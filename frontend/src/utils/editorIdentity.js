const guestLikeNames = new Set([
  'guest',
  'guest user',
  'anonymous',
  'anonymous user',
  'unknown',
  'unknown user'
]);

const userColorPalette = [
  '#1d4ed8',
  '#047857',
  '#b45309',
  '#be123c',
  '#6d28d9',
  '#0f766e',
  '#c2410c',
  '#4338ca'
];

function readJsonStorage(key) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function isGuestLikeName(value) {
  return guestLikeNames.has(String(value || '').trim().toLowerCase());
}

export function getStoredIdentityUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const authUser = window.authContext?.user;
  const sflowUser = window.sflowIdentity?.user || window.sflowIdentity;
  const storedSflowUser = readJsonStorage('sflow.user') || readJsonStorage('sflow.identity');

  return authUser || sflowUser || storedSflowUser || null;
}

function firstDisplayName(candidates) {
  const values = candidates
    .map(value => String(value || '').trim())
    .filter(Boolean);

  return values.find(value => !isGuestLikeName(value)) || null;
}

function getStableUserColor(seed) {
  const value = String(seed || 'Authenticated User');
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }

  return userColorPalette[Math.abs(hash) % userColorPalette.length];
}

export function getEditorIdentity(user, fallbackName = 'Authenticated User') {
  const identityUser = user || getStoredIdentityUser();
  const email = identityUser?.email || identityUser?.preferred_username || identityUser?.upn;
  const userName = firstDisplayName([
    identityUser?.name,
    identityUser?.displayName,
    identityUser?.username,
    email,
    identityUser?.sub,
    identityUser?.id
  ]) || fallbackName;
  const userId = identityUser?.id || identityUser?.oid || identityUser?.sub || email || userName;

  return {
    userId: String(userId || userName),
    userName: String(userName),
    email,
    roles: toArray(identityUser?.roles || identityUser?.role).filter(Boolean),
    groups: toArray(identityUser?.groups).filter(Boolean),
    isAuthenticated: Boolean(identityUser && (identityUser.id || identityUser.sub || identityUser.oid || email)),
    color: getStableUserColor(userId || userName)
  };
}