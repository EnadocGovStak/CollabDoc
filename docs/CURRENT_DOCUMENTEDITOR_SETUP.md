# Current DocumentEditor Setup - Isolation Strategy

> Current reality note, May 19, 2026: this file documents the intended editor isolation strategy, but the current app still exposes editor instability in `/editor-test` and inconsistent template editor/preview rendering. Treat this as historical implementation context until Sprint 01 validates the active editor paths.

## Overview
We now have a **selective isolation approach** where different pages use different DocumentEditor implementations based on their specific needs.

## Current Component Architecture

### 1. `IsolatedDocumentEditor` (iframe isolation)
**Location**: `frontend/src/components/IsolatedDocumentEditor.js`
**Used by**: `DocumentEditorPage.js` ONLY
**Features**:
- Complete iframe isolation using postMessage communication
- **Perfect focus management** - sidebar forms work flawlessly
- All Syncfusion features maintained
- Robust error handling
- Slightly higher resource usage due to iframe

### 2. `DocumentEditorDemo` (original component)
**Location**: `frontend/src/components/DocumentEditorDemo.js`
**Used by**: All other pages (`TemplateEditorPage.js`, `DocumentTestPage.js`, `SyncfusionDemoPage.js`)
**Features**:
- Direct React integration (no iframe)
- Standard Syncfusion behavior
- Lower resource usage
- **May have focus issues** if used with sidebar forms

## Page-Specific Usage

### 📋 DocumentEditorPage.js ✅
```javascript
import IsolatedDocumentEditor from '../components/IsolatedDocumentEditor';

<IsolatedDocumentEditor
  ref={editorRef}
  initialContent={document.content}
  onContentChange={handleContentChange}
  onSave={handleSave}
  isReadOnly={!!selectedVersion || isDocumentFinal()}
/>
```
**Why**: Has extensive sidebar forms (title, records management, version history) that need perfect focus behavior.

### 📝 TemplateEditorPage.js ✅
```javascript
import DocumentEditorDemo from '../components/DocumentEditorDemo';

<DocumentEditorDemo
  ref={editorRef}
  initialContent={template.content}
  onContentChange={handleContentChange}
  isReadOnly={false}
/>
```
**Why**: Has minimal sidebar forms (template name, description). May experience minor focus issues but functionality remains intact.

### 🧪 DocumentTestPage.js ✅
```javascript
import DocumentEditorDemo from '../components/DocumentEditorDemo';

<DocumentEditorDemo
  ref={editorRef}
  document={testDocument}
  onContentChange={handleContentChange}
  isReadOnly={false}
/>
```
**Why**: Test page with buttons only - no focus issues.

### 🎨 SyncfusionDemoPage.js ✅
```javascript
import DocumentEditorDemo from '../components/DocumentEditorDemo';

<DocumentEditorDemo />
```
**Why**: Demo page - no sidebar forms, no focus issues.

## Benefits of This Approach

### ✅ Targeted Solution
- **Maximum protection** where needed most (DocumentEditorPage)
- **Minimal overhead** for simpler use cases
- **Component isolation** - changes to one don't affect others

### ✅ Performance Optimization
- Heavy iframe isolation only used where absolutely necessary
- Other pages get better performance with direct integration
- Resource usage optimized per use case

### ✅ Maintenance Simplicity
- Clear separation of concerns
- Each component optimized for its specific use case
- Easy to understand which component to modify for specific issues

### ✅ Future Flexibility
- Can easily add more pages using either approach
- Can upgrade specific pages to isolation if needed
- Clear upgrade path if requirements change

## When to Use Which Component

### Use `IsolatedDocumentEditor` when:
✅ Page has multiple sidebar form elements  
✅ Focus management is critical for UX  
✅ Users frequently interact with both sidebar and editor  
✅ Complex form validation or state management  

### Use `DocumentEditorDemo` when:
✅ Simple page with minimal sidebar elements  
✅ Editor is the primary interaction element  
✅ Performance is more critical than perfect focus  
✅ Test or demo environments  

## Migration Path

### If TemplateEditorPage needs better focus:
```javascript
// Change from:
import DocumentEditorDemo from '../components/DocumentEditorDemo';

// To:
import IsolatedDocumentEditor from '../components/IsolatedDocumentEditor';
```

### If new pages need isolation:
1. Import `IsolatedDocumentEditor`
2. Use same props as `DocumentEditorDemo`
3. Update component references in comments

## Troubleshooting

### Focus Issues on TemplateEditorPage:
- **Current**: Users may experience minor focus jumping
- **Solution**: Migrate to `IsolatedDocumentEditor` if it becomes problematic
- **Workaround**: Users can click directly in editor to regain focus

### Performance Issues on DocumentEditorPage:
- **Current**: iframe isolation adds slight overhead
- **Solution**: Already optimized with proper error handling
- **Monitoring**: Check memory usage if multiple editors open

### Component Confusion:
- **Documentation**: This file clearly defines usage
- **Naming**: Clear component names indicate their purpose
- **Comments**: Each import includes usage context

## Summary

This **selective isolation strategy** provides:
- **Perfect focus behavior** where most needed (DocumentEditorPage)
- **Optimal performance** for simpler use cases  
- **Clear upgrade path** for future requirements
- **Component independence** for easier maintenance

The main document editing experience gets the full isolation treatment, while other pages maintain simpler, more performant implementations.
