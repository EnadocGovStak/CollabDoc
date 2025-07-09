const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Define upload directories
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const VERSIONS_DIR = path.join(__dirname, '../../uploads/versions');
const TEMPLATES_DIR = path.join(__dirname, '../../templates');

// Directory for storing document versions
const DOCUMENTS_DIR = path.join(__dirname, '../../uploads/documents');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Create both documents and versions directories if they don't exist
        try {
            await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
            await fs.mkdir(VERSIONS_DIR, { recursive: true });
            cb(null, path.join(__dirname, '../../uploads/temp'));
        } catch (error) {
            cb(error, null);
        }
    },
    filename: async (req, file, cb) => {
        // Generate a temporary filename
        const tempName = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        cb(null, tempName);
    }
});

const upload = multer({ storage });

// Get document metadata
async function getDocumentMetadata(documentId) {
    try {
        const metadataPath = path.join(DOCUMENTS_DIR, `${documentId}.meta.json`);
        const data = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(data);
        
        // Ensure backward compatibility - add missing fields if they don't exist
        if (!metadata.versions || !Array.isArray(metadata.versions)) {
            metadata.versions = [];
        }
        if (!metadata.currentVersion) {
            metadata.currentVersion = 1;
        }
        
        return metadata;
    } catch (error) {
        // If metadata doesn't exist, return default metadata
        return {
            id: documentId,
            title: 'Untitled',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            currentVersion: 1,
            versions: []
        };
    }
}

// Save document metadata
async function saveDocumentMetadata(documentId, metadata) {
    const metadataPath = path.join(DOCUMENTS_DIR, `${documentId}.meta.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

// Get list of documents
router.get('/list', async (req, res) => {
    try {
        // Create directories if they don't exist
        await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
        
        // Read metadata files from documents directory
        const files = await fs.readdir(DOCUMENTS_DIR);
        const metadataFiles = files.filter(file => file.endsWith('.meta.json'));
        
        const documents = await Promise.all(metadataFiles.map(async (filename) => {
            try {
                const filePath = path.join(DOCUMENTS_DIR, filename);
                const stats = await fs.stat(filePath);
                
                // Read metadata
                const data = await fs.readFile(filePath, 'utf8');
                const metadata = JSON.parse(data);
                
                // Get main document content stats
                const documentId = filename.replace('.meta.json', '');
                const mainDocPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
                const docStats = await fs.stat(mainDocPath);
                
                return {
                    name: documentId,
                    title: metadata.title || 'Untitled',
                    size: docStats.size,
                    modifiedDate: metadata.modifiedAt || stats.mtime,
                    version: metadata.currentVersion || 1
                };
            } catch (error) {
                console.error(`Error processing metadata file ${filename}:`, error);
                return null;
            }
        }));
        
        // Filter out any null results from errors
        res.json(documents.filter(doc => doc !== null));
    } catch (error) {
        console.error('Error listing documents:', error);
        res.status(500).json({ error: 'Failed to list documents' });
    }
});

// Save document
router.post('/save', upload.single('document'), async (req, res) => {
    try {
        console.log('=== SAVE REQUEST START ===');
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);
        
        if (!req.file) {
            console.log('No file provided in request');
            return res.status(400).json({ error: 'No document provided' });
        }

        // Create directories if they don't exist
        await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
        await fs.mkdir(VERSIONS_DIR, { recursive: true });
        await fs.mkdir(path.join(__dirname, '../../uploads/temp'), { recursive: true });
        
        const tempFilePath = req.file.path;
        
        // Read file content and validate it's valid JSON
        const content = await fs.readFile(tempFilePath, 'utf8');
        try {
            JSON.parse(content);
        } catch (e) {
            // Delete temp file if content is invalid
            await fs.unlink(tempFilePath);
            return res.status(400).json({ error: 'Invalid document format' });
        }
        
        // Get title and optional template ID from request
        const title = req.body.title || 'Untitled';
        const templateId = req.body.templateId;
        const timestamp = new Date().toISOString();
        
        // Extract records management data if provided directly
        let recordsManagement = null;
        if (req.body.recordsManagement) {
            try {
                recordsManagement = JSON.parse(req.body.recordsManagement);
            } catch (e) {
                console.warn('Invalid records management data format:', e);
            }
        }
        
        // Determine the document ID
        let documentId;
        let isNew = false;
        
        if (req.body.originalFilename) {
            // Updating an existing document
            documentId = req.body.originalFilename;
            console.log(`Updating existing document: ${documentId}`);
        } else {
            // Creating a new document - generate a UUID
            documentId = uuidv4();
            isNew = true;
            console.log(`Creating new document with ID: ${documentId}`);
        }
        
        // Get existing metadata or create new metadata
        const metadata = await getDocumentMetadata(documentId);
        
        // Update metadata
        metadata.title = title;
        metadata.modifiedAt = timestamp;
        
        // If template ID is provided and this is a new document
        if (templateId && isNew) {
            try {
                // Load template information (simplified for this example)
                // In a real application, you would fetch this from your template service
                const templatePath = path.join(__dirname, '../../templates', `${templateId}.json`);
                if (await fileExists(templatePath)) {
                    const templateData = JSON.parse(await fs.readFile(templatePath, 'utf8'));
                    
                    // Inherit records management metadata from template
                    if (templateData.recordsManagement) {
                        metadata.recordsManagement = { ...templateData.recordsManagement };
                        metadata.templateId = templateId;
                        console.log(`Inherited records management metadata from template: ${templateId}`);
                    }
                }
            } catch (error) {
                console.error('Error loading template metadata:', error);
                // Continue even if template loading fails
            }
        }
        
        // Override with directly provided records management data if available
        if (recordsManagement) {
            metadata.recordsManagement = {
                ...metadata.recordsManagement || {},
                ...recordsManagement
            };
        }
        
        if (isNew) {
            metadata.createdAt = timestamp;
            metadata.currentVersion = 1;
            metadata.versions = [{
                version: 1,
                timestamp: timestamp,
                comment: 'Initial version'
            }];
        } else {
            // Increment version
            metadata.currentVersion = (metadata.currentVersion || 1) + 1;
            
            // Ensure versions array exists
            if (!metadata.versions || !Array.isArray(metadata.versions)) {
                metadata.versions = [];
            }
            
            // Add version to history
            metadata.versions.push({
                version: metadata.currentVersion,
                timestamp: timestamp,
                comment: `Version ${metadata.currentVersion}`
            });
            
            // Store the previous version
            const previousVersion = metadata.currentVersion - 1;
            const versionPath = path.join(VERSIONS_DIR, `${documentId}.v${previousVersion}.sfdt`);
            
            try {
                // Copy the current document to the versions directory before overwriting
                const currentDocPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
                if (await fileExists(currentDocPath)) {
                    await fs.copyFile(currentDocPath, versionPath);
                    console.log(`Saved version ${previousVersion} to: ${versionPath}`);
                }
            } catch (error) {
                console.error(`Error saving version ${previousVersion}:`, error);
                // Continue even if saving the version fails
            }
        }
        
        // Save the document to its final location
        const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
        await fs.copyFile(tempFilePath, documentPath);
        
        // Save the updated metadata
        await saveDocumentMetadata(documentId, metadata);
        
        // Clean up the temporary file
        await fs.unlink(tempFilePath);
        
        console.log(`Successfully saved document: ${documentId}, version: ${metadata.currentVersion}`);
        console.log('=== SAVE REQUEST END ===');
        
        // Send success response
        res.json({
            message: 'Document saved successfully',
            id: documentId,
            title: title,
            version: metadata.currentVersion,
            timestamp: timestamp,
            recordsManagement: metadata.recordsManagement
        });
    } catch (error) {
        console.error('=== SAVE ERROR ===');
        console.error('Error saving document:', error);
        console.error('Stack trace:', error.stack);
        console.error('=== SAVE ERROR END ===');
        res.status(500).json({ error: 'Failed to save document' });
    }
});

// Helper function to check if a file exists
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Get document by ID
router.get('/:id', async (req, res) => {
    try {
        const documentId = req.params.id;
        const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
        
        // Get metadata
        const metadata = await getDocumentMetadata(documentId);
        
        // Read document content
        const content = await fs.readFile(documentPath, 'utf8');
        
        // Send response with content and metadata
        res.json({
            id: documentId,
            title: metadata.title,
            content: JSON.parse(content),
            createdAt: metadata.createdAt,
            modifiedAt: metadata.modifiedAt,
            version: metadata.currentVersion,
            versions: metadata.versions,
            recordsManagement: metadata.recordsManagement || {
                classification: '',
                documentType: '',
                retentionPeriod: '',
                recordNumber: '',
                notes: ''
            }
        });
    } catch (error) {
        console.error(`Error reading document ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to read document' });
    }
});

// Get specific version of a document
router.get('/:id/versions/:version', async (req, res) => {
    try {
        const documentId = req.params.id;
        const version = parseInt(req.params.version);
        
        // Get metadata
        const metadata = await getDocumentMetadata(documentId);
        
        // Handle legacy metadata format - use 'version' field or default to 1
        const currentVersion = metadata.currentVersion || metadata.version || 1;
        const versions = metadata.versions || [];
        
        if (version === currentVersion) {
            // Request for current version - redirect to the main endpoint
            return res.redirect(`/api/documents/${documentId}`);
        }
        
        if (version < 1 || version > currentVersion) {
            return res.status(404).json({ error: 'Version not found' });
        }
        
        // Path to the version file
        const versionPath = path.join(VERSIONS_DIR, `${documentId}.v${version}.sfdt`);
        
        try {
            // Read version content
            const content = await fs.readFile(versionPath, 'utf8');
            
            // Find version metadata
            const versionMeta = versions.find(v => v.version === version);
            
            // Parse content safely
            let parsedContent;
            try {
                parsedContent = JSON.parse(content);
            } catch (parseError) {
                console.error(`Error parsing version content for ${documentId}:`, parseError);
                parsedContent = content; // Return as string if JSON parsing fails
            }
            
            // Send response
            res.json({
                id: documentId,
                title: metadata.title,
                content: parsedContent,
                createdAt: metadata.createdAt,
                timestamp: versionMeta?.timestamp || metadata.modifiedAt || '',
                version: version,
                current: false,
                recordsManagement: metadata.recordsManagement || {
                    classification: '',
                    documentType: '',
                    retentionPeriod: '',
                    recordNumber: '',
                    notes: ''
                }
            });
        } catch (fileError) {
            console.error(`Version file not found for ${documentId} v${version}:`, fileError);
            return res.status(404).json({ error: 'Version file not found' });
        }
    } catch (error) {
        console.error(`Error reading document version ${req.params.id}/${req.params.version}:`, error);
        res.status(500).json({ error: 'Failed to read document version' });
    }
});

// List versions of a document
router.get('/:id/versions', async (req, res) => {
    try {
        const documentId = req.params.id;
        
        // Get metadata
        const metadata = await getDocumentMetadata(documentId);
        
        // Handle legacy metadata format
        const currentVersion = metadata.currentVersion || metadata.version || 1;
        const versions = metadata.versions || [];
        
        // Send response with versions
        res.json({
            id: documentId,
            title: metadata.title,
            currentVersion: currentVersion,
            versions: versions
        });
    } catch (error) {
        console.error(`Error listing versions for document ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to list document versions' });
    }
});

// Merge document with template and prepare for signing
router.post('/:id/merge', async (req, res) => {
  const { id } = req.params;
  const { templateId, mergeFields } = req.body;

  if (!templateId) {
    return res.status(400).json({ error: 'Template ID is required' });
  }

  try {
    console.log(`Merging document ${id} with template ${templateId}`);
    console.log('Merge fields:', mergeFields);
    
    // Get the document
    const docPath = path.join(DOCUMENTS_DIR, `${id}.sfdt`);
    if (!await fileExists(docPath)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Get document metadata
    const docMetadata = await getDocumentMetadata(id);
    
    // Get the template
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    if (!await fileExists(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const templateData = JSON.parse(await fs.readFile(templatePath, 'utf8'));
    
    if (!templateData.content) {
      return res.status(400).json({ error: 'Template has no content' });
    }
    
    // Perform the merge operation
    // Load document content
    const documentContent = await fs.readFile(docPath, 'utf8');
    
    // Start with template content
    let mergedContent = templateData.content;
    
    // Replace merge fields in the template content
    if (mergeFields) {
      Object.keys(mergeFields).forEach(fieldName => {
        const placeholder = new RegExp(`{{${fieldName}}}`, 'g');
        mergedContent = mergedContent.replace(placeholder, mergeFields[fieldName] || '');
      });
    }
    
    // Set document-specific fields
    mergedContent = mergedContent.replace(/{{document_title}}/g, docMetadata.title || 'Untitled');
    mergedContent = mergedContent.replace(/{{document_id}}/g, id);
    
    // Add current date if {{date}} is used
    if (mergedContent.includes('{{date}}')) {
      const currentDate = new Date().toLocaleDateString();
      mergedContent = mergedContent.replace(/{{date}}/g, currentDate);
    }
    
    // Save the merged document
    await fs.writeFile(docPath, mergedContent);
    
    // Update the document to mark as final
    docMetadata.recordsManagement = {
      ...docMetadata.recordsManagement || {},
      isFinal: true,
      finalizedDate: new Date().toISOString(),
      finalizedBy: 'System',
      finalizedNotes: `Merged with template ${templateId} and sent for signing`
    };
    
    // Save the updated metadata
    await saveDocumentMetadata(id, docMetadata);
    
    // For a real implementation, this would trigger the following steps:
    // 1. Converting to PDF
    // 2. Sending to evia sign API for digital sealing
    
    // Simulate success response
    res.json({
      success: true,
      documentId: id,
      templateId,
      message: 'Document successfully merged with template and sent for digital signing',
      status: 'processing'
    });
  } catch (error) {
    console.error('Error merging document:', error);
    res.status(500).json({ error: 'Failed to merge document with template' });
  }
});

// Send document for digital signing
router.post('/:id/sign', async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Sending document ${id} for digital signing`);
    
    // Get the document
    const docPath = path.join(DOCUMENTS_DIR, `${id}.sfdt`);
    if (!await fileExists(docPath)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // In a real implementation, this would:
    // 1. Prepare the document for signing
    // 2. Send to an e-signature API
    // 3. Track the signing status
    
    // Simulate success response
    res.json({
      success: true,
      documentId: id,
      message: 'Document sent for digital signing',
      status: 'signing_initiated'
    });
  } catch (error) {
    console.error('Error sending document for signing:', error);
    res.status(500).json({ error: 'Failed to send document for signing' });
  }
});

// Add a new endpoint to get available templates
router.get('/templates', async (req, res) => {
  try {
    // For a real implementation, this would retrieve templates from a database
    // Here we'll return mock data
    const templates = [
      { id: 'template1', name: 'Approval Template', description: 'Template for approval workflow documents' },
      { id: 'template2', name: 'Contract Template', description: 'Template for legal contracts' },
      { id: 'template3', name: 'Report Template', description: 'Template for formal reports' }
    ];
    
    res.json(templates);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to retrieve templates' });
  }
});

/**
 * POST /api/documents/create-from-template
 * Create a new document from a template with merge fields
 */
router.post('/create-from-template', async (req, res) => {
  try {
    const { templateId, mergeFields } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    // Get the template
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    
    // Check if template exists
    try {
      await fs.access(templatePath);
    } catch (err) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Read template data
    const templateData = JSON.parse(await fs.readFile(templatePath, 'utf8'));
    
    if (!templateData.content) {
      return res.status(400).json({ error: 'Template has no content' });
    }
    
    // Replace merge fields in the template content
    let content = templateData.content;
    
    // Replace all merge fields with their values
    if (mergeFields) {
      Object.keys(mergeFields).forEach(fieldName => {
        const placeholder = new RegExp(`{{${fieldName}}}`, 'g');
        content = content.replace(placeholder, mergeFields[fieldName] || '');
      });
    }
    
    // Add current date if {{date}} is used and not provided
    if (content.includes('{{date}}')) {
      const currentDate = new Date().toLocaleDateString();
      content = content.replace(/{{date}}/g, currentDate);
    }
    
    // Generate a document ID
    const documentId = uuidv4();
    
    // Create document title based on template name
    const title = mergeFields?.document_title || 
                 `${templateData.name} - ${new Date().toLocaleDateString()}`;
    
    // Set up document metadata
    const documentMeta = {
      id: documentId,
      title,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      recordsManagement: {
        classification: 'Internal', // Default classification
        documentType: templateData.name,
        retentionPeriod: '3 Years',
        notes: `Created from template: ${templateData.name}`
      },
      currentVersion: 1,
      versions: [{
        version: 1,
        timestamp: new Date().toISOString(),
        comment: 'Initial version'
      }]
    };
    
    // Save document content
    const contentPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
    await fs.writeFile(contentPath, content);
    
    // Save document metadata
    const metaPath = path.join(DOCUMENTS_DIR, `${documentId}.meta.json`);
    await fs.writeFile(metaPath, JSON.stringify(documentMeta, null, 2));
    
    // Create version folder and save as version 1
    try {
      const versionPath = path.join(VERSIONS_DIR, `${documentId}.v1.sfdt`);
      await fs.writeFile(versionPath, content);
      console.log(`Saved initial version to: ${versionPath}`);
    } catch (error) {
      console.error('Error saving initial version:', error);
      // Continue even if version save fails
    }
    
    console.log(`Document created from template ${templateId}: ${documentId}`);
    
    // Return the document details
    res.status(201).json({
      id: documentId,
      title,
      ...documentMeta
    });
  } catch (error) {
    console.error('Error creating document from template:', error);
    res.status(500).json({ error: 'Failed to create document from template' });
  }
});

module.exports = router;