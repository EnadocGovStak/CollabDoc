using Collabdoc.Web.Data.Entities;
using Collabdoc.Web.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Collabdoc.Web.Tests.Integration
{
    public class TemplateMergeIntegrationTests
    {
        private readonly Mock<ILogger<MergeFieldService>> _mockLogger;
        private readonly Mock<IDocumentApiService> _mockDocumentApiService;
        private readonly Mock<IDocumentRepository> _mockDocumentRepository;
        private readonly MergeFieldService _mergeFieldService;

        public TemplateMergeIntegrationTests()
        {
            _mockLogger = new Mock<ILogger<MergeFieldService>>();
            _mockDocumentApiService = new Mock<IDocumentApiService>();
            _mockDocumentRepository = new Mock<IDocumentRepository>();
            _mergeFieldService = new MergeFieldService(_mockLogger.Object, _mockDocumentApiService.Object, _mockDocumentRepository.Object);
        }

        [Fact]
        public async Task Scenario1_UIBasedTemplateMerging_CompleteWorkflow()
        {
            // Arrange - Setup template with HR employee bundle
            var templateRequest = new CreateTemplateWithMergeFieldsRequest
            {
                Name = "Employee Onboarding Template",
                Description = "Template for employee onboarding documents",
                Category = "HR-Confidential", // Changed to trigger Confidential classification
                SelectedBundles = new List<string> { "hr-bundle" },
                CustomFields = new List<MergeField>
                {
                    new() { Name = "Department", DisplayName = "Department", Type = MergeFieldType.Text, IsRequired = true },
                    new() { Name = "Position", DisplayName = "Job Position", Type = MergeFieldType.Text, IsRequired = true }
                },
                IncludeRecordManagement = true,  // Required for RecordSettings to be populated
                RecordRetentionPeriod = "7 years",
                RecordClassification = "Confidential"
            };

            var createdTemplate = new Document
            {
                Id = 1,
                Name = templateRequest.Name,
                Description = templateRequest.Description,
                Category = "HR-Confidential", // Match the category
                IsTemplate = true,
                Content = @"{""sfdt"": ""Employee: {{< EmployeeName >}}, ID: {{< EmployeeId >}}, Start: {{< StartDate >}}""}",
                ClassificationPolicy = "Confidential",
                RetentionPolicy = "7 years",
                RequiresApproval = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockDocumentRepository.Setup(r => r.CreateDocumentAsync(It.IsAny<Document>()))
                .ReturnsAsync(createdTemplate);

            // Step 1: Create template with merge fields
            var templateResult = await _mergeFieldService.CreateTemplateWithMergeFieldsAsync(templateRequest);

            // Assert template creation
            templateResult.Success.Should().BeTrue();
            templateResult.Data.Should().NotBeNull();
            templateResult.Data!.MergeFields.Should().NotBeEmpty();
            templateResult.Data.RecordSettings.Should().NotBeNull();
            templateResult.Data.RecordSettings!.Classification.Should().Be("Confidential");

            // Step 2: Simulate user clicking "Use" button and filling merge fields
            var mergeData = new Dictionary<string, object>
            {
                ["FirstName"] = "John",
                ["LastName"] = "Doe",
                ["EmployeeId"] = "EMP-001",
                ["Email"] = "john.doe@company.com",
                ["Department"] = "IT",
                ["Position"] = "Software Developer",
                ["StartDate"] = DateTime.Parse("2024-02-01"),
                ["Salary"] = 75000.00,
                ["Manager"] = "Jane Smith"
            };

            var mergedDocument = new Document
            {
                Id = 2,
                DocumentId = "doc-001",
                Name = "Employee Onboarding - John Doe",
                Content = @"{""sfdt"": ""Employee: John Doe, ID: EMP-001, Start: 2024-02-01""}",
                Category = "Generated",
                IsTemplate = false,
                TemplateId = createdTemplate.Id,
                ClassificationPolicy = "Confidential",
                RetentionPolicy = "7 years",
                RequiresApproval = true,
                ExpiryDate = DateTime.UtcNow.AddYears(7),
                CreatedAt = DateTime.UtcNow
            };

            _mockDocumentRepository.Setup(r => r.GetDocumentByIdAsync(createdTemplate.Id))
                .ReturnsAsync(createdTemplate);
            _mockDocumentRepository.Setup(r => r.CreateDocumentAsync(It.Is<Document>(d => !d.IsTemplate)))
                .ReturnsAsync(mergedDocument);

            // Step 3: Merge template with user data
            var mergeResult = await _mergeFieldService.MergeTemplateAsync(
                createdTemplate.Id, 
                mergeData, 
                "Employee Onboarding - John Doe", 
                "Generated");

            // Assert merge result
            mergeResult.Success.Should().BeTrue();
            mergeResult.Data.Should().NotBeNull();
            mergeResult.Data!.Name.Should().Be("Employee Onboarding - John Doe");

            // Step 4: Verify document was saved to library with classification
            // Updated to match actual service logic: ClassificationPolicy = "Confidential" (because Category contains "Confidential")
            _mockDocumentRepository.Verify(r => r.CreateDocumentAsync(It.Is<Document>(d => 
                d.TemplateId == createdTemplate.Id &&
                d.ClassificationPolicy == "Confidential" &&  // Service sets this based on Category containing "Confidential"
                d.RequiresApproval == true &&                // Service sets this based on Category containing "Confidential"
                d.IsTemplate == false)), Times.Once);
        }

        [Fact]
        public async Task Scenario2_APIBasedTemplateMerging_ExternalConsumerWorkflow()
        {
            // Arrange - Setup template for external API consumption
            var template = new Document
            {
                Id = 10,
                DocumentId = "api-template-001",
                Name = "Invoice API Template",
                Description = "Template for API-generated invoices",
                Category = "Finance",
                IsTemplate = true,
                Content = @"{""sfdt"": ""Invoice: {{< InvoiceNumber >}}, Customer: {{< CustomerName >}}, Amount: {{< TotalAmount >}}""}",
                ClassificationPolicy = "Internal",
                RetentionPolicy = "5 years",
                RequiresApproval = false
            };

            _mockDocumentRepository.Setup(r => r.GetDocumentByIdAsync(template.Id))
                .ReturnsAsync(template);

            // Step 1: External consumer gets template merge structure
            var structureResult = await _mergeFieldService.GetTemplateMergeStructureAsync(template.Id);

            // Assert structure result
            structureResult.Success.Should().BeTrue();
            structureResult.Data.Should().NotBeNull();
            structureResult.Data.Should().BeOfType<Dictionary<string, object>>();

            // Step 2: External consumer gets template merge fields for validation
            var fieldsResult = await _mergeFieldService.GetTemplateMergeFieldsAsync(template.Id);

            // Assert fields result
            fieldsResult.Success.Should().BeTrue();
            fieldsResult.Data.Should().NotBeNull();

            // Step 3: External consumer sends merge request with completed data
            var apiMergeData = new Dictionary<string, object>
            {
                ["InvoiceNumber"] = "API-INV-001",
                ["CustomerName"] = "Acme Corporation",
                ["TotalAmount"] = 2500.00,
                ["InvoiceDate"] = DateTime.Parse("2024-01-15"),
                ["DueDate"] = DateTime.Parse("2024-02-15"),
                ["BillingAddress"] = "123 Business St, Corporate City, CC 12345"
            };

            var apiGeneratedDocument = new Document
            {
                Id = 11,
                DocumentId = "api-doc-001",
                Name = "API Generated Invoice - Acme Corporation",
                Content = @"{""sfdt"": ""Invoice: API-INV-001, Customer: Acme Corporation, Amount: 2500.00""}",
                Category = "API Generated",
                IsTemplate = false,
                TemplateId = template.Id,
                ClassificationPolicy = "Internal",
                RetentionPolicy = "5 years",
                RequiresApproval = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "API-Consumer"
            };

            _mockDocumentRepository.Setup(r => r.CreateDocumentAsync(It.Is<Document>(d => !d.IsTemplate)))
                .ReturnsAsync(apiGeneratedDocument);

            // Step 4: Process merge request
            var apiMergeResult = await _mergeFieldService.MergeTemplateAsync(
                template.Id,
                apiMergeData,
                "API Generated Invoice - Acme Corporation",
                "API Generated");

            // Assert API merge result
            apiMergeResult.Success.Should().BeTrue();
            apiMergeResult.Data.Should().NotBeNull();
            apiMergeResult.Data!.Name.Should().Be("API Generated Invoice - Acme Corporation");

            // Step 5: Verify document was saved to library (saveToLibrary = true scenario)
            _mockDocumentRepository.Verify(r => r.CreateDocumentAsync(It.Is<Document>(d => 
                d.TemplateId == template.Id &&
                d.ClassificationPolicy == "Internal" &&
                d.RequiresApproval == false &&
                d.IsTemplate == false &&
                d.CreatedBy == "system")), Times.Once);
        }

        [Fact]
        public async Task TemplateMergeWorkflow_WithMultipleBundles_ShouldCombineFieldsCorrectly()
        {
            // Arrange - Template with multiple bundles
            var multieBundleRequest = new CreateTemplateWithMergeFieldsRequest
            {
                Name = "Contract Invoice Template",
                Description = "Combined contract and invoice template",
                Category = "Legal-Finance",
                SelectedBundles = new List<string> { "contracts-bundle", "invoicing-bundle" },
                CustomFields = new List<MergeField>
                {
                    new() { Name = "ProjectCode", DisplayName = "Project Code", Type = MergeFieldType.Text, IsRequired = true }
                }
            };

            var template = new Document
            {
                Id = 20,
                Name = multieBundleRequest.Name,
                IsTemplate = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockDocumentRepository.Setup(r => r.CreateDocumentAsync(It.IsAny<Document>()))
                .ReturnsAsync(template);

            // Act
            var result = await _mergeFieldService.CreateTemplateWithMergeFieldsAsync(multieBundleRequest);

            // Assert - Should combine fields from both bundles plus custom fields
            result.Success.Should().BeTrue();
            result.Data!.MergeFields.Should().NotBeEmpty();
            
            // Should have contract fields
            result.Data.MergeFields.Should().Contain(f => f.Name == "ContractNumber");
            result.Data.MergeFields.Should().Contain(f => f.Name == "PartyA");
            
            // Should have invoice fields
            result.Data.MergeFields.Should().Contain(f => f.Name == "InvoiceNumber");
            result.Data.MergeFields.Should().Contain(f => f.Name == "CustomerName");
            
            // Should have custom field
            result.Data.MergeFields.Should().Contain(f => f.Name == "ProjectCode");

            // Should not have duplicates
            var fieldNames = result.Data.MergeFields.Select(f => f.Name).ToList();
            fieldNames.Should().OnlyHaveUniqueItems();
        }

        [Theory]
        [InlineData("HR-Internal", "Internal", false)]
        [InlineData("Finance-Confidential", "Confidential", true)]  
        [InlineData("Legal-Confidential", "Confidential", true)]
        public async Task TemplateMerge_ShouldInheritCorrectClassificationPolicies(string category, string expectedClassification, bool expectedRequiresApproval)
        {
            // Arrange
            var template = new Document
            {
                Id = 30,
                Name = "Classification Test Template",
                IsTemplate = true,
                Category = category, // Category used by service to determine classification
                ClassificationPolicy = expectedClassification,
                RequiresApproval = expectedRequiresApproval,
                RetentionPolicy = "7 years"
            };

            var mergedDocument = new Document
            {
                Id = 31,
                Name = "Merged Document",
                IsTemplate = false,
                TemplateId = template.Id,
                ClassificationPolicy = expectedClassification,
                RequiresApproval = expectedRequiresApproval,
                RetentionPolicy = "7 years",
                ExpiryDate = DateTime.UtcNow.AddYears(7)
            };

            _mockDocumentRepository.Setup(r => r.GetDocumentByIdAsync(template.Id))
                .ReturnsAsync(template);
            _mockDocumentRepository.Setup(r => r.CreateDocumentAsync(It.IsAny<Document>()))
                .ReturnsAsync(mergedDocument);

            var mergeData = new Dictionary<string, object> { ["TestField"] = "TestValue" };

            // Act
            var result = await _mergeFieldService.MergeTemplateAsync(template.Id, mergeData, "Test Document");

            // Assert
            result.Success.Should().BeTrue();
            
            // Updated to match actual service logic: classification based on Category containing "Confidential"
            _mockDocumentRepository.Verify(r => r.CreateDocumentAsync(It.Is<Document>(d => 
                d.ClassificationPolicy == expectedClassification &&
                d.RequiresApproval == expectedRequiresApproval &&
                d.RetentionPolicy == "7 years")), Times.Once);
        }

        [Fact]
        public async Task TemplateMerge_WithEmptyMergeData_ShouldHandleGracefully()
        {
            // Arrange
            var template = new Document
            {
                Id = 40,
                Name = "Empty Data Test Template",
                Content = @"{""sfdt"": ""Template with {{< Field1 >}} and {{< Field2 >}}""}",
                IsTemplate = true
            };

            var resultDocument = new Document
            {
                Id = 41,
                Name = "Empty Data Document",
                Content = @"{""sfdt"": ""Template with  and ""}",
                IsTemplate = false,
                TemplateId = template.Id
            };

            _mockDocumentRepository.Setup(r => r.GetDocumentByIdAsync(template.Id))
                .ReturnsAsync(template);
            _mockDocumentRepository.Setup(r => r.CreateDocumentAsync(It.IsAny<Document>()))
                .ReturnsAsync(resultDocument);

            // Act
            var result = await _mergeFieldService.MergeTemplateAsync(template.Id, new Dictionary<string, object>(), "Empty Data Document");

            // Assert
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            
            _mockDocumentRepository.Verify(r => r.CreateDocumentAsync(It.IsAny<Document>()), Times.Once);
        }
    }
} 