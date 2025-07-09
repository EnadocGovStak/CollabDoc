import React, { useEffect, useRef, useState } from 'react';
import {
  DocumentEditorContainerComponent,
  DocumentEditorContainer,
  Toolbar,
  Editor,
  Selection,
  EditorHistory,
  SfdtExport,
  Print,
  WordExport,
  TextExport,
  TableOfContentsDialog,
  HyperlinkDialog,
  TableDialog,
  BookmarkDialog,
  TablePropertiesDialog,
  BordersAndShadingDialog,
  TableOptionsDialog,
  CellOptionsDialog,
  StyleDialog,
  ListDialog,
  ParagraphDialog,
  BulletsAndNumberingDialog,
  FontDialog,
  PageSetupDialog,
  StylesDialog,
  ImageResizer,
  ContextMenu,
  Search,
  OptionsPane,
  SpellChecker,
  RestrictEditing
} from '@syncfusion/ej2-react-documenteditor';

// Note: Modules are now injected globally in utils/syncfusionModules.js

// A more complete minimal valid SFDT document to prevent selection/caret errors
const MINIMAL_DOCUMENT = {
  "sfdt": {
    "sections": [{
      "sectionFormat": {
        "pageWidth": 612,
        "pageHeight": 792,
        "leftMargin": 72,
        "rightMargin": 72,
        "topMargin": 72,
        "bottomMargin": 72,
        "differentFirstPage": false,
        "differentOddAndEvenPages": false
      },
      "blocks": [{
        "paragraphFormat": {
          "styleName": "Normal",
          "listFormat": {}
        },
        "characterFormat": {},
        "inlines": [{
          "characterFormat": {},
          "text": " "
        }]
      }]
    }]
  }
};

const DocEditorContainer = () => {
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const timersRef = useRef([]);
  const resizeHandlerRef = useRef(null);

  // Custom function to handle resize safely
  const handleSafeResize = () => {
    try {
      if (editorRef.current?.documentEditor && 
          !editorRef.current.documentEditor.isDestroyed &&
          editorRef.current.documentEditor.documentHelper &&
          editorRef.current.documentEditor.documentHelper.pages &&
          editorRef.current.documentEditor.documentHelper.pages.length > 0) {
        editorRef.current.documentEditor.resize();
      }
    } catch (error) {
      console.warn("Error during container resize:", error);
    }
  };

  // Effect for initial document loading
  useEffect(() => {
    // Function to clear all timers
    const clearAllTimers = () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };

    if (editorRef.current?.documentEditor && isEditorReady) {
      try {
        // Wait a short time after editor is ready to load content
        const timer = setTimeout(() => {
          const editor = editorRef.current.documentEditor;
          
          console.log("Initializing editor modules");
          
          // Make sure the editor modules are initialized before loading content
          if (editor.selection && !editor.selection.isInitialized) {
            console.log("Initializing selection module");
            editor.selection.initSelectionModule();
          }
          
          if (editor.editor && !editor.editor.isInitialized) {
            console.log("Initializing editor module");
            editor.editor.initEditor();
          }
          
          // Load document with a longer delay to ensure all modules are ready
          const loadTimer = setTimeout(() => {
            try {
              console.log("Loading minimal document");
              editor.open(JSON.stringify(MINIMAL_DOCUMENT));
              
              // Set up resize handler after document is loaded with a delay
              const resizeTimer = setTimeout(() => {
                console.log("Document loaded in container component");
                if (resizeHandlerRef.current) {
                  window.removeEventListener('resize', resizeHandlerRef.current);
                }
                resizeHandlerRef.current = handleSafeResize;
                window.addEventListener('resize', resizeHandlerRef.current);
              }, 200);
              
              timersRef.current.push(resizeTimer);
            } catch (loadError) {
              console.error("Error loading document:", loadError);
            }
          }, 300);
          
          timersRef.current.push(loadTimer);
        }, 200);
        
        timersRef.current.push(timer);
        
        return () => clearAllTimers();
      } catch (error) {
        console.error("Error initializing editor:", error);
        clearAllTimers();
      }
    }
  }, [isEditorReady]);

  // Effect for cleanup
  useEffect(() => {
    return () => {
      // Clear all timers
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
      
      // Remove resize listener
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      
      // Cleanup on unmount
      if (editorRef.current && editorRef.current.documentEditor) {
        try {
          console.log('Destroying DocumentEditorContainerComponent');
          const editor = editorRef.current.documentEditor;
          if (editor.selection) editor.selection.destroy();
          if (editor.editor) editor.editor.destroy();
          if (!editor.isDestroyed) editor.destroy();
        } catch (error) {
          console.error('Error during editor cleanup:', error);
        }
      }
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <DocumentEditorContainerComponent
        ref={editorRef}
        id="doc_editor_container"
        style={{ display: 'block', height: '100%' }}
        enableToolbar={true}
        showPropertiesPane={false}
        height="600px"
        width="100%"
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        toolbarItems={[
          'New', 'Open', 'Separator', 'Undo', 'Redo', 'Separator',
          'Image', 'Table', 'Hyperlink', 'Bookmark', 'TableOfContents', 'Separator',
          'Find', 'Separator',
          'LocalClipboard', 'RestrictEditing'
        ]}
        created={() => {
          console.log("Container component created");
          
          // Monkey patch DocumentEditorContainer prototype to fix protectionType error
          // This approach ensures all instances are patched at once
          try {
            const containerPrototype = Object.getPrototypeOf(editorRef.current);
            if (containerPrototype && containerPrototype.showPropertiesPaneOnSelection) {
              const originalMethod = containerPrototype.showPropertiesPaneOnSelection;
              
              // Only patch if not already patched
              if (!containerPrototype._patchedShowPropertiesPane) {
                containerPrototype.showPropertiesPaneOnSelection = function() {
                  try {
                    // Check all required properties before executing
                    if (this && this.documentEditor && 
                        this.documentEditor.selection && 
                        this.documentEditor.selection.sectionFormat &&
                        this.documentEditor.selection.characterFormat) {
                      return originalMethod.apply(this, arguments);
                    }
                  } catch (error) {
                    console.warn('Error in showPropertiesPaneOnSelection:', error);
                  }
                };
                
                // Mark as patched to avoid double patching
                containerPrototype._patchedShowPropertiesPane = true;
                console.log("Successfully patched showPropertiesPaneOnSelection method");
              }
            }
          } catch (error) {
            console.warn("Error patching showPropertiesPaneOnSelection:", error);
          }
          
          setIsEditorReady(true);
        }}
        documentEditorSettings={{
          enableEditor: true,
          enableSelection: true,
          enableEditorHistory: true,
          enableSfdtExport: true,
          enablePrint: true,
          enableImageResizer: true
        }}
      />
    </div>
  );
};

export default DocEditorContainer;
