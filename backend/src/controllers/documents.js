const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const templateService = require('../services/templateService');

// In a production app, this would be a database
// For this example, we'll use an in-memory store
const documentsStore = {};

/**
 * Get all documents for the current user
 */
const getAllDocuments = (req, res) => {
  try {
    // Get user ID from the token
    const userId = req.user.sub || req.user.oid;
    
    // Filter documents by user
    const userDocuments = Object.values(documentsStore)
      .filter(doc => doc.createdBy === userId)
      .map(({ content, ...metadata }) => metadata); // Exclude content for listing
    
    res.status(200).json(userDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

/**
 * Get a specific document by ID
 */
const getDocumentById = (req, res) => {
  try {
    const { id } = req.params;
    const document = documentsStore[id];
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Verify ownership or admin role
    const userId = req.user.sub || req.user.oid;
    const userRoles = req.user.roles || [];
    
    if (document.createdBy !== userId && !userRoles.includes('Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.status(200).json(document);
  } catch (error) {
    console.error(`Error fetching document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

/**
 * Create a new document
 */
const createDocument = (req, res) => {
  try {
    const { name, content, templateId } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }
    
    const userId = req.user.sub || req.user.oid;
    const userName = req.user.name || 'Unknown User';
    const documentId = uuidv4();
    
    // Create the document
    const document = {
      id: documentId,
      name,
      content,
      templateId,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    // Store the document
    documentsStore[documentId] = document;
    
    // Return the document ID
    res.status(201).json({ 
      documentId,
      name,
      createdAt: document.createdAt 
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
};

/**
 * Update an existing document
 */
const updateDocument = (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, status } = req.body;
    
    // Verify document exists
    if (!documentsStore[id]) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Verify ownership
    const userId = req.user.sub || req.user.oid;
    const userRoles = req.user.roles || [];
    
    if (documentsStore[id].createdBy !== userId && !userRoles.includes('Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update document
    documentsStore[id] = {
      ...documentsStore[id],
      name: name || documentsStore[id].name,
      content: content || documentsStore[id].content,
      status: status || documentsStore[id].status,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({ 
      documentId: id,
      name: documentsStore[id].name,
      updatedAt: documentsStore[id].updatedAt
    });
  } catch (error) {
    console.error(`Error updating document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update document' });
  }
};

/**
 * Delete a document (Admin only)
 */
const deleteDocument = (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify document exists
    if (!documentsStore[id]) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete document
    delete documentsStore[id];
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

/**
 * Create a document from a template with merge data
 */
const createFromTemplate = async (req, res) => {
  try {
    const { templateId, mergeData } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    // Load template (in a real app, this would fetch from a database)
    const template = await templateService.getTemplateById(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Process the template to replace merge fields with data
    let processedContent = template.content;
    
    if (mergeData) {
      // Replace all merge fields in format {{FieldName}} with corresponding values
      Object.entries(mergeData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedContent = processedContent.replace(regex, value);
      });
    }
    
    const userId = req.user.sub || req.user.oid;
    const userName = req.user.name || 'Unknown User';
    const documentId = uuidv4();
    
    // Create the document
    const document = {
      id: documentId,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      content: processedContent,
      templateId,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    // Store the document
    documentsStore[documentId] = document;
    
    // Return the document ID
    res.status(201).json({ 
      documentId,
      name: document.name,
      createdAt: document.createdAt 
    });
  } catch (error) {
    console.error('Error creating document from template:', error);
    res.status(500).json({ error: 'Failed to create document from template' });
  }
};

/**
 * Export document as DOCX
 */
const exportDocument = (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify document exists
    if (!documentsStore[id]) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Verify ownership or admin role
    const userId = req.user.sub || req.user.oid;
    const userRoles = req.user.roles || [];
    
    if (documentsStore[id].createdBy !== userId && !userRoles.includes('Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // In a real app, this would convert SFDT to DOCX
    // For this example, we'll return the SFDT content with a different content type
    res.status(200).json({
      message: 'Document exported successfully',
      // This would be the URL to download the DOCX in a real application
      downloadUrl: `/api/documents/${id}/download`
    });
  } catch (error) {
    console.error(`Error exporting document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to export document' });
  }
};

/**
 * Submit document to external system
 */
const submitDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify document exists
    if (!documentsStore[id]) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Verify ownership
    const userId = req.user.sub || req.user.oid;
    const userRoles = req.user.roles || [];
    
    if (documentsStore[id].createdBy !== userId && !userRoles.includes('Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // In a real app, this would convert SFDT to DOCX and send to external endpoint
    // For this example, we'll simulate the submission
    
    // Update document status
    documentsStore[id].status = 'submitted';
    documentsStore[id].updatedAt = new Date().toISOString();
    documentsStore[id].submittedAt = new Date().toISOString();
    
    // Return success
    res.status(200).json({
      documentId: id,
      status: 'submitted',
      submittedAt: documentsStore[id].submittedAt
    });
  } catch (error) {
    console.error(`Error submitting document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to submit document' });
  }
};

/**
 * Upload a DOCX file and convert to SFDT
 */
const uploadDocument = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // In a real app, this would convert DOCX to SFDT
    // For this example, we'll simulate the conversion
    
    const userId = req.user.sub || req.user.oid;
    const userName = req.user.name || 'Unknown User';
    const documentId = uuidv4();
    
    // Create the document
    const document = {
      id: documentId,
      name: req.file.originalname.replace('.docx', ''),
      content: '{"sfdt":"simulated-sfdt-content"}', // Simulated SFDT content
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    // Store the document
    documentsStore[documentId] = document;
    
    // Return the document ID
    res.status(201).json({ 
      documentId,
      name: document.name,
      createdAt: document.createdAt 
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  createFromTemplate,
  exportDocument,
  submitDocument,
  uploadDocument
}; 