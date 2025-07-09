import React, { useEffect, useRef } from 'react';
import {
  DocumentEditor,
  Editor,
  Selection,
  EditorHistory
} from '@syncfusion/ej2-documenteditor';

// Inject the core editing modules
DocumentEditor.Inject(Editor, Selection, EditorHistory);

// A more complete minimal valid SFDT document to prevent selection/caret errors
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

const DocEditor = () => {
  const containerRef = useRef(null);
  const editorObjRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    // Clear any existing timers
    const clearAllTimers = () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
    
    // Function to handle window resize events safely
    const handleResize = () => {
      try {
        if (editorObjRef.current && !editorObjRef.current.isDestroyed) {
          // Check if document is loaded before resizing
          if (editorObjRef.current.documentHelper && 
              editorObjRef.current.documentHelper.pages && 
              editorObjRef.current.documentHelper.pages.length > 0) {
            editorObjRef.current.resize();
          }
        }
      } catch (error) {
        console.warn("Error during resize:", error);
      }
    };

    // Need a small delay to ensure the DOM is fully rendered
    const initTimer = setTimeout(() => {
      if (containerRef.current) {
        try {
          console.log("Creating DocumentEditor instance");
          
          // Instantiate the editor
          editorObjRef.current = new DocumentEditor({
            height: '600px',
            isReadOnly: false,
            enableEditor: true,
            enableSelection: true,
            enableEditorHistory: true,
            enableImageResizer: true,
            // Ensure proper initialization of editor modules
            created: function() {
              console.log("DocumentEditor instance created");
            }
          });
          
          // Mount it to the container div
          editorObjRef.current.appendTo(containerRef.current);
          
          console.log("Editor mounted to container");
          
          // First initialize the selection to prevent errors
          if (editorObjRef.current.selection) {
            // Check if initSelectionModule exists before calling it
            if (typeof editorObjRef.current.selection.initSelectionModule === 'function') {
              editorObjRef.current.selection.initSelectionModule();
              console.log("Selection module initialized");
            } else {
              console.log("Selection module already initialized or not available");
            }
          }
          
          // Then initialize editor
          if (editorObjRef.current.editor) {
            editorObjRef.current.editor.initEditor();
            console.log("Editor module initialized");
          }
          
          // Wait for modules to initialize before loading document
          const loadTimer = setTimeout(() => {
            try {
              // Open a document with minimal valid structure
              console.log("Loading minimal document");
              editorObjRef.current.open(JSON.stringify(MINIMAL_DOCUMENT));
              
              // Add a small delay before adding resize listener to ensure document is fully rendered
              const resizeTimer = setTimeout(() => {
                console.log("Basic Document Editor initialized successfully");
                window.addEventListener('resize', handleResize);
              }, 200);
              
              timersRef.current.push(resizeTimer);
            } catch (error) {
              console.error("Error loading document:", error);
            }
          }, 300); // Longer delay for document loading
          
          timersRef.current.push(loadTimer);
        } catch (error) {
          console.error("Error initializing document editor:", error);
        }
      }
    }, 200);
    
    timersRef.current.push(initTimer);

    // Cleanup on unmount to prevent memory leaks and double-init in StrictMode
    return () => {
      clearAllTimers();
      window.removeEventListener('resize', handleResize);
      
      if (editorObjRef.current) {
        try {
          console.log("Destroying DocumentEditor instance");
          // Important: destroy in reverse order of creation
          if (editorObjRef.current.editor) editorObjRef.current.editor.destroy();
          if (editorObjRef.current.selection) editorObjRef.current.selection.destroy();
          if (!editorObjRef.current.isDestroyed) editorObjRef.current.destroy();
          editorObjRef.current = null;
          console.log("Document Editor instance destroyed");
        } catch (error) {
          console.error("Error during editor cleanup:", error);
        }
      }
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div ref={containerRef} id="document-editor-container" style={{ height: '600px', border: '1px solid #ddd' }} />
    </div>
  );
};

export default DocEditor;
