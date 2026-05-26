const fs = require('fs');
const path = require('path');
const {
  extractMergeFieldsFromSfdtContent,
  mergeSfdtContent,
  normalizeSfdtContent
} = require('./sfdtContent');
const fieldLibraryService = require('./fieldLibraryService');
const { templatesDir } = require('../config/storagePaths');

// Ensure templates directory exists
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

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

const normalizeTemplateRecordsManagement = (recordsManagement = {}, templateData = {}) => {
  const source = recordsManagement && typeof recordsManagement === 'object' ? recordsManagement : {};
  const documentType = source.documentType || templateData.documentType || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.documentType;

  return {
    ...source,
    classification: source.classification || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.classification,
    retentionPeriod: normalizePolicyPeriod(source.retentionPeriod || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.retentionPeriod),
    accessControl: source.accessControl || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.accessControl,
    documentType,
    department: source.department || templateData.category || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.department,
    reviewCycle: normalizePolicyPeriod(source.reviewCycle || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.reviewCycle)
  };
};

const getTemplateSaveMode = (templateData = {}) => {
  const requestedMode = String(templateData.saveMode || templateData.governanceStatus || '').toLowerCase();
  return requestedMode === 'draft' ? 'draft' : 'governed';
};

const buildTemplateFieldAnalysis = (templateData = {}) => {
  const extractedFields = extractMergeFields(templateData.content);
  return fieldLibraryService.analyzeTemplateFields(templateData, extractedFields);
};

const getTemplateReadinessIssues = (templateData = {}, fieldAnalysis) => {
  const issues = [];
  const recordsPolicy = templateData.recordsManagement && typeof templateData.recordsManagement === 'object'
    ? templateData.recordsManagement
    : {};
  const documentType = recordsPolicy.documentType || templateData.documentType;
  const mergeFields = Array.isArray(fieldAnalysis?.mergeFields)
    ? fieldAnalysis.mergeFields
    : Array.isArray(templateData.mergeFields)
      ? templateData.mergeFields
      : [];
  const extractedFields = Array.isArray(fieldAnalysis?.extractedFields)
    ? fieldAnalysis.extractedFields
    : mergeFields.map(field => field.name).filter(Boolean);
  const unmanagedFields = mergeFields.filter(field => field.managed === false);
  const weakMetadataFields = mergeFields.filter(field => (
    !field.name
      || !field.label
      || !field.type
      || !field.category
      || (!field.description && !field.exampleValue)
  ));

  if (!templateData.name?.trim() || templateData.name === 'Untitled Template') {
    issues.push({
      code: 'templateName',
      label: 'Template name',
      detail: 'Replace the default name with a recognizable business title.'
    });
  }

  if (!recordsPolicy.classification || recordsPolicy.classification === 'Unclassified' || !recordsPolicy.retentionPeriod || !documentType || !recordsPolicy.department) {
    issues.push({
      code: 'lifecyclePolicy',
      label: 'Lifecycle policy',
      detail: 'Set classification, retention, document type, and department before saving a governed template.'
    });
  }

  if (extractedFields.length === 0) {
    issues.push({
      code: 'managedFields',
      label: 'Managed fields',
      detail: 'Insert at least one reusable field token before saving a governed generation template.'
    });
  }

  if (unmanagedFields.length > 0) {
    issues.push({
      code: 'fieldMigration',
      label: 'Field migration',
      detail: `${unmanagedFields.length} unmanaged field${unmanagedFields.length === 1 ? '' : 's'} must be reviewed and added to the Field Library.`
    });
  }

  if (weakMetadataFields.length > 0) {
    issues.push({
      code: 'fieldMetadata',
      label: 'Field metadata',
      detail: `${weakMetadataFields.length} field${weakMetadataFields.length === 1 ? '' : 's'} need stronger labels, categories, descriptions, or examples.`
    });
  }

  return issues;
};

const validateTemplateReadiness = (templateData = {}, fieldAnalysis) => {
  const saveMode = getTemplateSaveMode(templateData);
  const readinessIssues = getTemplateReadinessIssues(templateData, fieldAnalysis);

  return {
    isValid: saveMode === 'draft' || readinessIssues.length === 0,
    saveMode,
    readinessIssues
  };
};

const createTemplateReadinessError = (validation) => {
  const error = new Error('Template readiness validation failed');
  error.code = 'TEMPLATE_READINESS_VALIDATION';
  error.statusCode = 400;
  error.saveMode = validation.saveMode;
  error.readinessIssues = validation.readinessIssues;
  error.validationErrors = validation.readinessIssues.map(issue => issue.detail);
  return error;
};

/**
 * Get all templates (metadata only, no content)
 * @returns {Array} Array of template metadata objects
 */
const getAllTemplates = () => {
  try {
    const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
    
    return files.map(filename => {
      try {
        const filePath = path.join(templatesDir, filename);
        const templateData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Return metadata without content for listing
        const { content, ...metadata } = templateData;
        return metadata;
      } catch (parseError) {
        console.error(`Error parsing template file ${filename}:`, parseError);
        return null;
      }
    }).filter(template => template !== null);
  } catch (error) {
    console.error('Error in getAllTemplates:', error);
    return [];
  }
};

/**
 * Get a specific template by ID (with content)
 * @param {string} templateId Template ID
 * @returns {Object|null} Template object or null if not found
 */
const getTemplateById = (templateId) => {
  try {
    const templateFilePath = path.join(templatesDir, `${templateId}.json`);
    
    if (fs.existsSync(templateFilePath)) {
      return JSON.parse(fs.readFileSync(templateFilePath, 'utf8'));
    }
    
    return null;
  } catch (error) {
    console.error(`Error in getTemplateById for ID ${templateId}:`, error);
    return null;
  }
};

const getTemplateFieldAnalysis = (templateId) => {
  const template = getTemplateById(templateId);

  if (!template) return null;

  return buildTemplateFieldAnalysis({
    id: templateId,
    ...template
  });
};

const getTemplateWithManagedFields = (templateId) => {
  const template = getTemplateById(templateId);

  if (!template) return null;

  const analysis = getTemplateFieldAnalysis(templateId);

  return {
    id: templateId,
    ...template,
    recordsManagement: normalizeTemplateRecordsManagement(template.recordsManagement, template),
    mergeFields: analysis?.mergeFields || template.mergeFields || [],
    fieldAnalysis: analysis ? {
      extractedFields: analysis.extractedFields,
      managedFieldCount: analysis.managedFieldCount,
      unmanagedFieldCount: analysis.unmanagedFieldCount,
      unknownFields: analysis.unknownFields,
      migrationRequired: analysis.migrationRequired
    } : undefined
  };
};

const enrichTemplateForSave = (templateData) => {
  const analysis = buildTemplateFieldAnalysis(templateData);
  const recordsManagement = normalizeTemplateRecordsManagement(templateData.recordsManagement, templateData);
  const saveMode = getTemplateSaveMode(templateData);
  const enrichedTemplate = {
    ...templateData,
    saveMode,
    governanceStatus: saveMode,
    documentType: recordsManagement.documentType || templateData.documentType || DEFAULT_TEMPLATE_RECORDS_MANAGEMENT.documentType,
    recordsManagement,
    mergeFields: analysis.mergeFields
  };
  const validation = validateTemplateReadiness(enrichedTemplate, analysis);

  if (!validation.isValid) {
    throw createTemplateReadinessError(validation);
  }

  return enrichedTemplate;
};

/**
 * Extract merge fields from template content
 * Looks for {{FieldName}} patterns in the content
 * @param {string} content Template content
 * @returns {Array} Array of unique field names found in the template
 */
const extractMergeFields = (content) => {
  try {
    if (!content || typeof content !== 'string') {
      return [];
    }

    return extractMergeFieldsFromSfdtContent(content);
  } catch (error) {
    console.error('Error extracting merge fields:', error);
    return [];
  }
};

/**
 * Validate merge data against template requirements
 * @param {Object} template Template object with merge field definitions
 * @param {Object} mergeData Merge data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
const validateMergeData = (template, mergeData) => {
  const result = {
    isValid: true,
    errors: []
  };

  try {
    // If template has merge field definitions, validate against them
    if (template.mergeFields && Array.isArray(template.mergeFields)) {
      template.mergeFields.forEach(field => {
        const value = mergeData[field.name];
        
        // Check required fields
        if (field.required && (!value || value.toString().trim() === '')) {
          result.errors.push(`Required field '${field.name}' is missing or empty`);
          result.isValid = false;
        }
        
        // Basic type validation
        if (value && field.type) {
          switch (field.type) {
            case 'email':
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                result.errors.push(`Field '${field.name}' must be a valid email address`);
                result.isValid = false;
              }
              break;
            case 'number':
              if (isNaN(Number(value))) {
                result.errors.push(`Field '${field.name}' must be a number`);
                result.isValid = false;
              }
              break;
            case 'date':
              if (isNaN(Date.parse(value))) {
                result.errors.push(`Field '${field.name}' must be a valid date`);
                result.isValid = false;
              }
              break;
          }
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error validating merge data:', error);
    return {
      isValid: false,
      errors: ['Validation error occurred']
    };
  }
};

/**
 * Simple merge engine - replaces {{FieldName}} patterns with data values
 * @param {string} content Template content
 * @param {Object} mergeData Key-value pairs for merge fields
 * @returns {string} Content with merge fields replaced
 */
const mergeTemplateData = (content, mergeData) => {
  try {
    if (!content || typeof content !== 'string') {
      return content;
    }
    

    return mergeSfdtContent(content, mergeData || {});
  } catch (error) {
    console.error('Error merging template data:', error);
    return content;
  }
};

/**
 * Generate a complete document from template and merge data
 * @param {string} templateId Template ID
 * @param {Object} mergeData Key-value pairs for merge fields
 * @returns {Object} Generation result with success status, content, and any errors
 */
const generateDocument = (templateId, mergeData) => {
  try {
    const template = getTemplateWithManagedFields(templateId);
    
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${templateId}`
      };
    }
    
    // Validate merge data
    const validation = validateMergeData(template, mergeData || {});
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Validation failed',
        validationErrors: validation.errors
      };
    }
    
    // Merge the data
    const processedContent = normalizeSfdtContent(
      mergeTemplateData(template.content, mergeData || {}),
      { title: template.name }
    );
    
    return {
      success: true,
      content: processedContent || mergeTemplateData(template.content, mergeData || {}),
      template: {
        id: template.id,
        name: template.name,
        category: template.category || 'General',
        documentType: template.documentType || 'Document',
        recordsManagement: normalizeTemplateRecordsManagement(template.recordsManagement, template)
      },
      mergeData: mergeData || {},
      extractedFields: extractMergeFields(template.content)
    };
  } catch (error) {
    console.error(`Error generating document from template ${templateId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Save a new template to the file system
 * @param {Object} templateData Template data
 * @returns {Object} Save result with success status
 */
const saveTemplate = (templateData) => {
  try {
    if (!templateData.id) {
      return {
        success: false,
        error: 'Template ID is required'
      };
    }
    
    const templateFilePath = path.join(templatesDir, `${templateData.id}.json`);
    
    // Add timestamps
    const templateWithTimestamps = enrichTemplateForSave({
      ...templateData,
      createdAt: templateData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    fs.writeFileSync(templateFilePath, JSON.stringify(templateWithTimestamps, null, 2));
    
    return {
      success: true,
      templateId: templateData.id,
      template: templateWithTimestamps
    };
  } catch (error) {
    console.error('Error saving template:', error);
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      saveMode: error.saveMode,
      readinessIssues: error.readinessIssues,
      validationErrors: error.validationErrors
    };
  }
};

/**
 * Preview template with merge data (without saving as document)
 * @param {string} templateId Template ID
 * @param {Object} mergeData Data to merge into template
 * @returns {Object} Preview result with success, content, and template info
 */
const previewTemplate = (templateId, mergeData = {}) => {
  try {
    // Get the template
    const template = getTemplateWithManagedFields(templateId);
    if (!template) {
      return {
        success: false,
        error: 'Template not found'
      };
    }

    // Validate merge data against template fields
    const validation = validateMergeData(template, mergeData);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Validation failed',
        validationErrors: validation.errors
      };
    }

    const mergedContent = mergeTemplateData(template.content, mergeData || {});
    const processedContent = normalizeSfdtContent(mergedContent, { title: template.name }) || mergedContent;

    return {
      success: true,
      content: processedContent,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        documentType: template.documentType,
        recordsManagement: normalizeTemplateRecordsManagement(template.recordsManagement, template)
      }
    };
  } catch (error) {
    console.error('Error in previewTemplate:', error);
    return {
      success: false,
      error: 'Failed to preview template'
    };
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  getTemplateWithManagedFields,
  getTemplateFieldAnalysis,
  normalizeTemplateRecordsManagement,
  enrichTemplateForSave,
  getTemplateSaveMode,
  getTemplateReadinessIssues,
  validateTemplateReadiness,
  extractMergeFields,
  validateMergeData,
  mergeTemplateData,
  generateDocument,
  saveTemplate,
  previewTemplate
};