const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const templateService = require('../services/templateService');

// Path constants
const templatesDir = path.join(__dirname, '../../templates');
const documentsDir = path.join(__dirname, '../../uploads/documents');

// Ensure directories exist
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

/**
 * Get all available templates (metadata only)
 */
const getAllTemplates = (req, res) => {
  try {
    const templates = templateService.getAllTemplates();
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

/**
 * Get a specific template by ID (with full content)
 */
const getTemplateById = (req, res) => {
  try {
    const { id } = req.params;
    const template = templateService.getTemplateById(id);
    
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
 * Create a new template
 */
const createTemplate = (req, res) => {
  try {
    const { name, description, content, category, documentType, mergeFields } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ error: 'Template name and content are required' });
    }
    
    const templateId = uuidv4();
    const templateData = {
      id: templateId,
      name,
      description: description || '',
      category: category || 'General',
      documentType: documentType || 'Document',
      content,
      mergeFields: mergeFields || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = templateService.saveTemplate(templateData);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.status(201).json({
      templateId: result.templateId,
      ...templateData
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

/**
 * Create a new template with merge fields (enhanced version)
 */
const createTemplateWithFields = (req, res) => {
  try {
    const { name, description, content, category, documentType, mergeFields } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ error: 'Template name and content are required' });
    }
    
    // Extract merge fields from content if not provided
    let extractedFields = [];
    if (!mergeFields || mergeFields.length === 0) {
      extractedFields = templateService.extractMergeFields(content);
    }
    
    const templateId = uuidv4();
    const templateData = {
      id: templateId,
      name,
      description: description || '',
      category: category || 'General',
      documentType: documentType || 'Document',
      content,
      mergeFields: mergeFields || extractedFields.map(field => ({
        name: field,
        type: 'text',
        required: false
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = templateService.saveTemplate(templateData);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.status(201).json({
      templateId: result.templateId,
      extractedFields,
      ...templateData
    });
  } catch (error) {
    console.error('Error creating template with fields:', error);
    res.status(500).json({ error: 'Failed to create template with fields' });
  }
};

/**
 * Get template categories
 */
const getTemplateCategories = (req, res) => {
  try {
    const templates = templateService.getAllTemplates();
    const categories = [...new Set(templates.map(t => t.category || 'General'))];
    
    const categoriesWithCounts = categories.map(category => ({
      name: category,
      count: templates.filter(t => (t.category || 'General') === category).length,
      templates: templates.filter(t => (t.category || 'General') === category).map(t => ({
        id: t.id,
        name: t.name,
        documentType: t.documentType
      }))
    }));
    
    res.status(200).json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching template categories:', error);
    res.status(500).json({ error: 'Failed to fetch template categories' });
  }
};

/**
 * Get merge fields from a template
 */
const getTemplateMergeFields = (req, res) => {
  try {
    const { id } = req.params;
    const template = templateService.getTemplateById(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Extract fields from content
    const extractedFields = templateService.extractMergeFields(template.content);
    
    res.status(200).json({
      templateId: id,
      templateName: template.name,
      fields: extractedFields,
      mergeFieldDefinitions: template.mergeFields || []
    });
  } catch (error) {
    console.error(`Error extracting merge fields for template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to extract merge fields' });
  }
};

/**
 * Update template merge fields
 */
const updateTemplateMergeFields = (req, res) => {
  try {
    const { id } = req.params;
    const { mergeFields } = req.body;
    
    if (!mergeFields || !Array.isArray(mergeFields)) {
      return res.status(400).json({ error: 'mergeFields array is required' });
    }
    
    const template = templateService.getTemplateById(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Update template with new merge fields
    const updatedTemplate = {
      ...template,
      mergeFields,
      updatedAt: new Date().toISOString()
    };
    
    const result = templateService.saveTemplate(updatedTemplate);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.status(200).json({
      templateId: id,
      mergeFields: updatedTemplate.mergeFields,
      updatedAt: updatedTemplate.updatedAt
    });
  } catch (error) {
    console.error(`Error updating merge fields for template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update merge fields' });
  }
};

/**
 * Generate a document from template with merge data
 * This creates a new document in the documents folder
 */
const generateDocument = (req, res) => {
  try {
    const { id } = req.params;
    const { mergeData, documentName } = req.body;
    
    const result = templateService.generateDocument(id, mergeData || {});
    
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error,
        validationErrors: result.validationErrors
      });
    }
    
    // Generate document ID and save to documents folder
    const documentId = uuidv4();
    const documentFileName = `${documentId}.sfdt`;
    const documentPath = path.join(documentsDir, documentFileName);
    const metadataPath = path.join(documentsDir, `${documentId}.meta.json`);
    
    // Save document content
    // Create a proper minimal SFDT document structure for the main document editor
    let contentToSave;
    try {
      console.log('=== BACKEND DOCUMENT GENERATION DEBUG ===');
      console.log('Processing content for document generation...');
      console.log('Content type:', typeof result.content);
      console.log('Content sample:', result.content?.substring ? result.content.substring(0, 100) : result.content);
      
      // Get the merged text content
      let textContent = '';
      if (typeof result.content === 'string') {
        try {
          // Try to parse if it's JSON
          const parsed = JSON.parse(result.content);
          textContent = parsed.sfdt || result.content;
        } catch {
          // It's plain text
          textContent = result.content;
        }
      } else {
        textContent = JSON.stringify(result.content);
      }
      
      // Split text into lines and create proper paragraph blocks
      const lines = textContent.split('\n');
      const blocks = [];
      
      lines.forEach((line) => {
        const paragraph = {
          "paragraphFormat": {
            "styleName": "Normal",
            "listFormat": {},
            "lineSpacing": 1.15,
            "lineSpacingType": "Multiple"
          },
          "characterFormat": {
            "fontSize": 11,
            "fontFamily": "Calibri"
          },
          "inlines": []
        };
        
        if (line.trim() === '') {
          // Empty line - just add a line break
          paragraph.inlines.push({
            "characterFormat": {
              "fontSize": 11,
              "fontFamily": "Calibri"
            },
            "text": ""
          });
        } else {
          // Line with content
          paragraph.inlines.push({
            "characterFormat": {
              "fontSize": 11,
              "fontFamily": "Calibri"
            },
            "text": line
          });
        }
        
        blocks.push(paragraph);
      });

      // Create a proper SFDT document structure that matches DocumentEditor expectations
      const sfdtDocument = {
        "sections": [{
          "sectionFormat": {
            "pageWidth": 612,
            "pageHeight": 792,
            "leftMargin": 72,
            "rightMargin": 72,
            "topMargin": 72,
            "bottomMargin": 72,
            "differentFirstPage": false,
            "differentOddAndEvenPages": false,
            "headerDistance": 36,
            "footerDistance": 36,
            "bidi": false
          },
          "blocks": blocks,
          "headersFooters": {}
        }],
        "characterFormat": {
          "fontSize": 11,
          "fontFamily": "Calibri"
        },
        "paragraphFormat": {
          "lineSpacing": 1.15,
          "lineSpacingType": "Multiple"
        },
        "defaultTabWidth": 36,
        "trackChanges": false,
        "enforcement": false,
        "hashValue": "",
        "saltValue": "",
        "formatting": false,
        "protectionType": "NoProtection",
        "dontUseHTMLParagraphAutoSpacing": false,
        "formFieldShading": true,
        "styles": [{
          "name": "Normal",
          "type": "Paragraph",
          "paragraphFormat": {
            "lineSpacing": 1.15,
            "lineSpacingType": "Multiple",
            "listFormat": {}
          },
          "characterFormat": {
            "fontSize": 11,
            "fontFamily": "Calibri",
            "fontSizeBidi": 11,
            "fontFamilyBidi": "Calibri"
          },
          "next": "Normal"
        }]
      };
      
      contentToSave = JSON.stringify(sfdtDocument);
      console.log('=== NEW SFDT DOCUMENT GENERATED ===');
      console.log('Generated proper SFDT document structure for main DocumentEditor');
      console.log('Document structure has sections:', !!sfdtDocument.sections);
      console.log('Document sections count:', sfdtDocument.sections?.length || 0);
      console.log('Content sample:', contentToSave.substring(0, 200));
      
    } catch (error) {
      console.error('=== ERROR IN SFDT GENERATION ===');
      console.error('Error formatting content for document:', error);
      // Fallback to simple format if SFDT generation fails
      contentToSave = JSON.stringify({ "sfdt": result.content?.toString() || '' });
      console.log('=== FALLBACK FORMAT USED ===');
    }
    
    fs.writeFileSync(documentPath, contentToSave);
    
    console.log('=== DOCUMENT FILE SAVED ===');
    console.log('File path:', documentPath);
    console.log('Content written to file, length:', contentToSave.length);
    console.log('First 200 chars of saved content:', contentToSave.substring(0, 200));
    
    // Save document metadata
    const documentMetadata = {
      id: documentId,
      name: documentName || `${result.template.name} - Generated`,
      templateId: id,
      templateName: result.template.name,
      category: result.template.category,
      documentType: result.template.documentType,
      mergeData: result.mergeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVersion: 1,
      status: 'draft'
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(documentMetadata, null, 2));
    
    res.status(201).json({
      success: true,
      documentId,
      documentName: documentMetadata.name,
      template: result.template,
      mergeData: result.mergeData,
      extractedFields: result.extractedFields,
      createdAt: documentMetadata.createdAt
    });
  } catch (error) {
    console.error(`Error generating document from template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
};

/**
 * Preview template merge (validate merge data without generating full document)
 */
const previewTemplateMerge = (req, res) => {
  try {
    const { id } = req.params;
    const { mergeData } = req.body;
    
    const template = templateService.getTemplateById(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Validate merge data
    const validation = templateService.validateMergeData(template, mergeData || {});
    
    // Extract all fields from template
    const extractedFields = templateService.extractMergeFields(template.content);
    
    // Find missing required fields
    const requiredFields = (template.mergeFields || [])
      .filter(field => field.required)
      .map(field => field.name);
    
    const providedFields = Object.keys(mergeData || {});
    const missingRequiredFields = requiredFields.filter(field => !providedFields.includes(field));
    
    res.status(200).json({
      isValid: validation.isValid,
      errors: validation.errors,
      extractedFields,
      requiredFields,
      providedFields,
      missingRequiredFields,
      templateName: template.name,
      category: template.category
    });
  } catch (error) {
    console.error(`Error previewing template merge for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to preview template merge' });
  }
};

/**
 * Batch document generation from template
 */
const batchGenerateDocuments = (req, res) => {
  try {
    const { templateId, batchData, documentNamePattern } = req.body;
    
    if (!templateId || !batchData || !Array.isArray(batchData)) {
      return res.status(400).json({ 
        error: 'templateId and batchData array are required' 
      });
    }
    
    const template = templateService.getTemplateById(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const results = [];
    const errors = [];
    
    batchData.forEach((mergeData, index) => {
      try {
        const result = templateService.generateDocument(templateId, mergeData);
        
        if (!result.success) {
          errors.push({
            index,
            mergeData,
            error: result.error,
            validationErrors: result.validationErrors
          });
          return;
        }
        
        // Generate document ID and save
        const documentId = uuidv4();
        const documentFileName = `${documentId}.sfdt`;
        const documentPath = path.join(documentsDir, documentFileName);
        const metadataPath = path.join(documentsDir, `${documentId}.meta.json`);
        
        // Generate document name using pattern or default
        let documentName;
        if (documentNamePattern) {
          documentName = documentNamePattern;
          // Replace placeholders in pattern with merge data
          Object.entries(mergeData).forEach(([key, value]) => {
            documentName = documentName.replace(new RegExp(`{${key}}`, 'g'), value);
          });
        } else {
          documentName = `${template.name} - ${index + 1}`;
        }
        
        // Save document content
        fs.writeFileSync(documentPath, result.content);
        
        // Save document metadata
        const documentMetadata = {
          id: documentId,
          name: documentName,
          templateId,
          templateName: result.template.name,
          category: result.template.category,
          documentType: result.template.documentType,
          mergeData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentVersion: 1,
          status: 'draft',
          batchIndex: index
        };
        
        fs.writeFileSync(metadataPath, JSON.stringify(documentMetadata, null, 2));
        
        results.push({
          index,
          documentId,
          documentName,
          mergeData,
          success: true
        });
      } catch (error) {
        errors.push({
          index,
          mergeData,
          error: error.message
        });
      }
    });
    
    res.status(200).json({
      success: true,
      templateId,
      templateName: template.name,
      totalProcessed: batchData.length,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error in batch document generation:', error);
    res.status(500).json({ error: 'Failed to process batch generation' });
  }
};

/**
 * Upload a template file (DOCX to SFDT conversion would go here)
 */
const uploadTemplate = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { originalname, buffer } = req.file;
    const { name, description, category, documentType } = req.body;
    
    // For now, we'll assume the uploaded file is already in SFDT format
    // In a real implementation, you would convert DOCX to SFDT here
    
    const templateId = uuidv4();
    const templateData = {
      id: templateId,
      name: name || originalname.replace(/\.[^/.]+$/, ""),
      description: description || '',
      category: category || 'General',
      documentType: documentType || 'Document',
      content: buffer.toString('utf8'),
      mergeFields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Extract merge fields from content
    const extractedFields = templateService.extractMergeFields(templateData.content);
    templateData.mergeFields = extractedFields.map(field => ({
      name: field,
      type: 'text',
      required: false
    }));
    
    const result = templateService.saveTemplate(templateData);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.status(201).json({
      templateId: result.templateId,
      extractedFields,
      ...templateData
    });
  } catch (error) {
    console.error('Error uploading template:', error);
    res.status(500).json({ error: 'Failed to upload template' });
  }
};

/**
 * Preview template with merge data (without creating document)
 */
const previewTemplate = (req, res) => {
  try {
    const { id } = req.params;
    const { mergeData } = req.body;

    console.log(`Previewing template ${id} with data:`, mergeData);

    const result = templateService.previewTemplate(id, mergeData);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error || 'Preview failed',
        validationErrors: result.validationErrors 
      });
    }

    res.status(200).json({
      success: true,
      content: result.content,
      template: result.template
    });
  } catch (error) {
    console.error(`Error previewing template ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to preview template' });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  createTemplateWithFields,
  getTemplateCategories,
  getTemplateMergeFields,
  updateTemplateMergeFields,
  generateDocument,
  previewTemplateMerge,
  batchGenerateDocuments,
  uploadTemplate,
  previewTemplate
};