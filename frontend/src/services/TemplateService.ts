import config from '../config';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateContent {
  id: string;
  content: string; // SFDT content
}

/**
 * Service for handling document template operations
 */
class TemplateService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = `${config.api.baseUrl}/api/templates`;
  }
  
  /**
   * Get all available templates
   * @param accessToken Azure AD access token
   * @returns Array of template metadata
   */
  async getTemplates(accessToken: string): Promise<Template[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }
  
  /**
   * Get a specific template's content by ID
   * @param templateId Template ID
   * @param accessToken Azure AD access token
   * @returns Template content in SFDT format
   */
  async getTemplateContent(templateId: string, accessToken: string): Promise<TemplateContent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch template content for ID: ${templateId}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching template content for ID ${templateId}:`, error);
      return null;
    }
  }
  
  /**
   * Create a document from a template with merge data
   * @param templateId Template ID
   * @param mergeData Key-value pairs for merge fields
   * @param accessToken Azure AD access token
   * @returns The created document content
   */
  async createFromTemplate(
    templateId: string, 
    mergeData: Record<string, string>, 
    accessToken: string
  ): Promise<{ documentId: string } | null> {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/documents/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          templateId,
          mergeData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create document from template');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating document from template:', error);
      return null;
    }
  }
}

export default new TemplateService(); 