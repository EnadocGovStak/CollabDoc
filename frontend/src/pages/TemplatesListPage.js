import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../services/DocumentService';
import './TemplatesListPage.css';

const TemplatesListPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const templatesData = await documentService.getTemplates();
        setTemplates(templatesData);
        setError(null);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Handle template deletion
  const handleDeleteTemplate = async (templateId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      await documentService.deleteTemplate(templateId);
      // Update the templates list after deletion
      setTemplates(templates.filter(template => template.id !== templateId));
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  };

  return (
    <div className="templates-list-page">
      <div className="templates-list-header">
        <h1>Document Templates</h1>
        <Link to="/templates/new" className="new-template-button">
          Create New Template
        </Link>
      </div>

      {loading ? (
        <div className="loading-message">Loading templates...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : templates.length === 0 ? (
        <div className="empty-message">
          <p>No templates yet. Click "Create New Template" to get started.</p>
          <p className="empty-description">
            Templates are used to merge with documents when finalizing them for signing.
          </p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => (
            <Link 
              to={`/templates/${template.id}`} 
              key={template.id}
              className="template-card"
            >
              <div className="template-icon">📄</div>
              <div className="template-details">
                <h3 className="template-name">{template.name}</h3>
                {template.description && (
                  <p className="template-description">{template.description}</p>
                )}
                <div className="template-meta">
                  <span className="template-date">
                    {template.modifiedAt 
                      ? `Modified: ${new Date(template.modifiedAt).toLocaleDateString()}` 
                      : `Created: ${new Date(template.createdAt).toLocaleDateString()}`
                    }
                  </span>
                </div>
              </div>
              <button 
                className="template-delete-btn" 
                onClick={(e) => handleDeleteTemplate(template.id, e)}
                title="Delete Template"
              >
                ×
              </button>
            </Link>
          ))}
        </div>
      )}

      <div className="templates-info-section">
        <h2>About Templates</h2>
        <p>
          Templates provide standardized layouts and content for documents when preparing them
          for finalization and digital signing. Create templates with placeholders that will
          be automatically filled with document data.
        </p>
        <div className="templates-info-columns">
          <div className="templates-info-column">
            <h3>Template Usage</h3>
            <ol>
              <li>Create a template with the necessary structure</li>
              <li>Include placeholders for dynamic content</li>
              <li>When finalizing a document, select the appropriate template</li>
              <li>The system will merge the document with the template</li>
              <li>The merged document will be prepared for digital signing</li>
            </ol>
          </div>
          <div className="templates-info-column">
            <h3>Template Placeholders</h3>
            <ul>
              <li><code>{'{{document_title}}'}</code> - Title of the document</li>
              <li><code>{'{{document_id}}'}</code> - ID of the document</li>
              <li><code>{'{{date}}'}</code> - Current date</li>
              <li><code>{'{{signature_field}}'}</code> - Place for digital signature</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesListPage; 