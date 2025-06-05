# Implementation Instructions - Collabdoc Platform

**Version**: 3.0 (Updated with Template Merging Scenarios)  
**Current Status**: 70% Complete - Production Ready for Core Features  
**Last Updated**: January 2025

---

## 📊 **ACCURATE CURRENT STATUS**

### ✅ **FULLY IMPLEMENTED & WORKING** 
- 📝 **Document Editor**: Complete Syncfusion DocumentEditor integration (620+ lines)
- 🗄️ **Database Layer**: Full Entity Framework setup with SQLite
- 🎨 **Template Management**: Comprehensive UI with visual editor (4 pages, 2000+ lines)
- 🔧 **Service Layer**: Complete business logic services (3000+ lines)
- 💾 **Document Storage**: Database + file system persistence
- 🖥️ **Professional UI**: Modern Blazor interface with navigation
- 📁 **File Operations**: Upload, download, DOCX/SFDT conversion
- 🔀 **Merge Field System**: Complete merge field bundles and custom fields (537+ lines)

### 🔄 **NEW REQUIREMENTS - TEMPLATE MERGING SCENARIOS**

#### **🎯 Scenario 1: UI-Based Template Merging**
**Current Status**: ❌ **NOT IMPLEMENTED**
1. ✅ User creates template with fields ← **DONE**
2. ✅ User saves template ← **DONE**  
3. ❌ **MISSING**: "Use" button shows modal form to fill required fields
4. ❌ **MISSING**: Template merging with user data
5. ❌ **MISSING**: Create new document from merged template
6. ❌ **MISSING**: Save merged document to documents library
7. ❌ **MISSING**: Inherit classification policy from template

#### **🎯 Scenario 2: API-Based Template Merging**
**Current Status**: 🔄 **PARTIALLY IMPLEMENTED**
1. ✅ External consumers can retrieve templates ← **API EXISTS**
2. ❌ **MISSING**: Return empty JSON payload with placeholders
3. ❌ **MISSING**: Merge request with completed JSON payload
4. ❌ **MISSING**: Direct merge request without asking
5. ❌ **MISSING**: Option to save document OR return as payload

---

## 🚧 **IMPLEMENTATION PLAN**

### **Phase 1: UI-Based Template Merging (Priority 1)**

#### **Step 1.1: Create Template Merge Modal Component**
```csharp
// Create: Collabdoc.Web/Components/TemplateMergeModal.razor
public class TemplateMergeModal
{
    [Parameter] public int TemplateId { get; set; }
    [Parameter] public List<MergeField> MergeFields { get; set; }
    [Parameter] public EventCallback<Dictionary<string, object>> OnMergeCompleted { get; set; }
    
    private Dictionary<string, object> mergeData = new();
    
    // Dynamic form generation based on MergeField types
    // Validation for required fields
    // Type-specific input controls (date picker, currency, etc.)
}
```

#### **Step 1.2: Extend MergeFieldService for Document Generation**
```csharp
// Add to: Collabdoc.Web/Services/IMergeFieldService.cs
Task<ApiResponse<DocumentInfo>> MergeTemplateAsync(int templateId, Dictionary<string, object> mergeData, string documentName);
Task<ApiResponse<Dictionary<string, object>>> GetTemplateMergeStructureAsync(int templateId);

// Add to: Collabdoc.Web/Services/MergeFieldService.cs
public async Task<ApiResponse<DocumentInfo>> MergeTemplateAsync(int templateId, Dictionary<string, object> mergeData, string documentName)
{
    // 1. Load template from database
    // 2. Replace merge field placeholders with actual data
    // 3. Create new document entity
    // 4. Inherit classification from template
    // 5. Save to documents library
    // 6. Return document info
}
```

#### **Step 1.3: Update Templates/Index.razor UseTemplate Method**
```csharp
private async Task UseTemplate(int templateId)
{
    // 1. Load template merge fields
    var mergeStructure = await MergeFieldService.GetTemplateMergeStructureAsync(templateId);
    
    // 2. Show modal with merge fields form
    if (mergeStructure.Success && mergeStructure.Data.Any())
    {
        await ShowTemplateMergeModal(templateId, mergeStructure.Data);
    }
    else
    {
        // No merge fields - direct copy
        await CreateDocumentFromTemplate(templateId);
    }
}
```

### **Phase 2: API-Based Template Merging (Priority 2)**

#### **Step 2.1: Implement TemplateService (MISSING)**
```csharp
// Create: SyncfusionDocumentConverter/Services/TemplateService.cs
public class TemplateService : ITemplateService
{
    // Implement all methods from ITemplateService interface
    // Focus on PerformMailMergeAsync and GetTemplateMergeFieldsAsync
}

// Register in Program.cs:
services.AddScoped<ITemplateService, TemplateService>();
```

#### **Step 2.2: Enhanced Template API Endpoints**
```csharp
// Add to: SyncfusionDocumentConverter/Controllers/TemplatesController.cs

[HttpGet("{id}/merge-structure")]
public async Task<IActionResult> GetTemplateMergeStructure(int id)
{
    // Return empty JSON structure with field types and validation rules
}

[HttpPost("{id}/merge")]
public async Task<IActionResult> MergeTemplate(int id, [FromBody] MergeTemplateRequest request)
{
    // request.SaveToLibrary (bool) - save vs return
    // request.MergeData (Dictionary<string, object>)
    // request.OutputFormat ("SFDT" | "DOCX" | "PDF")
}
```

#### **Step 2.3: New DTOs for API**
```csharp
// Add to: SyncfusionDocumentConverter/DTOs/TemplateRequests.cs
public class MergeTemplateRequest
{
    public Dictionary<string, object> MergeData { get; set; } = new();
    public bool SaveToLibrary { get; set; } = true;
    public string OutputFormat { get; set; } = "SFDT";
    public string? DocumentName { get; set; }
    public string? CreatedBy { get; set; }
}

public class TemplateMergeStructureResponse
{
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = "";
    public Dictionary<string, FieldStructure> Fields { get; set; } = new();
    public RecordManagementPolicy? ClassificationPolicy { get; set; }
}

public class FieldStructure
{
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public bool Required { get; set; }
    public string? DefaultValue { get; set; }
    public List<string>? Options { get; set; }
    public string? Format { get; set; }
}
```

### **Phase 3: Document Classification Inheritance**

#### **Step 3.1: Extend Document Entity**
```csharp
// Add to: Collabdoc.Web/Data/Entities/Document.cs
public class Document 
{
    // ... existing properties ...
    
    public int? TemplateId { get; set; }  // Reference to source template
    public string? ClassificationPolicy { get; set; }  // Inherited from template
    public string? RetentionPolicy { get; set; }
    public bool RequiresApproval { get; set; }
    public DateTime? ExpiryDate { get; set; }
}
```

#### **Step 3.2: Template Classification Logic**
```csharp
// Add to: Collabdoc.Web/Services/DocumentClassificationService.cs
public class DocumentClassificationService
{
    public async Task<ClassificationPolicy> GetTemplateClassificationAsync(int templateId);
    public async Task ApplyClassificationAsync(int documentId, ClassificationPolicy policy);
    public async Task<bool> ValidateDocumentAccess(int documentId, string userId);
}
```

---

## 🔧 **TECHNICAL IMPLEMENTATION DETAILS**

### **1. Template Merge Field Processing**
```csharp
public class SfdtMergeProcessor
{
    public string ProcessMergeFields(string sfdtContent, Dictionary<string, object> mergeData)
    {
        // 1. Parse SFDT JSON
        // 2. Find merge field placeholders: {{< FieldName >}}
        // 3. Replace with actual values based on type
        // 4. Handle formatting (currency, dates, etc.)
        // 5. Return processed SFDT
    }
}
```

### **2. Dynamic Form Generation**
```razor
@* TemplateMergeModal.razor *@
@foreach (var field in MergeFields.Where(f => f.IsRequired))
{
    <div class="mb-3">
        <label class="form-label">@field.DisplayName *</label>
        @switch (field.Type)
        {
            case MergeFieldType.Text:
                <SfTextBox @bind-Value="mergeData[field.Name]" />
                break;
            case MergeFieldType.Date:
                <SfDatePicker @bind-Value="GetDateValue(field.Name)" />
                break;
            case MergeFieldType.Currency:
                <SfNumericTextBox Format="C" @bind-Value="GetNumericValue(field.Name)" />
                break;
            // ... more types
        }
    </div>
}
```

### **3. API Response Formats**
```json
// GET /api/templates/{id}/merge-structure
{
  "templateId": 123,
  "templateName": "Invoice Template",
  "fields": {
    "CustomerName": {
      "type": "Text",
      "required": true,
      "defaultValue": null
    },
    "Amount": {
      "type": "Currency",
      "required": true,
      "format": "C"
    },
    "DueDate": {
      "type": "Date",
      "required": false,
      "format": "yyyy-MM-dd"
    }
  },
  "classificationPolicy": {
    "classification": "Internal",
    "retentionPeriod": "7 years",
    "requiresApproval": false
  }
}
```

---

## 📋 **VALIDATION CHECKLIST**

### **✅ Current Validation Results:**
- ✅ Template creation works perfectly
- ✅ Merge field system is comprehensive  
- ✅ Visual template editor is functional
- ✅ Database storage is working
- ✅ API structure exists for templates

### **❌ Missing Components:**
- ❌ TemplateService implementation in API project
- ❌ Template merge modal in UI
- ❌ SFDT merge field processing
- ❌ Document classification inheritance
- ❌ API endpoints for template merging
- ❌ External API integration capabilities

---

## 🎯 **DEVELOPMENT PRIORITIES**

### **Week 1: UI Template Merging**
1. Create TemplateMergeModal component
2. Implement SfdtMergeProcessor
3. Update UseTemplate functionality
4. Add document classification inheritance

### **Week 2: API Template Merging**  
1. Implement TemplateService
2. Add API endpoints for merge operations
3. Create template merge structure API
4. Add external API documentation

### **Week 3: Testing & Polish**
1. End-to-end testing of both scenarios
2. API documentation and examples
3. Performance optimization
4. Error handling improvements

---

## 🚀 **SUCCESS CRITERIA**

### **Scenario 1 Success:**
- ✅ User clicks "Use" → Modal appears with template fields
- ✅ User fills required fields → Click OK
- ✅ New document created with merged content
- ✅ Document saved to library with classification
- ✅ Document inherits template policies

### **Scenario 2 Success:**
- ✅ External API can get all templates
- ✅ API returns empty JSON structure for template
- ✅ API accepts merge request with data
- ✅ API can save to library OR return document
- ✅ Classification policies are enforced

This implementation plan addresses both business scenarios with a clear roadmap and technical specifications. 