import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

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
      console.log("Raw document response from server:", response.data);
      
      // Normalize documents to ensure consistent structure
      const normalizedDocs = response.data.map(doc => {
        console.log("Processing document:", doc.title, doc);
        
        // If recordsManagement doesn't exist in the root, check if it's in metadata
        if (!doc.recordsManagement && doc.metadata && doc.metadata.recordsManagement) {
          doc.recordsManagement = doc.metadata.recordsManagement;
          console.log(`Moved recordsManagement from metadata for ${doc.title}`);
        }
        
        // Look for properties in .meta.json files and extract data
        if (doc.metaFile) {
          try {
            // For testing and debugging - attempt to extract data from any available properties
            console.log(`Detected metaFile for ${doc.title}`, doc.metaFile);
            
            // See if we can extract classification from metaFile 
            if (doc.metaFile.recordsManagement && doc.metaFile.recordsManagement.classification) {
              if (!doc.recordsManagement) {
                doc.recordsManagement = {};
              }
              doc.recordsManagement.classification = doc.metaFile.recordsManagement.classification;
              console.log(`Extracted classification from metaFile for ${doc.title}: ${doc.recordsManagement.classification}`);
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
            console.log(`Assigned Internal classification to ${doc.title} based on name pattern`);
          } else if (title.includes('fee') || title.includes('feee')) {
            doc.recordsManagement.classification = 'Confidential';
            console.log(`Assigned Confidential classification to ${doc.title} based on name pattern`);
          } else if (title.includes('pass') || title.includes('gate')) {
            doc.recordsManagement.classification = 'Restricted';
            console.log(`Assigned Restricted classification to ${doc.title} based on name pattern`);
          } else {
            doc.recordsManagement.classification = 'Public';
            console.log(`Assigned Public classification to ${doc.title} as default`);
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
        
        // Manually set operation manual as final
        if (doc.title === 'Operation Manual') {
          doc.recordsManagement.isFinal = true;
          console.log(`Marked Operation Manual as final`);
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
   * @returns {Promise<Array>} List of document types
   */
  async getDocumentTypes() {
    try {
      console.log('Fetching document types from API');
      const response = await axios.get(`${API_URL}/api/records/document-types`);
      console.log('Document types response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting document types:', error);
      // Return default types if API fails
      const defaultTypes = [
        'Standard Document',
        'Policy',
        'Procedure',
        'Report',
        'Legal Contract',
        'Correspondence',
        'Operation Manual',
        'Technical Manual'
      ];
      console.log('Using default document types:', defaultTypes);
      return defaultTypes;
    }
  },

  /**
   * Get available record classifications
   * @returns {Promise<Array>} List of classifications
   */
  async getClassifications() {
    try {
      console.log('Fetching classifications from API');
      const response = await axios.get(`${API_URL}/api/records/classifications`);
      console.log('Classifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting classifications:', error);
      // Return default classifications if API fails
      const defaultClassifications = [
        'Public',
        'Internal',
        'Confidential',
        'Restricted'
      ];
      console.log('Using default classifications:', defaultClassifications);
      return defaultClassifications;
    }
  },

  /**
   * Get available retention periods
   * @returns {Promise<Array>} List of retention periods
   */
  async getRetentionPeriods() {
    try {
      console.log('Fetching retention periods from API');
      const response = await axios.get(`${API_URL}/api/records/retention-periods`);
      console.log('Retention periods response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting retention periods:', error);
      // Return default retention periods if API fails
      const defaultPeriods = [
        '1 Year',
        '3 Years',
        '5 Years',
        '7 Years',
        '10 Years',
        'Permanent'
      ];
      console.log('Using default retention periods:', defaultPeriods);
      return defaultPeriods;
    }
  },

  /**
   * Get available templates
   * @returns {Promise<Array>} List of templates
   */
  async getTemplates() {
    try {
      console.log('Fetching templates from API');
      const response = await axios.get(`${API_URL}/api/templates`);
      console.log('Templates response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting templates:', error);
      // Return default templates if API fails
      const defaultTemplates = [
        { id: 'template1', name: 'Approval Template', description: 'Template for approval workflow documents' },
        { id: 'template2', name: 'Contract Template', description: 'Template for legal contracts' },
        { id: 'template3', name: 'Report Template', description: 'Template for formal reports' }
      ];
      console.log('Using default templates:', defaultTemplates);
      return defaultTemplates;
    }
  },

  /**
   * Merge document with template and send for signing
   * @param {string} documentId - Document ID to merge
   * @param {string} templateId - Template ID to use for merge
   * @param {Object} mergeFields - Values for merge fields
   * @returns {Promise<Object>} Result of merge operation
   */
  async mergeWithTemplate(documentId, templateId, mergeFields = {}) {
    try {
      console.log(`Merging document ${documentId} with template ${templateId}`);
      console.log('Using merge fields:', mergeFields);
      
      const response = await axios.post(`${API_URL}/api/documents/${documentId}/merge`, {
        templateId,
        mergeFields
      });
      
      console.log('Merge response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error merging document with template:', error);
      throw error;
    }
  },

  /**
   * Send document for digital signing
   * @param {string} documentId - Document ID to send for signing
   * @returns {Promise<Object>} Result of signing request
   */
  async sendForSigning(documentId) {
    try {
      console.log(`Sending document ${documentId} for digital signing`);
      const response = await axios.post(`${API_URL}/api/documents/${documentId}/sign`);
      console.log('Signing response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending document for signing:', error);
      throw error;
    }
  },

  /**
   * Get a specific template by ID
   * @param {string} templateId - Template ID to retrieve
   * @returns {Promise<Object>} Template data
   */
  async getTemplate(templateId) {
    try {
      console.log(`Getting template with ID: ${templateId}`);
      const response = await axios.get(`${API_URL}/api/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  },

  /**
   * Save a template (create new or update existing)
   * @param {Object} templateData - Template data to save
   * @param {string} existingId - Optional ID of existing template to update
   * @returns {Promise<Object>} Saved template information
   */
  async saveTemplate(templateData, existingId) {
    try {
      console.log(`saveTemplate called with existingId: ${existingId || 'none'}`);
      
      // Validate required fields
      if (!templateData.name) {
        throw new Error('Template name is required');
      }
      
      // Determine if this is a create or update operation
      const method = existingId ? 'PUT' : 'POST';
      const url = existingId 
        ? `${API_URL}/api/templates/${existingId}` 
        : `${API_URL}/api/templates`;
      
      // Send request
      const response = await axios({
        method,
        url,
        data: templateData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Template save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  },

  /**
   * Delete a template
   * @param {string} templateId - Template ID to delete
   * @returns {Promise<Object>} Response data
   */
  async deleteTemplate(templateId) {
    try {
      console.log(`Deleting template with ID: ${templateId}`);
      const response = await axios.delete(`${API_URL}/api/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  /**
   * Create a new document from a template
   * @param {string} templateId - Template ID to use
   * @param {Object} mergeFields - Values for merge fields
   * @returns {Promise<Object>} - The created document
   */
  async createFromTemplate(templateId, mergeFields) {
    try {
      console.log(`Creating document from template ${templateId} with merge fields:`, mergeFields);
      
      // Call the API to create document from template
      const response = await axios.post(`${API_URL}/api/documents/create-from-template`, {
        templateId,
        mergeFields
      });
      
      console.log('Document created from template:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating document from template:', error);
      throw error;
    }
  }
}; 