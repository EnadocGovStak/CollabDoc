# Syncfusion Document Editor Implementation Notes

## Component Structure
The Collaborative Document Platform uses two main Syncfusion components:

1. **DocumentEditor** - Basic editor component used in `DocEditor.js`
2. **DocumentEditorContainer** - Full-featured component with toolbar and properties pane used in `DocEditorContainer.js` and `DocumentEditorDemo.js`

## Key Dependencies
The Document Editor requires these key dependencies (all at version 22.2.x):
- @syncfusion/ej2-base
- @syncfusion/ej2-buttons
- @syncfusion/ej2-dropdowns
- @syncfusion/ej2-inputs
- @syncfusion/ej2-navigations
- @syncfusion/ej2-popups
- @syncfusion/ej2-splitbuttons
- @syncfusion/ej2-lists
- @syncfusion/ej2-react-documenteditor
- @syncfusion/ej2-react-navigations
- @syncfusion/ej2-icons

## Module Injection
For correct functionality (especially menus and context menus), ensure these modules are properly injected:

```javascript
// IMPORTANT: Use DocumentEditorContainer (class) NOT DocumentEditorContainerComponent (component)
// This is critical to avoid "module.prototype.getModuleName is not a function" error
DocumentEditorContainer.Inject(
  Toolbar, 
  SfdtExport,
  Selection, 
  Editor, 
  EditorHistory,
  ContextMenu,
  Print,
  WordExport,
  TextExport,
  Search,
  ImageResizer,
  OptionsPane,
  HyperlinkDialog,
  TableDialog,
  BookmarkDialog,
  TableOfContentsDialog,
  PageSetupDialog,
  StyleDialog,
  ListDialog,
  ParagraphDialog,
  BulletsAndNumberingDialog,
  FontDialog,
  TablePropertiesDialog,
  BordersAndShadingDialog,
  TableOptionsDialog,
  CellOptionsDialog,
  StylesDialog
);
```

## Menu Implementation
For proper menu and context menu functionality:

1. Set `enableContextMenu: true` in component properties
2. For manual context menu setup, use:
   ```javascript
   editor.contextMenu.addCustomMenu([
     { text: 'Copy', id: 'copy', iconCss: 'e-icons e-copy' },
     { text: 'Paste', id: 'paste', iconCss: 'e-icons e-paste' },
     // Additional menu items...
   ]);
   ```
3. Implement event handlers:
   ```javascript
   editor.customContextMenuSelect = (args) => { 
     // Handle menu item clicks
   };
   ```

## CSS Requirements
Ensure all required CSS files are imported:
- Material theme CSS for all Syncfusion components
- Special attention to icons and navigations styles

## Service URL
For operations like spell check, format conversions, etc., a service URL is required:
```javascript
serviceUrl: 'https://ej2services.syncfusion.com/production/web-services/api/documenteditor/'
```

## Version Consistency
All Syncfusion packages must be the same version (22.2.x in our case) to avoid issues with menus, icons and other features.

## Reimplementation Plan

Based on the Syncfusion documentation, here's our approach to reimplementing the Document Editor:

1. **Confirm Package Versions**:
   - Ensure all Syncfusion packages are at version 22.2.x
   - Run `npm list | grep syncfusion` to verify

2. **CSS Import Strategy**:
   - Import all required CSS files in index.js and index.html
   - Follow the exact order from Syncfusion documentation
   - Use CDN links as fallback for fonts and icons

3. **Module Injection**:
   - Inject all required modules for DocumentEditor and DocumentEditorContainer
   - Follow the pattern from official examples

4. **Component Initialization**:
   - Initialize components with all required properties
   - Explicitly enable context menu and toolbar
   - Set service URL for required operations

5. **Menu and Context Menu Setup**:
   - Define custom menu items after component is created
   - Implement proper event handlers
   - Setup context menu only after document is fully loaded

6. **Implementation Steps**:
   - First create a simpler test component
   - Verify basic functionality works
   - Then integrate into main application components
   - Test with progressive enhancements

## Common Issues to Avoid

1. Module injection to wrong class (DocumentEditorContainerComponent vs DocumentEditorContainer)
2. Incorrect SFDT document format when using open() method
3. Missing module imports (especially DocumentEditorContainer class for injection)
4. Missing CSS imports for specific components
5. Version mismatches between packages
6. Setup timing issues (trying to access features before component is ready)
7. Missing service URL for certain operations
8. Not having the e-icons font properly loaded

## Document Format
When loading a document with the `open()` method, use a properly formatted SFDT document:

```javascript
// Note: Don't wrap this in { sfdt: ... } - pass it directly
const document = {
  "sections": [{
    "blocks": [{
      "paragraphFormat": {
        "styleName": "Normal"
      },
      "characterFormat": {
        "fontSize": 11,
        "fontFamily": "Calibri"
      },
      "inlines": [{
        "text": "Sample text"
      }]
    }]
  }],
  "characterFormat": {
    "fontSize": 11,
    "fontFamily": "Calibri"
  },
  "paragraphFormat": {
    "styleName": "Normal"
  },
  "styles": [
    {
      "name": "Normal",
      "type": "Paragraph",
      "paragraphFormat": {
        "listFormat": {}
      },
      "characterFormat": {
        "fontSize": 11,
        "fontFamily": "Calibri"
      }
    }
  ]
};

// Load it correctly
editor.open(JSON.stringify(document));
```

## Critical Bugs Resolved

1. **"module.prototype.getModuleName is not a function" Error**:
   - **Problem**: This occurs when using `DocumentEditorContainerComponent.Inject()` instead of `DocumentEditorContainer.Inject()`
   - **Solution**: Always inject modules into the base class (`DocumentEditorContainer`), not the React component wrapper
   - **Explanation**: In Syncfusion's React implementation, the module injection should happen on the underlying class level, not the React component level

2. **Document Loading Issues**:
   - **Problem**: Document fails to load properly when using incorrect SFDT format
   - **Solution**: Use the proper document structure and don't wrap it in a `{ sfdt: ... }` object
   - **Example**: 
     ```javascript
     // Correct way
     editor.open(JSON.stringify(documentObject));
     
     // Incorrect way (causes errors)
     editor.open(JSON.stringify({ sfdt: documentObject }));
     ```

3. **Module Import Strategy**:
   - Always import both the component and its base class:
     ```javascript
     import { 
       DocumentEditorContainerComponent, // React component
       DocumentEditorContainer,          // Base class for injection
       // Other modules...
     } from '@syncfusion/ej2-react-documenteditor';
     ```

## Advanced Module Injection Issues

The error `module.prototype.getModuleName is not a function` typically occurs due to the following issues:

1. **Wrong Injection Target**: 
   - Injecting into DocumentEditorContainerComponent (React component) instead of DocumentEditorContainer (base class)
   - This is a subtle but critical distinction in Syncfusion's architecture

2. **Syncfusion Internal ModuleLoader**: 
   - The error happens in module-loader.js during the component's initialization
   - The ModuleLoader tries to use the prototype of each injected module
   - When injection is done to the wrong target, the prototypes aren't properly set up

3. **React Component vs Base Class**:
   ```javascript
   // WRONG - leads to getModuleName error
   DocumentEditorContainerComponent.Inject(Toolbar, Editor, ...);
   
   // CORRECT - properly initializes module prototypes
   DocumentEditorContainer.Inject(Toolbar, Editor, ...);
   ```

4. **Consistent Implementation**:
   - This pattern applies to all Syncfusion components with module injection
   - Always import both the React component and its base class:
     ```javascript
     import { 
       DocumentEditorContainerComponent, // For rendering
       DocumentEditorContainer,          // For module injection
       // modules...
     } from '@syncfusion/ej2-react-documenteditor';
     ```

## Final Troubleshooting Steps

If the error persists after these comprehensive fixes, here are additional troubleshooting steps:

1. **Clean Node Modules and Package Lock**:
   ```bash
   cd frontend
   rm -rf node_modules
   rm package-lock.json
   npm cache clean --force
   npm install
   ```

2. **Check for Transitive Dependencies**:
   Some dependencies might bring in different versions of Syncfusion packages as transitive dependencies.
   Run `npm ls @syncfusion/ej2-base` to check if multiple versions are installed.

3. **Use a Minimal Test Component**:
   Create a bare-minimum component with only the essential modules to isolate the issue.
   
4. **Force Resolution in package.json**:
   Add resolutions to force specific versions:
   ```json
   "resolutions": {
     "@syncfusion/ej2-base": "22.2.5",
     "@syncfusion/ej2-react-base": "22.2.5"
   }
   ```

5. **Use CDN for Testing**:
   Temporarily test with CDN versions of Syncfusion to bypass local package issues.

Remember that after each significant change to dependencies or package structure, a full restart of the development server is required.
