import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
  SfdtExport,
  WordExport,
  TextExport,
  Selection,
  Search,
  ImageResizer,
  Editor,
  EditorHistory,
  ContextMenu,
  OptionsPane,
  Print,
  HyperlinkDialog,
  TableDialog,
  BookmarkDialog,
  TableOfContentsDialog,
  PageSetupDialog,
  StyleDialog,
  ListDialog,
  ParagraphDialog,
  FontDialog,
  TablePropertiesDialog,
  StylesDialog
} from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';
import './DocumentEditor.css';

import config from '../config';

// Register Syncfusion license
registerLicense(config.syncfusion.licenseKey);

// Inject necessary modules for Document Editor features
DocumentEditorContainerComponent.Inject(
  Toolbar, SfdtExport, WordExport, TextExport, Selection, Search, ImageResizer,
  Editor, EditorHistory, ContextMenu, OptionsPane, Print, HyperlinkDialog, TableDialog,
  BookmarkDialog, TableOfContentsDialog, PageSetupDialog, StyleDialog, ListDialog,
  ParagraphDialog, FontDialog, TablePropertiesDialog, StylesDialog
);

const DocumentEditorDemo = forwardRef(({ initialContent, onContentChange, documentSettings, onDocumentLoaded, isReadOnly, serviceUrl }, ref) => {
  const editorInstance = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  // Effect for cleanup
  useEffect(() => {
    return () => {
      const editor = editorInstance.current?.documentEditor;
      if (editor && !editor.isDestroyed) {
        try {
          if (editor.selection) editor.selection.destroy();
          if (editor.editor) editor.editor.destroy();
          if (editor.viewer) editor.viewer.destroy();
          editor.destroy();
        } catch (error) {
          console.warn('Error during editor cleanup:', error);
        }
      }
    };
  }, []);

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    editor: editorInstance.current?.documentEditor,
    getContent: async () => {
      if (editorInstance.current?.documentEditor) {
        try {
          return editorInstance.current.documentEditor.serializeContent();
        } catch (error) {
          console.error("Error getting content:", error);
          return null;
        }
      }
      return null;
    },
    loadContent: (contentToLoad) => {
      if (editorInstance.current?.documentEditor && isEditorReady) {
        try {
          const editor = editorInstance.current.documentEditor;
          if (typeof contentToLoad === 'string') {
            editor.open(contentToLoad === '' ? JSON.stringify({ "sfdt": "" }) : contentToLoad);
          } else if (typeof contentToLoad === 'object' && contentToLoad !== null) {
            const contentStr = JSON.stringify(contentToLoad);
            editor.open(!contentStr.includes('"sfdt"') ? 
              JSON.stringify({ "sfdt": contentStr }) : contentStr);
          } else {
            editor.open(JSON.stringify({ "sfdt": "" }));
          }
        } catch (error) {
          console.error("Error loading content:", error);
          editorInstance.current.documentEditor.open(JSON.stringify({ "sfdt": "" }));
        }
      }
    },
    setReadOnly: (readOnlyStatus) => {
      if (editorInstance.current?.documentEditor) {
        editorInstance.current.documentEditor.isReadOnly = readOnlyStatus;
      }
    }
  }));

  // Effect for editor initialization and content loading
  useEffect(() => {
    const initializeEditor = async () => {
      if (!editorInstance.current?.documentEditor || !isEditorReady) return;
      
      try {
        const editor = editorInstance.current.documentEditor;
        
        // Skip if editor is not ready
        if (editor.isDestroyed || !editor.editor) {
          console.warn('Editor not ready for initialization');
          return;
        }
        
        // Set read-only state
        editor.isReadOnly = !!isReadOnly;
        
        // Initialize modules
        if (editor.selection && !editor.selection.isInitialized) {
          editor.selection.initSelectionModule();
        }
        
        if (editor.viewer?.scroller && !editor.viewer.scroller.initialized) {
          editor.viewer.initViewerScroller();
        }
        
        // Load content with a small delay to ensure initialization is complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        if (typeof initialContent === 'object' && initialContent !== null) {
          const contentStr = JSON.stringify(initialContent);
          editor.open(!contentStr.includes('"sfdt"') ? 
            JSON.stringify({ "sfdt": contentStr }) : contentStr);
        } else if (typeof initialContent === 'string' && initialContent) {
          editor.open(!initialContent.includes('"sfdt"') ? 
            JSON.stringify({ "sfdt": initialContent }) : initialContent);
        } else {
          editor.open(JSON.stringify({ "sfdt": "" }));
        }
      } catch (error) {
        console.error("Error during editor initialization:", error);
        const editor = editorInstance.current?.documentEditor;
        if (editor && !editor.isDestroyed) {
          editor.open(JSON.stringify({ "sfdt": "" }));
        }
      }
    };
    
    initializeEditor();
  }, [initialContent, isEditorReady, isReadOnly]);

  return (
    <div className="document-editor-container" style={{ height: '100%', width: '100%' }}>
      <DocumentEditorContainerComponent
        id="doc_editor_container"
        ref={editorInstance}
        style={{ display: 'block', height: '100%' }}
        enableToolbar={true}
        showPropertiesPane={true}
        serviceUrl={serviceUrl || 'https://ej2services.syncfusion.com/production/web-services/api/documenteditor/'}
        created={() => {
          console.log("DocumentEditorComponent created");
          setIsEditorReady(true);
          if (onDocumentLoaded) {
            onDocumentLoaded();
          }
        }}
        contentChange={() => {
          if (onContentChange && editorInstance.current?.documentEditor) {
            try {
              const content = editorInstance.current.documentEditor.serializeContent();
              onContentChange(content);
            } catch (error) {
              console.error('Error serializing content:', error);
            }
          }
        }}
        documentChange={() => {
          const editor = editorInstance.current?.documentEditor;
          if (editor && !editor.isDestroyed) {
            if (editor.selection && !editor.selection.isInitialized) {
              editor.selection.initSelectionModule();
            }
            if (editor.viewer?.scroller && !editor.viewer.scroller.initialized) {
              editor.viewer.initViewerScroller();
            }
          }
        }}
        height="100%"
        width="100%"
        documentEditorSettings={{
          enableImageResizer: true,
          enableSelection: true,
          enableContextMenu: true,
          enableSearch: true,
          enableOptionsPane: false,
          enableEditorHistory: true,
          enableTableDialog: true,
          enableHyperlinkDialog: true,
          enableFontDialog: true,
          enableTableOfContentsDialog: true,
          enableListDialog: true,
          enableParagraphDialog: true,
          enableStyleDialog: true,
          enableRtl: false,
          enableTrackChanges: true,
          enableComment: true,
          zOrderPosition: 'Behind',
          fontFamilies: ['Arial', 'Times New Roman', 'Courier New', 'Calibri'],
          ...documentSettings
        }}
        toolbarItems={[
          'New', 'Open', 'Separator',
          'Undo', 'Redo', 'Separator',
          'Image', 'Table', 'Hyperlink', 'Bookmark', 'TableOfContents', 'Separator',
          'Header', 'Footer', 'PageSetup', 'PageNumber', 'Break', 'Separator',
          'Find', 'Separator', 'Comments', 'TrackChanges', 'Separator',
          'LocalClipboard', 'RestrictEditing', 'Separator', 'FormFields', 'UpdateFields'
        ]}
      />
    </div>
  );
});

DocumentEditorDemo.displayName = 'DocumentEditorDemo';

export default DocumentEditorDemo;