import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="login-container">
      <h1>Collaborative Document Platform</h1>
      <p>Please sign in to access the platform</p>
      <button onClick={login} className="login-button">
        Sign in with Azure AD
      </button>
    </div>
  );
};

export default LoginPage; 