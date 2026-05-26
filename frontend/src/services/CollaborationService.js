import axios from 'axios';
import config from '../config';
import { getEditorIdentity } from '../utils/editorIdentity';

const API_URL = config.api.baseUrl;
const CLIENT_ID_KEY = 'collabdoc.collaboration.clientId';
const USER_NAME_KEY = 'collabdoc.collaboration.userName';

function createClientId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getClientId() {
  let clientId = window.sessionStorage.getItem(CLIENT_ID_KEY);

  if (!clientId) {
    clientId = createClientId();
    window.sessionStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  return clientId;
}

function readJsonStorage(key) {
  try {
    const value = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getIdentityUser() {
  const authUser = window.authContext?.user;
  const sflowUser = window.sflowIdentity?.user || window.sflowIdentity;
  const storedSflowUser = readJsonStorage('sflow.user') || readJsonStorage('sflow.identity');

  return authUser || sflowUser || storedSflowUser || null;
}

function getStoredAccessToken(storage) {
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);

    if (!key || !key.includes('oidc.user')) {
      continue;
    }

    try {
      const value = JSON.parse(storage.getItem(key));
      if (value?.access_token) {
        return value.access_token;
      }
    } catch {
      // Ignore unrelated or malformed storage entries.
    }
  }

  return null;
}

function getAccessToken() {
  const token = window.authContext?.accessToken ||
    window.sflowIdentity?.accessToken ||
    getStoredAccessToken(window.sessionStorage) ||
    getStoredAccessToken(window.localStorage);

  if (!token || String(token).startsWith('mock-token')) {
    return null;
  }

  return token;
}

function getAuthConfig() {
  const token = getAccessToken();

  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;
}

function getQueryUserName() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user') || params.get('collabUser') || params.get('name');
}

function getInitials(name) {
  return String(name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U';
}

export function getCurrentCollaborationUser(identityOverride) {
  const identityUser = identityOverride || getIdentityUser();
  const editorIdentity = getEditorIdentity(identityUser, 'Authenticated User');
  const queryUserName = getQueryUserName();
  const clientId = getClientId();
  const hasIdentityUser = editorIdentity.isAuthenticated || Boolean(identityUser && (
    identityUser.id ||
    identityUser.oid ||
    identityUser.sub ||
    identityUser.email ||
    identityUser.preferred_username ||
    identityUser.upn ||
    identityUser.name ||
    identityUser.displayName ||
    identityUser.username
  ));
  const fallbackUserName = queryUserName || window.localStorage.getItem(USER_NAME_KEY) || `Editor ${clientId.slice(0, 4)}`;
  const userName = hasIdentityUser ? editorIdentity.userName : fallbackUserName;
  const userId = hasIdentityUser ? editorIdentity.userId : userName;

  if (queryUserName) {
    window.localStorage.setItem(USER_NAME_KEY, queryUserName);
  }

  return {
    clientId,
    userId: String(userId),
    userName: String(userName),
    email: editorIdentity.email,
    roles: editorIdentity.roles,
    groups: editorIdentity.groups,
    color: editorIdentity.color,
    initials: getInitials(userName),
    authenticated: hasIdentityUser
  };
}

function toQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  return query.toString();
}

export const collaborationService = {
  async joinSession(documentId, user) {
    const response = await axios.post(`${API_URL}/api/collaboration/${documentId}/join`, user, getAuthConfig());
    return response.data;
  },

  async getState(documentId, user, sinceRevision = 0) {
    const query = toQuery({
      since: sinceRevision,
      clientId: user.clientId,
      userId: user.userId,
      userName: user.userName
    });
    const response = await axios.get(`${API_URL}/api/collaboration/${documentId}/state?${query}`, getAuthConfig());
    return response.data;
  },

  async pushSnapshot(documentId, payload) {
    const response = await axios.post(`${API_URL}/api/collaboration/${documentId}/snapshot`, payload, getAuthConfig());
    return response.data;
  },

  async leaveSession(documentId, user) {
    const response = await axios.post(`${API_URL}/api/collaboration/${documentId}/leave`, user, getAuthConfig());
    return response.data;
  }
};

export default collaborationService;