import React, { useRef, useEffect } from 'react';
import { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';
import config from '../config';
import './DocumentEditor.css';

// Register Syncfusion license
registerLicense(config.syncfusion.licenseKey);

const DocumentEditor = ({ document, onContentChange }) => {
  const editorRef = useRef(null);

  // Initialize editor with document content when component mounts or document changes
  useEffect(() => {
    if (editorRef.current && document) {
      try {
        // Open a blank document first
        editorRef.current.documentEditor.openBlank();
        
        // Insert content properly
        const editor = editorRef.current.documentEditor;
        const contentText = typeof document.content === 'string'
          ? document.content
          : JSON.stringify(document.content, null, 2);
        
        // Use proper paragraph formatting for better display
        contentText.split('\n').forEach((line, index) => {
          if (index > 0) {
            editor.editor.insertParagraph();
          }
          if (line.trim()) {
            editor.editor.insertText(line);
          }
        });

        // Make sure to update document title
        if (document.title) {
          editor.documentName = document.title;
        }
      } catch (error) {
        console.error("Error loading document content:", error);
        // If we encounter an error, we'll still have a blank document open
      }
    }
  }, [document]);

  // Handle editor content changes
  const handleContentChange = () => {
    if (editorRef.current && onContentChange) {
      try {
        // Get the text content from the document
        const content = editorRef.current.documentEditor.getText();
        onContentChange(content);
      } catch (error) {
        console.error("Error getting document content:", error);
      }
    }
  };

  return (
    <div className="document-editor">
      <DocumentEditorContainerComponent
        ref={editorRef}
        height="100%"
        width="100%"
        enableToolbar={true}
        enableEditor={true}
        enableSfdtExport={true}
        enableWordExport={true}
        enableSelection={true}
        enableContextMenu={true}
        enableSearch={true}
        enableOptionsPane={false}
        enableEditorHistory={true}
        enableTableDialog={true}
        enableHyperlinkDialog={true}
        enableFontDialog={true}
        enableTableOfContentsDialog={true}
        enableListDialog={true}
        enableParagraphDialog={true}
        enableStyleDialog={true}
        enableImageResizer={true}
        enableRtl={false}
        enableTrackChanges={true}
        enableComment={true}
        documentChange={handleContentChange}
        showPropertiesPane={false}
      />
    </div>
  );
};

export default DocumentEditor; 