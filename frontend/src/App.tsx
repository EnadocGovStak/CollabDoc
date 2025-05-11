import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentEditorPage from './pages/DocumentEditorPage';
import TemplatesPage from './pages/TemplatesPage';
import './App.css';

// Private route component for authenticated routes
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Main App component
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <DocumentsPage />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/documents" 
          element={
            <PrivateRoute>
              <DocumentsPage />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/documents/:id" 
          element={
            <PrivateRoute>
              <DocumentEditorPage />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/new-document" 
          element={
            <PrivateRoute>
              <DocumentEditorPage />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/templates" 
          element={
            <PrivateRoute>
              <TemplatesPage />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/new-document/:templateId" 
          element={
            <PrivateRoute>
              <DocumentEditorPage />
            </PrivateRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// Wrap the app with authentication provider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 