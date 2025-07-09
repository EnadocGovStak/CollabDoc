import React, { useRef, useState, useEffect, useMemo } from 'react';
import DocumentEditorDemo from '../DocumentEditorDemo';
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
  
  // Create sample data for merge field preview
  const sampleMergeData = useMemo(() => {
    const defaultData = {
      'CustomerName': 'John Smith',
      'CompanyName': 'Acme Corporation',
      'ServiceType': 'Web Development',
      'ProjectName': 'Corporate Website Redesign',
      'Budget': '25,000',
      'Timeline': '3 months',
      'ContactPerson': 'Jane Doe',
      'ResponseTime': '3',
      'SenderName': 'David Johnson',
      'SenderTitle': 'Project Manager',
      'CompanyAddress': '123 Business Ave, Suite 100, New York, NY 10001',
      'CompanyPhone': '(555) 123-4567',
      'CompanyEmail': 'info@acmecorp.com'
    };
    
    // If the template has merge fields, populate with sample data
    if (templateData?.mergeFields) {
      const mergeData = {};
      templateData.mergeFields.forEach(field => {
        // Try to use a default value that makes sense for the field name
        if (defaultData[field.name]) {
          mergeData[field.name] = defaultData[field.name];
        } else {
          // Generate a sample value based on field name
          const name = field.name.toLowerCase();
          if (name.includes('name')) {
            mergeData[field.name] = 'Sample Name';
          } else if (name.includes('email')) {
            mergeData[field.name] = 'sample@example.com';
          } else if (name.includes('phone')) {
            mergeData[field.name] = '(555) 123-4567';
          } else if (name.includes('date')) {
            mergeData[field.name] = '01/01/2025';
          } else if (name.includes('amount') || name.includes('price') || name.includes('cost')) {
            mergeData[field.name] = '$1,000.00';
          } else {
            mergeData[field.name] = `Sample ${field.name}`;
          }
        }
      });
      return mergeData;
    }
    
    // If no merge fields are defined, try to extract them from content
    if (templateData?.content) {
      const pattern = /\{\{([^}]+)\}\}/g;
      const extractedFields = [];
      let match;
      let content = templateData.content;
      
      // Handle if content is an object with sfdt property
      if (typeof content === 'object' && content.sfdt) {
        content = content.sfdt;
      }
      
      // Convert to string if it's an object
      if (typeof content === 'object') {
        content = JSON.stringify(content);
      }
      
      // Extract fields
      const mergeData = {};
      try {
        while ((match = pattern.exec(content)) !== null) {
          const fieldName = match[1].trim();
          if (!extractedFields.includes(fieldName)) {
            extractedFields.push(fieldName);
            mergeData[fieldName] = defaultData[fieldName] || `Sample ${fieldName}`;
          }
        }
        
        if (Object.keys(mergeData).length > 0) {
          return mergeData;
        }
      } catch (err) {
        console.error('Error extracting merge fields from content:', err);
      }
    }
    
    return defaultData;
  }, [templateData]);

  // Handle editor loaded event
  const handleEditorLoaded = () => {
    setEditorLoaded(true);
  };

  // Load template data if not provided
  useEffect(() => {
    const loadTemplate = async () => {
      if (template) {
        setTemplateData(template);
        return;
      }
      
      if (!templateId) {
        setError('No template ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await TemplateService.getTemplateContent(templateId);
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
              <DocumentEditorDemo
                ref={editorRef}
                document={templateData}
                isReadOnly={true}
                enableToolbar={false}
                onContentChange={handleEditorLoaded}
                mergeData={sampleMergeData}
                isPreview={true}
              />
              {editorLoaded && editorRef.current && (
                <div className="preview-controls">
                  <button 
                    className="preview-toggle-button"
                    onClick={() => editorRef.current.previewWithMergeFields(sampleMergeData)}
                  >
                    Show with Sample Data
                  </button>
                </div>
              )}
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
