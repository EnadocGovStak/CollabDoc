import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  Library,
  ShieldCheck
} from 'lucide-react';
import TemplateService from '../services/TemplateService';
import { TemplateMergeForm, TemplateMergePreview, useTemplateMerge } from '../components/TemplateMerge';
import './DocumentFromTemplatePage.css';

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';

const formatPolicyValue = (value) => value || 'Not set';

const getPolicyEntries = (recordsPolicy = {}) => ([
  { label: 'Classification', value: recordsPolicy.classification },
  { label: 'Retention', value: recordsPolicy.retentionPeriod },
  { label: 'Access', value: recordsPolicy.accessControl },
  { label: 'Review', value: recordsPolicy.reviewCycle }
]);

const DocumentFromTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [documentName, setDocumentName] = useState('');

  // Use the template merge hook for form management
  const {
    mergeData,
    setMergeData,
    updateMergeData,
    extractedFields
  } = useTemplateMerge(template);

  // Load template on mount
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        const templateData = await TemplateService.getTemplateContent(templateId);
        if (!templateData) {
          throw new Error('Template not found');
        }
        setTemplate(templateData);
        
        // Set default document name
        setDocumentName(`${templateData.name} - Generated`);
        
        setLoadError(null);
      } catch (err) {
        console.error('Error loading template:', err);
        setLoadError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      loadTemplate();
    }
  }, [templateId]); // Removed setMergeData dependency

  // Initialize form data with default values when template loads
  useEffect(() => {
    if (template?.mergeFields) {
      const initialData = {};
      template.mergeFields.forEach(field => {
        if (field.defaultValue) {
          initialData[field.name] = field.defaultValue;
        }
      });
      setMergeData(initialData);
    }
  }, [template, setMergeData]);

  const handleGenerateDocument = async (formData) => {
    if (!template) return;

    if (!hasValue(documentName)) {
      setGenerationError('Enter a document name before generating.');
      return;
    }

    try {
      setGenerating(true);
      setGenerationError(null);
      console.log('Starting document generation with template:', templateId);
      console.log('Form data:', formData);
      
      // Generate document from template
      const result = await TemplateService.generateDocument(templateId, formData, undefined, documentName.trim());
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
        setGenerationError(result.error || 'Failed to generate document');
      }
    } catch (err) {
      console.error('Error generating document:', err);
      setGenerationError('Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="document-from-template-page">
        <div className="generation-loading">Loading template...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="document-from-template-page">
        <div className="generation-state generation-state-error">
          <h2>Error</h2>
          <p>{loadError}</p>
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
        <div className="generation-state generation-state-error">
          <h2>Template Not Found</h2>
          <p>The requested template could not be found.</p>
          <button onClick={() => navigate('/templates')}>
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  const recordsPolicy = template.recordsManagement || {};
  const mergeFields = Array.isArray(template.mergeFields) ? template.mergeFields : [];
  const fieldAnalysis = template.fieldAnalysis || {};
  const fallbackFieldNames = Array.from(new Set([
    ...(fieldAnalysis.extractedFields || []),
    ...(extractedFields || [])
  ]));
  const fieldNames = Array.from(new Set([
    ...mergeFields.map(field => field.name),
    ...fallbackFieldNames
  ].filter(Boolean)));
  const totalFieldCount = fieldNames.length;
  const managedFieldCount = fieldAnalysis.managedFieldCount ?? mergeFields.filter(field => field.managed).length;
  const unmanagedFields = fieldAnalysis.unmanagedFields || mergeFields.filter(field => field.managed === false);
  const unmanagedFieldCount = fieldAnalysis.unmanagedFieldCount ?? unmanagedFields.length;
  const requiredFields = mergeFields.filter(field => field.required);
  const completedRequiredCount = requiredFields.filter(field => hasValue(mergeData[field.name])).length;
  const filledFieldCount = fieldNames.filter(fieldName => hasValue(mergeData[fieldName])).length;
  const documentNameReady = hasValue(documentName);
  const documentNameWarning = documentNameReady ? '' : 'Enter a document name before generating.';
  const requiredReady = requiredFields.length === completedRequiredCount;
  const migrationRequired = Boolean(fieldAnalysis.migrationRequired || unmanagedFieldCount > 0);
  const policyEntries = getPolicyEntries(recordsPolicy);
  const readinessItems = [
    {
      label: 'Document name',
      detail: documentNameReady ? 'Ready' : 'Required before generation',
      ready: documentNameReady
    },
    {
      label: 'Required fields',
      detail: `${completedRequiredCount} of ${requiredFields.length} complete`,
      ready: requiredReady
    },
    {
      label: 'Field library',
      detail: migrationRequired ? `${unmanagedFieldCount} fields need definitions` : 'Managed metadata ready',
      ready: !migrationRequired,
      attention: migrationRequired
    }
  ];

  return (
    <div className="document-from-template-page">
      <header className="generation-hero">
        <div className="generation-hero-main">
          <Link to="/templates" className="generation-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Templates
          </Link>
          <p className="generation-eyebrow">Guided generation</p>
          <h1>{template.name}</h1>
          <p className="generation-subtitle">
            {template.description || 'Complete the governed fields, review the policy, and generate a ready-to-edit document.'}
          </p>
          <div className="generation-meta">
            {template.category && <span>{template.category}</span>}
            {template.documentType && <span>{template.documentType}</span>}
            {recordsPolicy.classification && <span>{recordsPolicy.classification}</span>}
            {recordsPolicy.retentionPeriod && <span>{recordsPolicy.retentionPeriod}</span>}
          </div>
        </div>
        <div className="generation-hero-panel" aria-label="Generation readiness">
          <div className="generation-ready-icon">
            {documentNameReady && requiredReady ? <CheckCircle2 size={22} aria-hidden="true" /> : <ClipboardList size={22} aria-hidden="true" />}
          </div>
          <span>Readiness</span>
          <strong>{documentNameReady && requiredReady ? 'Ready to generate' : 'Needs details'}</strong>
          <small>{filledFieldCount} of {totalFieldCount} fields filled</small>
        </div>
      </header>

      <section className="generation-summary-grid" aria-label="Template generation summary">
        <article className="generation-summary-card">
          <FileText size={18} aria-hidden="true" />
          <span>Template fields</span>
          <strong>{totalFieldCount}</strong>
        </article>
        <article className="generation-summary-card">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Required complete</span>
          <strong>{completedRequiredCount}/{requiredFields.length}</strong>
        </article>
        <article className="generation-summary-card">
          <Library size={18} aria-hidden="true" />
          <span>Managed fields</span>
          <strong>{managedFieldCount}</strong>
        </article>
        <article className="generation-summary-card">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>Lifecycle policy</span>
          <strong>{recordsPolicy.classification || 'Default'}</strong>
        </article>
      </section>

      <div className="generation-content-layout">
        <div className="generation-form-section">
          <div className="generation-card generation-form-header">
            <div>
              <p className="generation-step-label">Step 1</p>
              <h2>Capture document details</h2>
              <p>Required values are validated before generation. A draft of this form is saved locally while you work.</p>
            </div>
            {template.fieldAnalysis && (
              <div className={`field-library-status ${migrationRequired ? 'migration-needed' : 'managed'}`}>
                <span>{managedFieldCount} managed fields</span>
                {unmanagedFieldCount > 0 && (
                  <span>{unmanagedFieldCount} need definitions</span>
                )}
              </div>
            )}
          </div>

          {generationError && (
            <div className="generation-inline-error" role="alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{generationError}</span>
            </div>
          )}

          {migrationRequired && (
            <div className="generation-migration-callout">
              <AlertTriangle size={18} aria-hidden="true" />
              <div>
                <strong>Field library attention needed</strong>
                <p>{unmanagedFieldCount} placeholders are usable now, but should be defined in the Field Library for governed reuse.</p>
                {unmanagedFields.length > 0 && (
                  <div className="generation-unmanaged-list">
                    {unmanagedFields.slice(0, 4).map(field => (
                      <span key={field.name || field}>{field.label || field.name || field}</span>
                    ))}
                    {unmanagedFields.length > 4 && <span>+{unmanagedFields.length - 4} more</span>}
                  </div>
                )}
                <Link to="/field-library">Open Field Library</Link>
              </div>
            </div>
          )}
          
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
            isSubmitDisabled={!documentNameReady || generating}
            disabledReason={documentNameWarning}
          />

          <div className="generation-cancel-actions">
            <button
              className="generation-btn generation-btn-secondary"
              onClick={() => navigate('/templates')}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="generation-preview-section">
          <div className="generation-card generation-readiness-card">
            <div className="generation-section-heading">
              <p className="generation-step-label">Step 2</p>
              <h2>Review readiness</h2>
            </div>
            <div className="generation-readiness-list">
              {readinessItems.map(item => (
                <div key={item.label} className={`generation-readiness-item ${item.ready ? 'ready' : item.attention ? 'attention' : 'blocked'}`}>
                  {item.ready ? <CheckCircle2 size={17} aria-hidden="true" /> : <AlertTriangle size={17} aria-hidden="true" />}
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="generation-policy-summary">
              <div className="generation-policy-heading">
                <ShieldCheck size={18} aria-hidden="true" />
                <strong>Attached lifecycle policy</strong>
              </div>
              <dl>
                {policyEntries.map(entry => (
                  <div key={entry.label}>
                    <dt>{entry.label}</dt>
                    <dd>{formatPolicyValue(entry.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="generation-card generation-preview-card">
            <div className="generation-section-heading">
              <p className="generation-step-label">Step 3</p>
              <h2>Preview output</h2>
              <p>The preview updates as values are entered.</p>
            </div>
            <TemplateMergePreview
              template={template}
              mergeData={mergeData}
              showRawContent={false}
              height="600px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentFromTemplatePage;
