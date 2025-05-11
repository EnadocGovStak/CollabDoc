import DocumentService from '../../services/DocumentService';

// Mock fetch
global.fetch = jest.fn();

describe('DocumentService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  const mockToken = 'mock-access-token';
  const mockDocument = {
    id: 'doc-123',
    name: 'Test Document',
    createdAt: '2023-07-15T10:30:00Z',
    updatedAt: '2023-07-15T10:30:00Z',
    createdBy: 'user-123',
    status: 'draft'
  };
  
  test('getDocuments should fetch and return documents', async () => {
    // Mock successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockDocument]
    });
    
    const result = await DocumentService.getDocuments(mockToken);
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/documents'),
      expect.objectContaining({
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      })
    );
    
    // Verify result
    expect(result).toEqual([mockDocument]);
  });
  
  test('getDocuments should return empty array on error', async () => {
    // Mock error response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const result = await DocumentService.getDocuments(mockToken);
    
    // Verify result is empty array
    expect(result).toEqual([]);
  });
  
  test('createDocument should create and return document ID', async () => {
    const newDoc = {
      name: 'New Document',
      content: '{"sfdt":"content"}'
    };
    
    const expectedResponse = {
      documentId: 'new-doc-123',
      name: newDoc.name,
      createdAt: '2023-07-15T10:30:00Z'
    };
    
    // Mock successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => expectedResponse
    });
    
    const result = await DocumentService.createDocument(newDoc, mockToken);
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/documents'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify(newDoc)
      })
    );
    
    // Verify result
    expect(result).toEqual(expectedResponse);
  });
  
  test('updateDocument should update a document', async () => {
    const docId = 'doc-123';
    const updateData = {
      name: 'Updated Document',
      content: '{"sfdt":"updated-content"}'
    };
    
    // Mock successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true
    });
    
    const result = await DocumentService.updateDocument(docId, updateData, mockToken);
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/documents/${docId}`),
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify(updateData)
      })
    );
    
    // Verify result
    expect(result).toBe(true);
  });
}); 