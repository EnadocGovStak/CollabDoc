import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';
import './DocumentEditor.css';
import "../../node_modules/@syncfusion/ej2-react-documenteditor/styles/material.css";
import "../css/documenteditor.css";

// Register Syncfusion license
try {
  registerLicense('Ngo9BigBOggjHTQxAR8/V1NGaF1cXGFCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXpfeXRWRWZcVEB2V0tWYUs=');
} catch (error) {
  console.warn('Error registering Syncfusion license:', error);
}

// Note: Modules are now injected globally in utils/syncfusionModules.js

const DocumentEditorCore = forwardRef(({ document, onContentChange, readOnly = false, showMergeFields = false, serverApiUrl = '/api/document-editor' }, ref) => {
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const initialLoadCompleted = useRef(false);
  const contentChangeTimeout = useRef(null);
  const isContentChangeInProgress = useRef(false);
  const lastLoadedContent = useRef(null);
  const [editorKey, setEditorKey] = useState(1);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    // Get the current document content
    getContent: async () => {
      if (!editorRef.current || !editorRef.current.documentEditor) {
        console.error('Document editor not initialized or not available');
        return null;
      }
      
      try {
        const content = editorRef.current.documentEditor.serialize();
        console.log('Getting document content for save');
        return content;
      } catch (error) {
        console.error('Error getting document content:', error);
        return null;
      }
    },
    
    // Load content into the editor
    loadContent: async (content) => {
      if (!editorRef.current?.documentEditor) {
        console.error('Document editor not initialized for content loading');
        return false;
      }
      
      try {
        if (typeof content === 'object') {
          editorRef.current.documentEditor.open(JSON.stringify(content));
        } else {
          editorRef.current.documentEditor.open(content);
        }
        lastLoadedContent.current = content;
        return true;
      } catch (error) {
        console.error('Error loading content into editor:', error);
        return false;
      }
    },
    
    // Force refresh the editor
    forceRefresh: () => {
      console.log('Force refreshing document editor');
      setEditorKey(prevKey => prevKey + 1);
    },
    
    // Insert text at the current cursor position
    insertText: (text) => {
      if (editorRef.current?.documentEditor) {
        try {
          editorRef.current.documentEditor.editor.insertText(text);
          return true;
        } catch (error) {
          console.error('Error inserting text:', error);
          return false;
        }
      }
      return false;
    },

    // Show the fields panel
    showFieldsPanel: () => {
      setShowFieldsSidebar(true);
    },

    // Hide the fields panel
    hideFieldsPanel: () => {
      setShowFieldsSidebar(false);
    }
  }));

  // Initialize the editor once the component is mounted
  useEffect(() => {
    console.log('DocumentEditorCore mounted, initializing editor with serviceUrl:', serverApiUrl);
    
    // Create the document editor component
    const initializeEditor = () => {
      try {
        if (!editorRef.current) {
          console.log("Creating new DocumentEditorContainerComponent with serviceUrl:", serverApiUrl);
          
          const container = new DocumentEditorContainerComponent({
            enableToolbar: true,
            height: '100%',
            width: '100%',
            serviceUrl: serverApiUrl,
            created: function() {
              setTimeout(() => {
                try {
                  if (!this.documentEditor) {
                    console.warn('this.documentEditor not available in created callback');
                    return;
                  }
                  
                  if (!editorRef.current) {
                    console.warn('editorRef.current not available in created callback');
                    return;
                  }
                  
                  this.documentEditor.serviceUrl = serverApiUrl;
                  console.log("DocumentEditor created callback executed, serviceUrl set to:", serverApiUrl);
                  
                  editorRef.current.documentEditor.enableLocalClipboard = true;
                  editorRef.current.documentEditor.serviceUrl = serverApiUrl;
                  
                  editorRef.current.documentEditor.openBlank();
                  console.log("Document editor successfully initialized");
                  setEditorInitialized(true);
                } catch (error) {
                  console.error('Error in created callback:', error);
                }
              }, 500);
            }
          });
          
          editorRef.current = container;
          
          if (readOnly) {
            container.documentEditor.isReadOnly = true;
            console.log('Document editor set to read-only mode');
          }
          
          container.appendTo('#documentEditor');
          console.log("DocumentEditorContainerComponent appended to DOM");
        }
      } catch (error) {
        console.error('Error creating document editor:', error);
        setTimeout(() => {
          console.log("Retrying editor initialization...");
          initializeEditor();
        }, 2000);
      }
    };
    
    setTimeout(initializeEditor, 300);
    
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          console.error('Error destroying document editor:', error);
        }
      }
    };
  }, [serverApiUrl, readOnly]);

  // Apply read-only mode when it changes
  useEffect(() => {
    if (editorRef.current?.documentEditor) {
      editorRef.current.documentEditor.isReadOnly = readOnly;
    }
  }, [readOnly]);

  // When editor is initialized and we have document content, try to load it
  useEffect(() => {
    const loadContent = async () => {
      if (!editorInitialized || !document) {
        console.log("Skipping content load - editor initialized:", editorInitialized, "document:", !!document);
        return;
      }

      if (!editorRef.current || !editorRef.current.documentEditor) {
        console.warn('Document editor not available when trying to load content');
        setTimeout(() => loadContent(), 1000);
        return;
      }

      isContentChangeInProgress.current = true;

      try {
        console.log('Attempting to load document content on initialization');
        
        if (document.content && typeof document.content === 'object') {
          console.log('Loading content from document object');
          lastLoadedContent.current = document.content;
          editorRef.current.documentEditor.open(JSON.stringify(document.content));
          initialLoadCompleted.current = true;
        }
        else if (document.content && typeof document.content === 'string' && document.content.length > 10) {
          console.log('Loading content from document string');
          try {
            const contentObj = JSON.parse(document.content);
            lastLoadedContent.current = contentObj;
            editorRef.current.documentEditor.open(JSON.stringify(contentObj));
          } catch (error) {
            editorRef.current.documentEditor.open(document.content);
            lastLoadedContent.current = document.content;
          }
          initialLoadCompleted.current = true;
        }
        else {
          console.log('No valid content found, opening blank document');
          editorRef.current.documentEditor.openBlank();
          initialLoadCompleted.current = true;
        }
      } catch (error) {
        console.error('Error loading document content:', error);
        try {
          editorRef.current.documentEditor.openBlank();
          initialLoadCompleted.current = true; 
        } catch (innerError) {
          console.error('Error opening blank document:', innerError);
        }
      } finally {
        setTimeout(() => {
          isContentChangeInProgress.current = false;
        }, 1000);
      }
    };

    setTimeout(loadContent, 3000);
    return () => {};
  }, [editorInitialized, document?.id, document?.version, document]);

  return (
    <div className="document-editor-container">
      {isLoading && (
        <div className="loading-overlay">
          <span>Loading...</span>
        </div>
      )}

      <DocumentEditorContainerComponent 
        key={editorKey}
        ref={editorRef}
        enableToolbar={true}
        height="100%"
        enableEditor={true}
        enableSelection={true}
        enableSfdtExport={true}
        enableWordExport={true}
        showPropertiesPane={false}
        enableContextMenu={true}
        isReadOnly={readOnly}
        id="documentEditor"
        serviceUrl={serverApiUrl}
        enableLocalClipboard={true}
        documentEditorSettings={{
          enableLocalPaste: true,
          restrictEditing: readOnly,
          imageResizerVisibility: true
        }}
      />
    </div>
  );
});

DocumentEditorCore.displayName = 'DocumentEditorCore';

export default DocumentEditorCore; 