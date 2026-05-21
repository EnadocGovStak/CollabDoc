import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Eye,
  FilePlus2,
  Library,
  Save,
  Search,
  ShieldCheck
} from 'lucide-react';
import DocumentEditorDemo from '../components/DocumentEditorDemo';
import TemplateService from '../services/TemplateService';
import TemplatePreviewModal from '../components/TemplateSelector/TemplatePreviewModal';
import { normalizeSfdtContent } from '../utils/sfdtContent';
import './TemplateEditorPage.css';

const CLASSIFICATION_OPTIONS = ['Unclassified', 'Public', 'Internal', 'Confidential', 'Restricted', 'Secret', 'Top Secret'];
const DOCUMENT_TYPE_OPTIONS = ['Standard Document', 'Template', 'Policy', 'Procedure', 'Report', 'Legal Contract', 'Correspondence', 'Operation Manual', 'Technical Manual', 'Invoice', 'Letter', 'Contract'];
const RETENTION_PERIOD_OPTIONS = ['1 Year', '2 Years', '3 Years', '5 Years', '7 Years', '10 Years', '15 Years', '25 Years', 'Permanent', 'Until Superseded'];
const ACCESS_CONTROL_OPTIONS = ['Public', 'Internal', 'Confidential', 'Restricted'];
const REVIEW_CYCLE_OPTIONS = ['3 Months', '6 Months', '1 Year', '2 Years', '3 Years', 'Not Required'];

const DEFAULT_TEMPLATE_RECORDS_MANAGEMENT = {
  classification: 'Internal',
  retentionPeriod: '7 Years',
  accessControl: 'Internal',
  documentType: 'Standard Document',
  department: 'General',
  reviewCycle: '1 Year'
};

const normalizePolicyPeriod = (value) => {
  if (!value || typeof value !== 'string') return value || '';

  return value.replace(/\b(year|years|month|months|day|days)\b/gi, (match) => (
    match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
  ));
};

const normalizeTemplateRecordsManagement = (recordsManagement = {}, sourceTemplate = {}) => {
  const source = recordsManagement && typeof recordsManagement === 'object' ? recordsManagement : {};
  const documentType = source.documentType || sourceTemplate.documentType || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.documentType;

  return {
    ...source,
    classification: source.classification || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.classification,
    retentionPeriod: normalizePolicyPeriod(source.retentionPeriod || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.retentionPeriod),
    accessControl: source.accessControl || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.accessControl,
    documentType,
    department: source.department || sourceTemplate.category || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.department,
    reviewCycle: normalizePolicyPeriod(source.reviewCycle || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.reviewCycle)
  };
};

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
  const [fieldLibraryFields, setFieldLibraryFields] = useState([]);
  const [fieldLibraryLoading, setFieldLibraryLoading] = useState(false);
  const [fieldLibraryError, setFieldLibraryError] = useState('');
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');

  const loadFieldLibrary = useCallback(async () => {
    try {
      setFieldLibraryLoading(true);
      setFieldLibraryError('');

      const result = await TemplateService.getFieldLibrary();
      const fields = Array.isArray(result?.fields) ? result.fields : [];

      if (!result?.success && fields.length === 0) {
        throw new Error(result?.error || 'Field library unavailable');
      }

      setFieldLibraryFields(fields);
    } catch (fieldError) {
      console.error('Error loading field library:', fieldError);
      setFieldLibraryFields([]);
      setFieldLibraryError('Field list is unavailable. Open the library to manage fields.');
    } finally {
      setFieldLibraryLoading(false);
    }
  }, []);
  
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
            category: response.category,
            documentType: response.documentType || response.recordsManagement?.documentType || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.documentType,
            content: response.content,
            mergeFields: response.mergeFields || [],
            fieldAnalysis: response.fieldAnalysis,
            recordsManagement: normalizeTemplateRecordsManagement(response.recordsManagement, response),
            createdAt: response.createdAt || new Date().toISOString(),
            lastModified: response.modifiedAt || new Date().toISOString()
          });
          
          setTimeout(() => {
            try {
              if (editorRef.current && response.content) {
                const normalizedContent = normalizeSfdtContent(response.content, { title: response.name });
                editorRef.current.setContent(normalizedContent || response.content);
              }
            } catch (editorLoadError) {
              console.warn('Template content will continue loading through editor fallback:', editorLoadError);
            } finally {
              setContentLoaded(true);
            }
          }, 100);
        } catch (fetchError) {
          console.error('Error fetching template:', fetchError);
          setTemplate({
            id: id,
            name: 'Untitled Template',
            description: '',
            category: 'General',
            documentType: DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.documentType,
            content: '',
            recordsManagement: normalizeTemplateRecordsManagement(),
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
          category: 'General',
          documentType: DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.documentType,
          content: '',
          recordsManagement: normalizeTemplateRecordsManagement(),
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

  useEffect(() => {
    loadFieldLibrary();
  }, [loadFieldLibrary]);

  // Handle content changes
  const handleContentChange = useCallback((content) => {
    if (content) {
      setTemplate(prev => prev ? ({
        ...prev,
        content,
        lastModified: new Date().toISOString()
      }) : prev);
    }
  }, []);

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
      const recordsManagement = normalizeTemplateRecordsManagement(template.recordsManagement, template);
      const templateData = {
        name: template.name,
        description: template.description,
        category: template.category || recordsManagement.department || 'General',
        documentType: recordsManagement.documentType || template.documentType || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.documentType,
        recordsManagement,
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
        category: result.category || prev.category,
        documentType: result.documentType || prev.documentType,
        recordsManagement: normalizeTemplateRecordsManagement(result.recordsManagement || recordsManagement, result),
        mergeFields: result.mergeFields || prev.mergeFields || [],
        fieldAnalysis: result.fieldAnalysis || {
          managedFieldCount: (result.mergeFields || []).filter(field => field.managed).length,
          unmanagedFieldCount: (result.mergeFields || []).filter(field => field.managed === false).length,
          unknownFields: (result.mergeFields || []).filter(field => field.managed === false).map(field => field.name),
          migrationRequired: (result.mergeFields || []).some(field => field.managed === false),
          extractedFields: (result.mergeFields || []).map(field => field.name)
        },
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

  const handleRecordsPolicyChange = (e) => {
    const { name, value } = e.target;

    setTemplate(prev => {
      const recordsManagement = {
        ...(prev.recordsManagement || {}),
        [name]: value
      };

      return {
        ...prev,
        documentType: name === 'documentType' ? value : prev.documentType,
        recordsManagement,
        lastModified: new Date().toISOString()
      };
    });
  };

  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewModalOpen(false);
  };

  const handleCopyFieldToken = async (fieldName) => {
    const token = `{{${fieldName}}}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
        setSaveStatus(`${token} copied`);
      } else {
        setSaveStatus(token);
      }
    } catch (copyError) {
      console.warn('Failed to copy field token:', copyError);
      setSaveStatus(token);
    }

    setTimeout(() => setSaveStatus(''), 2500);
  };

  const addMergeFieldToTemplate = useCallback((fieldDefinition) => {
    if (!fieldDefinition?.name) return;

    setTemplate(prev => {
      if (!prev) return prev;

      const existingFields = Array.isArray(prev.mergeFields) ? prev.mergeFields : [];
      const alreadyPresent = existingFields.some(field => field.name?.toLowerCase() === fieldDefinition.name.toLowerCase());

      if (alreadyPresent) return prev;

      const updatedFields = [
        ...existingFields,
        {
          ...fieldDefinition,
          managed: fieldDefinition.managed !== false
        }
      ];
      const managedFields = updatedFields.filter(field => field.managed);
      const unmanagedFields = updatedFields.filter(field => field.managed === false);
      const extractedFields = Array.from(new Set([
        ...(prev.fieldAnalysis?.extractedFields || []),
        fieldDefinition.name
      ]));

      return {
        ...prev,
        mergeFields: updatedFields,
        fieldAnalysis: {
          ...(prev.fieldAnalysis || {}),
          extractedFields,
          managedFieldCount: managedFields.length,
          unmanagedFieldCount: unmanagedFields.length,
          unknownFields: unmanagedFields.map(field => field.name),
          migrationRequired: unmanagedFields.length > 0
        },
        lastModified: new Date().toISOString()
      };
    });
  }, []);

  const handleInsertFieldToken = (fieldName, fieldDefinition) => {
    const token = `{{${fieldName}}}`;
    const inserted = editorRef.current?.insertTextAtCursor?.(token);

    if (inserted) {
      addMergeFieldToTemplate(fieldDefinition || { name: fieldName, managed: false });
      setSaveStatus(`${token} inserted`);
    } else {
      setSaveStatus(`Place cursor in editor, then insert ${token}`);
    }

    setTimeout(() => setSaveStatus(''), 3000);
  };

  const managedFieldCount = template?.fieldAnalysis?.managedFieldCount ?? template?.mergeFields?.filter(field => field.managed).length ?? 0;
  const unmanagedFieldCount = template?.fieldAnalysis?.unmanagedFieldCount ?? template?.mergeFields?.filter(field => field.managed === false).length ?? 0;
  const fieldCount = template?.mergeFields?.length || 0;
  const filteredFieldLibraryFields = useMemo(() => {
    const normalizedQuery = fieldSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) return fieldLibraryFields;

    return fieldLibraryFields.filter(field => [
      field.name,
      field.label,
      field.category,
      field.type,
      field.description
    ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [fieldLibraryFields, fieldSearchQuery]);
  const visibleFieldLibraryFields = filteredFieldLibraryFields.slice(0, 12);
  const existingFieldNames = new Set((template?.mergeFields || []).map(field => field.name?.toLowerCase()).filter(Boolean));
  const recordsPolicy = template ? normalizeTemplateRecordsManagement(template.recordsManagement, template) : DEFAULT_TEMPLATE_RECORDS_MANAGEMENT;
  const isNewTemplate = !id && !template?.id;
  const hasNamedTemplate = Boolean(template?.name && template.name !== 'Untitled Template');
  const hasLifecyclePolicy = Boolean(recordsPolicy.classification && recordsPolicy.retentionPeriod);
  const authoringSteps = [
    {
      label: 'Name the template',
      detail: hasNamedTemplate ? template.name : 'Use a recognizable business name.',
      complete: hasNamedTemplate,
      icon: FilePlus2
    },
    {
      label: 'Attach lifecycle policy',
      detail: `${recordsPolicy.classification} / ${recordsPolicy.retentionPeriod}`,
      complete: hasLifecyclePolicy,
      icon: ShieldCheck
    },
    {
      label: 'Add managed fields',
      detail: fieldCount > 0 ? `${managedFieldCount} managed, ${unmanagedFieldCount} unmanaged` : 'Insert {{FieldName}} tokens in the editor.',
      complete: fieldCount > 0 && unmanagedFieldCount === 0,
      attention: unmanagedFieldCount > 0,
      icon: Library
    }
  ];

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
    <div className={`template-editor-page ${isNewTemplate ? 'guided-template-creation' : ''}`}>
      <div className="template-editor-header">
        <Link to="/templates" className="back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Templates
        </Link>
        <div className="template-editor-title">
          <p>{isNewTemplate ? 'Guided creation' : 'Template authoring'}</p>
          <h1>{template?.name || 'Untitled Template'}</h1>
        </div>
        <div className="template-editor-actions">
          {saveStatus && <span className="save-status">{saveStatus}</span>}
          <button 
            onClick={handlePreview}
            className="template-editor-action-button preview-button"
          >
            <Eye size={16} aria-hidden="true" />
            Preview
          </button>
          <button 
            onClick={handleSave}
            className="template-editor-action-button save-button"
          >
            <Save size={16} aria-hidden="true" />
            Save Template
          </button>
        </div>
      </div>
      {isNewTemplate && (
        <section className="template-guided-banner" aria-labelledby="template-guided-title">
          <div>
            <p className="template-guided-eyebrow">
              <ClipboardList size={15} aria-hidden="true" />
              Guided creation
            </p>
            <h2 id="template-guided-title">Build a governed template before documents are generated.</h2>
            <p>
              Name the template, attach lifecycle policy, and insert reusable merge-field tokens into the editor surface.
            </p>
          </div>
          <div className="template-guided-banner-actions">
            <Link to="/field-library" className="template-guided-link">
              <Library size={16} aria-hidden="true" />
              Field Library
            </Link>
            <button type="button" onClick={handleSave} className="template-guided-save">
              <Save size={16} aria-hidden="true" />
              Save draft
            </button>
          </div>
        </section>
      )}
      <div className="template-editor-content">
        {template && (
          <>
            <div className="template-sidebar">
              <div className="template-authoring-guide">
                <div className="template-authoring-guide-heading">
                  <p>{isNewTemplate ? 'Creation checklist' : 'Authoring checklist'}</p>
                  <span>{authoringSteps.filter(step => step.complete).length}/{authoringSteps.length}</span>
                </div>
                <div className="template-authoring-steps">
                  {authoringSteps.map(step => {
                    const StepIcon = step.icon;
                    return (
                      <div key={step.label} className={`template-authoring-step ${step.complete ? 'complete' : step.attention ? 'attention' : ''}`}>
                        {step.complete ? <CheckCircle2 size={17} aria-hidden="true" /> : step.attention ? <AlertTriangle size={17} aria-hidden="true" /> : <StepIcon size={17} aria-hidden="true" />}
                        <div>
                          <strong>{step.label}</strong>
                          <span>{step.detail}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sidebar-section field-library-picker" aria-label="Managed field list">
                <div className="field-analysis-heading">
                  <h3>Managed Field List</h3>
                  <Link to="/field-library" className="field-library-link">Manage</Link>
                </div>
                <div className="template-field-library-search">
                  <Search size={15} aria-hidden="true" />
                  <input
                    type="search"
                    value={fieldSearchQuery}
                    onChange={(event) => setFieldSearchQuery(event.target.value)}
                    placeholder="Search reusable fields"
                    aria-label="Search reusable fields"
                  />
                </div>
                {fieldLibraryLoading ? (
                  <div className="template-field-empty">Loading managed fields...</div>
                ) : fieldLibraryError ? (
                  <div className="template-field-empty">
                    {fieldLibraryError}
                  </div>
                ) : visibleFieldLibraryFields.length > 0 ? (
                  <>
                    <div className="template-field-library-list">
                      {visibleFieldLibraryFields.map(field => {
                        const isInTemplate = existingFieldNames.has(field.name?.toLowerCase());

                        return (
                          <div key={field.name} className={`template-field-library-row ${isInTemplate ? 'in-template' : ''}`}>
                            <div className="template-field-row-main">
                              <strong>{field.label || field.name}</strong>
                              <span>{field.category || 'General'} · {field.type || 'text'}</span>
                            </div>
                            <div className="template-field-row-actions">
                              <span className="template-field-source managed">
                                {isInTemplate ? 'In template' : 'Managed'}
                              </span>
                              <div className="template-field-token-actions">
                                <button type="button" onClick={() => handleInsertFieldToken(field.name, field)}>Insert</button>
                                <button type="button" onClick={() => handleCopyFieldToken(field.name)}>Copy</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {filteredFieldLibraryFields.length > visibleFieldLibraryFields.length && (
                      <p className="template-field-library-more">
                        Showing {visibleFieldLibraryFields.length} of {filteredFieldLibraryFields.length}. Search to narrow the list.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="template-field-empty">No managed fields match this search.</div>
                )}
              </div>

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

              <div className="sidebar-section lifecycle-policy-section">
                <div className="lifecycle-policy-heading">
                  <h3>Document Lifecycle Policy</h3>
                  <span>Attached to template</span>
                </div>
                <div className="lifecycle-policy-summary">
                  <span>{recordsPolicy.classification}</span>
                  <span>{recordsPolicy.retentionPeriod}</span>
                </div>
                <div className="lifecycle-policy-grid">
                  <label>
                    Classification
                    <select name="classification" value={recordsPolicy.classification} onChange={handleRecordsPolicyChange}>
                      {CLASSIFICATION_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label>
                    Document Type
                    <select name="documentType" value={recordsPolicy.documentType} onChange={handleRecordsPolicyChange}>
                      {DOCUMENT_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label>
                    Retention Period
                    <select name="retentionPeriod" value={recordsPolicy.retentionPeriod} onChange={handleRecordsPolicyChange}>
                      {RETENTION_PERIOD_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label>
                    Access Control
                    <select name="accessControl" value={recordsPolicy.accessControl} onChange={handleRecordsPolicyChange}>
                      {ACCESS_CONTROL_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label>
                    Department
                    <input
                      type="text"
                      name="department"
                      value={recordsPolicy.department}
                      onChange={handleRecordsPolicyChange}
                      placeholder="Department"
                    />
                  </label>
                  <label>
                    Review Cycle
                    <select name="reviewCycle" value={recordsPolicy.reviewCycle} onChange={handleRecordsPolicyChange}>
                      {REVIEW_CYCLE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                </div>
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
                <div className="field-analysis-heading">
                  <h3>Field Analysis</h3>
                  <Link to="/field-library" className="field-library-link">Library</Link>
                </div>
                <div className="template-field-summary">
                  <span>{fieldCount} fields</span>
                  <span>{managedFieldCount} managed</span>
                  {unmanagedFieldCount > 0 && <span className="needs-migration">{unmanagedFieldCount} unmanaged</span>}
                </div>

                {fieldCount > 0 ? (
                  <div className="template-field-list">
                    {template.mergeFields.map(field => (
                      <div key={field.name} className="template-field-row">
                        <div className="template-field-row-main">
                          <strong>{field.label || field.name}</strong>
                          <span>{field.category || 'General'} · {field.type || 'text'}</span>
                        </div>
                        <div className="template-field-row-actions">
                          <span className={`template-field-source ${field.managed ? 'managed' : 'unmanaged'}`}>
                            {field.managed ? 'Managed' : 'Unmanaged'}
                          </span>
                          <div className="template-field-token-actions">
                            <button type="button" onClick={() => handleInsertFieldToken(field.name, field)}>Insert</button>
                            <button type="button" onClick={() => handleCopyFieldToken(field.name)}>Copy</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="template-field-empty">
                    No merge fields detected. Insert tokens such as {'{{ClientName}}'} into the editor, then save to refresh managed-field analysis.
                  </div>
                )}
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