import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  // For testing, start with authenticated = true
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({ name: 'Test User', email: 'test@example.com' });
  const [accessToken, setAccessToken] = useState('mock-token-12345');
  const [graphToken, setGraphToken] = useState('mock-graph-token-12345');
  
  // Auto-authenticate when the provider mounts (for testing)
  useEffect(() => {
    setIsAuthenticated(true);
    setUser({ name: 'Test User', email: 'test@example.com' });
    setAccessToken('mock-token-12345');
    setGraphToken('mock-graph-token-12345');
    
    // Make tokens available globally for components that don't use React context
    window.authContext = {
      accessToken: 'mock-token-12345',
      graphToken: 'mock-graph-token-12345'
    };
  }, []);
  
  // Login function (mock)
  const login = async () => {
    setIsAuthenticated(true);
    setUser({ name: 'Test User', email: 'test@example.com' });
    setAccessToken('mock-token-12345');
    setGraphToken('mock-graph-token-12345');
    
    window.authContext = {
      accessToken: 'mock-token-12345',
      graphToken: 'mock-graph-token-12345'
    };
  };
  
  // Logout function
  const logout = () => {
    // For testing, don't actually log out
    console.log('Logout requested but ignored for testing');
    // In production, these would be uncommented:
    // setIsAuthenticated(false);
    // setUser(null);
    // setAccessToken(null);
    // setGraphToken(null);
    // window.authContext = null;
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