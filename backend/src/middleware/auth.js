const { createRemoteJWKSet, jwtVerify } = require('jose');

const DEFAULT_SFLOW_ISSUER = 'https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity';
const DEFAULT_SFLOW_JWKS_URI = `${DEFAULT_SFLOW_ISSUER}/.well-known/jwks`;

let remoteJwks = null;
let remoteJwksUri = null;

function isEnabled(value) {
    return String(value || '').toLowerCase() === 'true';
}

function toList(value) {
    return String(value || '')
        .split(/[\s,]+/)
        .map(item => item.trim())
        .filter(Boolean);
}

function getAuthConfig() {
    const issuer = process.env.AUTH_ISSUER || process.env.SFLOW_AUTH_ISSUER || DEFAULT_SFLOW_ISSUER;
    const allowedClientIds = toList(
        process.env.AUTH_ALLOWED_CLIENT_IDS ||
        process.env.AUTH_CLIENT_ID ||
        process.env.SFLOW_AUTH_CLIENT_ID
    );

    return {
        required: isEnabled(process.env.AUTH_REQUIRED),
        issuer,
        audience: process.env.AUTH_AUDIENCE || process.env.SFLOW_AUTH_AUDIENCE || undefined,
        jwksUri: process.env.AUTH_JWKS_URI || process.env.SFLOW_AUTH_JWKS_URI || DEFAULT_SFLOW_JWKS_URI,
        allowedClientIds
    };
}

function getRemoteJwks(jwksUri) {
    if (!remoteJwks || remoteJwksUri !== jwksUri) {
        remoteJwksUri = jwksUri;
        remoteJwks = createRemoteJWKSet(new URL(jwksUri));
    }

    return remoteJwks;
}

function getBearerToken(req) {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
}

function toArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function getUserFromClaims(claims = {}) {
    const roles = [
        ...toArray(claims.roles),
        ...toArray(claims.role)
    ].filter(Boolean);
    const groups = toArray(claims.groups).filter(Boolean);
    const email = claims.email || claims.preferred_username || claims.upn;
    const displayName = claims.name || claims.given_name || email || claims.sub || 'Authenticated User';

    return {
        id: claims.sub || claims.oid || email,
        sub: claims.sub,
        oid: claims.oid,
        email,
        name: displayName,
        roles,
        groups,
        tenantId: claims.tid || claims.tenant_id,
        claims
    };
}

async function verifyAccessToken(token, config) {
    const verifyOptions = {
        issuer: config.issuer
    };

    if (config.audience) {
        verifyOptions.audience = config.audience;
    }

    const result = await jwtVerify(token, getRemoteJwks(config.jwksUri), verifyOptions);
    const claims = result.payload;

    if (config.allowedClientIds.length > 0) {
        const tokenClientIds = [
            ...toArray(claims.azp),
            ...toArray(claims.client_id),
            ...toArray(claims.clientId),
            ...toArray(claims.appid)
        ].filter(Boolean);

        const hasAllowedClientId = config.allowedClientIds.some(clientId => tokenClientIds.includes(clientId));

        if (!hasAllowedClientId) {
            throw new Error('Token client is not allowed for this API');
        }
    }

    return claims;
}

const auth = (options = {}) => async (req, res, next) => {
    const config = getAuthConfig();
    const optional = options.optional ?? !config.required;
    const token = getBearerToken(req);

    if (!token) {
        if (optional) return next();

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing bearer token'
        });
    }

    try {
        const claims = await verifyAccessToken(token, config);
        req.auth = claims;
        req.user = getUserFromClaims(claims);
        return next();
    } catch (error) {
        if (optional) {
            req.authError = error;
            return next();
        }

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired bearer token'
        });
    }
};

/**
 * Check if the user has the required role
 * @param {string[]} roles Array of required roles
 */
const requireRole = (roles) => (req, res, next) => {
    const config = getAuthConfig();

    if (!config.required) {
        return next();
    }

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const userRoles = req.user?.roles || [];
    const userGroups = req.user?.groups || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role) || userGroups.includes(role));

    if (!hasRequiredRole) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient permissions'
        });
    }

    next();
};

module.exports = { auth, requireRole, getAuthConfig, getUserFromClaims };