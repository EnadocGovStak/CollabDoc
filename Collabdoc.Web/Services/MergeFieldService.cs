using Collabdoc.Web.Data.Entities;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using SyncfusionDocumentConverter.DTOs;

namespace Collabdoc.Web.Services
{
    public class MergeFieldService : IMergeFieldService
    {
        private readonly ILogger<MergeFieldService> _logger;
        private readonly IDocumentApiService _documentApiService;
        private readonly IDocumentRepository _documentRepository;

        public MergeFieldService(ILogger<MergeFieldService> logger, IDocumentApiService documentApiService, IDocumentRepository documentRepository)
        {
            _logger = logger;
            _documentApiService = documentApiService;
            _documentRepository = documentRepository;
        }

        public async Task<IEnumerable<MergeFieldBundle>> GetAvailableBundlesAsync()
        {
            await Task.Delay(100); // Simulate async operation
            return GetPredefinedBundles();
        }

        public async Task<MergeFieldBundle> GetBundleAsync(string bundleId)
        {
            await Task.Delay(100);
            var bundles = GetPredefinedBundles();
            return bundles.FirstOrDefault(b => b.Id == bundleId) ?? new MergeFieldBundle();
        }

        public async Task<ApiResponse<bool>> ImportBundleAsync(string bundleId, int templateId)
        {
            try
            {
                var bundle = await GetBundleAsync(bundleId);
                if (bundle.Id == string.Empty)
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Error = "Bundle not found"
                    };
                }

                // In a real implementation, this would update the template with the bundle fields
                _logger.LogInformation("Importing bundle {BundleId} to template {TemplateId}", bundleId, templateId);

                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = $"Bundle '{bundle.Name}' imported successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing bundle {BundleId}", bundleId);
                return new ApiResponse<bool>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<IEnumerable<MergeField>> GetMergeFieldsForCategoryAsync(string category)
        {
            await Task.Delay(100);
            var bundles = GetPredefinedBundles().Where(b => b.Category == category);
            return bundles.SelectMany(b => b.Fields).DistinctBy(f => f.Name);
        }

        public async Task<ApiResponse<TemplateWithMergeFields>> CreateTemplateWithMergeFieldsAsync(CreateTemplateWithMergeFieldsRequest request)
        {
            try
            {
                var allFields = new List<MergeField>();

                // Add fields from selected bundles
                foreach (var bundleId in request.SelectedBundles ?? new List<string>())
                {
                    var bundle = await GetBundleAsync(bundleId);
                    allFields.AddRange(bundle.Fields);
                }

                // Add custom fields
                allFields.AddRange(request.CustomFields ?? new List<MergeField>());

                // Remove duplicates
                allFields = allFields.DistinctBy(f => f.Name).ToList();

                // Create a basic SFDT document template with merge fields as placeholders
                var sfdtContent = GenerateBasicSfdtWithMergeFields(request.Name, allFields) ?? "{}";

                // Create metadata for merge fields and record management
                var metadata = new Dictionary<string, object>
                {
                    ["MergeFields"] = allFields.Select(f => new
                    {
                        f.Name,
                        f.DisplayName,
                        f.Type,
                        f.Category,
                        f.IsRequired,
                        f.DefaultValue,
                        f.Format,
                        f.Options
                    }).ToList(),
                    ["SelectedBundles"] = request.SelectedBundles ?? new List<string>()
                };

                if (request.IncludeRecordManagement)
                {
                    metadata["RecordManagement"] = new
                    {
                        IsEnabled = true,
                        RetentionPeriod = request.RecordRetentionPeriod ?? "365 days",
                        Classification = request.RecordClassification ?? "General",
                        RequireApproval = !string.IsNullOrEmpty(request.RecordClassification) && request.RecordClassification.Contains("Confidential"),
                        TrackVersions = true,
                        ArchiveOnExpiry = true
                    };
                }

                // Save template to database
                var documentEntity = new Document
                {
                    DocumentId = Guid.NewGuid().ToString(),
                    Name = request.Name,
                    Description = request.Description ?? $"Template with {allFields.Count} merge fields",
                    Content = sfdtContent,
                    FileType = "SFDT",
                    Size = System.Text.Encoding.UTF8.GetByteCount(sfdtContent),
                    Category = request.Category ?? "General",
                    IsTemplate = true,
                    IsPublic = true,
                    Status = "Active",
                    CreatedBy = "system", // TODO: Use actual user when authentication is implemented
                    CreatedAt = DateTime.UtcNow,
                    LastModified = DateTime.UtcNow,
                    Version = 1,
                    Tags = string.Join(",", (request.SelectedBundles ?? new List<string>()).Union(new[] { "merge-fields", "template" }))
                };

                // Save to database
                var savedDocument = await _documentRepository.CreateDocumentAsync(documentEntity);

                // Create response object
                var template = new TemplateWithMergeFields
                {
                    Id = savedDocument.Id,
                    Name = savedDocument.Name,
                    Description = savedDocument.Description ?? "",
                    Category = savedDocument.Category ?? "",
                    MergeFields = allFields,
                    CreatedAt = savedDocument.CreatedAt
                };

                if (request.IncludeRecordManagement)
                {
                    template.RecordSettings = new RecordManagementSettings
                    {
                        IsEnabled = true,
                        RetentionPeriod = request.RecordRetentionPeriod ?? "365 days",
                        Classification = request.RecordClassification ?? "General",
                        RequireApproval = !string.IsNullOrEmpty(request.RecordClassification) && request.RecordClassification.Contains("Confidential"),
                        TrackVersions = true,
                        ArchiveOnExpiry = true
                    };
                }

                _logger.LogInformation("Template '{TemplateName}' created successfully with {FieldCount} merge fields", request.Name, allFields.Count);

                return new ApiResponse<TemplateWithMergeFields>
                {
                    Success = true,
                    Data = template,
                    Message = $"Template '{request.Name}' created successfully with {allFields.Count} merge fields and saved to database"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating template with merge fields for template '{TemplateName}'", request.Name);
                return new ApiResponse<TemplateWithMergeFields>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<ApiResponse<TemplateCreationResult>> UpdateTemplateWithMergeFieldsAsync(int templateId, CreateTemplateWithMergeFieldsRequest request)
        {
            try
            {
                _logger.LogInformation("Updating template with ID: {TemplateId}", templateId);

                // Get existing template
                var existingTemplate = await _documentRepository.GetDocumentByIdAsync(templateId);
                if (existingTemplate == null)
                {
                    return new ApiResponse<TemplateCreationResult>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                // Update template properties
                existingTemplate.Name = request.Name;
                existingTemplate.Description = request.Description;
                existingTemplate.Category = request.Category ?? "Custom";
                existingTemplate.Content = request.Content;
                existingTemplate.LastModified = DateTime.UtcNow;
                existingTemplate.Size = System.Text.Encoding.UTF8.GetByteCount(request.Content);

                // Update template in database
                await _documentRepository.UpdateDocumentAsync(existingTemplate);

                var result = new TemplateCreationResult
                {
                    TemplateId = existingTemplate.DocumentId,
                    Name = existingTemplate.Name,
                    FieldCount = request.MergeFields?.Count ?? 0
                };

                _logger.LogInformation("Template updated successfully: {TemplateName} with {FieldCount} merge fields", 
                    result.Name, result.FieldCount);

                return new ApiResponse<TemplateCreationResult>
                {
                    Success = true,
                    Data = result,
                    Message = "Template updated successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating template with merge fields");
                return new ApiResponse<TemplateCreationResult>
                {
                    Success = false,
                    Error = $"Failed to update template: {ex.Message}"
                };
            }
        }

        private string GenerateBasicSfdtWithMergeFields(string templateName, List<MergeField> mergeFields)
        {
            // Create a basic SFDT document with merge field placeholders
            var documentContent = new
            {
                sfdt = new
                {
                    sections = new object[]
                    {
                        new
                        {
                            sectionFormat = new
                            {
                                pageWidth = 612,
                                pageHeight = 792,
                                leftMargin = 72,
                                rightMargin = 72,
                                topMargin = 72,
                                bottomMargin = 72,
                                differentFirstPage = false,
                                differentOddAndEvenPages = false,
                                headerDistance = 36,
                                footerDistance = 36,
                                bidi = false
                            },
                            blocks = new object[]
                            {
                                // Title
                                new
                                {
                                    paragraphFormat = new
                                    {
                                        styleName = "Heading 1",
                                        textAlignment = "Center"
                                    },
                                    characterFormat = new { },
                                    inlines = new object[]
                                    {
                                        new
                                        {
                                            characterFormat = new
                                            {
                                                fontSize = 16,
                                                fontFamily = "Calibri",
                                                bold = true
                                            },
                                            text = templateName
                                        }
                                    }
                                },
                                // Empty paragraph
                                new
                                {
                                    paragraphFormat = new { },
                                    characterFormat = new { },
                                    inlines = new object[]
                                    {
                                        new { text = " " }
                                    }
                                },
                                // Merge fields section
                                new
                                {
                                    paragraphFormat = new
                                    {
                                        styleName = "Heading 2"
                                    },
                                    characterFormat = new { },
                                    inlines = new object[]
                                    {
                                        new
                                        {
                                            characterFormat = new
                                            {
                                                fontSize = 14,
                                                fontFamily = "Calibri",
                                                bold = true
                                            },
                                            text = "Available Merge Fields:"
                                        }
                                    }
                                }
                            }.Concat(
                                // Add merge field placeholders
                                mergeFields.Select(field => new
                                {
                                    paragraphFormat = new { },
                                    characterFormat = new { },
                                    inlines = new object[]
                                    {
                                        new
                                        {
                                            characterFormat = new
                                            {
                                                fontFamily = "Calibri"
                                            },
                                            text = $"{{{{< {field.Name} >}}}} - {field.DisplayName}"
                                        }
                                    }
                                })
                            ).Concat(
                                // Add footer note
                                new object[]
                                {
                                    new
                                    {
                                        paragraphFormat = new { },
                                        characterFormat = new { },
                                        inlines = new object[]
                                        {
                                            new { text = " " }
                                        }
                                    },
                                    new
                                    {
                                        paragraphFormat = new
                                        {
                                            styleName = "Normal"
                                        },
                                        characterFormat = new { },
                                        inlines = new object[]
                                        {
                                            new
                                            {
                                                characterFormat = new
                                                {
                                                    fontFamily = "Calibri",
                                                    italic = true,
                                                    color = "#666666"
                                                },
                                                text = $"This template was created on {DateTime.Now:yyyy-MM-dd} with {mergeFields.Count} merge fields. Replace the merge field placeholders above with your content and use the merge fields where needed."
                                            }
                                        }
                                    }
                                }
                            ).ToArray()
                        }
                    }
                }
            };

            return JsonSerializer.Serialize(documentContent, new JsonSerializerOptions { WriteIndented = false });
        }

        public async Task<IEnumerable<string>> GetAvailableCategoriesAsync()
        {
            await Task.Delay(100);
            return new[] { "HR", "Invoicing", "Maintenance", "Contracts", "General", "Legal", "Marketing", "Finance" };
        }

        private List<MergeFieldBundle> GetPredefinedBundles()
        {
            return new List<MergeFieldBundle>
            {
                // HR Bundle
                new MergeFieldBundle
                {
                    Id = "hr-employee-bundle",
                    Name = "Employee Management",
                    Description = "Standard HR fields for employee documents, contracts, and communications",
                    Category = "HR",
                    Icon = "fas fa-users",
                    Fields = new List<MergeField>
                    {
                        new() { Name = "EmployeeId", DisplayName = "Employee ID", Type = MergeFieldType.Text, Category = "HR", IsRequired = true },
                        new() { Name = "FirstName", DisplayName = "First Name", Type = MergeFieldType.Text, Category = "HR", IsRequired = true },
                        new() { Name = "LastName", DisplayName = "Last Name", Type = MergeFieldType.Text, Category = "HR", IsRequired = true },
                        new() { Name = "Email", DisplayName = "Email Address", Type = MergeFieldType.Email, Category = "HR", IsRequired = true },
                        new() { Name = "Phone", DisplayName = "Phone Number", Type = MergeFieldType.Phone, Category = "HR" },
                        new() { Name = "Department", DisplayName = "Department", Type = MergeFieldType.Select, Category = "HR", Options = new List<string> { "IT", "HR", "Finance", "Marketing", "Operations" } },
                        new() { Name = "Position", DisplayName = "Job Position", Type = MergeFieldType.Text, Category = "HR", IsRequired = true },
                        new() { Name = "HireDate", DisplayName = "Hire Date", Type = MergeFieldType.Date, Category = "HR", Format = "yyyy-MM-dd" },
                        new() { Name = "Salary", DisplayName = "Salary", Type = MergeFieldType.Currency, Category = "HR", Format = "C" },
                        new() { Name = "Manager", DisplayName = "Manager Name", Type = MergeFieldType.Text, Category = "HR" },
                        new() { Name = "Address", DisplayName = "Home Address", Type = MergeFieldType.Address, Category = "HR" }
                    }
                },

                // Invoicing Bundle
                new MergeFieldBundle
                {
                    Id = "invoicing-bundle",
                    Name = "Invoicing & Billing",
                    Description = "Complete invoicing fields for billing documents and financial transactions",
                    Category = "Invoicing",
                    Icon = "fas fa-file-invoice-dollar",
                    Fields = new List<MergeField>
                    {
                        new() { Name = "InvoiceNumber", DisplayName = "Invoice Number", Type = MergeFieldType.Text, Category = "Invoicing", IsRequired = true },
                        new() { Name = "InvoiceDate", DisplayName = "Invoice Date", Type = MergeFieldType.Date, Category = "Invoicing", Format = "yyyy-MM-dd", IsRequired = true },
                        new() { Name = "DueDate", DisplayName = "Due Date", Type = MergeFieldType.Date, Category = "Invoicing", Format = "yyyy-MM-dd" },
                        new() { Name = "CustomerName", DisplayName = "Customer Name", Type = MergeFieldType.Text, Category = "Invoicing", IsRequired = true },
                        new() { Name = "CustomerEmail", DisplayName = "Customer Email", Type = MergeFieldType.Email, Category = "Invoicing" },
                        new() { Name = "BillingAddress", DisplayName = "Billing Address", Type = MergeFieldType.Address, Category = "Invoicing", IsRequired = true },
                        new() { Name = "SubTotal", DisplayName = "Subtotal", Type = MergeFieldType.Currency, Category = "Invoicing", Format = "C" },
                        new() { Name = "TaxAmount", DisplayName = "Tax Amount", Type = MergeFieldType.Currency, Category = "Invoicing", Format = "C" },
                        new() { Name = "TotalAmount", DisplayName = "Total Amount", Type = MergeFieldType.Currency, Category = "Invoicing", Format = "C", IsRequired = true },
                        new() { Name = "PaymentTerms", DisplayName = "Payment Terms", Type = MergeFieldType.Select, Category = "Invoicing", Options = new List<string> { "Net 30", "Net 15", "Due on Receipt", "COD" } },
                        new() { Name = "TaxId", DisplayName = "Tax ID", Type = MergeFieldType.Text, Category = "Invoicing" },
                        new() { Name = "PurchaseOrder", DisplayName = "Purchase Order", Type = MergeFieldType.Text, Category = "Invoicing" }
                    }
                },

                // Maintenance Bundle
                new MergeFieldBundle
                {
                    Id = "maintenance-bundle",
                    Name = "Maintenance & Service",
                    Description = "Fields for maintenance requests, work orders, and service documentation",
                    Category = "Maintenance",
                    Icon = "fas fa-tools",
                    Fields = new List<MergeField>
                    {
                        new() { Name = "WorkOrderNumber", DisplayName = "Work Order #", Type = MergeFieldType.Text, Category = "Maintenance", IsRequired = true },
                        new() { Name = "RequestDate", DisplayName = "Request Date", Type = MergeFieldType.Date, Category = "Maintenance", Format = "yyyy-MM-dd" },
                        new() { Name = "ScheduledDate", DisplayName = "Scheduled Date", Type = MergeFieldType.Date, Category = "Maintenance", Format = "yyyy-MM-dd" },
                        new() { Name = "Priority", DisplayName = "Priority Level", Type = MergeFieldType.Select, Category = "Maintenance", Options = new List<string> { "Low", "Medium", "High", "Critical" } },
                        new() { Name = "Equipment", DisplayName = "Equipment/Asset", Type = MergeFieldType.Text, Category = "Maintenance", IsRequired = true },
                        new() { Name = "Location", DisplayName = "Location", Type = MergeFieldType.Text, Category = "Maintenance", IsRequired = true },
                        new() { Name = "Description", DisplayName = "Issue Description", Type = MergeFieldType.Text, Category = "Maintenance", IsRequired = true },
                        new() { Name = "Technician", DisplayName = "Assigned Technician", Type = MergeFieldType.Text, Category = "Maintenance" },
                        new() { Name = "EstimatedHours", DisplayName = "Estimated Hours", Type = MergeFieldType.Number, Category = "Maintenance" },
                        new() { Name = "Cost", DisplayName = "Estimated Cost", Type = MergeFieldType.Currency, Category = "Maintenance", Format = "C" },
                        new() { Name = "Status", DisplayName = "Status", Type = MergeFieldType.Select, Category = "Maintenance", Options = new List<string> { "Pending", "In Progress", "Completed", "Cancelled" } },
                        new() { Name = "CompletionDate", DisplayName = "Completion Date", Type = MergeFieldType.Date, Category = "Maintenance", Format = "yyyy-MM-dd" }
                    }
                },

                // Contracts Bundle
                new MergeFieldBundle
                {
                    Id = "contracts-bundle",
                    Name = "Contracts & Legal",
                    Description = "Legal and contract fields for agreements, terms, and legal documentation",
                    Category = "Contracts",
                    Icon = "fas fa-file-contract",
                    Fields = new List<MergeField>
                    {
                        new() { Name = "ContractNumber", DisplayName = "Contract Number", Type = MergeFieldType.Text, Category = "Contracts", IsRequired = true },
                        new() { Name = "ContractTitle", DisplayName = "Contract Title", Type = MergeFieldType.Text, Category = "Contracts", IsRequired = true },
                        new() { Name = "PartyA", DisplayName = "First Party", Type = MergeFieldType.Text, Category = "Contracts", IsRequired = true },
                        new() { Name = "PartyB", DisplayName = "Second Party", Type = MergeFieldType.Text, Category = "Contracts", IsRequired = true },
                        new() { Name = "StartDate", DisplayName = "Start Date", Type = MergeFieldType.Date, Category = "Contracts", Format = "yyyy-MM-dd", IsRequired = true },
                        new() { Name = "EndDate", DisplayName = "End Date", Type = MergeFieldType.Date, Category = "Contracts", Format = "yyyy-MM-dd" },
                        new() { Name = "ContractValue", DisplayName = "Contract Value", Type = MergeFieldType.Currency, Category = "Contracts", Format = "C" },
                        new() { Name = "PaymentSchedule", DisplayName = "Payment Schedule", Type = MergeFieldType.Select, Category = "Contracts", Options = new List<string> { "Monthly", "Quarterly", "Semi-Annual", "Annual", "One-time" } },
                        new() { Name = "GoverningLaw", DisplayName = "Governing Law", Type = MergeFieldType.Text, Category = "Contracts" },
                        new() { Name = "SigningDate", DisplayName = "Signing Date", Type = MergeFieldType.Date, Category = "Contracts", Format = "yyyy-MM-dd" },
                        new() { Name = "Witness", DisplayName = "Witness", Type = MergeFieldType.Text, Category = "Contracts" },
                        new() { Name = "NotaryPublic", DisplayName = "Notary Public", Type = MergeFieldType.Text, Category = "Contracts" }
                    }
                },

                // General Business Bundle
                new MergeFieldBundle
                {
                    Id = "general-business-bundle",
                    Name = "General Business",
                    Description = "Common business fields for general correspondence and documentation",
                    Category = "General",
                    Icon = "fas fa-building",
                    Fields = new List<MergeField>
                    {
                        new() { Name = "CompanyName", DisplayName = "Company Name", Type = MergeFieldType.Text, Category = "General", IsRequired = true },
                        new() { Name = "CompanyAddress", DisplayName = "Company Address", Type = MergeFieldType.Address, Category = "General" },
                        new() { Name = "CompanyPhone", DisplayName = "Company Phone", Type = MergeFieldType.Phone, Category = "General" },
                        new() { Name = "CompanyEmail", DisplayName = "Company Email", Type = MergeFieldType.Email, Category = "General" },
                        new() { Name = "ContactPerson", DisplayName = "Contact Person", Type = MergeFieldType.Text, Category = "General" },
                        new() { Name = "Date", DisplayName = "Document Date", Type = MergeFieldType.Date, Category = "General", Format = "yyyy-MM-dd" },
                        new() { Name = "ReferenceNumber", DisplayName = "Reference Number", Type = MergeFieldType.Text, Category = "General" },
                        new() { Name = "Subject", DisplayName = "Subject", Type = MergeFieldType.Text, Category = "General" },
                        new() { Name = "ProjectName", DisplayName = "Project Name", Type = MergeFieldType.Text, Category = "General" },
                        new() { Name = "Website", DisplayName = "Website", Type = MergeFieldType.Text, Category = "General" }
                    }
                }
            };
        }

        public async Task<IEnumerable<MergeField>> GetMergeFieldsForBundleAsync(string bundleId)
        {
            await Task.Delay(100);
            var bundle = await GetBundleAsync(bundleId);
            return bundle.Fields;
        }

        // NEW: Template merging implementation
        public async Task<ApiResponse<DocumentInfo>> MergeTemplateAsync(int templateId, Dictionary<string, object> mergeData, string documentName, string? documentCategory = null)
        {
            try
            {
                _logger.LogInformation("Starting template merge for template ID: {TemplateId}", templateId);
                Console.WriteLine($"[MERGE DEBUG] Starting template merge for template ID: {templateId}");
                Console.WriteLine($"[MERGE DEBUG] Document name: {documentName}");
                Console.WriteLine($"[MERGE DEBUG] Merge data: {System.Text.Json.JsonSerializer.Serialize(mergeData)}");

                // 1. Load template from database
                var template = await _documentRepository.GetDocumentByIdAsync(templateId);
                if (template == null || !template.IsTemplate)
                {
                    Console.WriteLine($"[MERGE ERROR] Template not found or not a template. Found: {template != null}, IsTemplate: {template?.IsTemplate}");
                    return new ApiResponse<DocumentInfo>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                Console.WriteLine($"[MERGE DEBUG] Template loaded: {template.Name}");
                Console.WriteLine($"[MERGE DEBUG] Template content length: {template.Content?.Length ?? 0}");
                Console.WriteLine($"[MERGE DEBUG] Template content preview: {(template.Content?.Length > 100 ? template.Content.Substring(0, 100) + "..." : template.Content)}");

                // 2. Get template merge fields (parse from content or metadata)
                var templateMergeFields = await ExtractMergeFieldsFromTemplate(template);
                Console.WriteLine($"[MERGE DEBUG] Extracted {templateMergeFields.Count()} merge fields: {string.Join(", ", templateMergeFields.Select(f => f.Name))}");

                // 3. Process SFDT content with merge data
                Console.WriteLine($"[MERGE DEBUG] Processing SFDT content with merge data...");
                var mergedContent = ProcessSfdtMergeFields(template.Content ?? "", mergeData) ?? template.Content ?? "";
                Console.WriteLine($"[MERGE DEBUG] Merged content length: {mergedContent.Length}");
                Console.WriteLine($"[MERGE DEBUG] Content changed: {!string.Equals(template.Content, mergedContent)}");
                
                if (!string.Equals(template.Content, mergedContent))
                {
                    Console.WriteLine($"[MERGE DEBUG] Merged content preview: {(mergedContent.Length > 100 ? mergedContent.Substring(0, 100) + "..." : mergedContent)}");
                }
                else
                {
                    Console.WriteLine($"[MERGE WARNING] Content did not change - no merge fields were replaced!");
                }

                // 4. Create new document entity with merged content
                var newDocument = new Document
                {
                    DocumentId = Guid.NewGuid().ToString(),
                    Name = documentName,
                    Description = $"Document created from template '{template.Name}' on {DateTime.Now:yyyy-MM-dd HH:mm}",
                    Content = mergedContent,
                    FileType = template.FileType,
                    Size = System.Text.Encoding.UTF8.GetByteCount(mergedContent),
                    Category = documentCategory ?? template.Category ?? "General",
                    IsTemplate = false,
                    IsPublic = template.IsPublic,
                    Status = "Active",
                    CreatedBy = "system", // TODO: Use actual user when authentication is implemented
                    CreatedAt = DateTime.UtcNow,
                    LastModified = DateTime.UtcNow,
                    Version = 1,
                    Tags = template.Tags,
                    // 5. Inherit classification from template
                    TemplateId = templateId,
                    ClassificationPolicy = template.Category?.Contains("Confidential") == true ? "Confidential" : "Internal",
                    RetentionPolicy = "7 years", // Default retention policy
                    RequiresApproval = template.Category?.Contains("Confidential") == true,
                    ExpiryDate = DateTime.UtcNow.AddYears(7)
                };

                // 6. Save merged document to documents library
                var savedDocument = await _documentRepository.CreateDocumentAsync(newDocument);

                // 7. Return document info
                var documentInfo = new DocumentInfo
                {
                    Id = savedDocument.Id,
                    DocumentId = savedDocument.DocumentId,
                    Name = savedDocument.Name,
                    Type = savedDocument.FileType,
                    Size = savedDocument.Size,
                    CreatedAt = savedDocument.CreatedAt,
                    LastModified = savedDocument.LastModified,
                    CreatedBy = savedDocument.CreatedBy ?? "",
                    Status = savedDocument.Status
                };

                _logger.LogInformation("Template merge completed successfully. New document ID: {DocumentId}", savedDocument.Id);

                return new ApiResponse<DocumentInfo>
                {
                    Success = true,
                    Data = documentInfo,
                    Message = $"Document '{documentName}' created successfully from template '{template.Name}'"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error merging template {TemplateId}", templateId);
                return new ApiResponse<DocumentInfo>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<ApiResponse<Dictionary<string, object>>> GetTemplateMergeStructureAsync(int templateId)
        {
            try
            {
                // Load template
                var template = await _documentRepository.GetDocumentByIdAsync(templateId);
                if (template == null || !template.IsTemplate)
                {
                    return new ApiResponse<Dictionary<string, object>>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                // Extract merge fields from template
                var mergeFields = await ExtractMergeFieldsFromTemplate(template);

                // Create merge structure with empty placeholders
                var mergeStructure = new Dictionary<string, object>();
                
                foreach (var field in mergeFields)
                {
                    var defaultValue = field.Type switch
                    {
                        MergeFieldType.Number or MergeFieldType.Currency => (object)0,
                        MergeFieldType.Date => (object)DateTime.Today.ToString("yyyy-MM-dd"),
                        MergeFieldType.Boolean => (object)false,
                        _ => (object)""
                    };

                    mergeStructure[field.Name] = defaultValue;
                }

                return new ApiResponse<Dictionary<string, object>>
                {
                    Success = true,
                    Data = mergeStructure,
                    Message = $"Merge structure for template '{template.Name}' retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template merge structure for template {TemplateId}", templateId);
                return new ApiResponse<Dictionary<string, object>>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<ApiResponse<List<MergeField>>> GetTemplateMergeFieldsAsync(int templateId)
        {
            try
            {
                // Load template
                var template = await _documentRepository.GetDocumentByIdAsync(templateId);
                if (template == null || !template.IsTemplate)
                {
                    return new ApiResponse<List<MergeField>>
                    {
                        Success = false,
                        Error = "Template not found"
                    };
                }

                // Extract merge fields from template
                var mergeFields = await ExtractMergeFieldsFromTemplate(template);

                return new ApiResponse<List<MergeField>>
                {
                    Success = true,
                    Data = mergeFields.ToList(),
                    Message = $"Merge fields for template '{template.Name}' retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template merge fields for template {TemplateId}", templateId);
                return new ApiResponse<List<MergeField>>
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        // Helper method to extract merge fields from template content
        private async Task<IEnumerable<MergeField>> ExtractMergeFieldsFromTemplate(Document template)
        {
            var mergeFields = new List<MergeField>();

            try
            {
                // Parse SFDT content to find merge field placeholders
                if (!string.IsNullOrEmpty(template.Content))
                {
                    // Look for Word-style MERGEFIELD patterns like "MERGEFIELD FieldName \\* MERGEFORMAT" (primary pattern)
                    try
                    {
                        var wordMergeFieldPattern = @"MERGEFIELD\s+(\w+)\s+\\\\*\s*MERGEFORMAT";
                        var wordMatches = System.Text.RegularExpressions.Regex.Matches(template.Content, wordMergeFieldPattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase);

                        foreach (System.Text.RegularExpressions.Match match in wordMatches)
                        {
                            var fieldName = match.Groups[1].Value;
                            
                            // Check if we already have this field
                            if (!mergeFields.Any(f => f.Name == fieldName))
                            {
                                // Try to infer field type from predefined bundles
                                var inferredField = await InferFieldTypeFromBundles(fieldName);
                                
                                if (inferredField != null)
                                {
                                    mergeFields.Add(inferredField);
                                }
                                else
                                {
                                    // Default to text field
                                    mergeFields.Add(new MergeField
                                    {
                                        Name = fieldName,
                                        DisplayName = fieldName.Replace("_", " ").Replace("-", " "),
                                        Type = MergeFieldType.Text,
                                        Category = "Custom",
                                        IsRequired = false
                                    });
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error processing Word MERGEFIELD pattern for template {TemplateId}", template.Id);
                    }

                    // Look for Word-style display patterns like «FieldName»
                    try
                    {
                        var wordDisplayPattern = @"«(\w+)»";
                        var displayMatches = System.Text.RegularExpressions.Regex.Matches(template.Content, wordDisplayPattern);

                        foreach (System.Text.RegularExpressions.Match match in displayMatches)
                        {
                            var fieldName = match.Groups[1].Value;
                            
                            // Check if we already have this field
                            if (!mergeFields.Any(f => f.Name == fieldName))
                            {
                                // Try to infer field type from predefined bundles
                                var inferredField = await InferFieldTypeFromBundles(fieldName);
                                
                                if (inferredField != null)
                                {
                                    mergeFields.Add(inferredField);
                                }
                                else
                                {
                                    // Default to text field
                                    mergeFields.Add(new MergeField
                                    {
                                        Name = fieldName,
                                        DisplayName = fieldName.Replace("_", " ").Replace("-", " "),
                                        Type = MergeFieldType.Text,
                                        Category = "Custom",
                                        IsRequired = false
                                    });
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error processing Word display pattern for template {TemplateId}", template.Id);
                    }

                    // Look for Syncfusion DocIO merge field patterns like <<FieldName>> (secondary pattern)
                    try
                    {
                        var syncfusionPattern = @"<<(\w+)>>";
                        var syncfusionMatches = System.Text.RegularExpressions.Regex.Matches(template.Content, syncfusionPattern);

                        foreach (System.Text.RegularExpressions.Match match in syncfusionMatches)
                        {
                            var fieldName = match.Groups[1].Value;
                            
                            // Check if we already have this field
                            if (!mergeFields.Any(f => f.Name == fieldName))
                            {
                                // Try to infer field type from predefined bundles
                                var inferredField = await InferFieldTypeFromBundles(fieldName);
                                
                                if (inferredField != null)
                                {
                                    mergeFields.Add(inferredField);
                                }
                                else
                                {
                                    // Default to text field
                                    mergeFields.Add(new MergeField
                                    {
                                        Name = fieldName,
                                        DisplayName = fieldName.Replace("_", " ").Replace("-", " "),
                                        Type = MergeFieldType.Text,
                                        Category = "Custom",
                                        IsRequired = false
                                    });
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error processing Syncfusion pattern for template {TemplateId}", template.Id);
                    }

                    // Look for patterns like {{< FieldName >}} in the SFDT content (legacy pattern)
                    try
                    {
                        var legacyPattern = @"\{\{<\s*(\w+)\s*>\}\}";
                        var legacyMatches = System.Text.RegularExpressions.Regex.Matches(template.Content, legacyPattern);

                        foreach (System.Text.RegularExpressions.Match match in legacyMatches)
                        {
                            var fieldName = match.Groups[1].Value;
                            
                            // Check if we already have this field
                            if (!mergeFields.Any(f => f.Name == fieldName))
                            {
                                // Try to infer field type from predefined bundles
                                var inferredField = await InferFieldTypeFromBundles(fieldName);
                                
                                if (inferredField != null)
                                {
                                    mergeFields.Add(inferredField);
                                }
                                else
                                {
                                    // Default to text field
                                    mergeFields.Add(new MergeField
                                    {
                                        Name = fieldName,
                                        DisplayName = fieldName.Replace("_", " ").Replace("-", " "),
                                        Type = MergeFieldType.Text,
                                        Category = "Custom",
                                        IsRequired = false
                                    });
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error processing legacy pattern for template {TemplateId}", template.Id);
                    }

                    // Look for simple bracket patterns like [FieldName] - most common in templates
                    try
                    {
                        var bracketPattern = @"\[([^\[\]]+)\]";
                        var bracketMatches = System.Text.RegularExpressions.Regex.Matches(template.Content, bracketPattern);

                        foreach (System.Text.RegularExpressions.Match match in bracketMatches)
                        {
                            var fieldName = match.Groups[1].Value.Trim();
                            
                            // Skip common non-field brackets like [Date], [Page], etc. if they contain spaces or special chars
                            if (string.IsNullOrEmpty(fieldName) || (fieldName.Contains(" ") && !IsValidMergeFieldName(fieldName)))
                            {
                                continue;
                            }
                            
                            // Convert field names with spaces to camelCase (e.g., "Recipient Name" -> "RecipientName")
                            var processedFieldName = fieldName.Contains(" ") ? 
                                string.Join("", fieldName.Split(' ').Select((word, index) => 
                                    index == 0 ? word : char.ToUpper(word[0]) + word.Substring(1).ToLower())) : 
                                fieldName;
                            
                            // Check if we already have this field
                            if (!mergeFields.Any(f => f.Name == processedFieldName || f.DisplayName == fieldName))
                            {
                                // Try to infer field type from predefined bundles
                                var inferredField = await InferFieldTypeFromBundles(processedFieldName);
                                
                                if (inferredField != null)
                                {
                                    inferredField.DisplayName = fieldName; // Use original display name
                                    mergeFields.Add(inferredField);
                                }
                                else
                                {
                                    // Default to text field
                                    mergeFields.Add(new MergeField
                                    {
                                        Name = processedFieldName,
                                        DisplayName = fieldName,
                                        Type = MergeFieldType.Text,
                                        Category = "Template",
                                        IsRequired = false
                                    });
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error processing bracket pattern for template {TemplateId}", template.Id);
                    }
                }

                // If no merge fields found in content, try to get from tags or description
                if (!mergeFields.Any() && !string.IsNullOrEmpty(template.Tags))
                {
                    try
                    {
                        // Look for tag-based merge field definitions
                        var tags = template.Tags.Split(',').Select(t => t.Trim()).ToList();
                        foreach (var tag in tags.Where(t => t.StartsWith("field:")))
                        {
                            var fieldName = tag.Substring(6); // Remove "field:" prefix
                            mergeFields.Add(new MergeField
                            {
                                Name = fieldName,
                                DisplayName = fieldName.Replace("_", " ").Replace("-", " "),
                                Type = MergeFieldType.Text,
                                Category = "Custom",
                                IsRequired = false
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error processing tags for template {TemplateId}", template.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error extracting merge fields from template {TemplateId}", template.Id);
            }

            return mergeFields;
        }

        // Helper method to infer field type from predefined bundles
        private async Task<MergeField?> InferFieldTypeFromBundles(string fieldName)
        {
            try
            {
                var bundles = await GetAvailableBundlesAsync();
                
                foreach (var bundle in bundles)
                {
                    var matchingField = bundle.Fields.FirstOrDefault(f => 
                        f.Name.Equals(fieldName, StringComparison.OrdinalIgnoreCase));
                    
                    if (matchingField != null)
                    {
                        return matchingField;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error inferring field type for field {FieldName}", fieldName);
            }

            return null;
        }

        // Helper method to process SFDT content with merge data
        private string ProcessSfdtMergeFields(string sfdtContent, Dictionary<string, object> mergeData)
        {
            if (string.IsNullOrEmpty(sfdtContent) || mergeData == null || !mergeData.Any())
            {
                Console.WriteLine($"[PROCESS DEBUG] Early return - content empty: {string.IsNullOrEmpty(sfdtContent)}, data empty: {mergeData == null || !mergeData.Any()}");
                return sfdtContent;
            }

            var processedContent = sfdtContent;
            var replacementCount = 0;

            try
            {
                Console.WriteLine($"[PROCESS DEBUG] Processing {mergeData.Count} merge fields...");
                
                // Replace merge field placeholders with actual values
                foreach (var kvp in mergeData)
                {
                    Console.WriteLine($"[PROCESS DEBUG] Processing field: {kvp.Key} = {kvp.Value}");
                    
                    var value = FormatMergeValue(kvp.Value);
                    
                    // Handle Word-style MERGEFIELD pattern: "MERGEFIELD FieldName \\* MERGEFORMAT"
                    var wordMergeFieldPattern = $"MERGEFIELD {kvp.Key} \\\\* MERGEFORMAT";
                    if (processedContent.Contains(wordMergeFieldPattern))
                    {
                        Console.WriteLine($"[PROCESS DEBUG] Found Word MERGEFIELD pattern: {wordMergeFieldPattern}");
                        processedContent = processedContent.Replace(wordMergeFieldPattern, value);
                        replacementCount++;
                        Console.WriteLine($"[PROCESS DEBUG] Replaced with: {value}");
                    }
                    
                    // Handle Word-style merge field display: «FieldName»
                    var wordDisplayPattern = $"«{kvp.Key}»";
                    if (processedContent.Contains(wordDisplayPattern))
                    {
                        Console.WriteLine($"[PROCESS DEBUG] Found Word display pattern: {wordDisplayPattern}");
                        processedContent = processedContent.Replace(wordDisplayPattern, value);
                        replacementCount++;
                        Console.WriteLine($"[PROCESS DEBUG] Replaced with: {value}");
                    }
                    
                    // Handle Syncfusion DocIO merge field pattern <<FieldName>>
                    var syncfusionPlaceholder = $"<<{kvp.Key}>>";
                    if (processedContent.Contains(syncfusionPlaceholder))
                    {
                        Console.WriteLine($"[PROCESS DEBUG] Found Syncfusion placeholder: {syncfusionPlaceholder}");
                        processedContent = processedContent.Replace(syncfusionPlaceholder, value);
                        replacementCount++;
                        Console.WriteLine($"[PROCESS DEBUG] Replaced with: {value}");
                    }
                    
                    // Handle legacy pattern {{< FieldName >}} for backward compatibility
                    var legacyPlaceholder = $"{{{{< {kvp.Key} >}}}}";
                    if (processedContent.Contains(legacyPlaceholder))
                    {
                        Console.WriteLine($"[PROCESS DEBUG] Found legacy placeholder: {legacyPlaceholder}");
                        processedContent = processedContent.Replace(legacyPlaceholder, value);
                        replacementCount++;
                        Console.WriteLine($"[PROCESS DEBUG] Replaced with: {value}");
                    }
                    
                    // Handle simple bracket pattern [FieldName] - most common template pattern
                    var bracketPlaceholder = $"[{kvp.Key}]";
                    if (processedContent.Contains(bracketPlaceholder))
                    {
                        Console.WriteLine($"[PROCESS DEBUG] Found bracket placeholder: {bracketPlaceholder}");
                        processedContent = processedContent.Replace(bracketPlaceholder, value);
                        replacementCount++;
                        Console.WriteLine($"[PROCESS DEBUG] Replaced with: {value}");
                    }
                    
                    // Also try to match bracket patterns with display names (e.g., [Recipient Name] for RecipientName field)
                    var displayNamePattern = ConvertFieldNameToDisplayName(kvp.Key);
                    var displayBracketPlaceholder = $"[{displayNamePattern}]";
                    if (!string.Equals(bracketPlaceholder, displayBracketPlaceholder, StringComparison.OrdinalIgnoreCase) && 
                        processedContent.Contains(displayBracketPlaceholder))
                    {
                        Console.WriteLine($"[PROCESS DEBUG] Found display bracket placeholder: {displayBracketPlaceholder}");
                        processedContent = processedContent.Replace(displayBracketPlaceholder, value);
                        replacementCount++;
                        Console.WriteLine($"[PROCESS DEBUG] Replaced with: {value}");
                    }
                }

                Console.WriteLine($"[PROCESS DEBUG] Total replacements made: {replacementCount}");
                _logger.LogInformation("Processed {FieldCount} merge fields in template, made {ReplacementCount} replacements", mergeData.Count, replacementCount);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PROCESS ERROR] Error processing merge fields: {ex.Message}");
                _logger.LogError(ex, "Error processing SFDT merge fields");
            }

            return processedContent;
        }

        // Helper method to format merge values based on type
        private string FormatMergeValue(object value)
        {
            if (value == null)
                return "";

            return value switch
            {
                DateTime date => date.ToString("yyyy-MM-dd"),
                decimal currency => currency.ToString("C"),
                double number => number.ToString("N2"),
                bool boolean => boolean ? "Yes" : "No",
                _ => value.ToString() ?? ""
            };
        }

        // Helper method to determine if a bracket content is a valid merge field name
        private bool IsValidMergeFieldName(string fieldName)
        {
            // Consider it a valid merge field if it contains common field patterns
            var commonFieldPatterns = new[]
            {
                "name", "address", "date", "company", "title", "recipient", "sender",
                "amount", "total", "number", "id", "email", "phone", "city", "state",
                "zip", "country", "subject", "message", "content", "description"
            };

            var lowerFieldName = fieldName.ToLower();
            return commonFieldPatterns.Any(pattern => lowerFieldName.Contains(pattern));
        }

        // Helper method to convert field names like "RecipientName" to "Recipient Name"
        private string ConvertFieldNameToDisplayName(string fieldName)
        {
            if (string.IsNullOrEmpty(fieldName))
                return fieldName;

            // Insert spaces before capital letters (camelCase to words)
            var result = System.Text.RegularExpressions.Regex.Replace(fieldName, "([a-z])([A-Z])", "$1 $2");
            
            // Capitalize first letter
            return char.ToUpper(result[0]) + result.Substring(1);
        }
    }
}
