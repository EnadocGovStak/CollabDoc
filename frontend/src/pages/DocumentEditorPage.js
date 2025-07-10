import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DocumentPageEditor from '../components/DocumentPageEditor';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-react-buttons/styles/material.css';
import '@syncfusion/ej2-react-popups/styles/material.css';
import { documentService } from '../services/DocumentService';
import './DocumentEditorPage.css';
import VersionHistory from '../components/VersionHistory';


const DocumentEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        // Determine the current/target version to load
        const versionsResponse = await documentService.getDocumentVersions(id);
        console.log('versionsResponse:', versionsResponse);
        // Ensure versionsResponse and versionsResponse.versions are checked before accessing currentVersion
        const currentVersion = (versionsResponse?.versions?.length > 0 && versionsResponse.currentVersion) 
          ? versionsResponse.currentVersion 
          : 1;
        console.log(`Target version is ${currentVersion}`);

        // Fetch the specific version content
        const versionData = await documentService.getDocumentVersion(id, currentVersion);
        console.log('versionData:', versionData);
        if (!versionData || versionData.content === undefined) {
          console.error(`Failed to load content for version ${currentVersion} of document ${id}`);
          throw new Error(`Document content for version ${currentVersion} could not be loaded.`);
        }

        // Fetch document metadata (like title, recordsManagement, etc.)
        // This might come from a general getDocument endpoint or be part of versionData
        const docMetadata = await documentService.getDocument(id);

        newDocumentData = {
          id: id,
          title: docMetadata?.title || versionData?.title || 'Untitled',
          content: versionData.content, // This is the critical content from the specific version
          createdAt: docMetadata?.createdAt || new Date().toISOString(),
          lastModified: versionData?.timestamp || docMetadata?.modifiedAt || new Date().toISOString(),
          createdBy: docMetadata?.createdBy || 'Anonymous',
          recordsManagement: docMetadata?.recordsManagement || {
            classification: '',
            documentType: '',
            retentionPeriod: '',
            recordNumber: '',
            notes: '',
            isFinal: false
          },
          version: versionData?.version || currentVersion || 1
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
  }, [id]); // React to changes in 'id' directly

  // Check if document is final
  const isDocumentFinal = useCallback(() => {
    return document?.recordsManagement?.isFinal === true;
  }, [document]);

  // Stable content change handler that doesn't recreate on every render
  const handleContentChange = useCallback((content) => {
    if (content) {
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
    }
  }, []); // No dependencies to prevent callback recreation

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
    
    if (isFinal) {
      // Show confirmation before finalizing
      if (!window.confirm('Are you sure you want to mark this document as final? This cannot be undone and the document will become read-only.')) {
        return;
      }
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

  return (
    <div className="document-editor-page">
      <div className="document-editor-header">
        <Link to="/documents" className="back-link">
          ← Back to Documents
        </Link>
        <div className="document-editor-title">
          <h1>{document?.title || 'Untitled'}</h1>
          {isDocumentFinal() && (
            <div className="final-document-badge">
              <span className="final-icon">🔒</span> Final Document
            </div>
          )}
        </div>
        <div className="document-editor-actions">
          {saveStatus && <span className="save-status">{saveStatus}</span>}
          <button 
            onClick={handleSave}
            className="save-button"
            disabled={!!selectedVersion || isDocumentFinal()}
          >
            Save
          </button>
        </div>
      </div>
      <div className="document-editor-content">
        <div className="document-sidebar" ref={sidebarRef}>
          <div className="sidebar-section">
            <label>Title</label>
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
            />
          </div>

          <div className="sidebar-section">
            <label>Document Info</label>
            <div className="document-info">
              <div className="info-row">
                <span className="info-label">Version:</span>
                <span className="info-value">{document?.version || 1}</span>
              </div>
              {selectedVersion && (
                <div className="info-row preview-warning">
                  <span className="info-label">Previewing:</span>
                  <span className="info-value">Version {selectedVersion}</span>
                </div>
              )}
              {selectedVersion && (
                <div className="info-row">
                  <button 
                    onClick={returnToCurrent}
                    className="return-current-btn"
                    title="Return to current version"
                  >
                    Return to Current
                  </button>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Last Modified:</span>
                <span className="info-value">
                  {document?.lastModified ? new Date(document.lastModified).toLocaleString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section collapsible">
            <div className="section-header" onClick={toggleRecordsSection}>
              <h3>Records Management</h3>
              <span className={`toggle-icon ${recordsExpanded ? 'expanded' : ''}`}>▼</span>
            </div>
            {recordsExpanded && (
              <div className="section-content">
                <div className="sidebar-field">
                  <label>Classification</label>
                  <select 
                    name="classification"
                    value={document?.recordsManagement?.classification || ''}
                    onChange={handleRecordsChange}
                    onFocus={() => setSidebarHasFocus(true)}
                    onBlur={() => setSidebarHasFocus(false)}
                    disabled={!!selectedVersion || isDocumentFinal()}
                  >
                    <option value="">Select Classification</option>
                    {classifications.map(classification => (
                      <option key={classification} value={classification}>
                        {classification}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sidebar-field">
                  <label>Document Type</label>
                  <select 
                    name="documentType"
                    value={document?.recordsManagement?.documentType || ''}
                    onChange={handleRecordsChange}
                    onFocus={() => setSidebarHasFocus(true)}
                    onBlur={() => setSidebarHasFocus(false)}
                    disabled={!!selectedVersion || isDocumentFinal()}
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sidebar-field">
                  <label>Retention Period</label>
                  <select 
                    name="retentionPeriod"
                    value={document?.recordsManagement?.retentionPeriod || ''}
                    onChange={handleRecordsChange}
                    onFocus={() => setSidebarHasFocus(true)}
                    onBlur={() => setSidebarHasFocus(false)}
                    disabled={!!selectedVersion || isDocumentFinal()}
                  >
                    <option value="">Select Retention Period</option>
                    {retentionPeriods.map(period => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sidebar-field">
                  <label>Record Number</label>
                  <input 
                    type="text"
                    name="recordNumber"
                    value={document?.recordsManagement?.recordNumber || ''}
                    onChange={handleRecordsChange}
                    onFocus={() => setSidebarHasFocus(true)}
                    onBlur={() => setSidebarHasFocus(false)}
                    placeholder="Enter record number"
                    disabled={!!selectedVersion || isDocumentFinal()}
                  />
                </div>

                <div className="sidebar-field">
                  <label>Notes</label>
                  <textarea 
                    name="notes"
                    value={document?.recordsManagement?.notes || ''}
                    onChange={handleRecordsChange}
                    onFocus={() => setSidebarHasFocus(true)}
                    onBlur={() => setSidebarHasFocus(false)}
                    placeholder="Enter notes"
                    rows="3"
                    disabled={!!selectedVersion || isDocumentFinal()}
                  />
                </div>

                <div className="sidebar-field">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      name="isFinal"
                      checked={document?.recordsManagement?.isFinal || false}
                      onChange={handleToggleFinal}
                      disabled={!!selectedVersion}
                    />
                    Mark as Final
                  </label>
                  {isDocumentFinal() && (
                    <p className="final-warning">
                      This document is marked as final and cannot be edited.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-section collapsible">
            <div className="section-header" onClick={toggleVersionHistory}>
              <h3>Version History</h3>
              <span className={`toggle-icon ${versionHistoryExpanded ? 'expanded' : ''}`}>▼</span>
            </div>
            {versionHistoryExpanded && (
              <div className="section-content">
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