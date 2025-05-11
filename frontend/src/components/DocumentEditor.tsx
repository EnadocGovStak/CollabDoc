import React, { useEffect, useRef } from 'react';
import { 
  DocumentEditorComponent, 
  DocumentEditorContainerComponent, 
  Toolbar, 
  Print,
  SfdtExport,
  WordExport,
  Editor,
  Selection,
  EditorHistory
} from '@syncfusion/ej2-react-documenteditor';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';

// Register Syncfusion document editor modules
DocumentEditorContainerComponent.Inject(Toolbar, Print, SfdtExport, WordExport, Editor, Selection, EditorHistory);

interface DocumentEditorProps {
  documentId?: string;
  templateId?: string;
  readOnly?: boolean;
  onSave?: (documentData: string) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  documentId, 
  templateId, 
  readOnly = false,
  onSave
}) => {
  const editorRef = useRef<DocumentEditorContainerComponent | null>(null);
  const { getAccessToken } = useAuth();

  // Set Syncfusion license key
  useEffect(() => {
    if (config.syncfusion.licenseKey) {
      // Register Syncfusion license (in production)
      // Syncfusion.EJ2.DocumentEditor.LicenseManager.registerLicense(config.syncfusion.licenseKey);
    }
  }, []);

  // Load document if documentId is provided
  useEffect(() => {
    const loadDocument = async () => {
      if (documentId && editorRef.current) {
        try {
          const token = await getAccessToken();
          const response = await fetch(
            `${config.api.baseUrl}/api/documents/${documentId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            editorRef.current.documentEditor.open(data.content);
          } else {
            console.error('Failed to load document');
          }
        } catch (error) {
          console.error('Error loading document:', error);
        }
      }
    };

    loadDocument();
  }, [documentId, getAccessToken]);

  // Load template if templateId is provided
  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId && editorRef.current) {
        try {
          const token = await getAccessToken();
          const response = await fetch(
            `${config.api.baseUrl}/api/templates/${templateId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            editorRef.current.documentEditor.open(data.content);
          } else {
            console.error('Failed to load template');
          }
        } catch (error) {
          console.error('Error loading template:', error);
        }
      }
    };

    loadTemplate();
  }, [templateId, getAccessToken]);

  // Handle document save
  const handleSave = async () => {
    if (editorRef.current) {
      // Get document content in SFDT format
      const documentContent = editorRef.current.documentEditor.serialize();
      
      if (onSave) {
        onSave(documentContent);
      } else {
        try {
          const token = await getAccessToken();
          const response = await fetch(
            `${config.api.baseUrl}/api/documents${documentId ? `/${documentId}` : ''}`,
            {
              method: documentId ? 'PUT' : 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                content: documentContent,
                templateId
              })
            }
          );
          
          if (!response.ok) {
            console.error('Failed to save document');
          }
        } catch (error) {
          console.error('Error saving document:', error);
        }
      }
    }
  };

  // Handle document export
  const handleExport = async () => {
    if (editorRef.current) {
      editorRef.current.documentEditor.saveAsBlob('Docx').then(async (blob: Blob) => {
        try {
          const token = await getAccessToken();
          const formData = new FormData();
          formData.append('file', blob, `document_${Date.now()}.docx`);
          
          const response = await fetch(
            `${config.api.baseUrl}/api/documents/export`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            }
          );
          
          if (!response.ok) {
            console.error('Failed to export document');
          } else {
            // Trigger file download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `document_${Date.now()}.docx`;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        } catch (error) {
          console.error('Error exporting document:', error);
        }
      });
    }
  };

  return (
    <div className="document-editor-container">
      <div className="editor-actions">
        <button onClick={handleSave} disabled={readOnly}>Save</button>
        <button onClick={handleExport}>Export</button>
      </div>
      
      <DocumentEditorContainerComponent
        ref={editorRef}
        height="700px"
        enableToolbar={!readOnly}
        isReadOnly={readOnly}
        enableEditor={!readOnly}
        enableSelection={true}
        enableEditorHistory={!readOnly}
        enableSfdtExport={true}
        enableWordExport={true}
        enablePrint={true}
      />
    </div>
  );
};

export default DocumentEditor; 