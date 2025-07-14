# Template Merge Components - Separation of Concerns

## Overview
The template merge functionality has been completely isolated from the main document editor to prevent interference and ensure clean separation of concerns.

## Component Architecture

### 1. TemplateMergeEngine.js
**Purpose**: Core template merging logic  
**Isolation**: Pure utility class with no React dependencies  
**Responsibilities**:
- Merge template content with data
- Extract merge fields from templates
- Validate merge data
- Generate previews with highlighted unfilled fields

### 2. TemplateMergeForm.js
**Purpose**: Form component for template field input  
**Isolation**: Self-contained form with auto-save and validation  
**Responsibilities**:
- Render form fields based on template schema
- Handle field validation
- Auto-save form drafts to localStorage
- Submit merge data for document generation

### 3. TemplateMergePreview.js
**Purpose**: Preview component for merged template content  
**Isolation**: Uses DocumentEditorDemo (NOT DocumentPageEditor)  
**Responsibilities**:
- Display merged content in read-only editor
- Provide text preview with highlighted unfilled fields
- Switch between different preview modes
- Raw content debugging view (optional)

### 4. useTemplateMerge Hook
**Purpose**: React hook for template merge state management  
**Isolation**: Encapsulates merge logic and state  
**Responsibilities**:
- Manage merge data state
- Auto-update merged content
- Handle validation state
- Extract template fields

## Key Isolation Features

### 1. Editor Separation
- **Main Editor**: Uses `DocumentPageEditor` with full focus isolation and context menu disabled
- **Template Preview**: Uses `DocumentEditorDemo` for read-only preview
- **No Cross-Interference**: Different components, different instances, different concerns

### 2. State Management
- Template merge state is completely separate from main document state
- Auto-save uses different localStorage keys (`template_form_${templateId}`)
- No shared state or props between template and main editor

### 3. Focus Management
- Template form fields have proper focus/blur handling
- Preview editor is read-only and doesn't compete for focus
- Main document editor focus isolation remains intact

### 4. Event Handling
- Template components have their own event handlers
- No event bubbling conflicts with main editor
- Independent keyboard shortcuts and interactions

## Implementation Benefits

### 1. No Context Menu Issues
- Template preview uses standard DocumentEditorDemo
- Main editor uses DocumentPageEditor with context menu disabled
- No conflicts between different editor instances

### 2. Clean Architecture
- Single responsibility principle maintained
- Easy to test and maintain independently
- Clear boundaries between components

### 3. Performance
- Template components only re-render when template data changes
- Main editor performance unaffected by template operations
- Lazy loading of template components when needed

### 4. Extensibility
- Easy to add new template features without affecting main editor
- Template merge engine can be used in other contexts
- Preview component can be reused elsewhere

## Usage Example

```javascript
import { 
  TemplateMergeForm, 
  TemplateMergePreview, 
  useTemplateMerge 
} from '../components/TemplateMerge';

const MyTemplatePage = ({ template }) => {
  const { mergeData, updateMergeData, isValid } = useTemplateMerge(template);
  
  return (
    <div>
      <TemplateMergeForm 
        template={template}
        mergeData={mergeData}
        onDataChange={updateMergeData}
        onSubmit={handleGenerate}
      />
      <TemplateMergePreview 
        template={template}
        mergeData={mergeData}
      />
    </div>
  );
};
```

## Files Modified/Created

### New Components:
- `frontend/src/components/TemplateMerge/TemplateMergeEngine.js`
- `frontend/src/components/TemplateMerge/TemplateMergeForm.js`
- `frontend/src/components/TemplateMerge/TemplateMergeForm.css`
- `frontend/src/components/TemplateMerge/TemplateMergePreview.js`
- `frontend/src/components/TemplateMerge/TemplateMergePreview.css`
- `frontend/src/components/TemplateMerge/index.js`

### Updated Pages:
- `frontend/src/pages/DocumentFromTemplatePage.js` - Now uses isolated components

### Main Editor (Unchanged):
- `frontend/src/pages/DocumentEditorPage.js` - Continues to use DocumentPageEditor
- `frontend/src/components/DocumentPageEditor.js` - Focus isolation maintained

## Testing Considerations

1. **Unit Tests**: Each component can be tested independently
2. **Integration Tests**: Template workflow separate from main editor workflow
3. **Focus Tests**: Verify no focus conflicts between template and main editor
4. **Performance Tests**: Ensure no performance degradation

This architecture ensures that template merging functionality is completely isolated from the main document editor, eliminating any potential conflicts or interference while maintaining clean, maintainable code.
