import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DocumentPageEditor from '../components/DocumentPageEditor';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-react-buttons/styles/material.css';
import '@syncfusion/ej2-react-popups/styles/material.css';
import { documentService } from '../services/DocumentService';
import { collaborationService, getCurrentCollaborationUser } from '../services/CollaborationService';
import '../styles/design-system.css';
import '../styles/components.css';
import './DocumentEditorPage.css';
import VersionHistory from '../components/VersionHistory';
import { useAuth } from '../contexts/AuthContext';

const getCollaboratorInitials = (name) => String(name || 'User')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase())
  .join('') || 'U';

const collaborationStatusLabels = {
  idle: 'Save first to start live editing',
  connecting: 'Connecting live editing',
  live: 'Live editing on',
  syncing: 'Syncing changes',
  error: 'Live editing interrupted'
};


const DocumentEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const editorIdentity = useMemo(() => getCurrentCollaborationUser(authUser), [authUser]);
  const editorRef = useRef(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [retentionPeriods, setRetentionPeriods] = useState([]);
  const [recordsExpanded, setRecordsExpanded] = useState(true);
  const [versionHistoryExpanded, setVersionHistoryExpanded] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [sidebarHasFocus, setSidebarHasFocus] = useState(false);
  const sidebarRef = useRef(null);
  const collaborationUserRef = useRef(editorIdentity);
  const collaborationRevisionRef = useRef(0);
  const collaborationPushTimeoutRef = useRef(null);
  const applyingRemoteUpdateRef = useRef(false);
  const [collaborationStatus, setCollaborationStatus] = useState('idle');
  const [collaborators, setCollaborators] = useState([]);
  const [lastRemoteUpdate, setLastRemoteUpdate] = useState(null);

  useEffect(() => {
    collaborationUserRef.current = editorIdentity;
  }, [editorIdentity]);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [types, classes, periods] = await Promise.all([
          documentService.getDocumentTypes(),
          documentService.getClassifications(),
          documentService.getRetentionPeriods()
        ]);
        
        setDocumentTypes(types);
        setClassifications(classes);
        setRetentionPeriods(periods);
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };
    
    loadReferenceData();
  }, []);

  // Separate function to update editor content that doesn't depend on document state
  // This is now primarily for explicit calls if needed, e.g., previewing a version,
  // as main document loads are handled via initialContent prop.
  const updateEditorContent = useCallback((content) => {
    if (editorRef.current && content) {
      console.log('Explicitly updating editor with content via updateEditorContent');
      try {
        // DocumentPageEditor's setContent handles stringification and readiness.
        editorRef.current.setContent(content);
      } catch (err) {
        console.error('Error loading content into editor via updateEditorContent:', err);
        // Optionally, set an error state or provide user feedback
      }
    } else {
      console.warn('updateEditorContent called but editorRef.current is null or no content provided.');
    }
  }, []);

  // Load document
  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedVersion(null);
      setContentLoaded(false); // Unmount DocumentPageEditor, editorRef will become null temporarily

      let newDocumentData;

      if (id) {
        console.log(`Loading document: ${id}`);
        const docMetadata = await documentService.getDocument(id);

        if (!docMetadata || docMetadata.content === undefined) {
          console.error(`Failed to load content for document ${id}`);
          throw new Error('Document content could not be loaded.');
        }

        newDocumentData = {
          id: id,
          title: docMetadata?.title || 'Untitled',
          content: docMetadata.content,
          createdAt: docMetadata?.createdAt || new Date().toISOString(),
          lastModified: docMetadata?.modifiedAt || docMetadata?.timestamp || new Date().toISOString(),
          createdBy: docMetadata?.createdBy || 'Anonymous',
          recordsManagement: docMetadata?.recordsManagement || {
            classification: '',
            documentType: '',
            retentionPeriod: '',
            recordNumber: '',
            notes: '',
            isFinal: false
          },
          version: docMetadata?.version || docMetadata?.currentVersion || 1
        };
        console.log("Document state to be set after loading:", newDocumentData);

      } else {
        // New document
        console.log("Setting up a new document.");
        newDocumentData = {
          id: null,
          title: 'Untitled',
          content: '', // Empty content for new document
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          createdBy: 'Anonymous',
          recordsManagement: {
            classification: '',
            documentType: '',
            retentionPeriod: '',
            recordNumber: '',
            notes: '',
            isFinal: false
          },
          version: 1
        };
      }

      setDocument(newDocumentData); // Update the document state
      setContentLoaded(true);       // NOW set contentLoaded to true.
                                    // This will render DocumentPageEditor,
                                    // which will use newDocumentData.content as its initialContent prop.

    } catch (err) {
      console.error('Error in loadDocument:', err);
      setError(`Failed to load document: ${err.message}`);
      // Fallback: set a minimal document and allow editor to render to show error or be usable
      setDocument({
        id: id || null,
        title: 'Error Loading Document',
        content: '', // Empty content on error
        version: 1,
        recordsManagement: {
          classification: '',
          documentType: '',
          retentionPeriod: '',
          recordNumber: '',
          notes: '',
          isFinal: false
        },
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        createdBy: 'System'
      });
      setContentLoaded(true); // Still allow editor UI to render
    } finally {
      setLoading(false);
    }
  }, [id]); // 'id' is the primary dependency.

  // Load document data when ID changes
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Check if document is final
  const isDocumentFinal = useCallback(() => {
    return document?.recordsManagement?.isFinal === true;
  }, [document]);

  const handleCollaborationState = useCallback((state) => {
    if (!state) return;

    const incomingRevision = Number(state.revision || 0);
    const currentRevision = collaborationRevisionRef.current;
    const currentUser = collaborationUserRef.current;
    const hasRemoteContent = state.content !== undefined &&
      incomingRevision > currentRevision &&
      state.updatedBy &&
      state.updatedBy !== currentUser.clientId;

    collaborationRevisionRef.current = Math.max(currentRevision, incomingRevision);
    setCollaborators(state.collaborators || []);

    if (!hasRemoteContent) {
      return;
    }

    applyingRemoteUpdateRef.current = true;

    try {
      if (editorRef.current) {
        editorRef.current.setContent(state.content);
      }

      setDocument(prev => prev ? {
        ...prev,
        content: state.content,
        lastModified: state.updatedAt || new Date().toISOString()
      } : prev);

      setLastRemoteUpdate({
        userName: state.updatedByName || 'Another editor',
        updatedAt: state.updatedAt || new Date().toISOString()
      });
    } finally {
      window.setTimeout(() => {
        applyingRemoteUpdateRef.current = false;
      }, 800);
    }
  }, []);

  const queueCollaborativeSnapshot = useCallback((content) => {
    const documentId = id || document?.id;

    if (!documentId || selectedVersion || isDocumentFinal() || applyingRemoteUpdateRef.current) {
      return;
    }

    if (collaborationPushTimeoutRef.current) {
      clearTimeout(collaborationPushTimeoutRef.current);
    }

    setCollaborationStatus('syncing');

    collaborationPushTimeoutRef.current = window.setTimeout(async () => {
      try {
        const user = collaborationUserRef.current;
        const result = await collaborationService.pushSnapshot(documentId, {
          ...user,
          title: document?.title || 'Untitled',
          content
        });

        collaborationRevisionRef.current = Math.max(
          collaborationRevisionRef.current,
          Number(result.revision || 0)
        );
        setCollaborators(result.collaborators || []);
        setCollaborationStatus('live');
      } catch (error) {
        console.error('Error syncing collaborative snapshot:', error);
        setCollaborationStatus('error');
      }
    }, 1000);
  }, [document?.id, document?.title, id, isDocumentFinal, selectedVersion]);

  useEffect(() => {
    const documentId = id || document?.id;

    if (!documentId || selectedVersion) {
      setCollaborationStatus('idle');
      setCollaborators([]);
      return undefined;
    }

    let isMounted = true;
    let pollInterval = null;
    const user = editorIdentity;
    collaborationUserRef.current = user;
    collaborationRevisionRef.current = 0;

    const pollState = async () => {
      try {
        const state = await collaborationService.getState(documentId, user, collaborationRevisionRef.current);

        if (!isMounted) return;

        handleCollaborationState(state);
        setCollaborationStatus(prev => prev === 'syncing' ? prev : 'live');
      } catch (error) {
        console.error('Error polling collaborative state:', error);
        if (isMounted) {
          setCollaborationStatus('error');
        }
      }
    };

    const joinSession = async () => {
      try {
        setCollaborationStatus('connecting');
        const state = await collaborationService.joinSession(documentId, user);

        if (!isMounted) return;

        collaborationRevisionRef.current = Math.max(
          collaborationRevisionRef.current,
          Number(state.revision || 0)
        );
        setCollaborators(state.collaborators || []);
        setCollaborationStatus('live');
        pollInterval = window.setInterval(pollState, 2000);
      } catch (error) {
        console.error('Error joining collaborative session:', error);
        if (isMounted) {
          setCollaborationStatus('error');
        }
      }
    };

    joinSession();

    return () => {
      isMounted = false;

      if (pollInterval) {
        clearInterval(pollInterval);
      }

      if (collaborationPushTimeoutRef.current) {
        clearTimeout(collaborationPushTimeoutRef.current);
      }

      collaborationService.leaveSession(documentId, user).catch(() => {});
    };
  }, [document?.id, editorIdentity, handleCollaborationState, id, selectedVersion]);

  // Stable content change handler that doesn't recreate on every render
  const handleContentChange = useCallback((content) => {
    if (content && !applyingRemoteUpdateRef.current) {
      // Update document without triggering editor refresh
      setDocument(prev => {
        // Don't update if document is final
        if (prev?.recordsManagement?.isFinal === true) {
          return prev;
        }
        
        return {
          ...prev,
          content,
          lastModified: new Date().toISOString()
        };
      });

      queueCollaborativeSnapshot(content);
    }
  }, [queueCollaborativeSnapshot]);

  // Handle title changes
  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setDocument(prev => ({
      ...prev,
      title: newTitle,
      lastModified: new Date().toISOString()
    }));
  }, []);

  // Handle records management field changes
  const handleRecordsChange = useCallback((e) => {
    const { name, value } = e.target;
    setDocument(prev => ({
      ...prev,
      recordsManagement: {
        ...prev.recordsManagement,
        [name]: value
      },
      lastModified: new Date().toISOString()
    }));
  }, []);



  // Handle save with check for finalization
  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    
    // Don't allow saving if document is final
    if (isDocumentFinal()) {
      setSaveStatus('Cannot save: document is finalized');
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
      return;
    }
    
    try {
      setSaveStatus('Saving...');
      
      // Get the document content from the editor
      const content = await editorRef.current.getContent();
      if (!content) {
        throw new Error('Could not get document content');
      }
      
      // Create document data with content, title and records management
      const documentData = {
        content: content,
        title: document.title,
        recordsManagement: document.recordsManagement
      };
      
      // Check if we have an existing document ID to update
      const existingId = id || document.id;
      console.log(`Saving document with ${existingId ? 'existing ID: ' + existingId : 'as new document'}`);
      console.log("Saving with records management:", document.recordsManagement);
      
      // Save the document
      const result = await documentService.saveDocument(documentData, existingId);
      
      // Update document in state with the returned data
      setDocument(prev => ({
        ...prev,
        id: result.id || result.filename,
        content,
        lastModified: new Date().toISOString(),
        version: result.version || prev.version || 1
      }));
      
      setSaveStatus('Document saved successfully');
      
      // If this was a new document and we got an ID back, update the URL
      if (!id && result.id) {
        navigate(`/editor/${result.id}`, { replace: true });
      }
      
      // Reset selected version after saving
      setSelectedVersion(null);
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('Error saving document');
    } finally {
      // Clear save status after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }
  }, [document, id, navigate, isDocumentFinal]);

  // Toggle document final status
  const handleToggleFinal = useCallback((e) => {
    const isFinal = e.target.checked;
    
    if (isFinal && !window.confirm('Are you sure you want to mark this document as final? This cannot be undone and the document will become read-only.')) {
      return;
    }
    
    setDocument(prev => ({
      ...prev,
      recordsManagement: {
        ...prev.recordsManagement,
        isFinal: isFinal
      },
      lastModified: new Date().toISOString()
    }));
    
    // If marking as final, immediately save
    if (isFinal) {
      handleSave();
    }
  }, [handleSave]);

  // Create keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Handle version selection and preview
  const handleVersionSelect = useCallback(async (versionNumber) => {
    if (!document || !document.id) {
      console.warn('Cannot select version, document or document.id is missing.');
      return;
    }

    if (!versionNumber || versionNumber < 1) {
      console.warn('Invalid version number:', versionNumber);
      return;
    }

    try {
      setLoading(true);
      const versionData = await documentService.getDocumentVersion(document.id, versionNumber);
      if (versionData && versionData.content !== undefined) {
        setSelectedVersion(versionNumber);

        // Directly update the editor with the selected version's content using the imperative method.
        // DocumentPageEditor's setContent handles stringification and editor readiness.
        if (editorRef.current) {
          updateEditorContent(versionData.content);
        } else {
          console.warn('editorRef.current is null during handleVersionSelect. Editor might not be rendered.');
        }
        setSaveStatus(`Previewing version ${versionNumber}`);
      } else {
        setError('Failed to load version content for preview.');
        setSaveStatus('');
      }
    } catch (err) {
      console.error('Error selecting version for preview:', err);
      setError('Error loading version preview.');
      setSaveStatus('');
    } finally {
      setLoading(false);
      if (saveStatus.startsWith('Previewing')) {
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }
  }, [document, updateEditorContent, saveStatus]);

  // Handle returning to current version
  const returnToCurrent = useCallback(async () => {
    try {
      setLoading(true);
      // Load the current version using the main loadDocument function
      await loadDocument();
      // Clear selected version
      setSelectedVersion(null);
      setSaveStatus('Returned to current version');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error returning to current version:', error);
      setError('Failed to return to current version');
      setSaveStatus('Error returning to current version');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [loadDocument]);

  // Handle version restoration
  const handleRestoreVersion = useCallback(async () => {
    if (!document?.id || !selectedVersion) {
      console.warn('Cannot restore version: no document ID or selected version');
      return;
    }

    try {
      setLoading(true);
      const versionData = await documentService.getDocumentVersion(document.id, selectedVersion);
      
      if (!versionData || !versionData.content) {
        throw new Error('Failed to get version content for restore');
      }

      // Save the version content as a new version
      const result = await documentService.saveDocument({
        content: versionData.content,
        title: document.title, // Maintain current title
        recordsManagement: document.recordsManagement // Maintain current records management data
      }, document.id);

      if (!result) {
        throw new Error('Failed to save restored version');
      }

      // Clear selected version and reload the document to show the new version
      setSelectedVersion(null);
      await loadDocument();

      setSaveStatus(`Successfully restored as version ${result.version}`);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error restoring version:', error);
      setError('Failed to restore version. Please try again.');
      setSaveStatus('Error restoring version');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [document, selectedVersion, loadDocument]);

  if (loading) {
    return (
      <div className="document-editor-page loading">
        <div className="loading-spinner">Loading document...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-editor-page error">
        <div className="error-message">
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadDocument}>Retry</button>
            <Link to="/documents" className="back-link">Back to Documents</Link>
          </div>
        </div>
      </div>
    );
  }

  const toggleRecordsSection = () => {
    setRecordsExpanded(!recordsExpanded);
  };

  const toggleVersionHistory = () => {
    setVersionHistoryExpanded(!versionHistoryExpanded);
  };

  const currentCollaborationUser = editorIdentity;
  const visibleCollaborators = collaborators.slice(0, 5);
  const extraCollaboratorCount = Math.max(collaborators.length - visibleCollaborators.length, 0);
  const collaborationLabel = collaborationStatusLabels[collaborationStatus] || collaborationStatusLabels.idle;
  const remoteUpdateLabel = lastRemoteUpdate
    ? `${lastRemoteUpdate.userName} updated ${new Date(lastRemoteUpdate.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : null;

  return (
    <div className="document-editor-page">
      <div className="document-editor-header">
        <Link to="/documents" className="btn btn-ghost btn-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.5 2L5.5 8l5 6"/>
          </svg>
          Back to Documents
        </Link>
        <div className="document-editor-title-section">
          <h1 className="document-title">{document?.title || 'Untitled'}</h1>
          {isDocumentFinal() && (
            <div className="status-badge status-badge-success">
              <span className="status-icon">🔒</span>
              Final Document
            </div>
          )}
          <div className={`collaboration-status collaboration-status-${collaborationStatus}`} title={remoteUpdateLabel || collaborationLabel}>
            <span className="collaboration-status-dot" aria-hidden="true" />
            <span>{collaborationLabel}</span>
          </div>
          {visibleCollaborators.length > 0 && (
            <div className="collaboration-presence" aria-label="Active collaborators">
              {visibleCollaborators.map(collaborator => (
                <span
                  key={collaborator.clientId}
                  className={`collaboration-avatar${collaborator.clientId === currentCollaborationUser.clientId ? ' self' : ''}`}
                  title={`${collaborator.userName}${collaborator.clientId === currentCollaborationUser.clientId ? ' (you)' : ''}`}
                >
                  {getCollaboratorInitials(collaborator.userName)}
                </span>
              ))}
              {extraCollaboratorCount > 0 && (
                <span className="collaboration-avatar more" title={`${extraCollaboratorCount} more active`}>+{extraCollaboratorCount}</span>
              )}
            </div>
          )}
        </div>
        <div className="document-editor-actions">
          {saveStatus && (
            <div className={`save-status-notification ${saveStatus.includes('Error') ? 'error' : saveStatus.includes('Success') ? 'success' : 'info'}`}>
              <span className="save-status-icon">
                {saveStatus.includes('Error') ? '⚠️' : saveStatus.includes('Success') ? '✅' : 'ℹ️'}
              </span>
              <span className="save-status-text">{saveStatus}</span>
            </div>
          )}
          <button 
            onClick={handleSave}
            className="btn btn-primary"
            disabled={!!selectedVersion || isDocumentFinal()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2v12h12V4.414L11.586 2H2zm8 0v3H6V2h4zm0 4v3H6V6h4z"/>
            </svg>
            Save Document
          </button>
        </div>
      </div>
      <div className="document-editor-content">
        <div className="document-sidebar" ref={sidebarRef}>
          {/* Document Title Card */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Document Title</h3>
            </div>
            <div className="sidebar-card-content">
              <input
                type="text"
                value={document?.title || ''}
                onChange={handleTitleChange}
                onFocus={() => {
                  console.log('Title field got focus');
                  setSidebarHasFocus(true);
                }}
                onBlur={() => {
                  console.log('Title field lost focus');
                  setSidebarHasFocus(false);
                }}
                placeholder="Enter document title"
                className="form-input"
                disabled={!!selectedVersion || isDocumentFinal()}
              />
            </div>
          </div>

          {/* Document Info Card */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3 className="sidebar-card-title">Document Info</h3>
              {isDocumentFinal() && (
                <div className="status-badge status-badge-success">
                  <span className="status-icon">🔒</span>
                  Final
                </div>
              )}
            </div>
            <div className="sidebar-card-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Version</span>
                  <span className="info-value">{document?.version || 1}</span>
                </div>
                {selectedVersion && (
                  <div className="info-item info-item-warning">
                    <span className="info-label">Previewing</span>
                    <span className="info-value">Version {selectedVersion}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Last Modified</span>
                  <span className="info-value text-xs">
                    {document?.lastModified ? new Date(document.lastModified).toLocaleString() : 'Unknown'}
                  </span>
                </div>
                {remoteUpdateLabel && (
                  <div className="info-item info-item-live">
                    <span className="info-label">Live Update</span>
                    <span className="info-value text-xs">{remoteUpdateLabel}</span>
                  </div>
                )}
              </div>
              {selectedVersion && (
                <button 
                  onClick={returnToCurrent}
                  className="btn btn-secondary btn-sm w-full"
                  title="Return to current version"
                >
                  Return to Current Version
                </button>
              )}
            </div>
          </div>
          
          {/* Records Management Card */}
          <div className="sidebar-card collapsible">
            <div 
              className="sidebar-card-header clickable" 
              onClick={toggleRecordsSection}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleRecordsSection();
                }
              }}
              tabIndex="0"
              role="button"
              aria-expanded={recordsExpanded}
              aria-controls="records-management-content"
            >
              <h3 className="sidebar-card-title">Records Management</h3>
              <span className={`toggle-icon ${recordsExpanded ? 'expanded' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 9.5L4.5 6 5.9 4.6 8 6.7l2.1-2.1L11.5 6 8 9.5z"/>
                </svg>
              </span>
            </div>
            {recordsExpanded && (
              <div className="sidebar-card-content records-management-compact" id="records-management-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Classification</label>
                    <select 
                      name="classification"
                      value={document?.recordsManagement?.classification || ''}
                      onChange={handleRecordsChange}
                      onFocus={() => setSidebarHasFocus(true)}
                      onBlur={() => setSidebarHasFocus(false)}
                      disabled={!!selectedVersion || isDocumentFinal()}
                      className="form-select"
                    >
                      <option value="">Select Classification</option>
                      {classifications.map(classification => (
                        <option key={classification} value={classification}>
                          {classification}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Document Type</label>
                    <select 
                      name="documentType"
                      value={document?.recordsManagement?.documentType || ''}
                      onChange={handleRecordsChange}
                      onFocus={() => setSidebarHasFocus(true)}
                      onBlur={() => setSidebarHasFocus(false)}
                      disabled={!!selectedVersion || isDocumentFinal()}
                      className="form-select"
                    >
                      <option value="">Select Document Type</option>
                      {documentTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Retention Period</label>
                    <select 
                      name="retentionPeriod"
                      value={document?.recordsManagement?.retentionPeriod || ''}
                      onChange={handleRecordsChange}
                      onFocus={() => setSidebarHasFocus(true)}
                      onBlur={() => setSidebarHasFocus(false)}
                      disabled={!!selectedVersion || isDocumentFinal()}
                      className="form-select"
                    >
                      <option value="">Select Retention Period</option>
                      {retentionPeriods.map(period => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Record Number</label>
                    <input 
                      type="text"
                      name="recordNumber"
                      value={document?.recordsManagement?.recordNumber || ''}
                      onChange={handleRecordsChange}
                      onFocus={() => setSidebarHasFocus(true)}
                      onBlur={() => setSidebarHasFocus(false)}
                      placeholder="Enter record number"
                      disabled={!!selectedVersion || isDocumentFinal()}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea 
                      name="notes"
                      value={document?.recordsManagement?.notes || ''}
                      onChange={handleRecordsChange}
                      onFocus={() => setSidebarHasFocus(true)}
                      onBlur={() => setSidebarHasFocus(false)}
                      placeholder="Enter notes"
                      rows="3"
                      disabled={!!selectedVersion || isDocumentFinal()}
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group form-group-compact">
                    <label className="form-checkbox-label">
                      <input 
                        type="checkbox"
                        name="isFinal"
                        checked={document?.recordsManagement?.isFinal || false}
                        onChange={handleToggleFinal}
                        disabled={!!selectedVersion}
                        className="form-checkbox"
                      />
                      <span className="form-checkbox-text">Mark as Final</span>
                    </label>
                    {isDocumentFinal() && (
                      <p className="form-help-text text-warning-600">
                        This document is marked as final and cannot be edited.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Version History Card */}
          <div className="sidebar-card collapsible">
            <div 
              className="sidebar-card-header clickable" 
              onClick={toggleVersionHistory}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleVersionHistory();
                }
              }}
              tabIndex="0"
              role="button"
              aria-expanded={versionHistoryExpanded}
              aria-controls="version-history-content"
            >
              <h3 className="sidebar-card-title">Version History</h3>
              <span className={`toggle-icon ${versionHistoryExpanded ? 'expanded' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 9.5L4.5 6 5.9 4.6 8 6.7l2.1-2.1L11.5 6 8 9.5z"/>
                </svg>
              </span>
            </div>
            {versionHistoryExpanded && (
              <div className="sidebar-card-content" id="version-history-content">
                <VersionHistory 
                  documentId={document?.id}
                  onVersionSelect={handleVersionSelect}
                  selectedVersion={selectedVersion}
                  onRestoreVersion={handleRestoreVersion}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="document-editor-wrapper">
          {contentLoaded && document ? (
            <DocumentPageEditor
              ref={editorRef}
              initialContent={document.content}
              editorUser={editorIdentity}
              onContentChange={handleContentChange}
              onSave={handleSave}
              isReadOnly={!!selectedVersion || isDocumentFinal()}
              enableToolbar={true}
              sidebarHasFocus={sidebarHasFocus}
            />
          ) : (
            <div className="editor-loading">
              <p>Loading document editor...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentEditorPage;