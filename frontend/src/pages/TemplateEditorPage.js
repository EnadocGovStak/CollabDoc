import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DocumentEditorDemo from '../components/DocumentEditorDemo';
import TemplateService from '../services/TemplateService';
import TemplatePreviewModal from '../components/TemplateSelector/TemplatePreviewModal';
import './TemplateEditorPage.css';

const TemplateEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [contentLoaded, setContentLoaded] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  
  // Load template or create new one
  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setContentLoaded(false);
      
      if (id) {
        // Load existing template
        try {
          const response = await TemplateService.getTemplateContent(id);
          
          setTemplate({
            id: id,
            name: response.name,
            description: response.description,
            content: response.content,
            createdAt: response.createdAt || new Date().toISOString(),
            lastModified: response.modifiedAt || new Date().toISOString()
          });
          
          setTimeout(() => {
            if (editorRef.current && response.content) {
              editorRef.current.setContent(response.content);
            }
            setContentLoaded(true);
          }, 100);
        } catch (fetchError) {
          console.error('Error fetching template:', fetchError);
          setTemplate({
            id: id,
            name: 'Untitled Template',
            description: '',
            content: '',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
          });
          setContentLoaded(true);
        }
      } else {
        // Create new template
        setTemplate({
          id: null,
          name: 'Untitled Template',
          description: '',
          content: '',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        });
        setContentLoaded(true);
      }
    } catch (err) {
      console.error('Error loading template:', err);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  // Handle content changes
  const handleContentChange = useCallback((content) => {
    if (content && template) {
      setTemplate(prev => ({
        ...prev,
        content,
        lastModified: new Date().toISOString()
      }));
    }
  }, [template]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    
    try {
      setSaveStatus('Saving...');
      
      // Get the template content from the editor
      const content = await editorRef.current.getContent();
      if (!content) {
        throw new Error('Could not get template content');
      }
      
      // Create template data
      const templateData = {
        name: template.name,
        description: template.description,
        content: content
      };
      
      // Check if we have an existing template ID to update
      const existingId = id || template.id;
      console.log(`Saving template with ${existingId ? 'existing ID: ' + existingId : 'as new template'}`);
      
      // Save the template
      const result = await TemplateService.saveTemplate(templateData, existingId);
      
      // Update template in state with the returned data
      setTemplate(prev => ({
        ...prev,
        id: result.id,
        content,
        lastModified: new Date().toISOString()
      }));
      
      setSaveStatus('Template saved successfully');
      
      // If this was a new template and we got an ID back, update the URL
      if (!id && result.id) {
        navigate(`/templates/${result.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setSaveStatus('Error saving template');
    } finally {
      // Clear save status after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }
  }, [template, id, navigate]);

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

  const handleNameChange = (e) => {
    setTemplate(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleDescriptionChange = (e) => {
    setTemplate(prev => ({
      ...prev,
      description: e.target.value
    }));
  };

  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewModalOpen(false);
  };

  if (loading) {
    return (
      <div className="template-editor-page loading">
        <div className="loading-spinner">Loading template...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-editor-page error">
        <div className="error-message">
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadTemplate}>Retry</button>
            <Link to="/templates" className="back-link">Back to Templates</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="template-editor-page">
      <div className="template-editor-header">
        <Link to="/templates" className="back-link">
          ← Back to Templates
        </Link>
        <div className="template-editor-title">
          <h1>{template?.name || 'Untitled Template'}</h1>
        </div>
        <div className="template-editor-actions">
          {saveStatus && <span className="save-status">{saveStatus}</span>}
          <button 
            onClick={handlePreview}
            className="preview-button"
          >
            Preview
          </button>
          <button 
            onClick={handleSave}
            className="save-button"
          >
            Save Template
          </button>
        </div>
      </div>
      <div className="template-editor-content">
        {template && (
          <>
            <div className="template-sidebar">
              <div className="sidebar-section">
                <label>Template Name</label>
                <input 
                  type="text" 
                  value={template.name}
                  onChange={handleNameChange}
                  placeholder="Enter template name"
                />
              </div>
              
              <div className="sidebar-section">
                <label>Description</label>
                <textarea 
                  value={template.description}
                  onChange={handleDescriptionChange}
                  placeholder="Enter template description"
                  rows={4}
                ></textarea>
              </div>
              
              <div className="sidebar-section">
                <label>Created</label>
                <div>{new Date(template.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div className="sidebar-section">
                <label>Last modified</label>
                <div>{new Date(template.lastModified).toLocaleString()}</div>
              </div>

              {template.id && (
                <div className="sidebar-section">
                  <label>Template ID</label>
                  <div className="template-id">{template.id}</div>
                </div>
              )}

              <div className="sidebar-section">
                <h3>Template Instructions</h3>
                <div className="template-instructions">
                  <p>Templates are used to merge with documents when finalizing them for signing.</p>
                  <p>You can include placeholders for document data using double curly braces:</p>
                  <ul>
                    <li><code>{'{{document_title}}'}</code> - Title of the document</li>
                    <li><code>{'{{document_id}}'}</code> - ID of the document</li>
                    <li><code>{'{{date}}'}</code> - Current date</li>
                    <li><code>{'{{signature_field}}'}</code> - Place for digital signature</li>
                  </ul>
                </div>
              </div>

              <div className="sidebar-section">
                <button 
                  onClick={handleSave} 
                  className="sidebar-button"
                >
                  Save Template (Ctrl+S)
                </button>
                <button 
                  onClick={handlePreview} 
                  className="sidebar-button preview-button"
                >
                  Preview Template
                </button>
              </div>
            </div>
            <div className="template-editor-wrapper">
              <DocumentEditorDemo
                ref={editorRef}
                document={template}
                onContentChange={handleContentChange}
                key={template.id} 
              />
              {!contentLoaded && (
                <div className="editor-loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Loading template content...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={previewModalOpen}
        template={template}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default TemplateEditorPage;