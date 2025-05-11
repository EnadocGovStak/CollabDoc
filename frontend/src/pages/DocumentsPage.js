import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const DocumentsPage = () => {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call to get documents
    setTimeout(() => {
      const mockDocuments = [
        { id: '1', title: 'Project Proposal', lastModified: '2023-05-15', status: 'Draft' },
        { id: '2', title: 'Meeting Minutes', lastModified: '2023-05-10', status: 'Completed' },
        { id: '3', title: 'Budget Report', lastModified: '2023-05-05', status: 'In Review' },
      ];
      setDocuments(mockDocuments);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="documents-container">
      <header className="App-header">
        <h1>My Documents</h1>
        <div className="user-controls">
          {user && <span>Welcome, {user.name}</span>}
          <button onClick={logout} className="logout-button">
            Sign Out
          </button>
        </div>
      </header>
      
      <div className="content-container">
        <div className="actions-bar">
          <Link to="/new-document" className="button primary">Create New Document</Link>
          <Link to="/templates" className="button secondary">Use Template</Link>
        </div>
        
        {loading ? (
          <LoadingSpinner message="Loading documents..." />
        ) : (
          <>
            {documents.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any documents yet.</p>
                <p>Create a new document to get started.</p>
              </div>
            ) : (
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Last Modified</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>{doc.title}</td>
                      <td>{doc.lastModified}</td>
                      <td>
                        <span className={`status-badge ${doc.status.toLowerCase().replace(' ', '-')}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/documents/${doc.id}`} className="button small">
                            Edit
                          </Link>
                          <button className="button small secondary">
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage; 