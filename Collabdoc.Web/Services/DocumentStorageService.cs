using System.Text.Json;
using System.Text;

namespace Collabdoc.Web.Services
{
    public class DocumentStorageService : IDocumentStorageService
    {
        private readonly string _storageDirectory;
        private readonly ILogger<DocumentStorageService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public DocumentStorageService(ILogger<DocumentStorageService> logger, IWebHostEnvironment environment)
        {
            _logger = logger;
            _storageDirectory = Path.Combine(environment.ContentRootPath, "Documents");
            
            // Ensure storage directory exists
            if (!Directory.Exists(_storageDirectory))
            {
                Directory.CreateDirectory(_storageDirectory);
            }

            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        public async Task<string> SaveDocumentAsync(string documentId, string documentName, string sfdtContent)
        {
            try
            {
                var fileName = $"{documentId}.sfdt";
                var filePath = Path.Combine(_storageDirectory, fileName);
                var metadataPath = Path.Combine(_storageDirectory, $"{documentId}.meta.json");

                // Save document content
                await File.WriteAllTextAsync(filePath, sfdtContent, Encoding.UTF8);

                // Save metadata
                var metadata = new StoredDocumentMetadata
                {
                    DocumentId = documentId,
                    DocumentName = documentName,
                    CreatedAt = File.Exists(metadataPath) ? 
                        JsonSerializer.Deserialize<StoredDocumentMetadata>(await File.ReadAllTextAsync(metadataPath))?.CreatedAt ?? DateTime.Now : 
                        DateTime.Now,
                    LastModified = DateTime.Now,
                    Size = Encoding.UTF8.GetByteCount(sfdtContent),
                    FileType = "SFDT"
                };

                var metadataJson = JsonSerializer.Serialize(metadata, _jsonOptions);
                await File.WriteAllTextAsync(metadataPath, metadataJson, Encoding.UTF8);

                _logger.LogInformation("Document saved: {DocumentId} - {DocumentName}", documentId, documentName);
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving document {DocumentId}", documentId);
                throw;
            }
        }

        public async Task<DocumentStorageResult> LoadDocumentAsync(string documentId)
        {
            try
            {
                var fileName = $"{documentId}.sfdt";
                var filePath = Path.Combine(_storageDirectory, fileName);
                var metadataPath = Path.Combine(_storageDirectory, $"{documentId}.meta.json");

                if (!File.Exists(filePath))
                {
                    return new DocumentStorageResult
                    {
                        Success = false,
                        Error = "Document not found"
                    };
                }

                var content = await File.ReadAllTextAsync(filePath, Encoding.UTF8);
                
                StoredDocumentMetadata? metadata = null;
                if (File.Exists(metadataPath))
                {
                    var metadataJson = await File.ReadAllTextAsync(metadataPath, Encoding.UTF8);
                    metadata = JsonSerializer.Deserialize<StoredDocumentMetadata>(metadataJson, _jsonOptions);
                }

                return new DocumentStorageResult
                {
                    Success = true,
                    Content = content,
                    DocumentName = metadata?.DocumentName ?? $"Document_{documentId}",
                    LastModified = metadata?.LastModified ?? File.GetLastWriteTime(filePath)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading document {DocumentId}", documentId);
                return new DocumentStorageResult
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public Task<bool> DeleteDocumentAsync(string documentId)
        {
            try
            {
                var fileName = $"{documentId}.sfdt";
                var filePath = Path.Combine(_storageDirectory, fileName);
                var metadataPath = Path.Combine(_storageDirectory, $"{documentId}.meta.json");

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                if (File.Exists(metadataPath))
                {
                    File.Delete(metadataPath);
                }

                _logger.LogInformation("Document deleted: {DocumentId}", documentId);
                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {DocumentId}", documentId);
                return Task.FromResult(false);
            }
        }

        public async Task<IEnumerable<StoredDocumentMetadata>> GetDocumentListAsync()
        {
            try
            {
                var documents = new List<StoredDocumentMetadata>();
                var metadataFiles = Directory.GetFiles(_storageDirectory, "*.meta.json");

                foreach (var metadataFile in metadataFiles)
                {
                    try
                    {
                        var json = await File.ReadAllTextAsync(metadataFile, Encoding.UTF8);
                        var metadata = JsonSerializer.Deserialize<StoredDocumentMetadata>(json, _jsonOptions);
                        if (metadata != null)
                        {
                            documents.Add(metadata);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error reading metadata file {MetadataFile}", metadataFile);
                    }
                }

                return documents.OrderByDescending(d => d.LastModified);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document list");
                return new List<StoredDocumentMetadata>();
            }
        }

        public Task<bool> DocumentExistsAsync(string documentId)
        {
            try
            {
                var fileName = $"{documentId}.sfdt";
                var filePath = Path.Combine(_storageDirectory, fileName);
                return Task.FromResult(File.Exists(filePath));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if document exists {DocumentId}", documentId);
                return Task.FromResult(false);
            }
        }

        public async Task<string> ConvertSfdtToDocxAsync(string sfdtContent)
        {
            // TODO: Implement SFDT to DOCX conversion using Syncfusion
            // For now, return a placeholder
            await Task.Delay(100);
            throw new NotImplementedException("SFDT to DOCX conversion not yet implemented");
        }

        public async Task<string> ConvertDocxToSfdtAsync(byte[] docxContent)
        {
            // TODO: Implement DOCX to SFDT conversion using Syncfusion
            // For now, return a placeholder
            await Task.Delay(100);
            throw new NotImplementedException("DOCX to SFDT conversion not yet implemented");
        }
    }
} 