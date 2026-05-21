import axios from 'axios';

const { documentService } = require('../../services/DocumentService.js');

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('documentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getDocuments fetches the document list and normalizes records metadata', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [{
        name: 'doc-123',
        title: 'Policy Manual',
        version: 2,
        recordsManagement: {
          classification: 'Internal'
        }
      }]
    });

    const result = await documentService.getDocuments();

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/documents/list'));
    expect(result).toEqual([{
      name: 'doc-123',
      title: 'Policy Manual',
      version: 2,
      recordsManagement: {
        classification: 'Internal',
        retentionPeriod: '3 Years'
      }
    }]);
  });

  test('saveDocument posts multipart content and returns the requested title', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: 'doc-123',
        version: 1
      }
    });

    const result = await documentService.saveDocument({
      title: 'Generated Invoice',
      content: { optimizeSfdt: true, sec: [] },
      recordsManagement: {
        classification: 'Internal'
      }
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/documents/save'),
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );
    expect(result).toEqual({
      id: 'doc-123',
      version: 1,
      title: 'Generated Invoice'
    });
  });

  test('getDocument fetches a document and preserves the requested ID', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        title: 'Loaded Document',
        content: { optimizeSfdt: true, sec: [] },
        recordsManagement: {
          classification: 'Public'
        }
      }
    });

    const result = await documentService.getDocument('doc-456');

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/documents/doc-456'));
    expect(result).toEqual({
      id: 'doc-456',
      title: 'Loaded Document',
      content: { optimizeSfdt: true, sec: [] },
      recordsManagement: {
        classification: 'Public',
        retentionPeriod: '1 Year'
      }
    });
  });

  test('getDocumentVersions fetches version metadata for a document', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        id: 'doc-789',
        currentVersion: 2,
        versions: [{ version: 1 }, { version: 2 }]
      }
    });

    const result = await documentService.getDocumentVersions('doc-789');

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/documents/doc-789/versions'));
    expect(result).toEqual({
      id: 'doc-789',
      currentVersion: 2,
      versions: [{ version: 1 }, { version: 2 }]
    });
  });
});
