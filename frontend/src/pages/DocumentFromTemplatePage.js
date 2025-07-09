import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TemplateService from '../services/TemplateService';
import { documentService } from '../services/DocumentService';
import DynamicForm from '../components/DynamicForm/DynamicForm';
import DocumentPreview from '../components/DocumentPreview/DocumentPreview';
import './DocumentFromTemplatePage.css';

const DocumentFromTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [documentName, setDocumentName] = useState('');

  // Load template on mount
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        const templateData = await TemplateService.getTemplateContent(templateId);
        setTemplate(templateData);
        
        // Set default document name
        setDocumentName(`${templateData.name} - Generated`);
        
        // Initialize form data with default values
        const initialData = {};
        templateData.mergeFields?.forEach(field => {
          if (field.defaultValue) {
            initialData[field.name] = field.defaultValue;
          }
        });
        setFormData(initialData);
        
        setError(null);
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  // Update preview when form data changes
  useEffect(() => {
    const updatePreview = async () => {
      if (template && Object.keys(formData).length > 0) {
        try {
          const preview = await TemplateService.previewTemplate(templateId, formData);
          if (preview.success) {
            setPreviewContent(preview.content);
          }
        } catch (err) {
          console.error('Error generating preview:', err);
        }
      }
    };

    // Debounce preview updates
    const timeout = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeout);
  }, [template, formData, templateId]);

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  const handleGenerateDocument = async () => {
    if (!template) return;

    try {
      setGenerating(true);
      
      // Generate document from template
      const result = await TemplateService.generateDocument(templateId, formData);
      
      if (result.success) {
        // Navigate to the generated document
        navigate(`/editor/${result.documentId}`, {
          state: { 
            message: 'Document generated successfully from template',
            templateName: template.name 
          }
        });
      } else {
        setError(result.error || 'Failed to generate document');
      }
    } catch (err) {
      console.error('Error generating document:', err);
      setError('Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (submittedData) => {
    if (!template) return;

    try {
      setGenerating(true);
      
      // Generate document from template
      const result = await TemplateService.generateDocument(templateId, submittedData);
      
      if (result.success) {
        // Clear saved draft after successful generation
        localStorage.removeItem(`form_draft_${templateId}`);
        
        // Navigate to the generated document
        navigate(`/editor/${result.documentId}`, {
          state: { 
            message: 'Document generated successfully from template',
            templateName: template.name 
          }
        });
      } else {
        setError(result.error || 'Failed to generate document');
        setGenerating(false);
      }
    } catch (err) {
      console.error('Error generating document:', err);
      setError('An error occurred while generating the document');
      setGenerating(false);
    }
  };

  const validateForm = () => {
    if (!template?.mergeFields) return true;
    
    const requiredFields = template.mergeFields.filter(field => field.required);
    return requiredFields.every(field => 
      formData[field.name] && formData[field.name].toString().trim() !== ''
    );
  };

  if (loading) {
    return (
      <div className="document-from-template-page">
        <div className="loading">Loading template...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-from-template-page">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/templates')}>
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="document-from-template-page">
        <div className="error">
          <h2>Template Not Found</h2>
          <p>The requested template could not be found.</p>
          <button onClick={() => navigate('/templates')}>
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  const isFormValid = validateForm();

  return (
    <div className="document-from-template-page">
      <header className="page-header">
        <h1>Generate Document from Template</h1>
        <div className="template-info">
          <h2>{template.name}</h2>
          <p>{template.description}</p>
          <div className="template-meta">
            <span className="category">{template.category}</span>
            <span className="type">{template.documentType}</span>
          </div>
        </div>
      </header>

      <div className="content-layout">
        <div className="form-section">
          <div className="form-header">
            <h3>Fill in the Details</h3>
            <p>Complete the form below to generate your document</p>
          </div>
          
          <div className="document-name-input">
            <label htmlFor="documentName">Document Name:</label>
            <input
              id="documentName"
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>

          <DynamicForm
            template={template}
            formData={formData}
            onChange={handleFormChange}
          />

          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/templates')}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleGenerateDocument}
              disabled={!isFormValid || generating}
            >
              {generating ? 'Generating...' : 'Generate Document'}
            </button>
          </div>
        </div>

        <div className="preview-section">
          <div className="preview-header">
            <h3>Document Preview</h3>
            <p>Preview of your document with current data</p>
          </div>
          
          <DocumentPreview 
            content={previewContent}
            template={template}
            formData={formData}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentFromTemplatePage;
