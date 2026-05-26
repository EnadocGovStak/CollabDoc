import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import config from '../config';
import sflowAuthService from '../services/SflowAuthService';

// Create the authentication context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const useSflow = config.identity.provider === 'sflow';
  const [isLoading, setIsLoading] = useState(useSflow);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!useSflow);
  const [user, setUser] = useState(useSflow ? null : { name: 'Test User', email: 'test@example.com' });
  const [accessToken, setAccessToken] = useState(useSflow ? null : 'mock-token-12345');
  const [graphToken, setGraphToken] = useState(useSflow ? null : 'mock-graph-token-12345');

  const applyAuth = useCallback((auth) => {
    setIsAuthenticated(Boolean(auth?.accessToken));
    setUser(auth?.user || null);
    setAccessToken(auth?.accessToken || null);
    setGraphToken(null);
  }, []);
  
  useEffect(() => {
    let cancelled = false;

    if (useSflow) {
      const initializeSflow = async () => {
        try {
          const { callbackPath } = sflowAuthService;
          const isCallback = window.location.pathname === callbackPath;
          const auth = isCallback
            ? await sflowAuthService.handleCallback()
            : sflowAuthService.readStoredAuth();

          if (cancelled) return;

          if (auth) {
            applyAuth(auth);
            setAuthError(null);
            setIsLoading(false);
            return;
          }

          await sflowAuthService.login();
        } catch (error) {
          if (cancelled) return;
          setAuthError(error);
          setIsLoading(false);
        }
      };

      initializeSflow();
      return () => {
        cancelled = true;
      };
    }

    const mockUser = { name: 'Test User', email: 'test@example.com' };
    setIsAuthenticated(true);
    setUser(mockUser);
    setAccessToken('mock-token-12345');
    setGraphToken('mock-graph-token-12345');
    
    // Make tokens available globally for components that don't use React context
    window.authContext = {
      user: mockUser,
      accessToken: 'mock-token-12345',
      graphToken: 'mock-graph-token-12345'
    };
  }, [useSflow, applyAuth]);
  
  const login = async () => {
    if (useSflow) {
      await sflowAuthService.login();
      return;
    }

    const mockUser = { name: 'Test User', email: 'test@example.com' };
    setIsAuthenticated(true);
    setUser(mockUser);
    setAccessToken('mock-token-12345');
    setGraphToken('mock-graph-token-12345');
    
    window.authContext = {
      user: mockUser,
      accessToken: 'mock-token-12345',
      graphToken: 'mock-graph-token-12345'
    };
  };
  
  // Logout function
  const logout = () => {
    if (useSflow) {
      sflowAuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setAccessToken(null);
      setGraphToken(null);
      setAuthError(null);
      sflowAuthService.login('/').catch(error => setAuthError(error));
      return;
    }

    console.log('Logout requested but ignored for testing');
  };
  
  // Get access token for API calls
  const getAccessToken = async () => {
    return accessToken;
  };
  
  // Get Microsoft Graph token for OneDrive access
  const getGraphToken = async () => {
    return graphToken;
  };
  
  const contextValue = {
    isAuthenticated,
    user,
    accessToken,
    graphToken,
    isLoading,
    authError,
    login,
    logout,
    getAccessToken,
    getGraphToken
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 