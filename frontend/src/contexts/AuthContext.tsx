import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AuthenticationResult, AccountInfo } from '@azure/msal-browser';
import config from '../config';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: config.azureAd.clientId,
    authority: `https://login.microsoftonline.com/${config.azureAd.tenantId}`,
    redirectUri: config.azureAd.redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Define authentication context interface
interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | null>(null);

// Login request scopes
const loginRequest = {
  scopes: ['User.Read', 'Files.ReadWrite']
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  
  // Initialize MSAL
  const msalInstance = new PublicClientApplication(msalConfig);
  
  useEffect(() => {
    // Check if user is already authenticated
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      setIsAuthenticated(true);
      setUser(accounts[0]);
    }
  }, []);
  
  // Login function
  const login = async () => {
    try {
      const authResult = await msalInstance.loginPopup(loginRequest);
      if (authResult) {
        setIsAuthenticated(true);
        setUser(authResult.account);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  // Logout function
  const logout = () => {
    msalInstance.logout();
    setIsAuthenticated(false);
    setUser(null);
  };
  
  // Get access token for API calls
  const getAccessToken = async (): Promise<string> => {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const silentRequest = {
        scopes: loginRequest.scopes,
        account: accounts[0]
      };
      
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Error getting token silently:', error);
      // Fallback to interactive method
      const response = await msalInstance.acquireTokenPopup(loginRequest);
      return response.accessToken;
    }
  };
  
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    getAccessToken
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 