using Collabdoc.Web.Data.Entities;
using Collabdoc.Web.Services;

namespace Collabdoc.Web.Tests.TestData
{
    public static class TestDataHelper
    {
        public static Document CreateSampleTemplate(int id = 1, string name = "Test Template")
        {
            return new Document
            {
                Id = id,
                DocumentId = $"template-{id}",
                Name = name,
                Description = $"Test template: {name}",
                Category = "Test",
                IsTemplate = true,
                Content = @"{""sfdt"": ""Sample template with {{< Field1 >}} and {{< Field2 >}}""}",
                ClassificationPolicy = "Internal",
                RetentionPolicy = "5 years",
                RequiresApproval = false,
                FileType = "SFDT",
                Size = 500,
                Status = "Active",
                CreatedBy = "test-user",
                CreatedAt = DateTime.UtcNow,
                LastModified = DateTime.UtcNow,
                Version = 1,
                IsPublic = true
            };
        }

        public static Document CreateMergedDocument(int id, int templateId, string name = "Merged Document")
        {
            return new Document
            {
                Id = id,
                DocumentId = $"doc-{id}",
                Name = name,
                Description = $"Document created from template {templateId}",
                Category = "Generated",
                IsTemplate = false,
                TemplateId = templateId,
                Content = @"{""sfdt"": ""Merged document content""}",
                ClassificationPolicy = "Internal",
                RetentionPolicy = "5 years",
                RequiresApproval = false,
                ExpiryDate = DateTime.UtcNow.AddYears(5),
                FileType = "SFDT",
                Size = 750,
                Status = "Active",
                CreatedBy = "test-user",
                CreatedAt = DateTime.UtcNow,
                LastModified = DateTime.UtcNow,
                Version = 1,
                IsPublic = true
            };
        }

        public static CreateTemplateWithMergeFieldsRequest CreateSampleTemplateRequest(string name = "Sample Template")
        {
            return new CreateTemplateWithMergeFieldsRequest
            {
                Name = name,
                Description = $"Test template: {name}",
                Category = "Test",
                Content = @"{""sfdt"": ""Template content with merge fields""}",
                SelectedBundles = new List<string> { "hr-employee-bundle" },
                CustomFields = new List<MergeField>
                {
                    new() { Name = "CustomField1", DisplayName = "Custom Field 1", Type = MergeFieldType.Text, IsRequired = true },
                    new() { Name = "CustomField2", DisplayName = "Custom Field 2", Type = MergeFieldType.Date, IsRequired = false }
                },
                IncludeRecordManagement = true,
                RecordRetentionPeriod = "5 years",
                RecordClassification = "Internal"
            };
        }

        public static Dictionary<string, object> CreateSampleMergeData()
        {
            return new Dictionary<string, object>
            {
                ["FirstName"] = "John",
                ["LastName"] = "Doe",
                ["EmployeeId"] = "EMP-001",
                ["Email"] = "john.doe@company.com",
                ["Department"] = "IT",
                ["Position"] = "Software Developer",
                ["HireDate"] = DateTime.Parse("2024-01-15"),
                ["Salary"] = 75000.00,
                ["Manager"] = "Jane Smith",
                ["CustomField1"] = "Custom Value 1",
                ["CustomField2"] = DateTime.Parse("2024-02-01")
            };
        }

        public static Dictionary<string, object> CreateInvoiceMergeData()
        {
            return new Dictionary<string, object>
            {
                ["InvoiceNumber"] = "INV-2024-001",
                ["InvoiceDate"] = DateTime.Parse("2024-01-15"),
                ["DueDate"] = DateTime.Parse("2024-02-15"),
                ["CustomerName"] = "Acme Corporation",
                ["CustomerEmail"] = "billing@acme.com",
                ["BillingAddress"] = "123 Business St\nCorporate City, CC 12345",
                ["SubTotal"] = 2000.00,
                ["TaxAmount"] = 200.00,
                ["TotalAmount"] = 2200.00,
                ["PaymentTerms"] = "Net 30",
                ["TaxId"] = "TAX123456789"
            };
        }

        public static Dictionary<string, object> CreateContractMergeData()
        {
            return new Dictionary<string, object>
            {
                ["ContractNumber"] = "CONT-2024-001",
                ["ContractTitle"] = "Software Development Agreement",
                ["PartyA"] = "Acme Corporation",
                ["PartyB"] = "Dev Solutions LLC",
                ["StartDate"] = DateTime.Parse("2024-02-01"),
                ["EndDate"] = DateTime.Parse("2025-01-31"),
                ["ContractValue"] = 50000.00,
                ["PaymentSchedule"] = "Monthly",
                ["GoverningLaw"] = "State of California",
                ["SigningDate"] = DateTime.Parse("2024-01-20")
            };
        }

        public static List<MergeField> CreateSampleMergeFields()
        {
            return new List<MergeField>
            {
                new() { Name = "FirstName", DisplayName = "First Name", Type = MergeFieldType.Text, Category = "Personal", IsRequired = true },
                new() { Name = "LastName", DisplayName = "Last Name", Type = MergeFieldType.Text, Category = "Personal", IsRequired = true },
                new() { Name = "Email", DisplayName = "Email Address", Type = MergeFieldType.Email, Category = "Contact", IsRequired = true },
                new() { Name = "Phone", DisplayName = "Phone Number", Type = MergeFieldType.Phone, Category = "Contact", IsRequired = false },
                new() { Name = "HireDate", DisplayName = "Hire Date", Type = MergeFieldType.Date, Category = "Employment", IsRequired = true },
                new() { Name = "Salary", DisplayName = "Annual Salary", Type = MergeFieldType.Currency, Category = "Employment", IsRequired = false },
                new() { Name = "Department", DisplayName = "Department", Type = MergeFieldType.Select, Category = "Employment", 
                  Options = new List<string> { "IT", "HR", "Finance", "Marketing", "Operations" }, IsRequired = true },
                new() { Name = "IsFullTime", DisplayName = "Full Time Employee", Type = MergeFieldType.Boolean, Category = "Employment", IsRequired = false },
                new() { Name = "Address", DisplayName = "Home Address", Type = MergeFieldType.Address, Category = "Personal", IsRequired = false }
            };
        }

        public static TemplateWithMergeFields CreateSampleTemplateWithMergeFields(int id = 1)
        {
            return new TemplateWithMergeFields
            {
                Id = id,
                Name = "Sample Template with Fields",
                Description = "A sample template for testing",
                Category = "Test",
                MergeFields = CreateSampleMergeFields(),
                RecordSettings = new RecordManagementSettings
                {
                    IsEnabled = true,
                    RetentionPeriod = "5 years",
                    Classification = "Internal",
                    RequireApproval = false,
                    TrackVersions = true,
                    ArchiveOnExpiry = true
                },
                CreatedAt = DateTime.UtcNow
            };
        }

        public static DocumentInfo CreateSampleDocumentInfo(int id = 1, string name = "Test Document")
        {
            return new DocumentInfo
            {
                Id = id,
                DocumentId = $"doc-{id}",
                Name = name,
                Type = "SFDT",
                Size = 1024,
                CreatedAt = DateTime.UtcNow,
                LastModified = DateTime.UtcNow,
                CreatedBy = "test-user",
                Status = "Active"
            };
        }

        public static string CreateSampleSfdtContent(Dictionary<string, object>? mergeData = null)
        {
            var content = @"{
                ""sfdt"": ""Sample SFDT document with {{< FirstName >}} {{< LastName >}} from {{< Department >}} department.""
            }";

            if (mergeData != null)
            {
                foreach (var kvp in mergeData)
                {
                    var placeholder = $"{{{{< {kvp.Key} >}}}}";
                    content = content.Replace(placeholder, kvp.Value?.ToString() ?? "");
                }
            }

            return content;
        }

        /// <summary>
        /// Creates test scenarios for various classification policies and their expected behaviors
        /// </summary>
        public static IEnumerable<object[]> GetClassificationTestData()
        {
            yield return new object[] { "Public", false, "3 years" };
            yield return new object[] { "Internal", false, "5 years" };
            yield return new object[] { "Confidential", true, "7 years" };
            yield return new object[] { "Restricted", true, "10 years" };
        }

        /// <summary>
        /// Creates test scenarios for merge field validation
        /// </summary>
        public static IEnumerable<object[]> GetMergeFieldValidationTestData()
        {
            yield return new object[] { MergeFieldType.Text, "John Doe", true };
            yield return new object[] { MergeFieldType.Text, "", false };
            yield return new object[] { MergeFieldType.Email, "john@example.com", true };
            yield return new object[] { MergeFieldType.Email, "invalid-email", false };
            yield return new object[] { MergeFieldType.Number, 123.45, true };
            yield return new object[] { MergeFieldType.Number, "not-a-number", false };
            yield return new object[] { MergeFieldType.Date, "2024-01-15", true };
            yield return new object[] { MergeFieldType.Date, "invalid-date", false };
        }
    }
} 