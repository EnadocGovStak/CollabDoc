const fs = require('fs');
const path = require('path');

// In a production app, this would be a database
// This references the same store used in the templates controller
const templatesStore = {};

// Path to templates directory
const templatesDir = process.env.STORAGE_PATH || path.join(__dirname, '../../templates');

/**
 * Get all templates
 * @returns {Array} Array of template objects (without content)
 */
const getAllTemplates = () => {
  try {
    // Load templates from file system if the store is empty
    if (Object.keys(templatesStore).length === 0) {
      _loadTemplatesFromFiles();
    }
    
    return Object.values(templatesStore).map(({ content, ...metadata }) => metadata);
  } catch (error) {
    console.error('Error in getAllTemplates service:', error);
    return [];
  }
};

/**
 * Get a specific template by ID
 * @param {string} templateId Template ID
 * @returns {Object|null} Template object or null if not found
 */
const getTemplateById = (templateId) => {
  try {
    // Check if template exists in memory store
    if (templatesStore[templateId]) {
      return templatesStore[templateId];
    }
    
    // If not in memory, try to load from file
    const templateFilePath = path.join(templatesDir, `${templateId}.json`);
    if (fs.existsSync(templateFilePath)) {
      try {
        const templateData = JSON.parse(fs.readFileSync(templateFilePath, 'utf8'));
        templatesStore[templateId] = templateData;
        return templateData;
      } catch (parseError) {
        console.error(`Error parsing template file ${templateId}:`, parseError);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error in getTemplateById service for ID ${templateId}:`, error);
    return null;
  }
};

/**
 * Process a template with merge data
 * @param {string} templateId Template ID
 * @param {Object} mergeData Key-value pairs for merge fields
 * @returns {string|null} Processed template content or null if error
 */
const processTemplate = async (templateId, mergeData) => {
  try {
    const template = await getTemplateById(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    let processedContent = template.content;
    
    if (mergeData) {
      // Replace all merge fields in format {{FieldName}} with corresponding values
      Object.entries(mergeData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedContent = processedContent.replace(regex, value);
      });
    }
    
    return processedContent;
  } catch (error) {
    console.error(`Error processing template ${templateId}:`, error);
    return null;
  }
};

/**
 * Helper function to load templates from file system
 * @private
 */
const _loadTemplatesFromFiles = () => {
  try {
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      return;
    }
    
    const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
      try {
        const templateData = JSON.parse(fs.readFileSync(path.join(templatesDir, file), 'utf8'));
        templatesStore[templateData.id] = templateData;
      } catch (parseError) {
        console.error(`Error parsing template file ${file}:`, parseError);
      }
    });
  } catch (error) {
    console.error('Error loading templates from files:', error);
  }
};

// Load templates on module initialization
_loadTemplatesFromFiles();

module.exports = {
  getAllTemplates,
  getTemplateById,
  processTemplate
}; 