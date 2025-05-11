import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DocumentEditorDemo from '../components/DocumentEditorDemo';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-react-buttons/styles/material.css';
import '@syncfusion/ej2-react-popups/styles/material.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { documentService } from '../services/DocumentService';
import './DocumentEditorPage.css';
import VersionHistory from '../components/VersionHistory';
import TemplateManager from '../components/TemplateManager';

const DocumentEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const lastContentUpdate = useRef(Date.now());
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [retentionPeriods, setRetentionPeriods] = useState([]);
  const [recordsExpanded, setRecordsExpanded] = useState(true);
  const [versionHistoryExpanded, setVersionHistoryExpanded] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false); // Track if content has been loaded
  const [templateExpanded, setTemplateExpanded] = useState(false);
  const [mergeCompleted, setMergeCompleted] = useState(false);

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
  const updateEditorContent = useCallback((content) => {
    if (editorRef.current && content) {
      console.log('Updating editor with content');
      try {
        editorRef.current.loadContent(content);
        setContentLoaded(true);
      } catch (err) {
        console.error('Error loading content into editor:', err);
      }
    }
  }, []);

  // Load document
  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedVersion(null); // Reset any selected version when loading
      setContentLoaded(false); // Reset content loaded flag
      
      if (id) {
        try {
          console.log(`Loading document: ${id}`);
          
          // First, get the document versions to determine the latest version
          const versionsResponse = await documentService.getDocumentVersions(id);
          const currentVersion = versionsResponse.currentVersion || 1;
          
          console.log(`Current version is ${currentVersion}, fetching document data`);
          
          // Get the document metadata and potentially content
          const response = await documentService.getDocument(id);
          console.log('Document loaded with full response:', response);
          
          // Use the title from the response or extract one from the filename
          const title = response?.title || 'Untitled';
          
          // Check for records management data
          if (response.recordsManagement) {
            console.log('Records management data found:', response.recordsManagement);
          } else {
            console.warn('No records management data in document response');
          }
          
          // Compare versions - if the response version doesn't match current version
          // or if content is missing, explicitly load the latest version
          let content = response?.content || '';
          
          if (!content || response.version !== currentVersion) {
            console.log(`Need to load explicit version ${currentVersion}`);
            try {
              const latestVersionData = await documentService.getDocumentVersion(id, currentVersion);
              if (latestVersionData && latestVersionData.content) {
                content = latestVersionData.content;
                console.log(`Successfully loaded content for version ${currentVersion}`);
              } else {
                console.warn(`Version ${currentVersion} content is empty or invalid`);
              }
            } catch (versionError) {
              console.error('Error loading latest version:', versionError);
            }
          }
          
          if (!content) {
            console.error('Failed to load document content');
            throw new Error('Document content could not be loaded');
          }
          
          console.log("Document state after loading:", {
            id,
            title,
            contentLoaded: !!content,
            contentSize: content ? JSON.stringify(content).length : 0,
            version: currentVersion,
            recordsManagement: response?.recordsManagement
          });
          
          // Set document state first
          setDocument({
            id: id,
            title: title,
            content: content,
            createdAt: response?.createdAt || new Date().toISOString(),
            lastModified: response?.modifiedAt || new Date().toISOString(),
            createdBy: response?.createdBy || 'Anonymous',
            recordsManagement: response?.recordsManagement || {
              classification: '',
              documentType: '',
              retentionPeriod: '',
              recordNumber: '',
              notes: ''
            },
            version: currentVersion
          });
          
          // Use a small delay to ensure the editor component is ready before loading content
          setTimeout(() => {
            updateEditorContent(content);
          }, 100);
        } catch (fetchError) {
          console.error('Error fetching document:', fetchError);
          // If there's an error loading, create a new document with this ID
          setDocument({
            id: id,  // Use exactly the ID from the URL
            title: 'Untitled',
            content: '',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            createdBy: 'Anonymous',
            recordsManagement: {
              classification: '',
              documentType: '',
              retentionPeriod: '',
              recordNumber: '',
              notes: ''
            },
            version: 1
          });
          setContentLoaded(true);
        }
      } else {
        // New document
        setDocument({
          id: null,
          title: 'Untitled',
          content: '',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          createdBy: 'Anonymous',
          recordsManagement: {
            classification: '',
            documentType: '',
            retentionPeriod: '',
            recordNumber: '',
            notes: ''
          },
          version: 1
        });
        setContentLoaded(true);
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [id, updateEditorContent]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Check if document is final
  const isDocumentFinal = useCallback(() => {
    return document?.recordsManagement?.isFinal === true;
  }, [document]);

  // Updated content change handler to check for final status
  const handleContentChange = useCallback((content) => {
    // Don't update if document is final
    if (isDocumentFinal()) {
      return;
    }
    
    // Throttle content updates to avoid interfering with typing
    const now = Date.now();
    if (now - lastContentUpdate.current > 2000) { // Only update every 2 seconds at most
      lastContentUpdate.current = now;
      
      if (content && document) {
        // Update document without triggering editor refresh
        setDocument(prev => ({
          ...prev,
          content,
          lastModified: new Date().toISOString()
        }));
      }
    }
  }, [document, isDocumentFinal]);

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
        version: result.version || prev.version
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
  const handleToggleFinal = (e) => {
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
      }
    }));
    
    // If marking as final, immediately save
    if (isFinal) {
      handleSave();
    }
  };

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

  const handleTitleChange = (e) => {
    setDocument(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleRecordsChange = (e) => {
    const { name, value } = e.target;
    
    setDocument(prev => ({
      ...prev,
      recordsManagement: {
        ...prev.recordsManagement,
        [name]: value
      }
    }));
  };

  const handleVersionSelect = async (versionNumber) => {
    try {
      if (!document.id) return;
      
      console.log(`Version ${versionNumber} selected (current is ${document.version})`);
      
      if (versionNumber === document.version) {
        // Selected current version, just reset
        setSelectedVersion(null);
        return;
      }
      
      // Load the specific version
      const versionData = await documentService.getDocumentVersion(document.id, versionNumber);
      
      // Update editor with version content, but don't update document state fully
      // This avoids changing metadata but shows different content
      if (versionData && versionData.content) {
        console.log(`Loading content for version ${versionNumber}`);
        
        // Set loading state while switching versions
        setLoading(true);
        
        if (editorRef.current) {
          // First try standard load
          const loaded = await editorRef.current.loadContent(versionData.content);
          
          // If loading failed, try to force a refresh
          if (!loaded && editorRef.current.forceRefresh) {
            editorRef.current.forceRefresh();
            // Wait a moment for the refresh to complete, then try loading again
            setTimeout(async () => {
              await editorRef.current.loadContent(versionData.content);
            }, 200);
          }
        }
        
        setSelectedVersion(versionNumber);
        setSaveStatus(`Viewing version ${versionNumber} (read-only)`);
        setLoading(false);
      } else {
        console.error(`Version ${versionNumber} returned empty content`);
        setSaveStatus(`Error: Version ${versionNumber} content not found`);
      }
    } catch (error) {
      console.error(`Error loading version ${versionNumber}:`, error);
      setSaveStatus(`Error loading version ${versionNumber}`);
      setLoading(false);
    }
  };

  // Function to return to the current document version
  const returnToCurrent = () => {
    // Only proceed if we have a different version selected
    if (!selectedVersion || selectedVersion === document.version) {
      setSelectedVersion(null);
      return;
    }
    
    console.log('Returning to current version:', document.version);
    
    // Set loading state
    setLoading(true);
    
    // Clear selected version state
    setSelectedVersion(null);
    
    setTimeout(async () => {
      try {
        // Reload the current document content
        if (editorRef.current && document.content) {
          const success = await editorRef.current.loadContent(document.content);
          
          // If direct loading failed, try force refreshing the editor
          if (!success && editorRef.current.forceRefresh) {
            editorRef.current.forceRefresh();
            
            // Wait a moment and try again
            setTimeout(async () => {
              await editorRef.current.loadContent(document.content);
            }, 200);
          }
        }
      } catch (error) {
        console.error('Error returning to current version:', error);
        setSaveStatus('Error returning to current version');
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const handleRestoreVersion = async () => {
    if (!selectedVersion || !document.id) return;
    
    try {
      setSaveStatus('Restoring version...');
      
      // Get the version content
      const versionData = await documentService.getDocumentVersion(document.id, selectedVersion);
      
      if (versionData && versionData.content) {
        console.log('Restoring version with content:', versionData.content);
        
        // Create a document data object for saving
        const documentData = {
          content: versionData.content,
          title: document.title,
          recordsManagement: document.recordsManagement // Preserve records management metadata
        };
        
        // Save as new version
        const result = await documentService.saveDocument(documentData, document.id);
        
        // Update document state with new version
        setDocument(prev => ({
          ...prev,
          version: result.version,
          content: versionData.content,
          lastModified: new Date().toISOString()
        }));
        
        // If we have an editor reference, update its content too
        if (editorRef.current) {
          editorRef.current.loadContent(versionData.content);
        }
        
        // Reset selected version
        setSelectedVersion(null);
        
        setSaveStatus(`Restored version ${selectedVersion} as new version ${result.version}`);
        
        // Reload the document to ensure everything is in sync
        await loadDocument();
      } else {
        setSaveStatus('Error: Could not restore version - no content found');
      }
    } catch (error) {
      console.error(`Error restoring version ${selectedVersion}:`, error);
      setSaveStatus(`Error restoring version ${selectedVersion}`);
    }
  };

  // Toggle template merge section
  const toggleTemplateSection = () => {
    setTemplateExpanded(!templateExpanded);
  };
  
  // Handle template merge completion
  const handleMergeComplete = (result) => {
    if (result.success) {
      setMergeCompleted(true);
      setSaveStatus('Document merged and sent for signing');
      
      // Update document to reflect final status
      if (document) {
        setDocument(prev => ({
          ...prev,
          recordsManagement: {
            ...prev.recordsManagement,
            isFinal: true
          }
        }));
      }
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    } else {
      setSaveStatus('Error: ' + (result.message || 'Failed to merge document'));
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }
  };

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
        {document && (
          <>
            <div className="document-sidebar">
              <div className="sidebar-section">
                <label>Title</label>
                <input 
                  type="text" 
                  value={document.title}
                  onChange={handleTitleChange}
                  disabled={!!selectedVersion || isDocumentFinal()}
                />
              </div>
              
              <div className="sidebar-section">
                <label>Created by</label>
                <div>{document.createdBy}</div>
              </div>
              
              <div className="sidebar-section">
                <label>Created</label>
                <div>{new Date(document.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div className="sidebar-section">
                <label>Last modified</label>
                <div>{new Date(document.lastModified).toLocaleString()}</div>
              </div>

              <div className="sidebar-section">
                <label>Filename</label>
                <div className="filename">{document.id || 'Not saved yet'}</div>
              </div>

              <div className="sidebar-section">
                <button 
                  className="sidebar-section-header compact"
                  onClick={toggleVersionHistory}
                >
                  <span>Version History</span>
                  <span className="toggle-icon">{versionHistoryExpanded ? '▼' : '►'}</span>
                </button>
                
                {selectedVersion && (
                  <div className="version-actions">
                    <span className="viewing-version">Viewing v{selectedVersion}</span>
                    <button onClick={handleRestoreVersion} className="restore-button">
                      Restore This Version
                    </button>
                    <button 
                      onClick={returnToCurrent} 
                      className="cancel-button"
                    >
                      Back to Current
                    </button>
                  </div>
                )}
                
                {versionHistoryExpanded && (
                  <VersionHistory 
                    documentId={document.id} 
                    onVersionSelect={handleVersionSelect} 
                    onVersionRestore={loadDocument}
                    currentVersion={document.version}
                  />
                )}
              </div>

              <div className="sidebar-section records-management-section-container">
                <button 
                  className="sidebar-section-header"
                  onClick={toggleRecordsSection}
                >
                  <span>Records Management</span>
                  <span className="toggle-icon">{recordsExpanded ? '▼' : '►'}</span>
                </button>
                
                {recordsExpanded && (
                  <div className="records-management-section">
                    <div className="form-group">
                      <label>Classification</label>
                      <select 
                        name="classification"
                        value={document.recordsManagement?.classification || ''}
                        onChange={handleRecordsChange}
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
                    
                    <div className="form-group">
                      <label>Document Type</label>
                      <select 
                        name="documentType"
                        value={document.recordsManagement?.documentType || ''}
                        onChange={handleRecordsChange}
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
                    
                    <div className="form-group">
                      <label>Retention Period</label>
                      <select 
                        name="retentionPeriod"
                        value={document.recordsManagement?.retentionPeriod || ''}
                        onChange={handleRecordsChange}
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
                    
                    <div className="form-group">
                      <label>Record Number</label>
                      <input 
                        type="text"
                        name="recordNumber"
                        value={document.recordsManagement?.recordNumber || ''}
                        onChange={handleRecordsChange}
                        placeholder="Enter record number"
                        disabled={!!selectedVersion || isDocumentFinal()}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea 
                        name="notes"
                        value={document.recordsManagement?.notes || ''}
                        onChange={handleRecordsChange}
                        placeholder="Enter records management notes"
                        rows={3}
                        disabled={!!selectedVersion || isDocumentFinal()}
                      ></textarea>
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox"
                          name="isFinal"
                          checked={document.recordsManagement?.isFinal || false}
                          onChange={handleToggleFinal}
                          disabled={!!selectedVersion || isDocumentFinal()}
                        />
                        Mark as Final (prevents further editing)
                      </label>
                      {isDocumentFinal() && (
                        <div className="final-notice">
                          This document is finalized and cannot be edited.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sidebar-section">
                <button 
                  className="sidebar-section-header"
                  onClick={toggleTemplateSection}
                >
                  Template Merge & Finalization {templateExpanded ? '▼' : '►'}
                </button>
                
                {templateExpanded && (
                  <div className="sidebar-section-content">
                    <TemplateManager 
                      document={document}
                      onMergeComplete={handleMergeComplete}
                    />
                  </div>
                )}
              </div>

              <div className="sidebar-section">
                <button 
                  onClick={handleSave} 
                  className="sidebar-button"
                  disabled={!!selectedVersion || isDocumentFinal()}
                >
                  Save Document (Ctrl+S)
                </button>
              </div>
            </div>
            <div className="document-editor-wrapper">
              <DocumentEditorDemo
                ref={editorRef}
                document={document}
                onContentChange={handleContentChange}
                readOnly={!!selectedVersion || isDocumentFinal()}
                key={document.id} // Add key to force re-render when document ID changes
              />
              {!contentLoaded && (
                <div className="editor-loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Loading document content...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentEditorPage; 