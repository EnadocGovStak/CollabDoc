import React, { useRef, useState, useEffect } from 'react';
import TemplatePreviewEditor from '../TemplateMerge/TemplatePreviewEditor';
import TemplateService from '../../services/TemplateService';
import './TemplatePreview.css';

/**
 * Template Preview component for displaying templates in proper format
 * @param {Object} props Component props
 * @param {string} props.templateId The ID of the template to preview
 * @param {Object} props.template Optional template object (if already loaded)
 * @param {boolean} props.isModal Whether this preview is displayed in a modal
 * @param {Function} props.onClose Function to call when closing the preview (for modal mode)
 */
const TemplatePreview = ({ templateId, template, isModal = false, onClose }) => {
  const [templateData, setTemplateData] = useState(template || null);
  const [loading, setLoading] = useState(!template);
  const [error, setError] = useState(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const editorRef = useRef(null);
  // Handle editor loaded event
  const handleEditorLoaded = () => {
    console.log('Template preview editor loaded successfully');
    setEditorLoaded(true);
  };

  // Load template data if not provided
  useEffect(() => {
    const loadTemplate = async () => {
      if (template) {
        console.log('Using provided template:', template);
        setTemplateData(template);
        setLoading(false);
        return;
      }
      
      if (!templateId) {
        setError('No template ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Loading template with ID:', templateId);
        const response = await TemplateService.getTemplateContent(templateId);
        console.log('Template loaded successfully:', response);
        console.log('Template content type:', typeof response?.content);
        console.log('Template content preview:', response?.content?.substring ? response.content.substring(0, 100) : 'Not a string');
        setTemplateData(response);
        setError(null);
      } catch (err) {
        console.error('Error loading template for preview:', err);
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId, template]);

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className={`template-preview ${isModal ? 'modal' : ''}`}>
      {isModal && (
        <div className="template-preview-header">
          <h2>{templateData?.name || 'Template Preview'}</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
      )}
      
      <div className="template-preview-content">
        {loading ? (
          <div className="template-preview-loading">
            <div className="spinner"></div>
            <p>Loading template...</p>
          </div>
        ) : error ? (
          <div className="template-preview-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : templateData ? (
          <div className="template-preview-document">
            {templateData.description && (
              <div className="template-description">
                <p>{templateData.description}</p>
              </div>
            )}
            {!editorLoaded && (
              <div className="template-preview-loading editor-loading">
                <div className="spinner"></div>
                <p>Loading document editor...</p>
              </div>
            )}
            <div className="document-editor-container" style={{ opacity: editorLoaded ? 1 : 0.3 }}>
              <TemplatePreviewEditor
                ref={editorRef}
                initialContent={templateData?.content}
                isReadOnly={true}
                enableToolbar={false}
                onCreated={handleEditorLoaded}
                height="500px"
              />
            </div>
          </div>
        ) : (
          <div className="template-preview-empty">
            <p>No template data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePreview;
