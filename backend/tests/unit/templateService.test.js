const fs = require('fs');
const path = require('path');

// Mock the fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  readdirSync: jest.fn()
}));

// Clear module cache to ensure fresh imports with mocks
jest.mock('../../src/services/templateService');
const templateServicePath = require.resolve('../../src/services/templateService');
delete require.cache[templateServicePath];

// Import the service after mocking dependencies
const templateService = require('../../src/services/templateService');

describe('Template Service', () => {
  // Setup mock data
  const mockTemplateId = 'template-123';
  const mockTemplate = {
    id: mockTemplateId,
    name: 'Test Template',
    description: 'Test Description',
    content: '{"sfdt":"test-content"}',
    createdBy: 'admin',
    createdAt: '2023-07-15T10:30:00Z',
    updatedAt: '2023-07-15T10:30:00Z'
  };
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockTemplate));
  });
  
  describe('getTemplateById', () => {
    test('should return template when it exists', () => {
      // Arrange
      const expectedTemplate = mockTemplate;
      
      // Act
      const result = templateService.getTemplateById(mockTemplateId);
      
      // Assert
      expect(result).toEqual(expectedTemplate);
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(`${mockTemplateId}.json`));
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining(`${mockTemplateId}.json`), 'utf8');
    });
    
    test('should return null when template does not exist', () => {
      // Arrange
      fs.existsSync.mockReturnValue(false);
      
      // Act
      const result = templateService.getTemplateById('non-existent-id');
      
      // Assert
      expect(result).toBeNull();
    });
    
    test('should handle file read errors', () => {
      // Arrange
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });
      
      // Act
      const result = templateService.getTemplateById(mockTemplateId);
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('processTemplate', () => {
    test('should replace merge fields with provided data', async () => {
      // Arrange
      const templateWithMergeFields = {
        ...mockTemplate,
        content: '{"sfdt":"content with {{Name}} and {{Position}}"}'
      };
      
      // Mock getTemplateById to return our template with merge fields
      templateService.getTemplateById = jest.fn().mockReturnValue(templateWithMergeFields);
      
      const mergeData = {
        Name: 'John Doe',
        Position: 'Developer'
      };
      
      // Act
      const result = await templateService.processTemplate(mockTemplateId, mergeData);
      
      // Assert
      expect(result).toBe('{"sfdt":"content with John Doe and Developer"}');
      expect(templateService.getTemplateById).toHaveBeenCalledWith(mockTemplateId);
    });
    
    test('should return null when template not found', async () => {
      // Arrange
      templateService.getTemplateById = jest.fn().mockReturnValue(null);
      
      // Act
      const result = await templateService.processTemplate('non-existent-id', {});
      
      // Assert
      expect(result).toBeNull();
    });
  });
}); 