using SyncfusionDocumentConverter.Models;
using SyncfusionDocumentConverter.DTOs;

namespace SyncfusionDocumentConverter.Services
{
    public interface IDocumentService
    {
        Task<ConversionResponse> ConvertToSfdtAsync(IFormFile file);
        Task<ConversionResponse> ImportDocumentAsync(IFormFile file);
        Task<ApiResponse<DocumentResponse>> SaveDocumentAsync(CreateDocumentRequest request, IFormFile? file = null);
        Task<ApiResponse<IEnumerable<DocumentListResponse>>> GetDocumentsAsync();
        Task<ApiResponse<DocumentResponse>> GetDocumentAsync(string id);
        Task<ApiResponse<IEnumerable<object>>> GetDocumentVersionsAsync(string documentId);
        Task<ApiResponse<DocumentResponse>> GetDocumentVersionAsync(string documentId, int version);
        Task<ApiResponse<object>> PerformMailMergeAsync(IFormFile templateFile, string mergeData, bool removeEmptyParagraphs = true);
        Task<ApiResponse<bool>> DeleteDocumentAsync(string id);
        ApiResponse<object> GetConversionStatus();
        ApiResponse<object> GetCapabilities();
        
        // Direct DOCX handling methods
        Task<ApiResponse<object>> ProcessWordDocumentDirectlyAsync(IFormFile file, string operation = "read");
        Task<ApiResponse<byte[]>> ModifyWordDocumentAsync(IFormFile file, Dictionary<string, string> replacements);
        Task<ApiResponse<byte[]>> CreateWordDocumentFromTemplateAsync(IFormFile templateFile, Dictionary<string, object> data);
    }
} 