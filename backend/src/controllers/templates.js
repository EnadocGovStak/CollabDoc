const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// In a production app, this would be a database
// For this example, we'll use an in-memory store
const templatesStore = {};

// Path to templates directory
const templatesDir = process.env.STORAGE_PATH || path.join(__dirname, '../../templates');

// Ensure templates directory exists
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

/**
 * Get all available templates
 */
const getAllTemplates = (req, res) => {
  try {
    // Return all templates without content
    const templates = Object.values(templatesStore).map(
      ({ content, ...metadata }) => metadata
    );
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

/**
 * Get a specific template by ID
 */
const getTemplateById = (req, res) => {
  try {
    const { id } = req.params;
    const template = templatesStore[id];
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.status(200).json(template);
  } catch (error) {
    console.error(`Error fetching template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

/**
 * Create a new template (Admin only)
 */
const createTemplate = (req, res) => {
  try {
    const { name, description } = req.body;
    let content = req.body.content;
    
    // Extract records management fields from request
    const recordsManagement = {
      classification: req.body.classification || 'Unclassified',
      retentionPeriod: req.body.retentionPeriod || '7 years',
      accessControl: req.body.accessControl || 'Public',
      documentType: req.body.documentType || 'General',
      department: req.body.department || 'General',
      reviewCycle: req.body.reviewCycle || '1 year'
    };
    
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }
    
    // If file is uploaded and no content is provided, use the file
    if (req.file && !content) {
      // In a real app, this would convert DOCX to SFDT
      // For this example, we'll simulate the conversion
      content = `{"sfdt":"simulated-sfdt-content-from-${req.file.originalname}"}`;
    }
    
    if (!content) {
      return res.status(400).json({ error: 'Template content is required' });
    }
    
    const userId = req.user.sub || req.user.oid;
    const userName = req.user.name || 'Unknown User';
    const templateId = uuidv4();
    
    // Create the template
    const template = {
      id: templateId,
      name,
      description: description || '',
      content,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recordsManagement  // Add records management metadata
    };
    
    // Store the template
    templatesStore[templateId] = template;
    
    // Save template content to file system (in a real app, might be stored in a database)
    const templateFilePath = path.join(templatesDir, `${templateId}.json`);
    fs.writeFileSync(templateFilePath, JSON.stringify(template));
    
    // Return the template ID
    res.status(201).json({ 
      templateId,
      name,
      createdAt: template.createdAt 
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

/**
 * Update an existing template (Admin only)
 */
const updateTemplate = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content } = req.body;
    
    // Extract records management updates
    const recordsManagement = req.body.recordsManagement || {};
    
    // Verify template exists
    if (!templatesStore[id]) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Update template
    templatesStore[id] = {
      ...templatesStore[id],
      name: name || templatesStore[id].name,
      description: description !== undefined ? description : templatesStore[id].description,
      content: content || templatesStore[id].content,
      updatedAt: new Date().toISOString(),
      recordsManagement: {
        ...templatesStore[id].recordsManagement || {},
        ...recordsManagement
      }
    };
    
    // Save updated template to file system
    const templateFilePath = path.join(templatesDir, `${id}.json`);
    fs.writeFileSync(templateFilePath, JSON.stringify(templatesStore[id]));
    
    res.status(200).json({ 
      templateId: id,
      name: templatesStore[id].name,
      updatedAt: templatesStore[id].updatedAt
    });
  } catch (error) {
    console.error(`Error updating template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

/**
 * Delete a template (Admin only)
 */
const deleteTemplate = (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify template exists
    if (!templatesStore[id]) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Delete template from store
    delete templatesStore[id];
    
    // Delete template file
    const templateFilePath = path.join(templatesDir, `${id}.json`);
    if (fs.existsSync(templateFilePath)) {
      fs.unlinkSync(templateFilePath);
    }
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

/**
 * Upload a DOCX file as a template (Admin only)
 */
const uploadTemplate = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { name, description } = req.body;
    
    // Extract records management fields from request
    const recordsManagement = {
      classification: req.body.classification || 'Unclassified',
      retentionPeriod: req.body.retentionPeriod || '7 years',
      accessControl: req.body.accessControl || 'Public',
      documentType: req.body.documentType || 'General',
      department: req.body.department || 'General',
      reviewCycle: req.body.reviewCycle || '1 year'
    };
    
    // In a real app, this would convert DOCX to SFDT
    // For this example, we'll simulate the conversion
    const content = `{"sfdt":"simulated-sfdt-content-from-${req.file.originalname}"}`;
    
    const userId = req.user.sub || req.user.oid;
    const userName = req.user.name || 'Unknown User';
    const templateId = uuidv4();
    
    // Create the template
    const template = {
      id: templateId,
      name: name || req.file.originalname.replace('.docx', ''),
      description: description || '',
      content,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recordsManagement  // Add records management metadata
    };
    
    // Store the template
    templatesStore[templateId] = template;
    
    // Save template to file system
    const templateFilePath = path.join(templatesDir, `${templateId}.json`);
    fs.writeFileSync(templateFilePath, JSON.stringify(template));
    
    // Return the template ID
    res.status(201).json({ 
      templateId,
      name: template.name,
      createdAt: template.createdAt 
    });
  } catch (error) {
    console.error('Error uploading template:', error);
    res.status(500).json({ error: 'Failed to upload template' });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadTemplate
}; 