import axios from 'axios';
import config from '../config';

<<<<<<< HEAD
const API_URL = config.api.baseUrl;
=======
const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://collabdoc-backend.azurewebsites.net';
>>>>>>> 70d45d17be070077ddd65a950927a3d2d49058b9

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
      // Reduce logging frequency - only log summary
      
      // Normalize documents to ensure consistent structure
      const normalizedDocs = response.data.map(doc => {
        // Only log for debugging if needed
        // console.log("Processing document:", doc.title, doc);
        
        // If recordsManagement doesn't exist in the root, check if it's in metadata
        if (!doc.recordsManagement && doc.metadata && doc.metadata.recordsManagement) {
          doc.recordsManagement = doc.metadata.recordsManagement;
          // console.log(`Moved recordsManagement from metadata for ${doc.title}`);
        }
        
        // Look for properties in .meta.json files and extract data
        if (doc.metaFile) {
          try {
            // For testing and debugging - attempt to extract data from any available properties
            // console.log(`Detected metaFile for ${doc.title}`, doc.metaFile);
            
            // See if we can extract classification from metaFile 
            if (doc.metaFile.recordsManagement && doc.metaFile.recordsManagement.classification) {
              if (!doc.recordsManagement) {
                doc.recordsManagement = {};
              }
              doc.recordsManagement.classification = doc.metaFile.recordsManagement.classification;
              // console.log(`Extracted classification from metaFile for ${doc.title}: ${doc.recordsManagement.classification}`);
            }
          } catch (e) {
            console.error("Error processing metaFile:", e);
          }
        }
        
        // Extract document record data based on patterns in filename or document content
        // This is a heuristic approach to assign classifications based on document names
        if (!doc.recordsManagement || !doc.recordsManagement.classification) {
          const title = doc.title?.toLowerCase() || '';
          
          if (!doc.recordsManagement) {
            doc.recordsManagement = {};
          }
          
          // Assign classifications based on document name patterns
          if (title.includes('policy') || title.includes('manual')) {
            doc.recordsManagement.classification = 'Internal';
            // console.log(`Assigned Internal classification to ${doc.title} based on name pattern`);
          } else if (title.includes('fee') || title.includes('feee')) {
            doc.recordsManagement.classification = 'Confidential';
            // console.log(`Assigned Confidential classification to ${doc.title} based on name pattern`);
          } else if (title.includes('pass') || title.includes('gate')) {
            doc.recordsManagement.classification = 'Restricted';
            // console.log(`Assigned Restricted classification to ${doc.title} based on name pattern`);
          } else {
            doc.recordsManagement.classification = 'Public';
            // console.log(`Assigned Public classification to ${doc.title} as default`);
          }
        }
        
        // Ensure recordsManagement is complete
        if (!doc.recordsManagement) {
          doc.recordsManagement = {
            classification: 'Public',
            documentType: '',
            retentionPeriod: '',
            recordNumber: '',
            notes: '',
            isFinal: false
          };
        }
        
        // Apply retention period if not set
        if (!doc.recordsManagement.retentionPeriod) {
          // Assign a default retention period based on classification
          switch (doc.recordsManagement.classification.toLowerCase()) {
            case 'confidential':
              doc.recordsManagement.retentionPeriod = '7 Years';
              break;
            case 'restricted':
              doc.recordsManagement.retentionPeriod = '5 Years';
              break;
            case 'internal':
              doc.recordsManagement.retentionPeriod = '3 Years';
              break;
            case 'public':
              doc.recordsManagement.retentionPeriod = '1 Year';
              break;
            default:
              doc.recordsManagement.retentionPeriod = '1 Year';
          }
          console.log(`Assigned retention period for ${doc.title}: ${doc.recordsManagement.retentionPeriod}`);
        }
        
        return doc;
      });
      
      console.log("Normalized documents:", normalizedDocs);
      return normalizedDocs;
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
    try {
      console.log(`DocumentService: Getting document with ID: ${documentId}`);
      const response = await axios.get(`${API_URL}/api/documents/${documentId}`);
      console.log('DocumentService: API response data:', response.data);
      
      // Check specifically for recordsManagement
      if (response.data.recordsManagement) {
        console.log('DocumentService: Records management data found in response:', 
          response.data.recordsManagement);
      } else {
        console.warn('DocumentService: No records management data in API response');
      }
      
      return {
        ...response.data,
        id: documentId // Ensure ID is included
      };
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
    try {
      // For now, return static list - can be made dynamic later
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
    } catch (error) {
      console.error('Error getting document types:', error);
      return [];
    }
  },

  /**
   * Get available classifications for records management
   * @returns {Promise<Array>} - Array of classifications
   */
  async getClassifications() {
    try {
      // For now, return static list - can be made dynamic later
      return [
        'Public',
        'Internal',
        'Confidential',
        'Restricted',
        'Secret',
        'Top Secret'
      ];
    } catch (error) {
      console.error('Error getting classifications:', error);
      return [];
    }
  },

  /**
   * Get available retention periods for records management
   * @returns {Promise<Array>} - Array of retention periods
   */
  async getRetentionPeriods() {
    try {
      // For now, return static list - can be made dynamic later
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
    } catch (error) {
      console.error('Error getting retention periods:', error);
      return [];
    }
  }
}; 