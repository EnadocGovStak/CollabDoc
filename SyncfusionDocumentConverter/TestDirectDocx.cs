using System;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Syncfusion.DocIO;
using Syncfusion.DocIO.DLS;
using SyncfusionDocumentConverter.DTOs;
using DocIOWordDocument = Syncfusion.DocIO.DLS.WordDocument;
using DocIOFormatType = Syncfusion.DocIO.FormatType;

namespace SyncfusionDocumentConverter.Services
{
    /// <summary>
    /// Service class for direct DOCX manipulation using Syncfusion DocIO
    /// Integrated with the main DocumentService architecture
    /// </summary>
    public class DirectDocxService
    {
        private readonly ILogger<DirectDocxService> _logger;
        private const string DefaultOutputDirectory = "uploads";
        
        public DirectDocxService(ILogger<DirectDocxService> logger)
        {
            _logger = logger;
        }
        
        /// <summary>
        /// Demonstrates direct DOCX handling capabilities
        /// For development and testing purposes
        /// </summary>
        public async Task<ApiResponse<object>> DemonstrateDirectDocxHandlingAsync()
        {
            _logger.LogInformation("Starting Direct DOCX Handling demonstration");
            
            try
            {
                var results = new List<object>();
                
                // Example 1: Create a new document from scratch
                var createResult = await CreateNewDocumentAsync();
                results.Add(createResult);
                
                // Example 2: Modify an existing document (if available)
                var modifyResult = await ModifyExistingDocumentAsync();
                results.Add(modifyResult);
                
                // Example 3: Extract text from document
                var extractResult = await ExtractTextFromDocumentAsync();
                results.Add(extractResult);
                
                return new ApiResponse<object>
                {
                    Success = true,
                    Data = new
                    {
                        message = "Direct DOCX handling demonstration completed successfully",
                        operations = results,
                        timestamp = DateTime.UtcNow
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Direct DOCX demonstration");
                return new ApiResponse<object>
                {
                    Success = false,
                    Error = "Demonstration failed",
                    Message = ex.Message
                };
            }
        }
        
        /// <summary>
        /// Creates a new Word document with sample content
        /// Returns document as byte array for API response
        /// </summary>
        public async Task<ApiResponse<byte[]>> CreateNewDocumentAsync()
        {
            _logger.LogInformation("Creating new Word document with DocIO");
            
            try
            {
                using var document = new DocIOWordDocument();
                
                // Add a section
                var section = document.AddSection();
                
                // Add a paragraph with formatted text
                var paragraph = section.AddParagraph();
                var textRange = paragraph.AppendText("Hello from Direct DocIO!");
                textRange.CharacterFormat.Bold = true;
                textRange.CharacterFormat.FontSize = 16;
                textRange.CharacterFormat.FontName = "Arial";
                
                // Add another paragraph
                var paragraph2 = section.AddParagraph();
                paragraph2.AppendText("This document was created directly using Syncfusion DocIO without SFDT conversion.");
                
                // Add a third paragraph with different formatting
                var paragraph3 = section.AddParagraph();
                var textRange3 = paragraph3.AppendText("Key advantages:");
                textRange3.CharacterFormat.Bold = true;
                
                // Add a list using helper method
                var listItems = new[]
                {
                    "• Better performance for simple operations",
                    "• Preserves all original formatting",
                    "• No conversion overhead",
                    "• Direct Office Open XML manipulation"
                };
                
                AddListItems(section, listItems);
                
                // Convert document to byte array
                using var memoryStream = new MemoryStream();
                document.Save(memoryStream, DocIOFormatType.Docx);
                var documentBytes = memoryStream.ToArray();
                
                // Also save to uploads directory for demo purposes
                await SaveDocumentToUploadsAsync(documentBytes, "DirectDocIO_Demo.docx");
                
                _logger.LogInformation("Document created successfully. Size: {Size} bytes", documentBytes.Length);
                
                return new ApiResponse<byte[]>
                {
                    Success = true,
                    Data = documentBytes,
                    Message = $"Document created successfully. Size: {documentBytes.Length} bytes"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document");
                return new ApiResponse<byte[]>
                {
                    Success = false,
                    Error = "Document creation failed",
                    Message = ex.Message
                };
            }
        }
        
        /// <summary>
        /// Modifies an existing Word document with text replacements
        /// </summary>
        public Task<ApiResponse<byte[]>> ModifyWordDocumentAsync(IFormFile file, Dictionary<string, string> replacements)
        {
            _logger.LogInformation("Modifying Word document with {Count} replacements", replacements.Count);
            
            try
            {
                using var inputStream = file.OpenReadStream();
                using var document = new DocIOWordDocument(inputStream, DocIOFormatType.Docx);
                
                // Apply all replacements
                foreach (var replacement in replacements)
                {
                    document.Replace(replacement.Key, replacement.Value, false, true);
                    _logger.LogDebug("Replaced '{Key}' with '{Value}'", replacement.Key, replacement.Value);
                }
                
                // Add modification timestamp
                var lastSection = document.LastSection;
                var newParagraph = lastSection.AddParagraph();
                var newText = newParagraph.AppendText($"\n[MODIFIED] Document modified on {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
                newText.CharacterFormat.Italic = true;
                newText.CharacterFormat.TextColor = Syncfusion.Drawing.Color.Blue;
                
                // Convert to byte array
                using var memoryStream = new MemoryStream();
                document.Save(memoryStream, DocIOFormatType.Docx);
                var modifiedBytes = memoryStream.ToArray();
                
                _logger.LogInformation("Document modified successfully. New size: {Size} bytes", modifiedBytes.Length);
                
                return Task.FromResult(new ApiResponse<byte[]>
                {
                    Success = true,
                    Data = modifiedBytes,
                    Message = $"Document modified successfully with {replacements.Count} replacements"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error modifying document");
                return Task.FromResult(new ApiResponse<byte[]>
                {
                    Success = false,
                    Error = "Document modification failed",
                    Message = ex.Message
                });
            }
        }
        
        /// <summary>
        /// Extracts text and metadata from a Word document
        /// </summary>
        public Task<ApiResponse<object>> ExtractTextFromDocumentAsync(IFormFile? file = null)
        {
            _logger.LogInformation("Extracting text from document");
            
            try
            {
                DocIOWordDocument document;
                
                if (file != null)
                {
                    var inputStream = file.OpenReadStream();
                    document = new DocIOWordDocument(inputStream, DocIOFormatType.Docx);
                }
                else
                {
                    // Use demo document if no file provided
                    string demoPath = GetOutputPath("DirectDocIO_Demo.docx");
                    if (!File.Exists(demoPath))
                    {
                        return Task.FromResult(new ApiResponse<object>
                        {
                            Success = false,
                            Error = "No document provided and demo document not found",
                            Message = "Please provide a document file or run the create demo first"
                        });
                    }
                    document = new DocIOWordDocument(demoPath, DocIOFormatType.Docx);
                }
                
                using (document)
                {
                    // Extract plain text
                    string plainText = document.GetText();
                    
                    // Get document statistics
                    int wordCount = plainText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
                    int charCount = plainText.Length;
                    int paragraphCount = document.Sections.Cast<WSection>().Sum(s => s.Paragraphs.Count);
                    int sectionCount = document.Sections.Count;
                    
                    // Get document properties
                    var builtinProps = document.BuiltinDocumentProperties;
                    
                    var extractionResult = new
                    {
                        textContent = new
                        {
                            wordCount,
                            characterCount = charCount,
                            paragraphCount,
                            sectionCount,
                            preview = plainText.Length > 200 ? plainText.Substring(0, 200) + "..." : plainText
                        },
                        documentProperties = new
                        {
                            title = builtinProps.Title,
                            author = builtinProps.Author,
                            subject = builtinProps.Subject,
                            company = builtinProps.Company,
                            category = builtinProps.Category
                        },
                        extractedAt = DateTime.UtcNow
                    };
                    
                    _logger.LogInformation("Text extracted successfully. Words: {WordCount}, Characters: {CharCount}", wordCount, charCount);
                    
                    return Task.FromResult(new ApiResponse<object>
                    {
                        Success = true,
                        Data = extractionResult,
                        Message = "Text extraction completed successfully"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting text from document");
                return Task.FromResult(new ApiResponse<object>
                {
                    Success = false,
                    Error = "Text extraction failed",
                    Message = ex.Message
                });
            }
        }
        
        /// <summary>
        /// Gets the capabilities of the Direct DOCX service
        /// </summary>
        public ApiResponse<object> GetCapabilities()
        {
            var capabilities = new
            {
                supportedOperations = new[]
                {
                    "create - Create new documents from scratch",
                    "modify - Replace text placeholders in existing documents",
                    "extract-text - Extract plain text and metadata",
                    "analyze - Analyze document structure and properties"
                },
                supportedFormats = new[] { ".docx", ".doc", ".rtf" },
                features = new[]
                {
                    "Direct DOCX manipulation without SFDT conversion",
                    "Text replacement and substitution",
                    "Template-based document generation",
                    "Metadata extraction",
                    "Document structure analysis",
                    "Plain text extraction",
                    "Byte array response for API integration"
                },
                version = "1.0.0",
                lastUpdated = DateTime.UtcNow
            };
            
            return new ApiResponse<object>
            {
                Success = true,
                Data = capabilities
            };
        }
        
        // Private helper methods
        private async Task<object> ModifyExistingDocumentAsync()
        {
            string inputPath = GetOutputPath("DirectDocIO_Demo.docx");
            if (!File.Exists(inputPath))
            {
                return new { operation = "modify", status = "skipped", reason = "Demo document not found" };
            }
            
            var replacements = new Dictionary<string, string>
            {
                { "Hello from Direct DocIO!", "Modified with Direct DocIO!" }
            };
            
            // Read file as IFormFile simulation for testing
            var fileBytes = await File.ReadAllBytesAsync(inputPath);
            using var stream = new MemoryStream(fileBytes);
            var formFile = new FormFile(stream, 0, fileBytes.Length, "file", "DirectDocIO_Demo.docx")
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            };
            
            var result = await ModifyWordDocumentAsync(formFile, replacements);
            
            if (result.Success && result.Data != null)
            {
                await SaveDocumentToUploadsAsync(result.Data, "DirectDocIO_Modified.docx");
                return new { operation = "modify", status = "success", size = result.Data.Length };
            }
            
            return new { operation = "modify", status = "failed", error = result.Error };
        }
        
        private static void AddListItems(IWSection section, string[] items)
        {
            foreach (string item in items)
            {
                var listItem = section.AddParagraph();
                listItem.AppendText(item);
            }
        }
        
        private static string GetOutputPath(string fileName)
        {
            return Path.Combine(DefaultOutputDirectory, fileName);
        }
        
        private static async Task SaveDocumentToUploadsAsync(byte[] documentBytes, string fileName)
        {
            string outputPath = GetOutputPath(fileName);
            string? directoryPath = Path.GetDirectoryName(outputPath);
            
            if (!string.IsNullOrEmpty(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }
            
            await File.WriteAllBytesAsync(outputPath, documentBytes);
        }
    }
} 