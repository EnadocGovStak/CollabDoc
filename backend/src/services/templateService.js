const fs = require('fs');
const path = require('path');

// Path to templates directory
const templatesDir = path.join(__dirname, '../../templates');

// Ensure templates directory exists
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

/**
 * Get all templates (metadata only, no content)
 * @returns {Array} Array of template metadata objects
 */
const getAllTemplates = () => {
  try {
    const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
    
    const templates = files.map(filename => {
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
    
    return templates;
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
      const templateData = JSON.parse(fs.readFileSync(templateFilePath, 'utf8'));
      return templateData;
    }
    
    return null;
  } catch (error) {
    console.error(`Error in getTemplateById for ID ${templateId}:`, error);
    return null;
  }
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
    
    // Pattern to match {{FieldName}} with any characters except }}
    const fieldPattern = /\{\{([^}]+)\}\}/g;
    const fields = [];
    let match;
    
    while ((match = fieldPattern.exec(content)) !== null) {
      const fieldName = match[1].trim();
      if (fieldName && !fields.includes(fieldName)) {
        fields.push(fieldName);
      }
    }
    
    return fields;
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
    
    let result = content;
    
    if (mergeData && typeof mergeData === 'object') {
      // Replace all merge fields in format {{FieldName}} with corresponding values
      Object.entries(mergeData).forEach(([key, value]) => {
        // Escape special regex characters in the key
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');
        
        // Convert value to string and handle null/undefined
        const replacement = value != null ? value.toString() : '';
        result = result.replace(pattern, replacement);
      });
    }
    
    return result;
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
    const template = getTemplateById(templateId);
    
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
    const processedContent = mergeTemplateData(template.content, mergeData || {});
    
    return {
      success: true,
      content: processedContent,
      template: {
        id: template.id,
        name: template.name,
        category: template.category || 'General',
        documentType: template.documentType || 'Document'
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
    const templateWithTimestamps = {
      ...templateData,
      createdAt: templateData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(templateFilePath, JSON.stringify(templateWithTimestamps, null, 2));
    
    return {
      success: true,
      templateId: templateData.id
    };
  } catch (error) {
    console.error('Error saving template:', error);
    return {
      success: false,
      error: error.message
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
    const template = getTemplateById(templateId);
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

    // Process merge fields in content
    let processedContent = template.content;
    
    // Handle SFDT format
    if (typeof processedContent === 'object' && processedContent.sfdt) {
      processedContent = processedContent.sfdt;
    }
    
    // Replace merge fields with actual data
    Object.entries(mergeData).forEach(([fieldName, value]) => {
      const pattern = new RegExp(`{{${fieldName}}}`, 'g');
      processedContent = processedContent.replace(pattern, value || '');
    });

    return {
      success: true,
      content: processedContent,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        documentType: template.documentType
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
  extractMergeFields,
  validateMergeData,
  mergeTemplateData,
  generateDocument,
  saveTemplate,
  previewTemplate
};