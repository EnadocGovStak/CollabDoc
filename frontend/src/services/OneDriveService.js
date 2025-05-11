import config from '../config';

/**
 * Service for OneDrive operations
 */
class OneDriveService {
  constructor() {
    this.msGraphEndpoint = 'https://graph.microsoft.com/v1.0';
  }
  
  /**
   * Save a document to OneDrive
   * @param {string} fileName Document name
   * @param {string} content Document content
   * @param {string} accessToken Microsoft Graph API token
   * @returns {Promise<Object|null>} Result object or null if failed
   */
  async saveDocumentToOneDrive(fileName, content, accessToken) {
    try {
      // First convert the content to a Blob
      const contentBlob = new Blob([content], { type: 'application/json' });
      
      // Save file to OneDrive root folder
      const uploadUrl = `${this.msGraphEndpoint}/me/drive/root:/${fileName}.sfdt:/content`;
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: contentBlob
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload to OneDrive');
      }
      
      const result = await response.json();
      
      return {
        documentId: result.id,
        name: result.name,
        webUrl: result.webUrl,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error saving document to OneDrive:', error);
      return null;
    }
  }
  
  /**
   * Get document from OneDrive
   * @param {string} fileId OneDrive file ID
   * @param {string} accessToken Microsoft Graph API token
   * @returns {Promise<string|null>} File content or null if failed
   */
  async getDocumentFromOneDrive(fileId, accessToken) {
    try {
      const getUrl = `${this.msGraphEndpoint}/me/drive/items/${fileId}/content`;
      
      const response = await fetch(getUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get file from OneDrive');
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error getting document from OneDrive:', error);
      return null;
    }
  }
  
  /**
   * List OneDrive documents with a specific extension
   * @param {string} extension File extension to filter by (e.g., '.sfdt')
   * @param {string} accessToken Microsoft Graph API token
   * @returns {Promise<Array|null>} Array of file objects or null if failed
   */
  async listOneDriveDocuments(extension, accessToken) {
    try {
      // Search for documents with the provided extension
      const searchUrl = `${this.msGraphEndpoint}/me/drive/root/search(q='${extension}')`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to list OneDrive documents');
      }
      
      const result = await response.json();
      return result.value;
    } catch (error) {
      console.error('Error listing OneDrive documents:', error);
      return null;
    }
  }
}

export default new OneDriveService(); 