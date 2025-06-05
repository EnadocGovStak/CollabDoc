using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using SyncfusionDocumentConverter.Services;
using System.Diagnostics;
using Xunit;
using Xunit.Abstractions;

namespace SyncfusionDocumentConverter.Tests.Performance
{
    public class DirectDocxPerformanceTests
    {
        private readonly ITestOutputHelper _output;
        private readonly DirectDocxService _service;

        public DirectDocxPerformanceTests(ITestOutputHelper output)
        {
            _output = output;
            var mockLogger = new Mock<ILogger<DirectDocxService>>();
            _service = new DirectDocxService(mockLogger.Object);
        }

        [Fact]
        public async Task CreateNewDocument_ShouldCompleteWithin_AcceptableTimeLimit()
        {
            // Arrange
            const int maxExecutionTimeMs = 5000; // 5 seconds
            var stopwatch = Stopwatch.StartNew();

            // Act
            var result = await _service.CreateNewDocumentAsync();

            // Assert
            stopwatch.Stop();
            _output.WriteLine($"Document creation took: {stopwatch.ElapsedMilliseconds}ms");
            
            result.Success.Should().BeTrue();
            stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxExecutionTimeMs);
        }

        [Fact]
        public async Task ModifyDocument_ShouldCompleteWithin_AcceptableTimeLimit()
        {
            // Arrange
            const int maxExecutionTimeMs = 3000; // 3 seconds
            var originalDocument = await _service.CreateNewDocumentAsync();
            var formFile = TestHelpers.CreateMockFormFile(originalDocument.Data!, "test.docx");
            var replacements = new Dictionary<string, string>
            {
                { "Hello from Direct DocIO!", "Modified Text!" },
                { "Key advantages:", "Updated advantages:" }
            };

            var stopwatch = Stopwatch.StartNew();

            // Act
            var result = await _service.ModifyWordDocumentAsync(formFile, replacements);

            // Assert
            stopwatch.Stop();
            _output.WriteLine($"Document modification took: {stopwatch.ElapsedMilliseconds}ms");
            
            result.Success.Should().BeTrue();
            stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxExecutionTimeMs);
        }

        [Fact]
        public async Task ExtractText_ShouldCompleteWithin_AcceptableTimeLimit()
        {
            // Arrange
            const int maxExecutionTimeMs = 2000; // 2 seconds
            var originalDocument = await _service.CreateNewDocumentAsync();
            var formFile = TestHelpers.CreateMockFormFile(originalDocument.Data!, "test.docx");

            var stopwatch = Stopwatch.StartNew();

            // Act
            var result = await _service.ExtractTextFromDocumentAsync(formFile);

            // Assert
            stopwatch.Stop();
            _output.WriteLine($"Text extraction took: {stopwatch.ElapsedMilliseconds}ms");
            
            result.Success.Should().BeTrue();
            stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxExecutionTimeMs);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(5)]
        [InlineData(10)]
        public async Task CreateMultipleDocuments_ShouldMaintain_ConsistentPerformance(int documentCount)
        {
            // Arrange
            var executionTimes = new List<long>();
            const int maxAverageTimeMs = 3000; // 3 seconds average

            // Act
            for (int i = 0; i < documentCount; i++)
            {
                var stopwatch = Stopwatch.StartNew();
                var result = await _service.CreateNewDocumentAsync();
                stopwatch.Stop();

                result.Success.Should().BeTrue();
                executionTimes.Add(stopwatch.ElapsedMilliseconds);
            }

            // Assert
            var averageTime = executionTimes.Average();
            var maxTime = executionTimes.Max();
            var minTime = executionTimes.Min();

            _output.WriteLine($"Created {documentCount} documents:");
            _output.WriteLine($"  Average time: {averageTime:F2}ms");
            _output.WriteLine($"  Min time: {minTime}ms");
            _output.WriteLine($"  Max time: {maxTime}ms");

            averageTime.Should().BeLessThan(maxAverageTimeMs);
        }

        [Fact]
        public async Task LargeDocumentModification_ShouldCompleteWithin_AcceptableTimeLimit()
        {
            // Arrange
            const int maxExecutionTimeMs = 10000; // 10 seconds for large document
            var originalDocument = await _service.CreateNewDocumentAsync();
            
            // Create a large number of replacements to simulate complex modification
            var replacements = new Dictionary<string, string>();
            for (int i = 0; i < 100; i++)
            {
                replacements[$"placeholder_{i}"] = $"replacement_value_{i}";
            }

            var formFile = TestHelpers.CreateMockFormFile(originalDocument.Data!, "large_test.docx");
            var stopwatch = Stopwatch.StartNew();

            // Act
            var result = await _service.ModifyWordDocumentAsync(formFile, replacements);

            // Assert
            stopwatch.Stop();
            _output.WriteLine($"Large document modification took: {stopwatch.ElapsedMilliseconds}ms");
            _output.WriteLine($"Processed {replacements.Count} replacements");
            
            result.Success.Should().BeTrue();
            stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxExecutionTimeMs);
        }

        [Fact]
        public async Task ConcurrentDocumentOperations_ShouldMaintain_AcceptablePerformance()
        {
            // Arrange
            const int concurrentOperations = 5;
            const int maxExecutionTimeMs = 15000; // 15 seconds for concurrent operations
            var stopwatch = Stopwatch.StartNew();

            // Act
            var tasks = Enumerable.Range(0, concurrentOperations)
                .Select(async i =>
                {
                    var createResult = await _service.CreateNewDocumentAsync();
                    var formFile = TestHelpers.CreateMockFormFile(createResult.Data!, $"concurrent_test_{i}.docx");
                    var replacements = new Dictionary<string, string>
                    {
                        { "Hello from Direct DocIO!", $"Modified Text {i}!" }
                    };
                    var modifyResult = await _service.ModifyWordDocumentAsync(formFile, replacements);
                    var extractResult = await _service.ExtractTextFromDocumentAsync(formFile);

                    return new { createResult, modifyResult, extractResult };
                });

            var results = await Task.WhenAll(tasks);

            // Assert
            stopwatch.Stop();
            _output.WriteLine($"Concurrent operations ({concurrentOperations}) took: {stopwatch.ElapsedMilliseconds}ms");
            
            results.Should().HaveCount(concurrentOperations);
            results.Should().OnlyContain(r => r.createResult.Success && r.modifyResult.Success && r.extractResult.Success);
            stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxExecutionTimeMs);
        }

        [Fact]
        public void GetCapabilities_ShouldCompleteWithin_AcceptableTimeLimit()
        {
            // Arrange
            const int maxExecutionTimeMs = 100; // 100ms for simple operation
            var stopwatch = Stopwatch.StartNew();

            // Act
            var result = _service.GetCapabilities();

            // Assert
            stopwatch.Stop();
            _output.WriteLine($"Get capabilities took: {stopwatch.ElapsedMilliseconds}ms");
            
            result.Success.Should().BeTrue();
            stopwatch.ElapsedMilliseconds.Should().BeLessThan(maxExecutionTimeMs);
        }
    }

    public static class TestHelpers
    {
        public static Microsoft.AspNetCore.Http.IFormFile CreateMockFormFile(byte[] content, string fileName)
        {
            var stream = new MemoryStream(content);
            return new Microsoft.AspNetCore.Http.FormFile(stream, 0, content.Length, "file", fileName)
            {
                Headers = new Microsoft.AspNetCore.Http.HeaderDictionary(),
                ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            };
        }
    }
} 