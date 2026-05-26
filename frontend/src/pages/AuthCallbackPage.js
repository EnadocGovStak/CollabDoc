import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AccountPlaceholderPage.css';

const AuthCallbackPage = () => {
  const { authError, login } = useAuth();

  return (
    <div className="account-placeholder-page">
      <div className="account-placeholder-shell">
        <header className="account-placeholder-header">
          <div className="account-placeholder-kicker">Identity</div>
          <h1>{authError ? 'Sign in needs attention' : 'Completing sign in'}</h1>
          <p>
            {authError
              ? authError.message || 'The SFlow sign-in callback could not be completed.'
              : 'Connecting your SFlow identity to the document workspace.'}
          </p>
        </header>

        {authError && (
          <section className="account-placeholder-panel" aria-label="Sign in error">
            <div className="account-placeholder-panel-body">
              <button type="button" className="account-action-button" onClick={() => login('/')}>
                Try again
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;