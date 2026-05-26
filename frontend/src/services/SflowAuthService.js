import config from '../config';

const STORAGE_KEY = 'collabdoc.sflow.auth';
const VERIFIER_KEY = 'collabdoc.sflow.pkce.verifier';
const STATE_KEY = 'collabdoc.sflow.pkce.state';
const RETURN_PATH_KEY = 'collabdoc.sflow.returnPath';

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function randomString(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function sha256(value) {
  const encoded = new TextEncoder().encode(value);
  return window.crypto.subtle.digest('SHA-256', encoded);
}

function decodeJwtPayload(token) {
  if (!token || token.split('.').length < 2) {
    return {};
  }

  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payload.padEnd(payload.length + ((4 - payload.length % 4) % 4), '=');
    const json = decodeURIComponent(
      window.atob(paddedPayload)
        .split('')
        .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return {};
  }
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function claimsToUser(claims = {}) {
  const email = claims.email || claims.preferred_username || claims.upn;
  const name = claims.name || claims.preferred_username || email || 'SFlow User';

  return {
    id: claims.sub || claims.oid || email || name,
    sub: claims.sub,
    oid: claims.oid,
    name,
    email,
    roles: [...toArray(claims.role), ...toArray(claims.roles)].filter(Boolean),
    groups: toArray(claims.groups).filter(Boolean),
    tenantId: claims.tid || claims.tenant_id,
    claims
  };
}

function getCallbackPath() {
  return new URL(config.identity.redirectUri, window.location.origin).pathname;
}

async function getMetadata() {
  const metadataUrl = config.identity.metadataProxyUrl
    ? `${config.identity.metadataProxyUrl}?authority=${encodeURIComponent(config.identity.authority)}`
    : `${config.identity.authority.replace(/\/$/, '')}/.well-known/openid-configuration`;
  const response = await fetch(metadataUrl);

  if (!response.ok) {
    throw new Error('Unable to load SFlow OIDC metadata');
  }

  return response.json();
}

function persistAuth(tokenResponse) {
  const accessToken = tokenResponse.access_token;
  const idToken = tokenResponse.id_token;
  const claims = decodeJwtPayload(idToken || accessToken);
  const user = claimsToUser(claims);
  const expiresAt = Date.now() + Math.max(Number(tokenResponse.expires_in || 0) - 30, 0) * 1000;
  const auth = {
    provider: 'sflow',
    accessToken,
    idToken,
    refreshToken: tokenResponse.refresh_token,
    tokenType: tokenResponse.token_type,
    scope: tokenResponse.scope,
    expiresAt,
    claims,
    user
  };

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  window.sessionStorage.setItem('sflow.user', JSON.stringify(user));
  window.authContext = auth;
  window.sflowIdentity = auth;

  return auth;
}

function readStoredAuth() {
  try {
    const rawAuth = window.sessionStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(STORAGE_KEY);
    const auth = rawAuth ? JSON.parse(rawAuth) : null;

    if (!auth?.accessToken || (auth.expiresAt && auth.expiresAt <= Date.now())) {
      return null;
    }

    window.authContext = auth;
    window.sflowIdentity = auth;
    return auth;
  } catch {
    return null;
  }
}

async function login(returnPath = `${window.location.pathname}${window.location.search}`) {
  if (!config.identity.clientId) {
    throw new Error('REACT_APP_SFLOW_CLIENT_ID is required when REACT_APP_AUTH_PROVIDER=sflow');
  }

  const metadata = await getMetadata();
  const verifier = randomString(64);
  const challenge = base64UrlEncode(await sha256(verifier));
  const state = randomString(24);

  window.sessionStorage.setItem(VERIFIER_KEY, verifier);
  window.sessionStorage.setItem(STATE_KEY, state);
  window.sessionStorage.setItem(RETURN_PATH_KEY, returnPath || '/documents');

  const authorizeUrl = new URL(metadata.authorization_endpoint);
  authorizeUrl.searchParams.set('client_id', config.identity.clientId);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('redirect_uri', config.identity.redirectUri);
  authorizeUrl.searchParams.set('scope', config.identity.scope);
  authorizeUrl.searchParams.set('code_challenge', challenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');
  authorizeUrl.searchParams.set('state', state);

  window.location.assign(authorizeUrl.toString());
}

async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  const code = params.get('code');
  const state = params.get('state');
  const expectedState = window.sessionStorage.getItem(STATE_KEY);
  const verifier = window.sessionStorage.getItem(VERIFIER_KEY);

  if (error) {
    throw new Error(params.get('error_description') || error);
  }

  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    throw new Error('Invalid SFlow callback state');
  }

  const metadata = await getMetadata();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.identity.redirectUri,
    client_id: config.identity.clientId,
    code_verifier: verifier
  });

  const response = config.identity.tokenProxyUrl
    ? await fetch(config.identity.tokenProxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authority: config.identity.authority,
        code,
        codeVerifier: verifier,
        redirectUri: config.identity.redirectUri,
        clientId: config.identity.clientId
      })
    })
    : await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SFlow token exchange failed: ${text || response.status}`);
  }

  const tokenResponse = await response.json();
  const auth = persistAuth(tokenResponse);
  const returnPath = window.sessionStorage.getItem(RETURN_PATH_KEY) || '/documents';

  window.sessionStorage.removeItem(VERIFIER_KEY);
  window.sessionStorage.removeItem(STATE_KEY);
  window.sessionStorage.removeItem(RETURN_PATH_KEY);
  window.history.replaceState({}, document.title, returnPath);

  return auth;
}

function logout() {
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem('sflow.user');
  window.authContext = null;
  window.sflowIdentity = null;
}

export const sflowAuthService = {
  callbackPath: getCallbackPath(),
  readStoredAuth,
  login,
  handleCallback,
  logout
};

export default sflowAuthService;