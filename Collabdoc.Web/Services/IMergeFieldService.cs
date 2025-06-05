using SyncfusionDocumentConverter.DTOs;
using Collabdoc.Web.Data.Entities;

namespace Collabdoc.Web.Services
{
    public interface IMergeFieldService
    {
        Task<IEnumerable<MergeFieldBundle>> GetAvailableBundlesAsync();
        Task<MergeFieldBundle> GetBundleAsync(string bundleId);
        Task<ApiResponse<bool>> ImportBundleAsync(string bundleId, int templateId);
        Task<IEnumerable<MergeField>> GetMergeFieldsForCategoryAsync(string category);
        Task<ApiResponse<TemplateWithMergeFields>> CreateTemplateWithMergeFieldsAsync(CreateTemplateWithMergeFieldsRequest request);
        Task<ApiResponse<TemplateCreationResult>> UpdateTemplateWithMergeFieldsAsync(int templateId, CreateTemplateWithMergeFieldsRequest request);
        Task<IEnumerable<string>> GetAvailableCategoriesAsync();
        Task<IEnumerable<MergeField>> GetMergeFieldsForBundleAsync(string bundleId);

        // NEW: Template merging methods
        Task<ApiResponse<DocumentInfo>> MergeTemplateAsync(int templateId, Dictionary<string, object> mergeData, string documentName, string? documentCategory = null);
        Task<ApiResponse<Dictionary<string, object>>> GetTemplateMergeStructureAsync(int templateId);
        Task<ApiResponse<List<MergeField>>> GetTemplateMergeFieldsAsync(int templateId);
    }

    public class MergeFieldBundle
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public List<MergeField> Fields { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public string Version { get; set; } = "1.0";
        public bool IsBuiltIn { get; set; } = true;
    }

    public class MergeField
    {
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public MergeFieldType Type { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public string DefaultValue { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new(); // For dropdown/select fields
    }

    public enum MergeFieldType
    {
        Text,
        Number,
        Date,
        Currency,
        Boolean,
        Email,
        Phone,
        Address,
        Select,
        Image
    }

    public class CreateTemplateWithMergeFieldsRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<string> SelectedBundles { get; set; } = new();
        public List<MergeField> CustomFields { get; set; } = new();
        public List<MergeField> MergeFields { get; set; } = new();
        public bool IncludeRecordManagement { get; set; }
        public string RecordRetentionPeriod { get; set; } = string.Empty;
        public string RecordClassification { get; set; } = string.Empty;
    }

    public class TemplateWithMergeFields
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public List<MergeField> MergeFields { get; set; } = new();
        public RecordManagementSettings? RecordSettings { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RecordManagementSettings
    {
        public bool IsEnabled { get; set; }
        public string RetentionPeriod { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
        public bool RequireApproval { get; set; }
        public List<string> ApprovalWorkflow { get; set; } = new();
        public bool TrackVersions { get; set; } = true;
        public bool ArchiveOnExpiry { get; set; } = true;
    }

    public class TemplateCreationResult
    {
        public string TemplateId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int FieldCount { get; set; }
    }
} 