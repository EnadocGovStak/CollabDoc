import config from '../config';

export interface Document {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface DocumentContent {
  id: string;
  content: string; // SFDT content
}

/**
 * Service for handling document operations
 */
class DocumentService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = `${config.api.baseUrl}/api/documents`;
  }
  
  /**
   * Get all documents for the current user
   * @param accessToken Azure AD access token
   * @returns Array of document metadata
   */
  async getDocuments(accessToken: string): Promise<Document[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }
  
  /**
   * Get a specific document's content by ID
   * @param documentId Document ID
   * @param accessToken Azure AD access token
   * @returns Document content in SFDT format
   */
  async getDocumentContent(documentId: string, accessToken: string): Promise<DocumentContent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch document content for ID: ${documentId}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching document content for ID ${documentId}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new document
   * @param documentData Document data including content
   * @param accessToken Azure AD access token
   * @returns The created document ID
   */
  async createDocument(
    documentData: { name: string; content: string; templateId?: string }, 
    accessToken: string
  ): Promise<{ documentId: string } | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(documentData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create document');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  }
  
  /**
   * Update an existing document
   * @param documentId Document ID
   * @param documentData Document data to update
   * @param accessToken Azure AD access token
   * @returns Success indicator
   */
  async updateDocument(
    documentId: string,
    documentData: { name?: string; content?: string; status?: string },
    accessToken: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(documentData)
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Error updating document ID ${documentId}:`, error);
      return false;
    }
  }
  
  /**
   * Export and submit document to external API
   * @param documentId Document ID
   * @param accessToken Azure AD access token
   * @returns Success indicator
   */
  async submitDocument(documentId: string, accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Error submitting document ID ${documentId}:`, error);
      return false;
    }
  }
  
  /**
   * Export document as DOCX and trigger download
   * @param documentId Document ID
   * @param accessToken Azure AD access token
   * @returns void
   */
  async exportDocument(documentId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}/export`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document_${documentId}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting document ID ${documentId}:`, error);
    }
  }
}

export default new DocumentService(); 