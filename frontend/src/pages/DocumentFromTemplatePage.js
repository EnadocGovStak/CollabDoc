import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TemplateService from '../services/TemplateService';
import { documentService } from '../services/DocumentService';
import { TemplateMergeForm, TemplateMergePreview, useTemplateMerge } from '../components/TemplateMerge';
import './DocumentFromTemplatePage.css';

const DocumentFromTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [documentName, setDocumentName] = useState('');

  // Use the template merge hook for form management
  const {
    mergeData,
    setMergeData,
    updateMergeData,
    mergedContent,
    validationResult,
    isValid
  } = useTemplateMerge(template);

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
        setMergeData(initialData);
        
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
  }, [templateId, setMergeData]);

  const handleGenerateDocument = async (formData) => {
    if (!template) return;

    try {
      setGenerating(true);
      console.log('Starting document generation with template:', templateId);
      console.log('Form data:', formData);
      
      // Generate document from template
      const result = await TemplateService.generateDocument(templateId, formData);
      console.log('Generation result:', result);
      
      if (result.success) {
        console.log('Document generated successfully, documentId:', result.documentId);
        
        // Clear saved draft after successful generation
        localStorage.removeItem(`template_form_${templateId}`);
        
        // Navigate to the generated document
        const documentPath = `/editor/${result.documentId}`;
        console.log('Navigating to:', documentPath);
        
        navigate(documentPath, {
          state: { 
            message: 'Document generated successfully from template',
            templateName: template.name 
          }
        });
      } else {
        console.error('Generation failed:', result.error);
        setError(result.error || 'Failed to generate document');
      }
    } catch (err) {
      console.error('Error generating document:', err);
      setError('Failed to generate document');
    } finally {
      setGenerating(false);
    }
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

          <TemplateMergeForm
            template={template}
            mergeData={mergeData}
            onDataChange={updateMergeData}
            onSubmit={handleGenerateDocument}
            submitLabel={generating ? 'Generating...' : 'Generate Document'}
            showValidation={true}
            enableAutoSave={true}
          />

          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/templates')}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="preview-section">
          <div className="preview-header">
            <h3>Document Preview</h3>
            <p>Preview of your document with current data</p>
          </div>
          
          <TemplateMergePreview 
            template={template}
            mergeData={mergeData}
            showRawContent={false}
            height="500px"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentFromTemplatePage;
