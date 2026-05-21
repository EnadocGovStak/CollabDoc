import axios from 'axios';
import config from '../config';

const API_URL = config.api.baseUrl;
const pendingDocumentRequests = new Map();

const getDefaultClassification = (doc) => {
  const title = doc?.title?.toLowerCase() || '';

  if (title.includes('policy') || title.includes('manual')) {
    return 'Internal';
  }
  if (title.includes('fee') || title.includes('feee')) {
    return 'Confidential';
  }
  if (title.includes('pass') || title.includes('gate')) {
    return 'Restricted';
  }
  return 'Public';
};

const getDefaultRetentionPeriod = (classification) => {
  switch ((classification || '').toLowerCase()) {
    case 'confidential':
      return '7 Years';
    case 'restricted':
      return '5 Years';
    case 'internal':
      return '3 Years';
    case 'public':
    default:
      return '1 Year';
  }
};

const normalizeRecordsManagement = (doc) => {
  const recordsManagement = doc?.recordsManagement || doc?.metadata?.recordsManagement || doc?.metaFile?.recordsManagement || {};
  const classification = recordsManagement.classification || doc?.classification || getDefaultClassification(doc);

  return {
    ...recordsManagement,
    classification,
    retentionPeriod: recordsManagement.retentionPeriod || getDefaultRetentionPeriod(classification)
  };
};

/**
 * Service for handling document operations
 */
export const documentService = {
  /**
   * Save a document to the server
   * @param {Object} documentData - Document data to save
   * @param {String} existingId - Optional ID of an existing document to update
   * @returns {Promise<Object>} - Saved document information
   */
  async saveDocument(documentData, existingId) {
    try {
      console.log(`saveDocument called with existingId: ${existingId || 'none'}`);
      
      // Validate content
      if (!documentData.content) {
        console.error('No content provided for saving');
        throw new Error('Document content is required');
      }
      
      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Convert content to string if it's an object
      let contentToSave = documentData.content;
      if (typeof contentToSave === 'object') {
        contentToSave = JSON.stringify(contentToSave);
      }
      
      // Log content size for debugging
      console.log(`Content size for ${existingId || 'new document'}: ${contentToSave.length} characters`);
      
      // Create a Blob from the content
      const blob = new Blob([contentToSave], { type: 'application/json' });
      
      // For title, use provided title or 'Untitled'
      const title = documentData.title || 'Untitled';
      
      // Always use a consistent filename for the actual upload
      formData.append('document', blob, 'content.json');
      
      // If updating an existing document, pass its ID as originalFilename
      if (existingId) {
        formData.append('originalFilename', existingId);
        console.log(`Updating existing document with ID: ${existingId}`);
      }
      
      // Always send the title
      formData.append('title', title);

      // Add records management metadata if available
      if (documentData.recordsManagement) {
        formData.append('recordsManagement', JSON.stringify(documentData.recordsManagement));
      }
      
      // Send the request
      const response = await axios.post(`${API_URL}/api/documents/save`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Document save response:', response.data);
      
      // Return the response data
      return {
        ...response.data,
        title: title
      };
    } catch (error) {
      console.error('Error saving document:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      throw error;
    }
  },

  /**
   * Get list of documents
   * @returns {Promise<Array>} List of documents
   */
  async getDocuments() {
    try {
      const response = await axios.get(`${API_URL}/api/documents/list`);

      return response.data.map(doc => ({
        ...doc,
        recordsManagement: normalizeRecordsManagement(doc)
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  /**
   * Get document by ID
   * @param {String} documentId - Document ID
   * @returns {Promise<Object>} Document data
   */
  async getDocument(documentId) {
    if (pendingDocumentRequests.has(documentId)) {
      return pendingDocumentRequests.get(documentId);
    }

    const request = axios.get(`${API_URL}/api/documents/${documentId}`)
      .then(response => ({
        ...response.data,
        id: documentId,
        recordsManagement: normalizeRecordsManagement(response.data)
      }))
      .finally(() => {
        pendingDocumentRequests.delete(documentId);
      });

    pendingDocumentRequests.set(documentId, request);

    try {
      return await request;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  /**
   * Get document versions
   * @param {String} documentId - Document ID
   * @returns {Promise<Object>} Version information
   */
  async getDocumentVersions(documentId) {
    try {
      const response = await axios.get(`${API_URL}/api/documents/${documentId}/versions`);
      return response.data;
    } catch (error) {
      console.error('Error getting document versions:', error);
      throw error;
    }
  },

  /**
   * Get specific version of a document
   * @param {String} documentId - Document ID
   * @param {Number} version - Version number
   * @returns {Promise<Object>} Document version
   */
  async getDocumentVersion(documentId, version) {
    try {
      const response = await axios.get(`${API_URL}/api/documents/${documentId}/versions/${version}`);
      return response.data;
    } catch (error) {
      console.error('Error getting document version:', error);
      throw error;
    }
  },

  /**
   * Delete a document
   * @param {String} documentId - Document ID
   * @returns {Promise<Object>} Result
   */
  async deleteDocument(documentId) {
    try {
      const response = await axios.delete(`${API_URL}/api/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  /**
   * Update records management metadata for a document
   * @param {String} documentId - Document ID
   * @param {Object} recordsData - Records management data
   * @returns {Promise<Object>} Updated document information
   */
  async updateRecordsMetadata(documentId, recordsData) {
    try {
      const response = await axios.put(
        `${API_URL}/api/documents/${documentId}/records-metadata`,
        recordsData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating records metadata:', error);
      throw error;
    }
  },

  /**
   * Get available document types for records management
   * @returns {Promise<Array>} - Array of document types
   */
  async getDocumentTypes() {
    return [
      'Policy',
      'Contract',
      'Report',
      'Manual',
      'Procedure',
      'Standard',
      'Form',
      'Template',
      'Correspondence',
      'Legal Document'
    ];
  },

  /**
   * Get available classifications for records management
   * @returns {Promise<Array>} - Array of classifications
   */
  async getClassifications() {
    return [
      'Public',
      'Internal',
      'Confidential',
      'Restricted',
      'Secret',
      'Top Secret'
    ];
  },

  /**
   * Get available retention periods for records management
   * @returns {Promise<Array>} - Array of retention periods
   */
  async getRetentionPeriods() {
    return [
      '1 Year',
      '2 Years',
      '3 Years',
      '5 Years',
      '7 Years',
      '10 Years',
      '15 Years',
      '25 Years',
      'Permanent',
      'Until Superseded'
    ];
  }
}; 