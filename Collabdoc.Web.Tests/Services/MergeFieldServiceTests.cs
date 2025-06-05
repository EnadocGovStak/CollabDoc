using Collabdoc.Web.Data.Entities;
using Collabdoc.Web.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Collabdoc.Web.Tests.Services
{
    public class MergeFieldServiceTests
    {
        private readonly Mock<ILogger<MergeFieldService>> _mockLogger;
        private readonly Mock<IDocumentApiService> _mockDocumentApiService;
        private readonly Mock<IDocumentRepository> _mockDocumentRepository;
        private readonly MergeFieldService _service;

        public MergeFieldServiceTests()
        {
            _mockLogger = new Mock<ILogger<MergeFieldService>>();
            _mockDocumentApiService = new Mock<IDocumentApiService>();
            _mockDocumentRepository = new Mock<IDocumentRepository>();
            _service = new MergeFieldService(_mockLogger.Object, _mockDocumentApiService.Object, _mockDocumentRepository.Object);
        }

        [Fact]
        public async Task GetAvailableBundlesAsync_ShouldReturnPredefinedBundles()
        {
            // Act
            var result = await _service.GetAvailableBundlesAsync();

            // Assert
            result.Should().NotBeEmpty();
            result.Should().HaveCountGreaterThan(4);
            result.Should().Contain(b => b.Id == "hr-employee-bundle");
            result.Should().Contain(b => b.Id == "invoicing-bundle");
            result.Should().Contain(b => b.Id == "maintenance-bundle");
            result.Should().Contain(b => b.Id == "contracts-bundle");
        }

        [Fact]
        public async Task GetBundleAsync_WithValidId_ShouldReturnCorrectBundle()
        {
            // Act
            var result = await _service.GetBundleAsync("hr-employee-bundle");

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("hr-employee-bundle");
            result.Name.Should().Be("Employee Management");
            result.Category.Should().Be("HR");
            result.Fields.Should().NotBeEmpty();
            result.Fields.Should().Contain(f => f.Name == "EmployeeId");
            result.Fields.Should().Contain(f => f.Name == "FirstName");
            result.Fields.Should().Contain(f => f.Name == "Email");
        }

        [Fact]
        public async Task GetBundleAsync_WithInvalidId_ShouldReturnEmptyBundle()
        {
            // Act
            var result = await _service.GetBundleAsync("non-existent-bundle");

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().BeEmpty();
        }

        [Fact]
        public async Task CreateTemplateWithMergeFieldsAsync_ShouldCreateTemplateSuccessfully()
        {
            // Arrange
            var request = new CreateTemplateWithMergeFieldsRequest
            {
                Name = "Test Invoice Template",
                Description = "A test template for invoices",
                Category = "Finance",
                SelectedBundles = new List<string> { "invoicing-bundle" },
                CustomFields = new List<MergeField>
                {
                    new() { Name = "CustomField1", DisplayName = "Custom Field 1", Type = MergeFieldType.Text, IsRequired = true }
                },
                IncludeRecordManagement = true,
                RecordRetentionPeriod = "5 years",
                RecordClassification = "Financial"
            };

            var mockDocument = new Document
            {
                Id = 1,
                DocumentId = "test-doc-id",
                Name = request.Name,
                Description = request.Description,
                Category = request.Category,
                IsTemplate = true,
                CreatedAt = DateTime.UtcNow
            };

            _mockDocumentRepository.Setup(r => r.CreateDocumentAsync(It.IsAny<Document>()))
                .ReturnsAsync(mockDocument);

            // Act
            var result = await _service.CreateTemplateWithMergeFieldsAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Name.Should().Be("Test Invoice Template");
            result.Data.Category.Should().Be("Finance");
            result.Data.MergeFields.Should().NotBeEmpty();
            result.Data.RecordSettings.Should().NotBeNull();
            result.Data.RecordSettings!.IsEnabled.Should().BeTrue();
            result.Data.RecordSettings.RetentionPeriod.Should().Be("5 years");
            result.Data.RecordSettings.Classification.Should().Be("Financial");

            // Verify the document was created
            _mockDocumentRepository.Verify(r => r.CreateDocumentAsync(It.Is<Document>(d => 
                d.Name == request.Name && 
                d.IsTemplate == true &&
                d.Category == request.Category)), Times.Once);
        }

        [Fact]
        public async Task MergeTemplateAsync_WithValidTemplate_ShouldCreateMergedDocument()
        {
            // Arrange
            const int templateId = 1;
            const string documentName = "Merged Invoice";
            const string documentCategory = "Generated";

            var mergeData = new Dictionary<string, object>
            {
                ["CustomerName"] = "John Doe",
                ["InvoiceNumber"] = "INV-001",
                ["TotalAmount"] = 1500.00,
                ["InvoiceDate"] = DateTime.Now
            };

            var templateDocument = new Document
            {
                Id = templateId,
                DocumentId = "template-id",
                Name = "Invoice Template",
                Content = @"{""sfdt"": ""test template with {{< CustomerName >}} and {{< InvoiceNumber >}}""}",
                IsTemplate = true,
                Category = "Finance",
                FileType = "SFDT"
            };

            var createdDocument = new Document
            {
                Id = 2,
                DocumentId = "merged-doc-id",
                Name = documentName,
                Content = @"{""sfdt"": ""test template with John Doe and INV-001""}",
                IsTemplate = false,
                Category = documentCategory,
                CreatedAt = DateTime.UtcNow,
                LastModified = DateTime.UtcNow,
                FileType = "SFDT",
                Size = 100,
                TemplateId = templateId,
                ClassificationPolicy = "Internal",
                RetentionPolicy = "7 years",
                RequiresApproval = false
            };

            _mockDocumentRepository.Setup(r => r.GetDocumentByIdAsync(templateId))
                .ReturnsAsync(templateDocument);
            _mockDocumentRepository.Setup(r => r.CreateDocumentAsync(It.IsAny<Document>()))
                .ReturnsAsync(createdDocument);

            // Act
            var result = await _service.MergeTemplateAsync(templateId, mergeData, documentName, documentCategory);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Name.Should().Be(documentName);
            result.Data.Type.Should().Be("SFDT");

            // Verify template was loaded and document was created
            _mockDocumentRepository.Verify(r => r.GetDocumentByIdAsync(templateId), Times.Once);
            _mockDocumentRepository.Verify(r => r.CreateDocumentAsync(It.Is<Document>(d => 
                d.Name == documentName && 
                d.IsTemplate == false &&
                d.TemplateId == templateId)), Times.Once);
        }

        [Fact]
        public async Task MergeTemplateAsync_WithNonExistentTemplate_ShouldReturnError()
        {
            // Arrange
            const int templateId = 999;
            var mergeData = new Dictionary<string, object> { ["Field1"] = "Value1" };

            _mockDocumentRepository.Setup(r => r.GetDocumentByIdAsync(templateId))
                .ReturnsAsync((Document?)null);

            // Act
            var result = await _service.MergeTemplateAsync(templateId, mergeData, "Test Doc");

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeFalse();
            result.Error.Should().Be("Template not found");
        }

        [Fact]
        public async Task GetTemplateMergeStructureAsync_ShouldReturnEmptyStructure()
        {
            // Arrange
            const int templateId = 1;
            var templateDocument = new Document
            {
                Id = templateId,
                Name = "Test Template",
                Content = @"{""sfdt"": ""template with {{< Field1 >}} and {{< Field2 >}}""}",
                IsTemplate = true
            };

            _mockDocumentRepository.Setup(r => r.GetDocumentByIdAsync(templateId))
                .ReturnsAsync(templateDocument);

            // Act
            var result = await _service.GetTemplateMergeStructureAsync(templateId);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data.Should().BeOfType<Dictionary<string, object>>();
        }

        [Fact]
        public async Task GetTemplateMergeFieldsAsync_ShouldExtractFieldsFromTemplate()
        {
            // Arrange
            const int templateId = 1;
            var templateDocument = new Document
            {
                Id = templateId,
                Name = "Test Template",
                Content = @"{""sfdt"": ""template with {{< CustomerName >}} and {{< InvoiceNumber >}}""}",
                IsTemplate = true,
                Tags = "field:CustomField1,field:CustomField2"
            };

            _mockDocumentRepository.Setup(r => r.GetDocumentByIdAsync(templateId))
                .ReturnsAsync(templateDocument);

            // Act
            var result = await _service.GetTemplateMergeFieldsAsync(templateId);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Should().NotBeEmpty();
        }

        [Theory]
        [InlineData("HR")]
        [InlineData("Invoicing")]
        [InlineData("Maintenance")]
        [InlineData("Contracts")]
        public async Task GetMergeFieldsForCategoryAsync_ShouldReturnCorrectFields(string category)
        {
            // Act
            var result = await _service.GetMergeFieldsForCategoryAsync(category);

            // Assert
            result.Should().NotBeEmpty();
            result.Should().OnlyContain(f => f.Category == category);
        }

        [Fact]
        public async Task ImportBundleAsync_WithValidBundle_ShouldReturnSuccess()
        {
            // Arrange
            const string bundleId = "hr-employee-bundle";
            const int templateId = 1;

            // Act
            var result = await _service.ImportBundleAsync(bundleId, templateId);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Data.Should().BeTrue();
            result.Message.Should().Contain("imported successfully");
        }

        [Fact]
        public async Task ImportBundleAsync_WithInvalidBundle_ShouldReturnError()
        {
            // Arrange
            const string bundleId = "non-existent-bundle";
            const int templateId = 1;

            // Act
            var result = await _service.ImportBundleAsync(bundleId, templateId);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeFalse();
            result.Error.Should().Be("Bundle not found");
        }

        [Fact]
        public async Task GetAvailableCategoriesAsync_ShouldReturnExpectedCategories()
        {
            // Act
            var result = await _service.GetAvailableCategoriesAsync();

            // Assert
            result.Should().NotBeEmpty();
            result.Should().Contain("HR");
            result.Should().Contain("Invoicing");
            result.Should().Contain("Maintenance");
            result.Should().Contain("Contracts");
            result.Should().Contain("General");
        }

        [Fact]
        public void ProcessSfdtMergeFields_ShouldReplacePlaceholders()
        {
            // Arrange
            var sfdtContent = @"{""content"": ""Hello {{< CustomerName >}}, your invoice {{< InvoiceNumber >}} is ready.""}";
            var mergeData = new Dictionary<string, object>
            {
                ["CustomerName"] = "John Doe",
                ["InvoiceNumber"] = "INV-001"
            };

            // Act
            var result = _service.GetType()
                .GetMethod("ProcessSfdtMergeFields", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?
                .Invoke(_service, new object[] { sfdtContent, mergeData }) as string;

            // Assert
            result.Should().NotBeNull();
            result!.Should().Contain("John Doe");
            result.Should().Contain("INV-001");
            result.Should().NotContain("{{< CustomerName >}}");
            result.Should().NotContain("{{< InvoiceNumber >}}");
        }
    }
} 