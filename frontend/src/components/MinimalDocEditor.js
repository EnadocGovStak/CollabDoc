import React, { useRef } from 'react';
import { 
  DocumentEditorContainerComponent 
} from '@syncfusion/ej2-react-documenteditor';

// Note: Modules are now injected globally in utils/syncfusionModules.js

/**
 * Minimal Document Editor Implementation
 * This component uses only the most essential modules to test functionality
 */
const MinimalDocEditor = () => {
  const editorRef = useRef(null);

  return (
    <div className="minimal-doc-editor">
      <h2>Minimal Document Editor</h2>
      <p>Testing with only essential modules.</p>
      
      <div style={{ height: '400px', border: '1px solid #ccc' }}>
        <DocumentEditorContainerComponent
          ref={editorRef}
          id="minimal_documenteditor"
          style={{ display: 'block', height: '100%' }}
          enableToolbar={true}
          enableEditor={true}
          enableSelection={true}
          enableEditorHistory={true}
          created={() => {
            console.log("Minimal implementation: DocumentEditor created");
          }}
        />
      </div>
    </div>
  );
};

export default MinimalDocEditor;
