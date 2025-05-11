/**
 * End-to-end test for document workflow
 * 
 * This test simulates the entire flow of:
 * 1. Creating a template
 * 2. Creating a document from the template
 * 3. Updating the document
 * 4. Submitting the document
 * 
 * Note: This requires a running backend server
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN || 'test-token'; // For local testing

// Set longer timeout for E2E tests
jest.setTimeout(30000);

// Skip tests if no access token is available
const itif = (condition) => condition ? it : it.skip;

describe('Document Workflow (E2E)', () => {
  let templateId;
  let documentId;
  
  // Setup Axios with auth headers
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  beforeAll(async () => {
    // Check if API is available
    try {
      await api.get('/health');
    } catch (error) {
      console.warn('API server is not available. E2E tests will be skipped.');
      return;
    }
  });
  
  itif(ACCESS_TOKEN)('should create a new template', async () => {
    // In a real test, you would use a form data and upload a real DOCX
    // For this example, we'll just create a template with mock content
    const templateData = {
      name: 'E2E Test Template',
      description: 'Template created during E2E testing',
      content: JSON.stringify({
        sfdt: `{
          "sections": [{
            "blocks": [{
              "inlines": [{
                "text": "This is a test template with {{Name}} and {{Position}} merge fields."
              }]
            }]
          }]
        }`
      })
    };
    
    const response = await api.post('/api/templates', templateData);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('templateId');
    
    templateId = response.data.templateId;
  });
  
  itif(ACCESS_TOKEN)('should create a document from the template', async () => {
    // Skip if template creation failed
    if (!templateId) {
      return;
    }
    
    const data = {
      templateId,
      mergeData: {
        Name: 'E2E Test User',
        Position: 'Tester'
      }
    };
    
    const response = await api.post('/api/documents/create', data);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('documentId');
    
    documentId = response.data.documentId;
  });
  
  itif(ACCESS_TOKEN)('should get the created document', async () => {
    // Skip if document creation failed
    if (!documentId) {
      return;
    }
    
    const response = await api.get(`/api/documents/${documentId}`);
    
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(documentId);
    expect(response.data.content).toContain('E2E Test User');
    expect(response.data.content).toContain('Tester');
  });
  
  itif(ACCESS_TOKEN)('should update the document', async () => {
    // Skip if document creation failed
    if (!documentId) {
      return;
    }
    
    const updateData = {
      name: 'Updated E2E Test Document',
      content: JSON.stringify({
        sfdt: `{
          "sections": [{
            "blocks": [{
              "inlines": [{
                "text": "This document has been updated during E2E testing."
              }]
            }]
          }]
        }`
      })
    };
    
    const response = await api.put(`/api/documents/${documentId}`, updateData);
    
    expect(response.status).toBe(200);
    expect(response.data.documentId).toBe(documentId);
    expect(response.data.name).toBe(updateData.name);
  });
  
  itif(ACCESS_TOKEN)('should submit the document', async () => {
    // Skip if document creation failed
    if (!documentId) {
      return;
    }
    
    const response = await api.post(`/api/documents/${documentId}/submit`);
    
    expect(response.status).toBe(200);
    expect(response.data.documentId).toBe(documentId);
    expect(response.data.status).toBe('submitted');
    expect(response.data).toHaveProperty('submittedAt');
  });
  
  // Clean up after tests
  afterAll(async () => {
    // Only attempt cleanup if the API is available and we created resources
    if (!templateId && !documentId) {
      return;
    }
    
    try {
      // Try to delete the document
      if (documentId) {
        await api.delete(`/api/documents/${documentId}`);
      }
      
      // Try to delete the template
      if (templateId) {
        await api.delete(`/api/templates/${templateId}`);
      }
    } catch (error) {
      console.warn('Error during cleanup:', error.message);
    }
  });
}); 