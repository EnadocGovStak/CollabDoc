using SyncfusionDocumentConverter.DTOs;
using Syncfusion.DocIO.DLS;
using Syncfusion.DocIO;
using DocIOWordDocument = Syncfusion.DocIO.DLS.WordDocument;
using DocIOFormatType = Syncfusion.DocIO.FormatType;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace SyncfusionDocumentConverter.Services
{
    public class TemplateService : ITemplateService
    {
        private readonly ILogger<TemplateService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _templatesPath;

        public TemplateService(
            ILogger<TemplateService> logger,
            IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _templatesPath = Path.Combine(Directory.GetCurrentDirectory(), "templates");
            
            // Ensure templates directory exists
            if (!Directory.Exists(_templatesPath))
            {
                Directory.CreateDirectory(_templatesPath);
            }
        }

        public async Task<ApiResponse<IEnumerable<TemplateResponse>>> GetTemplatesAsync()
        {
            try
            {
                var templates = new List<TemplateResponse>();
                var templateFiles = Directory.GetFiles(_templatesPath, "*.json");

                foreach (var file in templateFiles)
                {
                    try
                    {
                        var templateData = await File.ReadAllTextAsync(file);
                        var template = JsonSerializer.Deserialize<TemplateResponse>(templateData);
                        if (template != null)
                        {
                            templates.Add(template);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to read template file {FileName}", file);
                    }
                }

                return new ApiResponse<IEnumerable<TemplateResponse>>
                {
                    Success = true,
                    Data = templates,
                    Message = $"Retrieved {templates.Count} templates"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving templates");
                return new ApiResponse<IEnumerable<TemplateResponse>>
                {
                    Success = false,
                    Error = "Failed to retrieve templates"
                };
            }
        }

        public async Task<ApiResponse<TemplateResponse>> GetTemplateAsync(int id)
        {
            try
            {
                var templateFile = Path.Combine(_templatesPath, $"{id}.json");
                if (!File.Exists(templateFile))
                {
                    return new ApiResponse<TemplateResponse>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                var templateData = await File.ReadAllTextAsync(templateFile);
                var template = JsonSerializer.Deserialize<TemplateResponse>(templateData);

                if (template == null)
                {
                    return new ApiResponse<TemplateResponse>
                    {
                        Success = false,
                        Error = "Failed to parse template data"
                    };
                }

                return new ApiResponse<TemplateResponse>
                {
                    Success = true,
                    Data = template,
                    Message = "Template retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving template {TemplateId}", id);
                return new ApiResponse<TemplateResponse>
                {
                    Success = false,
                    Error = "Failed to retrieve template"
                };
            }
        }

        public async Task<ApiResponse<TemplateResponse>> CreateTemplateAsync(CreateTemplateRequest request, IFormFile? templateFile = null)
        {
            try
            {
                var id = GetNextTemplateId();
                string content = "";
                string? filePath = null;
                long fileSize = 0;

                if (templateFile != null)
                {
                    // Save uploaded file
                    var fileName = $"{id}_{templateFile.FileName}";
                    filePath = Path.Combine(_templatesPath, fileName);
                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await templateFile.CopyToAsync(stream);
                    }
                    
                    fileSize = templateFile.Length;

                    // Process uploaded file to extract content
                    using var fileStream = templateFile.OpenReadStream();
                    using var wordDocument = new DocIOWordDocument(fileStream, DocIOFormatType.Docx);
                    using var sfdtStream = new MemoryStream();
                    wordDocument.Save(sfdtStream, DocIOFormatType.Docx);
                    content = System.Text.Encoding.UTF8.GetString(sfdtStream.ToArray());
                }
                else
                {
                    // Create basic template content
                    content = CreateBasicTemplateContent(request.Name);
                    fileSize = System.Text.Encoding.UTF8.GetByteCount(content);
                }

                var template = new TemplateResponse
                {
                    Id = id,
                    Name = request.Name,
                    Description = request.Description,
                    Category = request.Category,
                    IsActive = request.IsActive,
                    CreatedBy = request.CreatedBy ?? "API",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    FilePath = filePath,
                    FileSize = fileSize,
                    Metadata = request.Metadata ?? new Dictionary<string, object>(),
                    MergeFields = ExtractMergeFieldsFromContent(content)
                };

                // Add content to metadata
                if (template.Metadata == null)
                    template.Metadata = new Dictionary<string, object>();
                
                template.Metadata["Content"] = content;

                // Save template metadata
                var templateMetadataFile = Path.Combine(_templatesPath, $"{id}.json");
                var templateJson = JsonSerializer.Serialize(template, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(templateMetadataFile, templateJson);

                return new ApiResponse<TemplateResponse>
                {
                    Success = true,
                    Data = template,
                    Message = "Template created successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating template");
                return new ApiResponse<TemplateResponse>
                {
                    Success = false,
                    Error = "Failed to create template"
                };
            }
        }

        public async Task<ApiResponse<TemplateResponse>> UpdateTemplateAsync(int id, UpdateTemplateRequest request, IFormFile? templateFile = null)
        {
            try
            {
                var templateResponse = await GetTemplateAsync(id);
                if (!templateResponse.Success || templateResponse.Data == null)
                {
                    return new ApiResponse<TemplateResponse>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                var template = templateResponse.Data;

                // Update template properties
                if (!string.IsNullOrEmpty(request.Name))
                    template.Name = request.Name;
                if (request.Description != null)
                    template.Description = request.Description;
                if (!string.IsNullOrEmpty(request.Category))
                    template.Category = request.Category;
                if (request.IsActive.HasValue)
                    template.IsActive = request.IsActive.Value;
                
                template.UpdatedAt = DateTime.UtcNow;

                if (templateFile != null)
                {
                    // Process uploaded file
                    var fileName = $"{id}_{templateFile.FileName}";
                    var newFilePath = Path.Combine(_templatesPath, fileName);
                    
                    // Delete old file if exists
                    if (!string.IsNullOrEmpty(template.FilePath) && File.Exists(template.FilePath))
                    {
                        File.Delete(template.FilePath);
                    }
                    
                    using (var stream = new FileStream(newFilePath, FileMode.Create))
                    {
                        await templateFile.CopyToAsync(stream);
                    }
                    
                    template.FilePath = newFilePath;
                    template.FileSize = templateFile.Length;

                    // Update content
                    using var fileStream = templateFile.OpenReadStream();
                    using var wordDocument = new DocIOWordDocument(fileStream, DocIOFormatType.Docx);
                    using var sfdtStream = new MemoryStream();
                    wordDocument.Save(sfdtStream, DocIOFormatType.Docx);
                    var content = System.Text.Encoding.UTF8.GetString(sfdtStream.ToArray());
                    
                    if (template.Metadata == null)
                        template.Metadata = new Dictionary<string, object>();
                    
                    template.Metadata["Content"] = content;
                    template.MergeFields = ExtractMergeFieldsFromContent(content);
                }

                // Save updated template
                var templateMetadataFile = Path.Combine(_templatesPath, $"{id}.json");
                var templateJson = JsonSerializer.Serialize(template, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(templateMetadataFile, templateJson);

                return new ApiResponse<TemplateResponse>
                {
                    Success = true,
                    Data = template,
                    Message = "Template updated successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating template {TemplateId}", id);
                return new ApiResponse<TemplateResponse>
                {
                    Success = false,
                    Error = "Failed to update template"
                };
            }
        }

        public async Task<ApiResponse<bool>> DeleteTemplateAsync(int id)
        {
            try
            {
                var templateResponse = await GetTemplateAsync(id);
                if (!templateResponse.Success || templateResponse.Data == null)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                var template = templateResponse.Data;

                // Delete template file if exists
                if (!string.IsNullOrEmpty(template.FilePath) && File.Exists(template.FilePath))
                {
                    File.Delete(template.FilePath);
                }

                // Delete template metadata file
                var templateMetadataFile = Path.Combine(_templatesPath, $"{id}.json");
                if (File.Exists(templateMetadataFile))
                {
                    File.Delete(templateMetadataFile);
                }

                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Template deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting template {TemplateId}", id);
                return new ApiResponse<bool>
                {
                    Success = false,
                    Error = "Failed to delete template"
                };
            }
        }

        public async Task<ApiResponse<DocumentResponse>> PerformMailMergeAsync(int templateId, MailMergeRequest request)
        {
            try
            {
                var templateResponse = await GetTemplateAsync(templateId);
                if (!templateResponse.Success || templateResponse.Data == null)
                {
                    return new ApiResponse<DocumentResponse>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                var template = templateResponse.Data;
                var content = template.Metadata?.GetValueOrDefault("Content")?.ToString() ?? "";

                if (string.IsNullOrEmpty(content))
                {
                    return new ApiResponse<DocumentResponse>
                    {
                        Success = false,
                        Error = "Template content not found"
                    };
                }

                // Perform mail merge using Syncfusion DocIO
                var mergedContent = await PerformDocumentMerge(content, request.MergeData);

                var documentResponse = new DocumentResponse
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = request.OutputFileName ?? $"{template.Name} - Merged",
                    Content = mergedContent,
                    DocumentType = request.OutputFormat,
                    Classification = "Generated",
                    RetentionPeriod = "Standard",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Version = 1,
                    FileSize = System.Text.Encoding.UTF8.GetByteCount(mergedContent),
                    IsTemplate = false
                };

                return new ApiResponse<DocumentResponse>
                {
                    Success = true,
                    Data = documentResponse,
                    Message = "Mail merge completed successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing mail merge for template {TemplateId}", templateId);
                return new ApiResponse<DocumentResponse>
                {
                    Success = false,
                    Error = "Failed to perform mail merge"
                };
            }
        }

        public async Task<ApiResponse<IEnumerable<string>>> GetTemplateMergeFieldsAsync(int templateId)
        {
            try
            {
                var templateResponse = await GetTemplateAsync(templateId);
                if (!templateResponse.Success || templateResponse.Data == null)
                {
                    return new ApiResponse<IEnumerable<string>>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                var template = templateResponse.Data;
                var mergeFields = template.MergeFields ?? new List<string>();

                return new ApiResponse<IEnumerable<string>>
                {
                    Success = true,
                    Data = mergeFields,
                    Message = $"Found {mergeFields.Count()} merge fields"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting merge fields from template {TemplateId}", templateId);
                return new ApiResponse<IEnumerable<string>>
                {
                    Success = false,
                    Error = "Failed to extract merge fields"
                };
            }
        }

        public async Task<ApiResponse<DocumentResponse>> CreateDocumentFromTemplateAsync(int templateId, CreateDocumentFromTemplateRequest request)
        {
            try
            {
                var templateResponse = await GetTemplateAsync(templateId);
                if (!templateResponse.Success || templateResponse.Data == null)
                {
                    return new ApiResponse<DocumentResponse>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                var template = templateResponse.Data;
                var content = template.Metadata?.GetValueOrDefault("Content")?.ToString() ?? "";

                if (string.IsNullOrEmpty(content))
                {
                    return new ApiResponse<DocumentResponse>
                    {
                        Success = false,
                        Error = "Template content not found"
                    };
                }

                // Perform merge if merge data is provided
                if (request.MergeData != null && request.MergeData.Any())
                {
                    content = await PerformDocumentMerge(content, request.MergeData);
                }

                var documentResponse = new DocumentResponse
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = request.DocumentName,
                    Content = content,
                    DocumentType = "Document",
                    Classification = "Standard",
                    RetentionPeriod = "Standard",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Version = 1,
                    FileSize = System.Text.Encoding.UTF8.GetByteCount(content),
                    IsTemplate = false
                };

                return new ApiResponse<DocumentResponse>
                {
                    Success = true,
                    Data = documentResponse,
                    Message = "Document created from template successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document from template {TemplateId}", templateId);
                return new ApiResponse<DocumentResponse>
                {
                    Success = false,
                    Error = "Failed to create document from template"
                };
            }
        }

        public async Task<IEnumerable<string>> GetTemplateCategoriesAsync()
        {
            try
            {
                var templatesResponse = await GetTemplatesAsync();
                if (!templatesResponse.Success || templatesResponse.Data == null)
                {
                    return new List<string> { "General" };
                }

                var categories = templatesResponse.Data
                    .Select(t => t.Category)
                    .Where(c => !string.IsNullOrEmpty(c))
                    .Distinct()
                    .OrderBy(c => c)
                    .ToList();

                return categories.Any() ? categories : new List<string> { "General" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving template categories");
                return new List<string> { "General" };
            }
        }

        private async Task<string> PerformDocumentMerge(string templateContent, Dictionary<string, object> mergeData)
        {
            try
            {
                // For SFDT templates, perform string replacement directly on the JSON content
                var mergedContent = templateContent;

                if (mergeData.Any())
                {
                    foreach (var kvp in mergeData)
                    {
                        var fieldName = kvp.Key;
                        var fieldValue = kvp.Value?.ToString() ?? "";

                        // Replace different merge field patterns
                        
                        // 1. Syncfusion DocIO patterns like <<FieldName>>
                        var syncfusionPattern = $"<<{fieldName}>>";
                        mergedContent = mergedContent.Replace(syncfusionPattern, fieldValue);

                        // 2. Word MERGEFIELD patterns  
                        var mergeFieldPattern = $"\"fieldCode\":\"MERGEFIELD {fieldName}\"";
                        if (mergedContent.Contains(mergeFieldPattern))
                        {
                            // Replace the entire field structure with the value
                            var fieldPattern = @"\{[^}]*""fieldType"":""MergeField""[^}]*""fieldCode"":""MERGEFIELD\s+" + 
                                Regex.Escape(fieldName) + @"""[^}]*\}";
                            mergedContent = Regex.Replace(mergedContent, fieldPattern, 
                                $"{{\"characterFormat\":{{}},\"text\":\"{fieldValue}\"}}", RegexOptions.IgnoreCase);
                        }

                        // 3. Bracket patterns like [FieldName] - for UI templates
                        var bracketPattern = $"[{fieldName}]";
                        mergedContent = mergedContent.Replace(bracketPattern, fieldValue);

                        // 4. Also handle space-separated field names in brackets
                        var spaceFieldName = fieldName.Replace("_", " ");
                        var spaceBracketPattern = $"[{spaceFieldName}]";
                        mergedContent = mergedContent.Replace(spaceBracketPattern, fieldValue);

                        // 5. Placeholder patterns like {{FieldName}}
                        var placeholderPattern = $"{{{{{fieldName}}}}}";
                        mergedContent = mergedContent.Replace(placeholderPattern, fieldValue);

                        // 6. Word-style chevron patterns like «FieldName»
                        var chevronPattern = $"«{fieldName}»";
                        mergedContent = mergedContent.Replace(chevronPattern, fieldValue);
                    }
                }

                return await Task.FromResult(mergedContent);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error performing document merge, returning template content");
                return templateContent; // Return original content if merge fails
            }
        }

        private IEnumerable<string> ExtractMergeFieldsFromContent(string content)
        {
            var mergeFields = new HashSet<string>();

            try
            {
                // Extract merge fields from SFDT content using regex
                var mergeFieldPattern = @"""fieldType"":""MergeField"",""fieldCode"":""MERGEFIELD\s+(\w+)""";
                var matches = Regex.Matches(content, mergeFieldPattern, RegexOptions.IgnoreCase);

                foreach (Match match in matches)
                {
                    if (match.Groups.Count > 1)
                    {
                        mergeFields.Add(match.Groups[1].Value);
                    }
                }

                // Look for Syncfusion DocIO merge field patterns like <<FieldName>>
                var syncfusionPattern = @"<<(\w+)>>";
                var syncfusionMatches = Regex.Matches(content, syncfusionPattern);

                foreach (Match match in syncfusionMatches)
                {
                    if (match.Groups.Count > 1)
                    {
                        mergeFields.Add(match.Groups[1].Value);
                    }
                }

                // Also look for simple placeholder patterns like {{FieldName}} for backward compatibility
                var placeholderPattern = @"\{\{(\w+)\}\}";
                var placeholderMatches = Regex.Matches(content, placeholderPattern);

                foreach (Match match in placeholderMatches)
                {
                    if (match.Groups.Count > 1)
                    {
                        mergeFields.Add(match.Groups[1].Value);
                    }
                }

                // Look for bracket patterns like [FieldName] used in UI templates
                var bracketPattern = @"\[([^\[\]]+)\]";
                var bracketMatches = Regex.Matches(content, bracketPattern);

                foreach (Match match in bracketMatches)
                {
                    if (match.Groups.Count > 1)
                    {
                        var fieldName = match.Groups[1].Value.Trim();
                        if (IsValidMergeFieldName(fieldName))
                        {
                            mergeFields.Add(fieldName);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extracting merge fields from content");
            }

            return mergeFields.ToList();
        }

        private string CreateBasicTemplateContent(string templateName)
        {
            // Create a basic SFDT template structure
            return JsonSerializer.Serialize(new
            {
                sfdt = "UklGRtgEAABXRUJQVlA4IAAAAAAvAQAAAK+OQCf/AAAAAPIjEQIiHQHT", // Basic SFDT structure
                sections = new[]
                {
                    new
                    {
                        blocks = new[]
                        {
                            new
                            {
                                paragraphFormat = new { },
                                inlines = new[]
                                {
                                    new
                                    {
                                        text = templateName,
                                        characterFormat = new
                                        {
                                            fontSize = 16,
                                            bold = true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        private int GetNextTemplateId()
        {
            var existingIds = Directory.GetFiles(_templatesPath, "*.json")
                .Select(f => Path.GetFileNameWithoutExtension(f))
                .Where(name => int.TryParse(name, out _))
                .Select(int.Parse)
                .ToList();

            return existingIds.Any() ? existingIds.Max() + 1 : 1;
        }

        /// <summary>
        /// Validates if a field name is a valid merge field name
        /// </summary>
        private bool IsValidMergeFieldName(string fieldName)
        {
            if (string.IsNullOrWhiteSpace(fieldName))
                return false;

            // Allow alphanumeric characters, underscores, and spaces
            return Regex.IsMatch(fieldName, @"^[a-zA-Z][a-zA-Z0-9_\s]*$");
        }
    }
} 