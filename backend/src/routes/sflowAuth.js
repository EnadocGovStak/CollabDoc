const express = require('express');

const router = express.Router();

const DEFAULT_SFLOW_ISSUER = 'https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity';
const LOCAL_SFLOW_ISSUER = 'http://localhost:8000/identity';

function normalizeAuthority(value) {
  return String(value || '').trim().replace(/\/$/, '');
}

function getAllowedAuthorities() {
  return new Set([
    DEFAULT_SFLOW_ISSUER,
    LOCAL_SFLOW_ISSUER,
    process.env.AUTH_ISSUER,
    process.env.SFLOW_AUTH_ISSUER,
    process.env.SFLOW_AUTHORITY,
    ...(process.env.SFLOW_ALLOWED_AUTHORITIES || '').split(/[\s,]+/)
  ]
    .map(normalizeAuthority)
    .filter(Boolean));
}

function resolveAuthority(inputAuthority) {
  const authority = normalizeAuthority(
    inputAuthority ||
    process.env.AUTH_ISSUER ||
    process.env.SFLOW_AUTH_ISSUER ||
    process.env.SFLOW_AUTHORITY ||
    DEFAULT_SFLOW_ISSUER
  );
  const allowedAuthorities = getAllowedAuthorities();

  if (!allowedAuthorities.has(authority)) {
    const error = new Error('SFlow authority is not allowed');
    error.status = 400;
    throw error;
  }

  return authority;
}

async function getMetadata(authority) {
  const response = await fetch(`${authority}/.well-known/openid-configuration`);

  if (!response.ok) {
    const error = new Error(`Unable to load SFlow metadata: ${response.status}`);
    error.status = 502;
    throw error;
  }

  return response.json();
}

router.get('/metadata', async (req, res, next) => {
  try {
    const authority = resolveAuthority(req.query.authority);
    const metadata = await getMetadata(authority);
    res.json(metadata);
  } catch (error) {
    next(error);
  }
});

router.post('/token', async (req, res, next) => {
  try {
    const authority = resolveAuthority(req.body.authority);
    const metadata = await getMetadata(authority);
    const { code, codeVerifier, redirectUri, clientId } = req.body;

    if (!code || !codeVerifier || !redirectUri || !clientId) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'code, codeVerifier, redirectUri, and clientId are required'
      });
    }

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier
    });

    const response = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody
    });
    const text = await response.text();

    res.status(response.status);
    res.type(response.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (error) {
    next(error);
  }
});

module.exports = router;