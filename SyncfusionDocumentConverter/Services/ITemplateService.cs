using SyncfusionDocumentConverter.DTOs;

namespace SyncfusionDocumentConverter.Services
{
    public interface ITemplateService
    {
        Task<ApiResponse<IEnumerable<TemplateResponse>>> GetTemplatesAsync();
        Task<ApiResponse<TemplateResponse>> GetTemplateAsync(int id);
        Task<ApiResponse<TemplateResponse>> CreateTemplateAsync(CreateTemplateRequest request, IFormFile? templateFile = null);
        Task<ApiResponse<TemplateResponse>> UpdateTemplateAsync(int id, UpdateTemplateRequest request, IFormFile? templateFile = null);
        Task<ApiResponse<bool>> DeleteTemplateAsync(int id);
        Task<ApiResponse<DocumentResponse>> PerformMailMergeAsync(int templateId, MailMergeRequest request);
        Task<ApiResponse<IEnumerable<string>>> GetTemplateMergeFieldsAsync(int templateId);
        Task<ApiResponse<DocumentResponse>> CreateDocumentFromTemplateAsync(int templateId, CreateDocumentFromTemplateRequest request);
        Task<IEnumerable<string>> GetTemplateCategoriesAsync();
    }
} 