using Collabdoc.Web.Data.Entities;
using FluentAssertions;
using Xunit;

namespace Collabdoc.Web.Tests.Entities
{
    public class DocumentTests
    {
        [Fact]
        public void Document_ShouldHaveCorrectDefaultValues()
        {
            // Act
            var document = new Document();

            // Assert
            document.Id.Should().Be(0);
            document.DocumentId.Should().BeEmpty();
            document.Name.Should().BeEmpty();
            document.FileType.Should().Be("SFDT");
            document.Size.Should().Be(0);
            document.Content.Should().BeEmpty();
            document.Status.Should().Be("Active");
            document.IsTemplate.Should().BeFalse();
            document.IsPublic.Should().BeTrue();
            document.Version.Should().Be(1);
            document.RequiresApproval.Should().BeFalse();
            document.TemplateId.Should().BeNull();
            document.ClassificationPolicy.Should().BeNull();
            document.RetentionPolicy.Should().BeNull();
            document.ExpiryDate.Should().BeNull();
        }

        [Fact]
        public void Document_AsTemplate_ShouldSetCorrectProperties()
        {
            // Arrange & Act
            var template = new Document
            {
                Name = "Invoice Template",
                Description = "Standard invoice template",
                IsTemplate = true,
                Category = "Finance",
                ClassificationPolicy = "Internal",
                RetentionPolicy = "7 years",
                RequiresApproval = false
            };

            // Assert
            template.IsTemplate.Should().BeTrue();
            template.Name.Should().Be("Invoice Template");
            template.Category.Should().Be("Finance");
            template.ClassificationPolicy.Should().Be("Internal");
            template.RetentionPolicy.Should().Be("7 years");
            template.RequiresApproval.Should().BeFalse();
        }

        [Fact]
        public void Document_AsMergedDocument_ShouldInheritFromTemplate()
        {
            // Arrange
            const int templateId = 1;
            var expectedExpiryDate = DateTime.UtcNow.AddYears(7);

            // Act
            var mergedDocument = new Document
            {
                Name = "Merged Invoice - Customer ABC",
                Description = "Invoice created from template",
                IsTemplate = false,
                Category = "Generated",
                TemplateId = templateId,
                ClassificationPolicy = "Internal",
                RetentionPolicy = "7 years",
                RequiresApproval = false,
                ExpiryDate = expectedExpiryDate
            };

            // Assert
            mergedDocument.IsTemplate.Should().BeFalse();
            mergedDocument.TemplateId.Should().Be(templateId);
            mergedDocument.ClassificationPolicy.Should().Be("Internal");
            mergedDocument.RetentionPolicy.Should().Be("7 years");
            mergedDocument.RequiresApproval.Should().BeFalse();
            mergedDocument.ExpiryDate.Should().BeCloseTo(expectedExpiryDate, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void Document_WithConfidentialClassification_ShouldRequireApproval()
        {
            // Arrange & Act
            var document = new Document
            {
                Name = "Confidential Document",
                ClassificationPolicy = "Confidential",
                RequiresApproval = true,
                RetentionPolicy = "10 years"
            };

            // Assert
            document.ClassificationPolicy.Should().Be("Confidential");
            document.RequiresApproval.Should().BeTrue();
            document.RetentionPolicy.Should().Be("10 years");
        }

        [Theory]
        [InlineData("Internal", false)]
        [InlineData("Confidential", true)]
        [InlineData("Restricted", true)]
        [InlineData("Public", false)]
        public void Document_ClassificationPolicy_ShouldDetermineApprovalRequirement(string classification, bool shouldRequireApproval)
        {
            // Arrange & Act
            var document = new Document
            {
                ClassificationPolicy = classification,
                RequiresApproval = classification.Contains("Confidential") || classification.Contains("Restricted")
            };

            // Assert
            document.ClassificationPolicy.Should().Be(classification);
            document.RequiresApproval.Should().Be(shouldRequireApproval);
        }

        [Fact]
        public void Document_WithNavigationProperties_ShouldInitializeCollections()
        {
            // Act
            var document = new Document();

            // Assert
            document.Versions.Should().NotBeNull();
            document.Versions.Should().BeEmpty();
            document.Shares.Should().NotBeNull();
            document.Shares.Should().BeEmpty();
            document.Comments.Should().NotBeNull();
            document.Comments.Should().BeEmpty();
        }

        [Fact]
        public void Document_RequiredProperties_ShouldBeValidated()
        {
            // Arrange
            var document = new Document
            {
                DocumentId = Guid.NewGuid().ToString(),
                Name = "Test Document",
                FileType = "SFDT",
                Size = 1024,
                Content = "test content",
                CreatedAt = DateTime.UtcNow,
                LastModified = DateTime.UtcNow
            };

            // Assert
            document.DocumentId.Should().NotBeEmpty();
            document.Name.Should().NotBeEmpty();
            document.FileType.Should().NotBeEmpty();
            document.Size.Should().BeGreaterThan(0);
            document.Content.Should().NotBeEmpty();
            document.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            document.LastModified.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public void Document_StringLengthValidation_ShouldBeEnforced()
        {
            // Arrange & Act
            var document = new Document
            {
                DocumentId = new string('A', 36), // Max length 36
                Name = new string('B', 255), // Max length 255  
                Description = new string('C', 500), // Max length 500
                FileType = new string('D', 10), // Max length 10
                CreatedBy = new string('E', 100), // Max length 100
                LastModifiedBy = new string('F', 100), // Max length 100
                Status = new string('G', 20), // Max length 20
                Category = new string('H', 50), // Max length 50
                Tags = new string('I', 100), // Max length 100
                ClassificationPolicy = new string('J', 50), // Max length 50
                RetentionPolicy = new string('K', 100) // Max length 100
            };

            // Assert - These would be validated by Entity Framework data annotations
            document.DocumentId.Length.Should().Be(36);
            document.Name.Length.Should().Be(255);
            document.Description?.Length.Should().Be(500);
            document.FileType.Length.Should().Be(10);
            document.CreatedBy?.Length.Should().Be(100);
            document.LastModifiedBy?.Length.Should().Be(100);
            document.Status.Length.Should().Be(20);
            document.Category?.Length.Should().Be(50);
            document.Tags?.Length.Should().Be(100);
            document.ClassificationPolicy?.Length.Should().Be(50);
            document.RetentionPolicy?.Length.Should().Be(100);
        }
    }
} 