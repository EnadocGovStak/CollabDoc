import axios from 'axios';
import config from '../config';

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

export function getCurrentCollaborationUser() {
  const identityUser = getIdentityUser();
  const queryUserName = getQueryUserName();
  const clientId = getClientId();
  const identityName = identityUser?.name || identityUser?.displayName || identityUser?.username || identityUser?.email;
  const userName = queryUserName || identityName || window.localStorage.getItem(USER_NAME_KEY) || `Editor ${clientId.slice(0, 4)}`;
  const userId = identityUser?.id || identityUser?.oid || identityUser?.sub || identityUser?.email || userName;

  if (queryUserName) {
    window.localStorage.setItem(USER_NAME_KEY, queryUserName);
  }

  return {
    clientId,
    userId: String(userId),
    userName: String(userName),
    initials: getInitials(userName)
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
    const response = await axios.post(`${API_URL}/api/collaboration/${documentId}/join`, user);
    return response.data;
  },

  async getState(documentId, user, sinceRevision = 0) {
    const query = toQuery({
      since: sinceRevision,
      clientId: user.clientId,
      userId: user.userId,
      userName: user.userName
    });
    const response = await axios.get(`${API_URL}/api/collaboration/${documentId}/state?${query}`);
    return response.data;
  },

  async pushSnapshot(documentId, payload) {
    const response = await axios.post(`${API_URL}/api/collaboration/${documentId}/snapshot`, payload);
    return response.data;
  },

  async leaveSession(documentId, user) {
    const response = await axios.post(`${API_URL}/api/collaboration/${documentId}/leave`, user);
    return response.data;
  }
};

export default collaborationService;