import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/DocumentService';
import './NewDocumentModal.css';

const NewDocumentModal = ({ isOpen, onClose }) => {
  const [documentType, setDocumentType] = useState('blank');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [mergeFields, setMergeFields] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

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

  // Handle template selection
  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId) {
      try {
        setLoading(true);
        // Load the template to extract merge fields
        const template = await documentService.getTemplate(templateId);
        
        // Extract merge fields from template content
        // This is a simple implementation - in a real app, you might want to parse this more robustly
        const mergeFieldsObj = {};
        const regex = /{{([^}]+)}}/g;
        let match;
        const content = template.content || '';
        
        while ((match = regex.exec(content)) !== null) {
          const fieldName = match[1].trim();
          if (fieldName !== 'signature_field' && !mergeFieldsObj[fieldName]) {
            mergeFieldsObj[fieldName] = '';
          }
        }
        
        setMergeFields(mergeFieldsObj);
      } catch (err) {
        console.error('Error loading template details:', err);
        setError('Failed to load template details');
      } finally {
        setLoading(false);
      }
    } else {
      setMergeFields({});
    }
  };

  // Handle merge field value changes
  const handleMergeFieldChange = (fieldName, value) => {
    setMergeFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Create new document
  const handleCreateDocument = async () => {
    try {
      setLoading(true);
      
      if (documentType === 'blank') {
        // Create blank document and navigate to editor
        navigate('/editor');
      } else if (documentType === 'template' && selectedTemplate) {
        // Create document from template
        const result = await documentService.createFromTemplate(selectedTemplate, mergeFields);
        
        // Navigate to the new document
        if (result && result.id) {
          navigate(`/editor/${result.id}`);
        } else {
          throw new Error('Failed to create document from template');
        }
      }
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="new-document-modal">
        <div className="modal-header">
          <h2>Create New Document</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="document-type-selection">
            <div className="radio-group">
              <label className={`option-card ${documentType === 'blank' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="documentType"
                  value="blank"
                  checked={documentType === 'blank'}
                  onChange={() => setDocumentType('blank')}
                />
                <div className="option-icon">📄</div>
                <div className="option-text">
                  <h3>Blank Document</h3>
                  <p>Start with an empty document</p>
                </div>
              </label>
              
              <label className={`option-card ${documentType === 'template' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="documentType"
                  value="template"
                  checked={documentType === 'template'}
                  onChange={() => setDocumentType('template')}
                />
                <div className="option-icon">📋</div>
                <div className="option-text">
                  <h3>From Template</h3>
                  <p>Use an existing template</p>
                </div>
              </label>
            </div>
          </div>
          
          {documentType === 'template' && (
            <div className="template-selection">
              <label htmlFor="template-select">Select Template:</label>
              <select
                id="template-select"
                value={selectedTemplate}
                onChange={handleTemplateChange}
                disabled={loading || templates.length === 0}
              >
                <option value="">-- Select a template --</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              
              {loading && <div className="loading-spinner">Loading...</div>}
              
              {templates.length === 0 && !loading && (
                <p className="no-templates-message">
                  No templates available. Please create a template first.
                </p>
              )}
              
              {selectedTemplate && Object.keys(mergeFields).length > 0 && (
                <div className="merge-fields-section">
                  <h3>Enter values for merge fields:</h3>
                  {Object.keys(mergeFields).map(fieldName => (
                    <div key={fieldName} className="merge-field-input">
                      <label htmlFor={`field-${fieldName}`}>{fieldName}:</label>
                      <input
                        id={`field-${fieldName}`}
                        type="text"
                        value={mergeFields[fieldName]}
                        onChange={(e) => handleMergeFieldChange(fieldName, e.target.value)}
                        placeholder={`Enter ${fieldName}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="create-button"
            onClick={handleCreateDocument}
            disabled={loading || (documentType === 'template' && !selectedTemplate)}
          >
            {loading ? 'Creating...' : 'Create Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentModal; 