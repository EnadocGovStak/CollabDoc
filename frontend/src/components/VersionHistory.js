import React, { useState, useEffect } from 'react';
import { documentService } from '../services/DocumentService';
import './VersionHistory.css';

/**
 * Displays version history for a document
 */
const VersionHistory = ({ documentId, onVersionSelect, onVersionRestore, currentVersion }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVersion, setExpandedVersion] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const loadVersions = async () => {
      if (!documentId) return;
      
      try {
        setLoading(true);
        const response = await documentService.getDocumentVersions(documentId);
        setVersions(response.versions || []);
        setError(null);
      } catch (error) {
        console.error('Error loading versions:', error);
        setError('Failed to load version history');
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, [documentId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleVersionClick = (version) => {
    // Toggle the expanded state
    setExpandedVersion(expandedVersion === version ? null : version);
    
    // Call the parent handler if provided
    if (onVersionSelect) {
      onVersionSelect(version);
    }
  };

  const handleViewVersion = async (versionNumber) => {
    try {
      // Instead of trying to open the raw content, just select this version
      // which will load it in the editor
      if (onVersionSelect) {
        onVersionSelect(versionNumber);
      }
      
      // Collapse the expanded version after selecting
      setExpandedVersion(null);
    } catch (error) {
      console.error('Error viewing version:', error);
      alert('Failed to view this version. Please try again.');
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    if (versionNumber === currentVersion) {
      alert('This is already the current version');
      return;
    }

    if (!window.confirm(`Are you sure you want to restore version ${versionNumber}? This will create a new version based on the selected one.`)) {
      return;
    }

    try {
      setRestoring(true);
      
      // Get the version content
      const versionData = await documentService.getDocumentVersion(documentId, versionNumber);
      
      // Save this content as a new version
      const result = await documentService.saveDocument({
        content: versionData.content,
        title: versionData.title
      }, documentId);
      
      // If parent provided a restore handler, call it
      if (onVersionRestore) {
        onVersionRestore(result);
      }
      
      // Refresh the version list
      const response = await documentService.getDocumentVersions(documentId);
      setVersions(response.versions || []);
      
      alert(`Successfully restored as version ${result.version}`);
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('Failed to restore this version. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="version-history">
        <div className="version-history-header">
          <h3>Version History</h3>
        </div>
        <div className="version-history-loading">
          <div className="loading-spinner"></div>
          <p>Loading version history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="version-history">
        <div className="version-history-header">
          <h3>Version History</h3>
        </div>
        <div className="version-history-error">{error}</div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="version-history">
        <div className="version-history-header">
          <h3>Version History</h3>
        </div>
        <div className="version-history-empty">No version history available</div>
      </div>
    );
  }

  return (
    <div className="version-history">
      <div className="version-history-header">
        <h3>Version History</h3>
        <span className="version-count">{versions.length} versions</span>
      </div>
      
      <div className="version-list">
        <div className="version-timeline">
          {versions.map((version, index) => (
            <div 
              key={version.version} 
              className={`version-item-compact ${version.version === currentVersion ? 'current' : ''} ${expandedVersion === version.version ? 'expanded' : ''}`}
              onClick={() => handleVersionClick(version.version)}
            >
              <div className="version-item-left">
                <div className="version-marker">
                  <div className="version-dot"></div>
                  {index < versions.length - 1 && <div className="version-line"></div>}
                </div>
              </div>
              
              <div className="version-item-content">
                <div className="version-item-header">
                  <span className="version-number">v{version.version}</span>
                  <span className="version-date-time">
                    {formatDate(version.timestamp)} {formatTime(version.timestamp)}
                  </span>
                  {version.version === currentVersion && (
                    <span className="version-current-badge">Current</span>
                  )}
                </div>
                
                {version.comment && version.comment !== `Version ${version.version}` && (
                  <div className="version-comment">{version.comment}</div>
                )}
                
                {expandedVersion === version.version && (
                  <>
                    {version.recordsManagement && (
                      <div className="version-records-info">
                        {version.recordsManagement.classification && (
                          <span className="record-tag">{version.recordsManagement.classification}</span>
                        )}
                        {version.recordsManagement.documentType && (
                          <span className="record-tag">{version.recordsManagement.documentType}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="version-actions">
                      <button 
                        className="version-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewVersion(version.version);
                        }}
                      >
                        View
                      </button>
                      {version.version !== currentVersion && (
                        <button 
                          className="version-restore-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreVersion(version.version);
                          }}
                          disabled={restoring}
                        >
                          {restoring ? 'Restoring...' : 'Restore'}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionHistory; 