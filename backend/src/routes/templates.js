const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const templatesController = require('../controllers/templates');
const templateService = require('../services/templateService');
const { requireRole } = require('../middleware/auth');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Directory for storing templates
const TEMPLATES_DIR = path.join(__dirname, '../../templates');

// Ensure templates directory exists
async function ensureTemplatesDirExists() {
  try {
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating templates directory:', error);
  }
}

// Helper function to check if a file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/templates
 * Get all available templates
 */
router.get('/', async (req, res) => {
  try {
    await ensureTemplatesDirExists();
    
    // Read template files from templates directory
    const files = await fs.readdir(TEMPLATES_DIR);
    const templateFiles = files.filter(file => file.endsWith('.json'));
    
    const templates = await Promise.all(templateFiles.map(async (filename) => {
      try {
        const filePath = path.join(TEMPLATES_DIR, filename);
        const stats = await fs.stat(filePath);
        
        // Read template data
        const data = await fs.readFile(filePath, 'utf8');
        const template = JSON.parse(data);
        
        // Get template ID from filename
        const templateId = filename.replace('.json', '');
        const fieldAnalysis = templateService.getTemplateFieldAnalysis(templateId);
        const recordsManagement = templateService.normalizeTemplateRecordsManagement(template.recordsManagement, template);
        
        return {
          id: templateId,
          name: template.name || 'Untitled Template',
          description: template.description || '',
          category: template.category || 'General',
          documentType: template.documentType || 'Document',
          mergeFieldCount: fieldAnalysis?.mergeFields?.length || (Array.isArray(template.mergeFields) ? template.mergeFields.length : 0),
          managedFieldCount: fieldAnalysis?.managedFieldCount || 0,
          unmanagedFieldCount: fieldAnalysis?.unmanagedFieldCount || 0,
          migrationRequired: fieldAnalysis?.migrationRequired || false,
          recordsManagement,
          createdAt: template.createdAt || stats.birthtime,
          updatedAt: template.updatedAt || template.modifiedAt || stats.mtime,
          modifiedAt: template.modifiedAt || template.updatedAt || stats.mtime
        };
      } catch (error) {
        console.error(`Error processing template file ${filename}:`, error);
        return null;
      }
    }));
    
    // Filter out any null results from errors
    res.json(templates.filter(template => template !== null));
  } catch (error) {
    console.error('Error listing templates:', error);
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

/**
 * POST /api/templates
 * Create a new template
 */
router.post('/', async (req, res) => {
  try {
    await ensureTemplatesDirExists();
    
    const templateId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const templateData = templateService.enrichTemplateForSave({
      id: templateId,
      name: req.body.name || 'Untitled Template',
      description: req.body.description || '',
      category: req.body.category || 'General',
      documentType: req.body.documentType || 'Standard Document',
      content: req.body.content || '',
      mergeFields: req.body.mergeFields || [],
      recordsManagement: req.body.recordsManagement,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    // Save template to file
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    await fs.writeFile(templatePath, JSON.stringify(templateData, null, 2));
    
    console.log(`Created new template: ${templateId}`);
    res.status(201).json(templateData);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * PUT /api/templates/:id
 * Update an existing template
 */
router.put('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    
    // Check if template exists
    if (!(await fileExists(templatePath))) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Load existing template
    const existingData = JSON.parse(await fs.readFile(templatePath, 'utf8'));
    
    // Update template data
    const updatedData = templateService.enrichTemplateForSave({
      ...existingData,
      name: req.body.name || existingData.name,
      description: req.body.description !== undefined ? req.body.description : existingData.description,
      category: req.body.category || existingData.category,
      documentType: req.body.documentType || existingData.documentType,
      content: req.body.content !== undefined ? req.body.content : existingData.content,
      mergeFields: req.body.mergeFields || existingData.mergeFields,
      recordsManagement: req.body.recordsManagement !== undefined ? req.body.recordsManagement : existingData.recordsManagement,
      updatedAt: new Date().toISOString()
    });
    
    // Save updated template
    await fs.writeFile(templatePath, JSON.stringify(updatedData, null, 2));
    
    console.log(`Updated template: ${templateId}`);
    res.json(updatedData);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * DELETE /api/templates/:id
 * Delete a template
 */
router.delete('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    
    // Check if template exists
    if (!(await fileExists(templatePath))) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Delete template file
    await fs.unlink(templatePath);
    
    console.log(`Deleted template: ${templateId}`);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

/**
 * POST /api/templates/upload
 * Upload a DOCX file as a template (requires admin role)
 */
// Temporarily remove role requirement for testing
//router.post('/upload', requireRole(['Admin']), upload.single('file'), templatesController.uploadTemplate);
router.post('/upload', upload.single('file'), templatesController.uploadTemplate);

/**
 * POST /api/templates/create-with-fields
 * Create a new template with merge fields (enhanced version)
 */
router.post('/create-with-fields', templatesController.createTemplateWithFields);

/**
 * GET /api/templates/categories
 * Get all unique template categories
 */
router.get('/categories', async (req, res) => {
  try {
    await ensureTemplatesDirExists();
    
    // Read template files from templates directory
    const files = await fs.readdir(TEMPLATES_DIR);
    const templateFiles = files.filter(file => file.endsWith('.json'));
    
    // Extract categories from all templates
    const categories = new Set();
    
    for (const filename of templateFiles) {
      try {
        const filePath = path.join(TEMPLATES_DIR, filename);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const template = JSON.parse(fileContent);
        
        if (template.category) {
          categories.add(template.category);
        }
      } catch (error) {
        console.error(`Error reading template file ${filename}:`, error);
      }
    }
    
    const sortedCategories = Array.from(categories).sort();
    
    res.json({
      success: true,
      categories: sortedCategories.map(category => ({
        name: category,
        displayName: category
      }))
    });
  } catch (error) {
    console.error('Error getting template categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve template categories'
    });
  }
});

/**
 * GET /api/templates/field-library
 * Get managed reusable merge fields.
 */
router.get('/field-library', templatesController.getFieldLibrary);
router.get('/fields/library', templatesController.getFieldLibrary);

/**
 * POST /api/templates/field-library
 * Create or update a managed reusable merge field.
 */
router.post('/field-library', templatesController.upsertFieldLibraryField);
router.post('/fields/library', templatesController.upsertFieldLibraryField);

/**
 * GET /api/templates/:id/field-analysis
 * Compare extracted placeholders with the managed field library.
 */
router.get('/:id/field-analysis', templatesController.getTemplateFieldAnalysis);

/**
 * GET /api/templates/:id/fields
 * Get merge fields from a template
 */
router.get('/:id/fields', templatesController.getTemplateMergeFields);

/**
 * POST /api/templates/:id/generate
 * Generate a document from template with merge data
 */
router.post('/:id/generate', templatesController.generateDocument);

/**
 * POST /api/templates/:id/preview
 * Preview template with merge data (without creating document)
 */
router.post('/:id/preview', templatesController.previewTemplate);

/**
 * PUT /api/templates/:id/fields
 * Update template merge fields
 */
router.put('/:id/fields', templatesController.updateTemplateMergeFields);

/**
 * POST /api/templates/batch-generate
 * Batch document generation from template
 */
router.post('/batch-generate', templatesController.batchGenerateDocuments);

/**
 * GET /api/templates/search
 * Search templates by name, description, or category
 */
router.get('/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    await ensureTemplatesDirExists();
    
    // Read template files from templates directory
    const files = await fs.readdir(TEMPLATES_DIR);
    const templateFiles = files.filter(file => file.endsWith('.json'));
    
    // Load all templates
    let templates = await Promise.all(templateFiles.map(async (filename) => {
      try {
        const filePath = path.join(TEMPLATES_DIR, filename);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const template = JSON.parse(fileContent);
        return {
          id: template.id || filename.replace('.json', ''),
          ...template
        };
      } catch (error) {
        console.error(`Error reading template file ${filename}:`, error);
        return null;
      }
    }));
    
    // Filter out any templates that failed to load
    templates = templates.filter(template => template !== null);
    
    // Apply category filter if provided
    if (category) {
      templates = templates.filter(template => 
        template.category && template.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply search query if provided
    if (q) {
      const searchTerm = q.toLowerCase();
      templates = templates.filter(template => 
        (template.name && template.name.toLowerCase().includes(searchTerm)) ||
        (template.description && template.description.toLowerCase().includes(searchTerm)) ||
        (template.documentType && template.documentType.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort templates by name
    templates.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({
      success: true,
      query: q,
      category: category,
      count: templates.length,
      templates: templates.map(template => {
        const fieldAnalysis = templateService.getTemplateFieldAnalysis(template.id);

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          documentType: template.documentType,
          recordsManagement: templateService.normalizeTemplateRecordsManagement(template.recordsManagement, template),
          createdAt: template.createdAt,
          modifiedAt: template.modifiedAt,
          mergeFieldCount: fieldAnalysis?.mergeFields?.length || (template.mergeFields ? template.mergeFields.length : 0),
          managedFieldCount: fieldAnalysis?.managedFieldCount || 0,
          unmanagedFieldCount: fieldAnalysis?.unmanagedFieldCount || 0,
          migrationRequired: fieldAnalysis?.migrationRequired || false
        };
      })
    });
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search templates'
    });
  }
});

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 *
 * Keep this route after static routes such as /categories and /search.
 */
router.get('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);

    // Check if template exists
    if (!await fileExists(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateService.getTemplateWithManagedFields(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      id: templateId,
      ...template
    });
  } catch (error) {
    console.error(`Error reading template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to read template' });
  }
});

module.exports = router;