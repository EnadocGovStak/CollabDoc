import React from 'react';
import ThemeModeSelector from '../components/ThemeModeSelector';
import './AccountPlaceholderPage.css';

const SettingsPage = () => {
  return (
    <div className="account-placeholder-page">
      <div className="account-placeholder-shell">
        <header className="account-placeholder-header">
          <div className="account-placeholder-kicker">Settings</div>
          <h1>Workspace settings</h1>
          <p>
            Configure workspace preferences, editor behavior, notification rules, and security controls.
          </p>
        </header>

        <div className="account-placeholder-grid">
          <section className="account-placeholder-panel" aria-label="Appearance settings">
            <div className="account-placeholder-panel-header">
              <h2>Appearance</h2>
              <span className="account-placeholder-status active">Active</span>
            </div>
            <div className="account-placeholder-panel-body">
              <ThemeModeSelector />
            </div>
          </section>

          <section className="account-placeholder-panel" aria-label="Workspace settings summary">
            <div className="account-placeholder-panel-header">
              <h2>Workspace</h2>
              <span className="account-placeholder-status">Draft</span>
            </div>
            <div className="account-placeholder-panel-body">
              <div className="account-placeholder-list">
                <div className="account-placeholder-row">
                  <strong>Default view</strong>
                  <span>Documents dashboard</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Template source</strong>
                  <span>Managed field library</span>
                </div>
                <div className="account-placeholder-row">
                  <strong>Retention defaults</strong>
                  <span>Classification based</span>
                </div>
              </div>
            </div>
          </section>

          <section className="account-placeholder-panel" aria-label="Preference placeholders">
            <div className="account-placeholder-panel-header">
              <h2>Preferences</h2>
              <span className="account-placeholder-status">Placeholder</span>
            </div>
            <div className="account-placeholder-panel-body">
              <div className="account-placeholder-setting">
                <div>
                  <strong>Editor autosave</strong>
                  <span>Automatic draft saving controls.</span>
                </div>
                <span className="account-placeholder-toggle on" aria-hidden="true" />
              </div>
              <div className="account-placeholder-setting">
                <div>
                  <strong>Template validation prompts</strong>
                  <span>Field quality and merge readiness prompts.</span>
                </div>
                <span className="account-placeholder-toggle on" aria-hidden="true" />
              </div>
              <div className="account-placeholder-setting">
                <div>
                  <strong>Record finalization alerts</strong>
                  <span>Notifications before final documents are locked.</span>
                </div>
                <span className="account-placeholder-toggle" aria-hidden="true" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;