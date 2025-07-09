import config from '../config';

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  documentType?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateContent {
  id: string;
  name: string;
  content: string; // SFDT content
  description?: string;
  category?: string;
  documentType?: string;
  mergeFields?: MergeField[];
  createdAt: string;
  updatedAt: string;
}

export interface MergeField {
  name: string;
  type?: 'text' | 'number' | 'email' | 'date';
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface GenerationResult {
  success: boolean;
  content?: string;
  template?: {
    id: string;
    name: string;
    category: string;
    documentType: string;
  };
  mergeData?: Record<string, any>;
  extractedFields?: string[];
  error?: string;
  validationErrors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingRequiredFields?: string[];
  extractedFields?: string[];
}

/**
 * Category object returned from the API
 */
export interface TemplateCategory {
  name: string;
  displayName: string;
}

/**
 * Template search result
 */
export interface TemplateSearchResult {
  success: boolean;
  query?: string;
  category?: string;
  count: number;
  templates: Template[];
  error?: string;
}

/**
 * Service for handling document template operations
 * Updated to match the new backend template merge engine
 */
class TemplateService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = `${config.api.baseUrl}/api/templates`;
  }
  
  /**
   * Get all available templates (metadata only)
   * @param accessToken Azure AD access token (optional)
   * @returns Array of template metadata
   */
  async getTemplates(accessToken?: string): Promise<Template[]> {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(this.baseUrl, { headers });
      
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
   * Get a specific template's full content by ID
   * @param templateId Template ID
   * @param accessToken Azure AD access token (optional)
   * @returns Full template object with content
   */
  async getTemplateContent(templateId: string, accessToken?: string): Promise<TemplateContent | null> {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/${templateId}`, { headers });
      
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
   * Extract merge fields from a template
   * @param templateId Template ID
   * @param accessToken Azure AD access token (optional)
   * @returns Array of field names found in the template
   */
  async getTemplateMergeFields(templateId: string, accessToken?: string): Promise<string[]> {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/${templateId}/fields`, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch merge fields for template: ${templateId}`);
      }
      
      const result = await response.json();
      return result.fields || [];
    } catch (error) {
      console.error(`Error fetching merge fields for template ${templateId}:`, error);
      return [];
    }
  }

  /**
   * Generate a document from a template with merge data
   * @param templateId Template ID
   * @param mergeData Key-value pairs for merge fields
   * @param accessToken Azure AD access token (optional)
   * @returns Generation result with document content
   */
  async generateDocument(
    templateId: string, 
    mergeData: Record<string, any>, 
    accessToken?: string
  ): Promise<GenerationResult> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/${templateId}/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ mergeData })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to generate document',
          validationErrors: result.validationErrors
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error generating document from template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Preview a template with merge data (without saving as document)
   * @param templateId Template ID
   * @param mergeData Data to merge
   * @param accessToken Azure AD access token (optional)
   * @returns Preview result with content
   */
  async previewTemplate(
    templateId: string, 
    mergeData: Record<string, any>, 
    accessToken?: string
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/${templateId}/preview`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ mergeData })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || 'Failed to preview template' 
        };
      }
      
      const result = await response.json();
      return { 
        success: true, 
        content: result.content 
      };
    } catch (error) {
      console.error('Error previewing template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Save a template (create new or update existing)
   * @param templateData Template data to save
   * @param existingId ID of existing template to update (optional)
   * @param accessToken Azure AD access token (optional)
   * @returns Saved template metadata
   */
  async saveTemplate(templateData: any, existingId?: string, accessToken?: string): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const url = existingId ? `${this.baseUrl}/${existingId}` : this.baseUrl;
      const method = existingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to save template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  /**
   * Delete a template
   * @param templateId Template ID to delete
   * @param accessToken Azure AD access token (optional)
   * @returns Promise<void>
   */
  async deleteTemplate(templateId: string, accessToken?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/${templateId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Get all template categories 
   * @param accessToken Azure AD access token (optional)
   * @returns Array of template categories
   */
  async getTemplateCategories(accessToken?: string): Promise<TemplateCategory[]> {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/categories`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch template categories');
      }
      
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching template categories:', error);
      return [];
    }
  }
  
  /**
   * Search templates by name, description, or category
   * @param query Search query string
   * @param category Optional category filter
   * @param accessToken Azure AD access token (optional)
   * @returns Template search results
   */
  async searchTemplates(query?: string, category?: string, accessToken?: string): Promise<TemplateSearchResult> {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      // Build search URL with query parameters
      let searchUrl = `${this.baseUrl}/search`;
      const params = new URLSearchParams();
      
      if (query) {
        params.append('q', query);
      }
      
      if (category) {
        params.append('category', category);
      }
      
      if (params.toString()) {
        searchUrl += `?${params.toString()}`;
      }

      const response = await fetch(searchUrl, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to search templates');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching templates:', error);
      return {
        success: false,
        count: 0,
        templates: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   * Create a document from a template with merge data
   * @deprecated Use generateDocument instead
   */
  async createFromTemplate(
    templateId: string, 
    mergeData: Record<string, string>, 
    accessToken?: string
  ): Promise<{ documentId: string } | null> {
    try {
      const result = await this.generateDocument(templateId, mergeData, accessToken);
      
      if (result.success && result.content) {
        // For backward compatibility, we would need to save the generated content
        // and return a document ID. This would require integration with document service.
        console.warn('createFromTemplate is deprecated. Use generateDocument instead.');
        return { documentId: 'generated-doc-' + Date.now() };
      }
      
      return null;
    } catch (error) {
      console.error('Error in createFromTemplate:', error);
      return null;
    }
  }
}

export default new TemplateService();