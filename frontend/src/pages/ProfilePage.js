import React from 'react';
import ThemeModeSelector from '../components/ThemeModeSelector';
import { useAuth } from '../contexts/AuthContext';
import './AccountPlaceholderPage.css';

function getDisplayName(user) {
  return user?.name || user?.email || 'Workspace User';
}

function getInitials(user) {
  const source = getDisplayName(user);
  const parts = source
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);

  return (parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`
    : source.slice(0, 2)
  ).toUpperCase();
}

function formatRoles(roles) {
  return roles?.length ? roles.join(', ') : 'Workspace member';
}

function getTenant(user) {
  return user?.tenantId || user?.claims?.tenant_id || user?.claims?.tid || 'Default workspace';
}

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const displayName = getDisplayName(user);
  const email = user?.email || 'No email claim provided';
  const roles = formatRoles(user?.roles);
  const tenant = getTenant(user);
  const subject = user?.sub || user?.id || 'No subject claim provided';

  return (
    <div className="account-placeholder-page">
      <div className="account-placeholder-shell">
        <header className="account-placeholder-header">
          <div className="account-placeholder-kicker">User Profile</div>
          <h1>{displayName}</h1>
          <p>
            Manage identity details, workspace membership, access level, and personal document preferences.
          </p>
        </header>

        <div className="account-placeholder-grid">
          <section className="account-placeholder-panel" aria-label="Profile summary">
            <div className="account-placeholder-panel-body">
              <div className="account-avatar-placeholder" aria-hidden="true">{getInitials(user)}</div>
              <div className="account-placeholder-name">{displayName}</div>
              <div className="account-placeholder-muted">{email}</div>
              <div className="account-profile-meta">
                {(user?.roles?.length ? user.roles : ['Workspace member']).slice(0, 4).map(role => (
                  <span key={role}>{role}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="account-placeholder-panel" aria-label="Profile details">
            <div className="account-placeholder-panel-header">
              <h2>Account details</h2>
              <span className="account-placeholder-status active">SFlow</span>
            </div>
            <div className="account-placeholder-panel-body">
              <div className="account-placeholder-list">
                <div className="account-placeholder-row">
                  <strong>Name</strong>
                  <span>{displayName}</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Email</strong>
                  <span>{email}</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Roles</strong>
                  <span>{roles}</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Tenant</strong>
                  <span>{tenant}</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Subject</strong>
                  <span>{subject}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="account-placeholder-panel account-wide-panel" aria-label="Profile settings">
            <div className="account-placeholder-panel-header">
              <h2>Profile settings</h2>
              <span className="account-placeholder-status active">Active</span>
            </div>
            <div className="account-placeholder-panel-body">
              <div className="account-placeholder-setting stacked">
                <div>
                  <strong>Appearance</strong>
                  <span>Choose the workspace color mode used across lists, navigation, and account pages.</span>
                </div>
                <ThemeModeSelector />
              </div>
              <div className="account-placeholder-setting">
                <div>
                  <strong>Session</strong>
                  <span>Sign out clears the current SFlow session from this browser.</span>
                </div>
                <button type="button" className="account-action-button" onClick={logout}>
                  Sign out
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;