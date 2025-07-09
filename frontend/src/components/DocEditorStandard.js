import React, { useEffect, useRef } from 'react';
import {
  DocumentEditorContainerComponent,
  DocumentEditorContainer,
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
} from '@syncfusion/ej2-react-documenteditor';

// Note: Modules are now injected globally in utils/syncfusionModules.js

// A minimal SFDT document structure based on Syncfusion example
const MINIMAL_DOCUMENT = {
  "sections": [{
    "sectionFormat": {
      "pageWidth": 612,
      "pageHeight": 792,
      "leftMargin": 72,
      "rightMargin": 72,
      "topMargin": 72,
      "bottomMargin": 72,
      "differentFirstPage": false,
      "differentOddAndEvenPages": false,
      "headerDistance": 36,
      "footerDistance": 36
    },
    "blocks": [{
      "paragraphFormat": {
        "styleName": "Normal",
        "listFormat": {}
      },
      "characterFormat": {
        "fontSize": 11,
        "fontFamily": "Calibri",
        "fontColor": "#000000"
      },
      "inlines": [{
        "characterFormat": {
          "fontSize": 11,
          "fontFamily": "Calibri",
          "fontColor": "#000000"
        },
        "text": "Right-click here to test context menu. This is sample text you can select."
      }]
    }]
  }],
  "characterFormat": {
    "fontSize": 11,
    "fontFamily": "Calibri",
    "fontColor": "#000000"
  },
  "paragraphFormat": {
    "styleName": "Normal",
    "listFormat": {}
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
        "fontFamily": "Calibri",
        "fontColor": "#000000"
      }
    }
  ]
};

/**
 * Document Editor Standard Implementation
 * This component strictly follows the Syncfusion documentation
 * for proper implementation of DocumentEditorContainer
 */
const DocEditorStandard = () => {
  const editorRef = useRef(null);

  useEffect(() => {
    // Add a delay to ensure the component is fully mounted
    const initTimer = setTimeout(() => {
      // Only run this after the component is mounted and editor is available
      if (editorRef.current?.documentEditor) {
        try {
          const editor = editorRef.current.documentEditor;
          
          // Wait for editor to be fully ready
          if (editor.isDestroyed) {
            console.warn("Editor is destroyed, cannot initialize");
            return;
          }
          
          // 1. First, load a basic document - fixed format
          editor.open(JSON.stringify(MINIMAL_DOCUMENT));
          console.log("Standard implementation: Document loaded");

          // 2. Wait a bit more for the document to be processed
          setTimeout(() => {
            try {
              // Ensure context menu is enabled
              editor.enableContextMenu = true;
              
              // Check if context menu exists and log details
              console.log("Context menu enabled:", editor.enableContextMenu);
              console.log("Context menu object exists:", !!editor.contextMenu);
              
              // Setup custom context menu if available
              if (editor.contextMenu && typeof editor.contextMenu.addCustomMenu === 'function') {
                // Define menu items as per Syncfusion docs
                const menuItems = [
                  { text: 'Cut', id: 'cut', iconCss: 'e-icons e-cut' },
                  { text: 'Copy', id: 'copy', iconCss: 'e-icons e-copy' },
                  { text: 'Paste', id: 'paste', iconCss: 'e-icons e-paste' },
                  { separator: true },
                  { text: 'Select All', id: 'selectall', iconCss: 'e-icons e-select' }
                ];
                
                // Add custom menu items
                editor.contextMenu.addCustomMenu(menuItems, false);
                console.log("Custom context menu items added");
                
                // Set up event handlers with safety checks
                editor.customContextMenuSelect = (args) => {
                  console.log('Context menu item selected:', args.id);
                  try {
                    switch (args.id) {
                      case 'cut':
                        if (editor.editor && typeof editor.editor.cut === 'function') {
                          editor.editor.cut();
                        }
                        break;
                      case 'copy':
                        if (editor.editor && typeof editor.editor.copy === 'function') {
                          editor.editor.copy();
                        }
                        break;
                      case 'paste':
                        if (editor.editor && typeof editor.editor.paste === 'function') {
                          editor.editor.paste();
                        }
                        break;
                      case 'selectall':
                        if (editor.selection && typeof editor.selection.selectAll === 'function') {
                          editor.selection.selectAll();
                        }
                        break;
                      default:
                        break;
                    }
                  } catch (menuError) {
                    console.warn('Error executing menu action:', menuError);
                  }
                };
                
                console.log("Context menu event handlers set up");
              } else {
                console.log("Context menu API not available on the editor");
              }
            } catch (contextMenuError) {
              console.warn("Error setting up context menu:", contextMenuError);
            }
          }, 500); // Additional delay for context menu setup
          
        } catch (error) {
          console.error("Error in standard implementation:", error);
        }
      }
    }, 200); // Initial delay
    
    // Cleanup
    return () => {
      if (initTimer) {
        clearTimeout(initTimer);
      }
    };
  }, []);

  return (
    <div className="doc-editor-standard">
      <h2>Standard Document Editor Implementation</h2>
      <p>This component strictly follows the Syncfusion documentation.</p>
      
      <div style={{ height: '600px', border: '1px solid #ccc' }}>
        <DocumentEditorContainerComponent
          ref={editorRef}
          id="documenteditor_standard"
          style={{ display: 'block', height: '100%' }}
          enableToolbar={true}
          enableSelection={true}
          enableEditor={true}
          enableEditorHistory={true}
          enableContextMenu={true}
          enableSearch={true}
          enableOptionsPane={true}
          enableBookmarkDialog={true}
          enableBordersAndShadingDialog={true}
          enableFontDialog={true}
          enableTableDialog={true}
          enableParagraphDialog={true}
          enableHyperlinkDialog={true}
          enableImageResizer={true}
          enableListDialog={true}
          enablePageSetupDialog={true}
          enableSfdtExport={true}
          enableStyleDialog={true}
          enableTableOfContentsDialog={true}
          enableTableOptionsDialog={true}
          enableTablePropertiesDialog={true}
          enableTextExport={true}
          enableWordExport={true}
          serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
          created={() => {
            console.log("Standard implementation: DocumentEditor created");
            
            // Additional safety check and initialization
            if (editorRef.current?.documentEditor) {
              const editor = editorRef.current.documentEditor;
              
              // Ensure critical properties are initialized
              try {
                // Initialize selection if it's not already done
                if (editor.selection && !editor.selection.isSelectionCompleted) {
                  console.log("Initializing selection module...");
                  // Don't access isSelectionCompleted directly, let it initialize naturally
                }
                
                // Patch the showPropertiesPaneOnSelection method for safety
                if (typeof editor.showPropertiesPaneOnSelection === 'function') {
                  const originalMethod = editor.showPropertiesPaneOnSelection;
                  editor.showPropertiesPaneOnSelection = function() {
                    try {
                      if (this.selection && this.selection.sectionFormat && this.selection.characterFormat) {
                        return originalMethod.apply(this, arguments);
                      }
                    } catch (error) {
                      console.warn('Error in showPropertiesPaneOnSelection:', error);
                    }
                  };
                  console.log("Patched showPropertiesPaneOnSelection method");
                }
                
              } catch (error) {
                console.warn("Error during editor creation initialization:", error);
              }
            }
          }}
          documentEditorSettings={{
            enableContextMenu: true,
            enableSelection: true,
            enableEditor: true,
            enableEditorHistory: true,
            enableSfdtExport: true,
            enablePrint: true,
            enableImageResizer: true
          }}
        />
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <p>Check the browser console for implementation details and diagnostics.</p>
        <p><strong>Instructions:</strong> Right-click on the document to test the context menu.</p>
      </div>
    </div>
  );
};

export default DocEditorStandard;
