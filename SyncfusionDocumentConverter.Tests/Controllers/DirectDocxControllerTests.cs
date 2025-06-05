using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using SyncfusionDocumentConverter.Services;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Xunit;

namespace SyncfusionDocumentConverter.Tests.Controllers
{
    public class DirectDocxControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public DirectDocxControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Override services for testing if needed
                    services.AddScoped<DirectDocxService>();
                });
            });
            _client = _factory.CreateClient();
        }

        #region GET /api/DirectDocx/demo Tests

        [Fact]
        public async Task RunDemo_ShouldReturnOk_WithDemoResults()
        {
            // Act
            var response = await _client.GetAsync("/api/DirectDocx/demo");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
            
            var jsonDocument = JsonDocument.Parse(content);
            jsonDocument.RootElement.GetProperty("message").GetString()
                .Should().Contain("Direct DOCX handling demonstration completed successfully");
        }

        #endregion

        #region POST /api/DirectDocx/create Tests

        [Fact]
        public async Task CreateDocument_ShouldReturnFile_WithCorrectContentType()
        {
            // Act
            var response = await _client.PostAsync("/api/DirectDocx/create", null);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Headers.ContentType?.MediaType
                .Should().Be("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            
            var content = await response.Content.ReadAsByteArrayAsync();
            content.Length.Should().BeGreaterThan(0);
            
            // Verify it's a valid DOCX file (starts with PK signature)
            content.Take(2).Should().BeEquivalentTo(new byte[] { 0x50, 0x4B });
        }

        #endregion

        #region POST /api/DirectDocx/modify Tests

        [Fact]
        public async Task ModifyDocument_ShouldReturnModifiedFile_WithValidInputs()
        {
            // Arrange
            var createResponse = await _client.PostAsync("/api/DirectDocx/create", null);
            var originalDocument = await createResponse.Content.ReadAsByteArrayAsync();
            
            var formData = new MultipartFormDataContent();
            formData.Add(new ByteArrayContent(originalDocument), "file", "test.docx");
            
            var replacements = new Dictionary<string, string>
            {
                { "Hello from Direct DocIO!", "Modified Text!" }
            };
            formData.Add(new StringContent(JsonSerializer.Serialize(replacements)), "replacements");

            // Act
            var response = await _client.PostAsync("/api/DirectDocx/modify", formData);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Headers.ContentType?.MediaType
                .Should().Be("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            
            var modifiedContent = await response.Content.ReadAsByteArrayAsync();
            modifiedContent.Length.Should().BeGreaterThan(0);
            modifiedContent.Should().NotBeEquivalentTo(originalDocument);
        }

        [Fact]
        public async Task ModifyDocument_ShouldReturnBadRequest_WithNoFile()
        {
            // Arrange
            var formData = new MultipartFormDataContent();
            var replacements = new Dictionary<string, string> { { "test", "replacement" } };
            formData.Add(new StringContent(JsonSerializer.Serialize(replacements)), "replacements");

            // Act
            var response = await _client.PostAsync("/api/DirectDocx/modify", formData);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            jsonDocument.RootElement.GetProperty("error").GetString()
                .Should().Be("No file provided");
        }

        [Fact]
        public async Task ModifyDocument_ShouldReturnBadRequest_WithNoReplacements()
        {
            // Arrange
            var createResponse = await _client.PostAsync("/api/DirectDocx/create", null);
            var originalDocument = await createResponse.Content.ReadAsByteArrayAsync();
            
            var formData = new MultipartFormDataContent();
            formData.Add(new ByteArrayContent(originalDocument), "file", "test.docx");

            // Act
            var response = await _client.PostAsync("/api/DirectDocx/modify", formData);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            jsonDocument.RootElement.GetProperty("error").GetString()
                .Should().Be("No replacements provided");
        }

        [Fact]
        public async Task ModifyDocument_ShouldReturnBadRequest_WithInvalidReplacementsJson()
        {
            // Arrange
            var createResponse = await _client.PostAsync("/api/DirectDocx/create", null);
            var originalDocument = await createResponse.Content.ReadAsByteArrayAsync();
            
            var formData = new MultipartFormDataContent();
            formData.Add(new ByteArrayContent(originalDocument), "file", "test.docx");
            formData.Add(new StringContent("invalid json"), "replacements");

            // Act
            var response = await _client.PostAsync("/api/DirectDocx/modify", formData);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            jsonDocument.RootElement.GetProperty("error").GetString()
                .Should().Be("Invalid JSON format for replacements");
        }

        #endregion

        #region POST /api/DirectDocx/extract-text Tests

        [Fact]
        public async Task ExtractText_ShouldReturnTextData_WithValidDocument()
        {
            // Arrange
            var createResponse = await _client.PostAsync("/api/DirectDocx/create", null);
            var document = await createResponse.Content.ReadAsByteArrayAsync();
            
            var formData = new MultipartFormDataContent();
            formData.Add(new ByteArrayContent(document), "file", "test.docx");

            // Act
            var response = await _client.PostAsync("/api/DirectDocx/extract-text", formData);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            
            jsonDocument.RootElement.TryGetProperty("textContent", out var textContent).Should().BeTrue();
            textContent.TryGetProperty("wordCount", out var wordCount).Should().BeTrue();
            wordCount.GetInt32().Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task ExtractText_ShouldReturnBadRequest_WithNoFileAndNoDemoDocument()
        {
            // Act
            var response = await _client.PostAsync("/api/DirectDocx/extract-text", null);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            jsonDocument.RootElement.GetProperty("error").GetString()
                .Should().Be("No document provided and demo document not found");
        }

        #endregion

        #region POST /api/DirectDocx/analyze Tests

        [Fact]
        public async Task AnalyzeDocument_ShouldReturnAnalysisData_WithValidDocument()
        {
            // Arrange
            var createResponse = await _client.PostAsync("/api/DirectDocx/create", null);
            var document = await createResponse.Content.ReadAsByteArrayAsync();
            
            var formData = new MultipartFormDataContent();
            formData.Add(new ByteArrayContent(document), "file", "test.docx");

            // Act
            var response = await _client.PostAsync("/api/DirectDocx/analyze", formData);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            
            jsonDocument.RootElement.GetProperty("success").GetBoolean().Should().BeTrue();
            jsonDocument.RootElement.TryGetProperty("analysis", out var analysis).Should().BeTrue();
            jsonDocument.RootElement.GetProperty("message").GetString()
                .Should().Be("Document analysis completed successfully");
        }

        [Fact]
        public async Task AnalyzeDocument_ShouldReturnBadRequest_WithNoFile()
        {
            // Act
            var response = await _client.PostAsync("/api/DirectDocx/analyze", null);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            jsonDocument.RootElement.GetProperty("error").GetString()
                .Should().Be("No file provided");
        }

        #endregion

        #region GET /api/DirectDocx/capabilities Tests

        [Fact]
        public async Task GetCapabilities_ShouldReturnCapabilitiesData()
        {
            // Act
            var response = await _client.GetAsync("/api/DirectDocx/capabilities");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            
            jsonDocument.RootElement.TryGetProperty("supportedOperations", out var operations).Should().BeTrue();
            operations.GetArrayLength().Should().BeGreaterThan(0);
            
            jsonDocument.RootElement.TryGetProperty("supportedFormats", out var formats).Should().BeTrue();
            formats.GetArrayLength().Should().BeGreaterThan(0);
            
            jsonDocument.RootElement.TryGetProperty("features", out var features).Should().BeTrue();
            features.GetArrayLength().Should().BeGreaterThan(0);
        }

        #endregion

        #region GET /api/DirectDocx/health Tests

        [Fact]
        public async Task Health_ShouldReturnHealthStatus()
        {
            // Act
            var response = await _client.GetAsync("/api/DirectDocx/health");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(content);
            
            jsonDocument.RootElement.GetProperty("status").GetString().Should().Be("UP");
            jsonDocument.RootElement.GetProperty("service").GetString().Should().Be("Direct DOCX Service");
            jsonDocument.RootElement.GetProperty("version").GetString().Should().Be("1.0.0");
            
            jsonDocument.RootElement.TryGetProperty("capabilities", out var capabilities).Should().BeTrue();
            capabilities.GetArrayLength().Should().BeGreaterThan(0);
        }

        #endregion
    }

    #region Custom WebApplicationFactory for Testing

    public class TestWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Add test-specific service configurations
                services.AddScoped<DirectDocxService>();
                
                // Mock external dependencies if needed
                var mockLogger = new Mock<ILogger<DirectDocxService>>();
                services.AddSingleton(mockLogger.Object);
            });
        }
    }

    #endregion
} 