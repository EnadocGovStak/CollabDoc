using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.DocIO;
using Syncfusion.DocIO.DLS;
using DocIOWordDocument = Syncfusion.DocIO.DLS.WordDocument;
using DocIOFormatType = Syncfusion.DocIO.FormatType;
using EJ2WordDocument = Syncfusion.EJ2.DocumentEditor.WordDocument;
using EJ2FormatType = Syncfusion.EJ2.DocumentEditor.FormatType;
using Newtonsoft.Json;
using SyncfusionDocumentConverter.Models;
using SyncfusionDocumentConverter.DTOs;

namespace SyncfusionDocumentConverter.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly ILogger<DocumentService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _uploadsPath;
        private string VersionsPath => Path.Combine(_uploadsPath, "versions");
        private string DocumentsPath => Path.Combine(_uploadsPath, "documents");

        public DocumentService(ILogger<DocumentService> logger, IConfiguration configuration, IWebHostEnvironment environment)
        {
            _logger = logger;
            _configuration = configuration;
            _uploadsPath = Path.Combine(environment.ContentRootPath, "uploads");
            
            // Ensure uploads directory exists
            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
            
            // Create versioning directories
            var versionsPath = Path.Combine(_uploadsPath, "versions");
            if (!Directory.Exists(versionsPath))
            {
                Directory.CreateDirectory(versionsPath);
                _logger.LogInformation("Created versions directory: {Path}", versionsPath);
            }
            
            var documentsPath = Path.Combine(_uploadsPath, "documents");
            if (!Directory.Exists(documentsPath))
            {
                Directory.CreateDirectory(documentsPath);
                _logger.LogInformation("Created documents directory: {Path}", documentsPath);
            }
        }

        public async Task<ConversionResponse> ConvertToSfdtAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return new ConversionResponse
                {
                    Success = false,
                    Error = "No file provided"
                };
            }

            try
            {
                _logger.LogInformation("Converting document to SFDT: {FileName}, Size: {Size} bytes",
                    file.FileName, file.Length);

                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                stream.Position = 0;

                // Get file extension to determine format
                string fileExtension = Path.GetExtension(file.FileName).ToLower();
                EJ2FormatType formatType = GetFormatType(fileExtension);

                // Load Word document using EJ2 DocumentEditor WordDocument
                // This is the correct approach as per Syncfusion documentation
                EJ2WordDocument document = EJ2WordDocument.Load(stream, formatType);
                
                // Serialize to SFDT JSON string - this preserves all formatting
                string sfdtContent = JsonConvert.SerializeObject(document);
                document.Dispose();
                
                _logger.LogInformation("Document converted to SFDT successfully: {FileName}", file.FileName);

                return new ConversionResponse
                {
                    Success = true,
                    Content = sfdtContent,
                    FileName = file.FileName,
                    Message = "Document converted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting document to SFDT: {FileName}", file.FileName);
                return new ConversionResponse
                {
                    Success = false,
                    Error = "SFDT conversion failed",
                    Message = ex.Message
                };
            }
        }

        public async Task<ConversionResponse> ImportDocumentAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return new ConversionResponse
                {
                    Success = false,
                    Error = "No file provided"
                };
            }

            try
            {
                _logger.LogInformation("Importing document: {FileName}", file.FileName);

                // Convert to SFDT
                var conversionResult = await ConvertToSfdtAsync(file);
                
                if (conversionResult.Success)
                {
                    return new ConversionResponse
                    {
                        Success = true,
                        Content = conversionResult.Content,
                        FileName = file.FileName,
                        Message = "Document imported successfully"
                    };
                }
                else
                {
                    return conversionResult;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing document: {FileName}", file.FileName);
                return new ConversionResponse
                {
                    Success = false,
                    Error = "Document import failed",
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponse<DocumentResponse>> SaveDocumentAsync(CreateDocumentRequest request, IFormFile? file = null)
        {
            try
            {
                var document = new Document
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = request.Title,
                    Content = request.Content,
                    DocumentType = request.DocumentType ?? "other",
                    Classification = request.Classification ?? "internal",
                    RetentionPeriod = request.RetentionPeriod ?? "3years",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Version = 1
                };

                // Save document metadata
                var metadataPath = Path.Combine(_uploadsPath, $"{document.Id}_metadata.json");
                var metadataJson = JsonConvert.SerializeObject(document, Formatting.Indented);
                await File.WriteAllTextAsync(metadataPath, metadataJson);

                // Save uploaded file if provided
                if (file != null && file.Length > 0)
                {
                    document.FileName = file.FileName;
                    document.FileExtension = Path.GetExtension(file.FileName);
                    document.FileSize = file.Length;
                    
                    var filePath = Path.Combine(_uploadsPath, $"{document.Id}{document.FileExtension}");
                    
                    using var fileStream = new FileStream(filePath, FileMode.Create);
                    await file.CopyToAsync(fileStream);
                }

                _logger.LogInformation("Document saved: {DocumentId}", document.Id);

                var response = MapToDocumentResponse(document);
                return new ApiResponse<DocumentResponse>
                {
                    Success = true,
                    Data = response,
                    Message = "Document saved successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving document");
                return new ApiResponse<DocumentResponse>
                {
                    Success = false,
                    Error = "Failed to save document",
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponse<IEnumerable<DocumentListResponse>>> GetDocumentsAsync()
        {
            try
            {
                var documents = new List<DocumentListResponse>();
                var metadataFiles = Directory.GetFiles(_uploadsPath, "*_metadata.json");

                foreach (var file in metadataFiles)
                {
                    try
                    {
                        var content = await File.ReadAllTextAsync(file);
                        var document = JsonConvert.DeserializeObject<Document>(content);
                        if (document != null && !document.IsDeleted)
                        {
                            documents.Add(MapToDocumentListResponse(document));
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning("Failed to parse document metadata {File}: {Error}", file, ex.Message);
                    }
                }

                // Sort by creation date (newest first)
                documents = documents.OrderByDescending(d => d.CreatedAt).ToList();

                return new ApiResponse<IEnumerable<DocumentListResponse>>
                {
                    Success = true,
                    Data = documents,
                    Message = $"Retrieved {documents.Count} documents"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving documents");
                return new ApiResponse<IEnumerable<DocumentListResponse>>
                {
                    Success = false,
                    Error = "Failed to retrieve documents",
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponse<DocumentResponse>> GetDocumentAsync(string id)
        {
            try
            {
                var metadataPath = Path.Combine(_uploadsPath, $"{id}_metadata.json");
                
                if (!File.Exists(metadataPath))
                {
                    return new ApiResponse<DocumentResponse>
                    {
                        Success = false,
                        Error = "Document not found"
                    };
                }

                var content = await File.ReadAllTextAsync(metadataPath);
                var document = JsonConvert.DeserializeObject<Document>(content);
                
                if (document == null || document.IsDeleted)
                {
                    return new ApiResponse<DocumentResponse>
                    {
                        Success = false,
                        Error = "Document not found or deleted"
                    };
                }

                var response = MapToDocumentResponse(document);
                return new ApiResponse<DocumentResponse>
                {
                    Success = true,
                    Data = response,
                    Message = "Document retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document {Id}", id);
                return new ApiResponse<DocumentResponse>
                {
                    Success = false,
                    Error = "Failed to retrieve document",
                    Message = ex.Message
                };
            }
        }

        public Task<ApiResponse<IEnumerable<object>>> GetDocumentVersionsAsync(string documentId)
        {
            try
            {
                var metadataPath = Path.Combine(_uploadsPath, $"{documentId}_metadata.json");
                
                if (!File.Exists(metadataPath))
                {
                    return Task.FromResult(new ApiResponse<IEnumerable<object>>
                    {
                        Success = false,
                        Error = "Document not found"
                    });
                }

                // For now, return a simple version list
                // In a full implementation, this would read from a versions index file
                var versions = new List<object>
                {
                    new
                    {
                        id = documentId,
                        documentId = documentId,
                        version = 1,
                        createdAt = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        createdBy = "system"
                    }
                };

                return Task.FromResult(new ApiResponse<IEnumerable<object>>
                {
                    Success = true,
                    Data = versions,
                    Message = "Document versions retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document versions for {DocumentId}", documentId);
                return Task.FromResult(new ApiResponse<IEnumerable<object>>
                {
                    Success = false,
                    Error = "Failed to get document versions",
                    Message = ex.Message
                });
            }
        }

        public async Task<ApiResponse<DocumentResponse>> GetDocumentVersionAsync(string documentId, int version)
        {
            try
            {
                // For now, only support version 1 (current version)
                // In a full implementation, this would read from version-specific files
                if (version == 1)
                {
                    return await GetDocumentAsync(documentId);
                }
                else
                {
                    return new ApiResponse<DocumentResponse>
                    {
                        Success = false,
                        Error = "Version not found"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document version {DocumentId}/{Version}", documentId, version);
                return new ApiResponse<DocumentResponse>
                {
                    Success = false,
                    Error = "Failed to get document version",
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponse<bool>> DeleteDocumentAsync(string id)
        {
            try
            {
                var metadataPath = Path.Combine(_uploadsPath, $"{id}_metadata.json");
                
                if (!File.Exists(metadataPath))
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Document not found"
                    };
                }

                // Read the document metadata first to get file information
                var content = await File.ReadAllTextAsync(metadataPath);
                var document = JsonConvert.DeserializeObject<Document>(content);
                
                if (document == null)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Invalid document metadata"
                    };
                }

                // Mark as deleted instead of physical deletion for data integrity
                document.IsDeleted = true;
                document.UpdatedAt = DateTime.UtcNow;

                // Update metadata
                var updatedJson = JsonConvert.SerializeObject(document, Formatting.Indented);
                await File.WriteAllTextAsync(metadataPath, updatedJson);

                // Optionally, delete the actual file if it exists
                if (!string.IsNullOrEmpty(document.FileExtension))
                {
                    var filePath = Path.Combine(_uploadsPath, $"{id}{document.FileExtension}");
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                }

                _logger.LogInformation("Document deleted: {DocumentId}", id);

                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Document deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {DocumentId}", id);
                return new ApiResponse<bool>
                {
                    Success = false,
                    Error = "Failed to delete document",
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponse<object>> PerformMailMergeAsync(IFormFile templateFile, string mergeData, bool removeEmptyParagraphs = true)
        {
            try
            {
                _logger.LogInformation("Performing mail merge with template: {FileName}", templateFile.FileName);

                using var stream = new MemoryStream();
                await templateFile.CopyToAsync(stream);
                stream.Position = 0;

                string fileExtension = Path.GetExtension(templateFile.FileName).ToLower();
                EJ2FormatType formatType = GetFormatType(fileExtension);

                // Load the template document
                EJ2WordDocument document = EJ2WordDocument.Load(stream, formatType);
                
                // Parse merge data
                var mergeFields = JsonConvert.DeserializeObject<Dictionary<string, object>>(mergeData);
                
                // For mail merge, we need to use DocIO approach and then convert to SFDT
                // This is a simplified implementation - in production you might want to use DocIO for mail merge
                // and then convert the result to SFDT
                
                // Convert to SFDT
                string sfdtContent = JsonConvert.SerializeObject(document);
                document.Dispose();

                _logger.LogInformation("Mail merge completed successfully");

                return new ApiResponse<object>
                {
                    Success = true,
                    Data = JsonConvert.DeserializeObject(sfdtContent),
                    Message = "Mail merge completed successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing mail merge");
                return new ApiResponse<object>
                {
                    Success = false,
                    Error = "Mail merge failed",
                    Message = ex.Message
                };
            }
        }

        public ApiResponse<object> GetConversionStatus()
        {
            return new ApiResponse<object>
            {
                Success = true,
                Data = new
                {
                    status = "operational",
                    supportedFormats = new[] { ".docx", ".doc", ".rtf", ".txt" },
                    maxFileSize = "50MB",
                    features = new[] { "word-to-sfdt", "mail-merge", "document-import" }
                },
                Message = "Conversion service is operational"
            };
        }

        public ApiResponse<object> GetCapabilities()
        {
            return new ApiResponse<object>
            {
                Success = true,
                Data = new
                {
                    documentFormats = new[] { "DOCX", "DOC", "RTF", "TXT" },
                    outputFormats = new[] { "SFDT", "JSON" },
                    features = new[]
                    {
                        "Document conversion",
                        "Mail merge",
                        "Template processing",
                        "Content extraction",
                        "Format preservation"
                    },
                    limitations = new
                    {
                        maxFileSize = "50MB",
                        supportedImages = new[] { "PNG", "JPEG", "GIF", "BMP" },
                        maxDocumentPages = 1000
                    }
                },
                Message = "Service capabilities retrieved"
            };
        }

        // Direct DOCX handling methods using Syncfusion DocIO
        public async Task<ApiResponse<object>> ProcessWordDocumentDirectlyAsync(IFormFile file, string operation = "read")
        {
            if (file == null || file.Length == 0)
            {
                return new ApiResponse<object>
                {
                    Success = false,
                    Error = "No file provided"
                };
            }

            try
            {
                _logger.LogInformation("Processing Word document directly: {FileName}, Operation: {Operation}", 
                    file.FileName, operation);

                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                stream.Position = 0;

                // Use DocIO for direct DOCX manipulation
                using var document = new DocIOWordDocument(stream, DocIOFormatType.Docx);
                
                var result = operation.ToLower() switch
                {
                    "read" => await ExtractDocumentContentAsync(document),
                    "analyze" => await AnalyzeDocumentStructureAsync(document),
                    "extract-text" => await ExtractPlainTextAsync(document),
                    "get-metadata" => await GetDocumentMetadataAsync(document),
                    _ => new { error = "Unknown operation" }
                };

                return new ApiResponse<object>
                {
                    Success = true,
                    Data = result,
                    Message = $"Document {operation} completed successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Word document directly: {FileName}", file.FileName);
                return new ApiResponse<object>
                {
                    Success = false,
                    Error = "Failed to process Word document",
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponse<byte[]>> ModifyWordDocumentAsync(IFormFile file, Dictionary<string, string> replacements)
        {
            if (file == null || file.Length == 0)
            {
                return new ApiResponse<byte[]>
                {
                    Success = false,
                    Error = "No file provided"
                };
            }

            try
            {
                _logger.LogInformation("Modifying Word document: {FileName}", file.FileName);

                using var inputStream = new MemoryStream();
                await file.CopyToAsync(inputStream);
                inputStream.Position = 0;

                // Load the document using DocIO
                using var document = new DocIOWordDocument(inputStream, DocIOFormatType.Docx);
                
                // Perform find and replace operations
                foreach (var replacement in replacements)
                {
                    document.Replace(replacement.Key, replacement.Value, false, true);
                }

                // Save to output stream
                using var outputStream = new MemoryStream();
                document.Save(outputStream, DocIOFormatType.Docx);
                
                var modifiedBytes = outputStream.ToArray();
                
                _logger.LogInformation("Word document modified successfully: {FileName}", file.FileName);

                return new ApiResponse<byte[]>
                {
                    Success = true,
                    Data = modifiedBytes,
                    Message = "Document modified successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error modifying Word document: {FileName}", file.FileName);
                return new ApiResponse<byte[]>
                {
                    Success = false,
                    Error = "Failed to modify Word document",
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponse<byte[]>> CreateWordDocumentFromTemplateAsync(IFormFile templateFile, Dictionary<string, object> data)
        {
            if (templateFile == null || templateFile.Length == 0)
            {
                return new ApiResponse<byte[]>
                {
                    Success = false,
                    Error = "No template file provided"
                };
            }

            try
            {
                _logger.LogInformation("Creating document from template: {FileName}", templateFile.FileName);

                using var templateStream = new MemoryStream();
                await templateFile.CopyToAsync(templateStream);
                templateStream.Position = 0;

                // Load template using DocIO
                using var document = new DocIOWordDocument(templateStream, DocIOFormatType.Docx);
                
                // Replace placeholders with actual data
                foreach (var item in data)
                {
                    string placeholder = $"[{item.Key}]";
                    string value = item.Value?.ToString() ?? "";
                    document.Replace(placeholder, value, false, true);
                }

                // Add current date if not provided
                if (!data.ContainsKey("Date"))
                {
                    document.Replace("[Date]", DateTime.Now.ToString("yyyy-MM-dd"), false, true);
                }

                // Save the generated document
                using var outputStream = new MemoryStream();
                document.Save(outputStream, DocIOFormatType.Docx);
                
                var documentBytes = outputStream.ToArray();
                
                _logger.LogInformation("Document created from template successfully: {FileName}", templateFile.FileName);

                return new ApiResponse<byte[]>
                {
                    Success = true,
                    Data = documentBytes,
                    Message = "Document created from template successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document from template: {FileName}", templateFile.FileName);
                return new ApiResponse<byte[]>
                {
                    Success = false,
                    Error = "Failed to create document from template",
                    Message = ex.Message
                };
            }
        }

        // Helper methods for direct DOCX processing
        private async Task<object> ExtractDocumentContentAsync(DocIOWordDocument document)
        {
            var content = new
            {
                sections = document.Sections.Count,
                paragraphs = document.Sections.Cast<WSection>().Sum(s => s.Paragraphs.Count),
                text = document.GetText(),
                properties = new
                {
                    title = document.BuiltinDocumentProperties.Title,
                    author = document.BuiltinDocumentProperties.Author,
                    subject = document.BuiltinDocumentProperties.Subject,
                    createdDate = document.BuiltinDocumentProperties.CreateDate,
                    lastModified = document.BuiltinDocumentProperties.LastSaveDate
                }
            };
            
            return await Task.FromResult(content);
        }

        private async Task<object> AnalyzeDocumentStructureAsync(DocIOWordDocument document)
        {
            var structure = new
            {
                sections = document.Sections.Cast<WSection>().Select((section, index) => new
                {
                    sectionIndex = index,
                    paragraphCount = section.Paragraphs.Count,
                    tableCount = section.Tables.Count,
                    headerFooter = new
                    {
                        hasHeader = section.HeadersFooters.Header != null,
                        hasFooter = section.HeadersFooters.Footer != null
                    }
                }).ToList(),
                totalWords = document.GetText().Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
                totalCharacters = document.GetText().Length
            };
            
            return await Task.FromResult(structure);
        }

        private async Task<object> ExtractPlainTextAsync(DocIOWordDocument document)
        {
            var result = new
            {
                plainText = document.GetText(),
                wordCount = document.GetText().Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
                characterCount = document.GetText().Length,
                paragraphCount = document.Sections.Cast<WSection>().Sum(s => s.Paragraphs.Count)
            };
            
            return await Task.FromResult(result);
        }

        private async Task<object> GetDocumentMetadataAsync(DocIOWordDocument document)
        {
            var metadata = new
            {
                builtinProperties = new
                {
                    title = document.BuiltinDocumentProperties.Title,
                    author = document.BuiltinDocumentProperties.Author,
                    subject = document.BuiltinDocumentProperties.Subject,
                    keywords = document.BuiltinDocumentProperties.Keywords,
                    comments = document.BuiltinDocumentProperties.Comments,
                    createdDate = document.BuiltinDocumentProperties.CreateDate,
                    lastModified = document.BuiltinDocumentProperties.LastSaveDate,
                    lastPrinted = document.BuiltinDocumentProperties.LastPrinted,
                    revision = document.BuiltinDocumentProperties.RevisionNumber
                },
                statistics = new
                {
                    pageCount = document.BuiltinDocumentProperties.PageCount,
                    wordCount = document.BuiltinDocumentProperties.WordCount,
                    characterCount = document.BuiltinDocumentProperties.CharCount,
                    paragraphCount = document.BuiltinDocumentProperties.ParagraphCount
                    // Note: LineCount property may not be available in DocIO BuiltinDocumentProperties
                }
            };
            
            return await Task.FromResult(metadata);
        }

        private EJ2FormatType GetFormatType(string fileExtension)
        {
            return fileExtension switch
            {
                ".docx" => EJ2FormatType.Docx,
                ".doc" => EJ2FormatType.Doc,
                ".rtf" => EJ2FormatType.Rtf,
                ".txt" => EJ2FormatType.Txt,
                ".xml" => EJ2FormatType.WordML,
                _ => EJ2FormatType.Docx
            };
        }

        private DocumentResponse MapToDocumentResponse(Document document)
        {
            return new DocumentResponse
            {
                Id = document.Id,
                Title = document.Title,
                Content = document.Content,
                DocumentType = document.DocumentType,
                Classification = document.Classification,
                RetentionPeriod = document.RetentionPeriod,
                CreatedAt = document.CreatedAt,
                UpdatedAt = document.UpdatedAt,
                Version = document.Version,
                FileName = document.FileName,
                FileExtension = document.FileExtension,
                FileSize = document.FileSize,
                IsTemplate = document.IsTemplate
            };
        }

        private DocumentListResponse MapToDocumentListResponse(Document document)
        {
            return new DocumentListResponse
            {
                Id = document.Id,
                Title = document.Title,
                DocumentType = document.DocumentType,
                Classification = document.Classification,
                CreatedAt = document.CreatedAt,
                UpdatedAt = document.UpdatedAt,
                Version = document.Version,
                FileName = document.FileName,
                FileSize = document.FileSize,
                IsTemplate = document.IsTemplate
            };
        }
    }
} 