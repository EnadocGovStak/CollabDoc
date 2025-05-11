const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const documentsController = require('../../src/controllers/documents');

// Mock authentication middleware
jest.mock('../../src/middleware/auth', () => ({
  auth: () => (req, res, next) => {
    // Set mock user on request
    req.user = {
      sub: 'user-123',
      name: 'Test User',
      roles: []
    };
    next();
  },
  requireRole: (roles) => (req, res, next) => next()
}));

// Mock template service
jest.mock('../../src/services/templateService', () => ({
  getTemplateById: jest.fn().mockResolvedValue({
    id: 'template-123',
    name: 'Test Template',
    content: '{"sfdt":"Test content with {{Name}} and {{Position}}"}'
  }),
  processTemplate: jest.fn().mockImplementation((templateId, mergeData) => {
    let content = '{"sfdt":"Test content with {{Name}} and {{Position}}"}';
    if (mergeData) {
      Object.entries(mergeData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
      });
    }
    return Promise.resolve(content);
  })
}));

// Create express app for testing
const app = express();
app.use(bodyParser.json());

// Register document routes
app.get('/api/documents', documentsController.getAllDocuments);
app.get('/api/documents/:id', documentsController.getDocumentById);
app.post('/api/documents', documentsController.createDocument);
app.post('/api/documents/create', documentsController.createFromTemplate);
app.put('/api/documents/:id', documentsController.updateDocument);
app.post('/api/documents/:id/submit', documentsController.submitDocument);

describe('Documents API', () => {
  describe('GET /api/documents', () => {
    test('should return all documents for the current user', async () => {
      const response = await request(app).get('/api/documents');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
  
  describe('POST /api/documents', () => {
    test('should create a new document', async () => {
      const docData = {
        name: 'New Document',
        content: '{"sfdt":"new content"}'
      };
      
      const response = await request(app)
        .post('/api/documents')
        .send(docData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('documentId');
      expect(response.body.name).toBe(docData.name);
      expect(response.body).toHaveProperty('createdAt');
    });
    
    test('should return 400 when name or content is missing', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({ name: 'Incomplete Document' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/documents/create', () => {
    test('should create a document from template with merge data', async () => {
      const data = {
        templateId: 'template-123',
        mergeData: {
          Name: 'John Doe',
          Position: 'Developer'
        }
      };
      
      const response = await request(app)
        .post('/api/documents/create')
        .send(data);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('documentId');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('createdAt');
    });
    
    test('should return 400 when templateId is missing', async () => {
      const response = await request(app)
        .post('/api/documents/create')
        .send({ mergeData: { Name: 'John Doe' } });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('PUT /api/documents/:id', () => {
    test('should update an existing document', async () => {
      // First create a document to update
      const createResponse = await request(app)
        .post('/api/documents')
        .send({
          name: 'Document to Update',
          content: '{"sfdt":"original content"}'
        });
      
      const documentId = createResponse.body.documentId;
      
      // Now update it
      const updateData = {
        name: 'Updated Document',
        content: '{"sfdt":"updated content"}'
      };
      
      const response = await request(app)
        .put(`/api/documents/${documentId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.documentId).toBe(documentId);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body).toHaveProperty('updatedAt');
    });
    
    test('should return 404 when document does not exist', async () => {
      const response = await request(app)
        .put('/api/documents/non-existent-id')
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 