import React from 'react';
import ThemeModeSelector from '../components/ThemeModeSelector';
import './AccountPlaceholderPage.css';

const ProfilePage = () => {
  return (
    <div className="account-placeholder-page">
      <div className="account-placeholder-shell">
        <header className="account-placeholder-header">
          <div className="account-placeholder-kicker">User Profile</div>
          <h1>Evia Collab User</h1>
          <p>
            Manage identity details, workspace membership, access level, and personal document preferences.
          </p>
        </header>

        <div className="account-placeholder-grid">
          <section className="account-placeholder-panel" aria-label="Profile summary">
            <div className="account-placeholder-panel-body">
              <div className="account-avatar-placeholder" aria-hidden="true">EC</div>
              <div className="account-placeholder-name">Evia Collab User</div>
              <div className="account-placeholder-muted">Document workspace member</div>
              <div className="account-profile-meta">
                <span>Records contributor</span>
                <span>Template editor</span>
              </div>
            </div>
          </section>

          <section className="account-placeholder-panel" aria-label="Profile details">
            <div className="account-placeholder-panel-header">
              <h2>Account details</h2>
              <span className="account-placeholder-status">Placeholder</span>
            </div>
            <div className="account-placeholder-panel-body">
              <div className="account-placeholder-list">
                <div className="account-placeholder-row">
                  <strong>Name</strong>
                  <span>Pending identity provider connection</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Email</strong>
                  <span>Pending user directory data</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Role</strong>
                  <span>Editor / Records contributor</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Organization</strong>
                  <span>Configured during tenant onboarding</span>
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;