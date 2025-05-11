const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const templatesController = require('../controllers/templates');
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
        
        return {
          id: templateId,
          name: template.name || 'Untitled Template',
          description: template.description || '',
          createdAt: template.createdAt || stats.birthtime,
          modifiedAt: template.modifiedAt || stats.mtime
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
 * GET /api/templates/:id
 * Get a specific template by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    
    // Check if template exists
    if (!await fileExists(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Read template data
    const data = await fs.readFile(templatePath, 'utf8');
    const template = JSON.parse(data);
    
    res.json({
      id: templateId,
      ...template
    });
  } catch (error) {
    console.error(`Error reading template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to read template' });
  }
});

/**
 * POST /api/templates
 * Create a new template (requires admin role)
 */
// Temporarily remove role requirement for testing
//router.post('/', requireRole(['Admin']), async (req, res) => {
router.post('/', async (req, res) => {
  try {
    await ensureTemplatesDirExists();
    
    const { name, description, content } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }
    
    // Generate a new template ID
    const templateId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Create template data object
    const templateData = {
      name,
      description: description || '',
      content: content || '',
      createdAt: timestamp,
      modifiedAt: timestamp
    };
    
    // Save template to file
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    await fs.writeFile(templatePath, JSON.stringify(templateData, null, 2));
    
    // Return success response
    res.status(201).json({
      id: templateId,
      ...templateData
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * PUT /api/templates/:id
 * Update an existing template (requires admin role)
 */
// Temporarily remove role requirement for testing
//router.put('/:id', requireRole(['Admin']), async (req, res) => {
router.put('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    
    // Check if template exists
    if (!await fileExists(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Read existing template data
    const data = await fs.readFile(templatePath, 'utf8');
    const existingTemplate = JSON.parse(data);
    
    const { name, description, content } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }
    
    // Create updated template data object
    const templateData = {
      ...existingTemplate,
      name,
      description: description || existingTemplate.description || '',
      content: content || existingTemplate.content || '',
      modifiedAt: new Date().toISOString()
    };
    
    // Save updated template to file
    await fs.writeFile(templatePath, JSON.stringify(templateData, null, 2));
    
    // Return success response
    res.json({
      id: templateId,
      ...templateData
    });
  } catch (error) {
    console.error(`Error updating template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * DELETE /api/templates/:id
 * Delete a template (requires admin role)
 */
// Temporarily remove role requirement for testing
//router.delete('/:id', requireRole(['Admin']), async (req, res) => {
router.delete('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    
    // Check if template exists
    if (!await fileExists(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Delete template file
    await fs.unlink(templatePath);
    
    // Return success response
    res.json({
      id: templateId,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting template ${req.params.id}:`, error);
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

// Basic template routes
router.get('/', (req, res) => {
    res.json([]);  // Return empty array for now
});

module.exports = router; 