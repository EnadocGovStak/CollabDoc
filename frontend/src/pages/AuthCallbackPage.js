import React from 'react';
import './AccountPlaceholderPage.css';

const AuthCallbackPage = () => (
  <div className="account-placeholder-page">
    <div className="account-placeholder-shell">
      <header className="account-placeholder-header">
        <div className="account-placeholder-kicker">Identity</div>
        <h1>Completing sign in</h1>
        <p>Connecting your SFlow identity to the document workspace.</p>
      </header>
    </div>
  </div>
);

export default AuthCallbackPage;