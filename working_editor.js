import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import {
  DocumentEditorComponent,
  Print,
  SfdtExport,
  WordExport,
  TextExport,
  Selection,
  Editor,
  EditorHistory,
  ContextMenu,
  OptionsPane,
  Search,
  ImageResizer,
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

// Use DocumentEditorComponent (NOT DocumentEditorContainerComponent) for template preview
// This avoids conflicts with the main document editor
DocumentEditorComponent.Inject(
  Print,
  SfdtExport,
  WordExport,
  TextExport,
  Selection,
  Editor,
  EditorHistory,
  ContextMenu,
  OptionsPane,
  Search,
  ImageResizer,
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

/**
 * Creates a proper SFDT document structure from plain text content
 * @param {string} textContent - The plain text content to convert
 * @returns {string} - Stringified SFDT document
 */
const createProperSfdtFromText = (textContent) => {
  console.log('Creating proper SFDT document from text:', textContent?.substring(0, 100));
  
  // Split text into lines and create proper paragraph blocks
  const lines = textContent.split('\n');
  const blocks = [];
  
  lines.forEach((line) => {
    const paragraph = {
      "paragraphFormat": {
        "styleName": "Normal",
        "listFormat": {},
        "lineSpacing": 1.15,
        "lineSpacingType": "Multiple"
      },
      "characterFormat": {
        "fontSize": 11,
        "fontFamily": "Calibri"
      },
      "inlines": []
    };
    
    if (line.trim() === '') {
      // Empty line - just add a line break
      paragraph.inlines.push({
        "characterFormat": {
          "fontSize": 11,
          "fontFamily": "Calibri"
        },
        "text": ""
      });
    } else {
      // Line with content
      paragraph.inlines.push({
        "characterFormat": {
          "fontSize": 11,
          "fontFamily": "Calibri"
        },
        "text": line
      });
    }
    
    blocks.push(paragraph);
  });

  // Create a proper SFDT document structure that matches DocumentEditor expectations
  const sfdtDocument = {
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
        "footerDistance": 36,
        "bidi": false
      },
      "blocks": blocks,
      "headersFooters": {}
    }],
    "characterFormat": {
      "fontSize": 11,
      "fontFamily": "Calibri"
    },
    "paragraphFormat": {
      "lineSpacing": 1.15,
      "lineSpacingType": "Multiple"
    },
    "defaultTabWidth": 36,
    "trackChanges": false,
    "enforcement": false,
    "hashValue": "",
    "saltValue": "",
    "formatting": false,
    "protectionType": "NoProtection",
    "dontUseHTMLParagraphAutoSpacing": false,
    "formFieldShading": true,
    "styles": [{
      "name": "Normal",
      "type": "Paragraph",
      "paragraphFormat": {
        "lineSpacing": 1.15,
        "lineSpacingType": "Multiple",
        "listFormat": {}
      },
      "characterFormat": {
        "fontSize": 11,
        "fontFamily": "Calibri",
        "fontSizeBidi": 11,
        "fontFamilyBidi": "Calibri"
      },
      "next": "Normal"
    }]
  };
  
  console.log('Created SFDT document with', blocks.length, 'paragraphs');
  return JSON.stringify(sfdtDocument);
};

/**
 * Validates and sanitizes content for Syncfusion DocumentEditor
 * @param {string|object} content - The content to validate
 * @returns {string|null} - Valid SFDT content or null if invalid
 */
const validateAndSanitizeContent = (content) => {
  console.log('Validating content:', typeof content, content);
  
  if (!content) {
    console.log('No content provided to validate');
    return null;
  }
  
  try {
    // If content is a string, try to parse it as JSON
    if (typeof content === 'string') {
      // Check if it's already JSON
      if (content.trim().startsWith('{')) {
        const parsed = JSON.parse(content); // Validate JSON
        console.log('Parsed JSON content:', parsed);
        
        // Check if it has an sfdt property with plain text (not base64 SFDT)
        if (parsed.sfdt && typeof parsed.sfdt === 'string' && !parsed.sfdt.startsWith('UEs')) {
          console.log('Found plain text SFDT, converting to proper document format');
          // This is template content with plain text, create a proper SFDT document
          return createProperSfdtFromText(parsed.sfdt);
        }
        
        return content;
      }
      
      // If it's plain text, create a proper SFDT document from the text
      return createProperSfdtFromText(content);
    }
    
    // If content is already an object, stringify it
    if (typeof content === 'object') {
      console.log('Content is object, checking format...');
      
      // Check if it has an sfdt property with plain text (not base64 SFDT)
      if (content.sfdt && typeof content.sfdt === 'string' && !content.sfdt.startsWith('UEs')) {
        console.log('Found plain text SFDT in object, converting to proper document format');
        // This is template content with plain text, create a proper SFDT document
        return createProperSfdtFromText(content.sfdt);
      }
      
      return JSON.stringify(content);
    }
    
    return null;
  } catch (error) {
    console.error('Content validation failed:', error);
    return null;
  }
};

/**
 * Template Preview Editor Component
 * Uses DocumentEditorComponent (simple editor) instead of DocumentEditorContainerComponent
 * This avoids conflicts with the main document editor that uses the container component
 */
const TemplatePreviewEditor = forwardRef((props, ref) => {
  const {
    initialContent = '',
    height = '400px',
    onCreated,
    onContentChange,
    isReadOnly = true
  } = props;

  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (!editorRef.current || !isEditorReady) {
        console.warn('Template preview editor not ready');
        return '';
      }
      try {
        return editorRef.current.serialize();
      } catch (error) {
        console.error('Error getting content from template preview:', error);
        return '';
      }
    },
    setContent: (content) => {
      if (!editorRef.current || !isEditorReady) {
        console.warn('Template preview editor not ready for setContent');
        return;
      }
      
      const validContent = validateAndSanitizeContent(content);
      if (validContent) {
        try {
          editorRef.current.open(validContent);
        } catch (error) {
          console.error('Failed to set content in template preview:', error);
          setHasError(true);
        }
      } else {
        console.warn('Invalid content provided to template preview editor');
      }
    },
    refresh: () => {
      if (!editorRef.current || !isEditorReady) {
        console.warn('Template preview editor not ready for refresh');
        return;
      }
      try {
        editorRef.current.refresh();
      } catch (error) {
        console.error('Error refreshing template preview:', error);
      }
    },
    isReady: () => isEditorReady
  }));

  // Load initial content when editor is created
  const handleCreated = () => {
    console.log('Template preview editor created');
    console.log('Initial content provided:', initialContent);
    console.log('Initial content type:', typeof initialContent);
    setHasError(false);
    
    try {
      if (editorRef.current) {
        // Wait a moment for the editor to fully initialize
        setTimeout(() => {
          try {
            // Configure the editor for preview mode
            editorRef.current.isReadOnly = isReadOnly;
            
            // Load initial content if provided
            if (initialContent) {
              console.log('Processing initial content for template preview...');
              const validContent = validateAndSanitizeContent(initialContent);
              console.log('Validated content:', validContent ? 'Valid' : 'Invalid');
              if (validContent) {
                console.log('Opening content in template preview editor...');
                editorRef.current.open(validContent);
                console.log('Content loaded successfully in template preview');
              } else {
                console.warn('Invalid initial content provided to template preview, creating document from text');
                // Create a proper document with the template content as text
                const textContent = typeof initialContent === 'string' ? initialContent : JSON.stringify(initialContent);
                const properDoc = createProperSfdtFromText(textContent);
                editorRef.current.open(properDoc);
              }
            } else {
              console.log('No initial content provided, loading blank document');
              editorRef.current.openBlank();
            }
            
            setIsEditorReady(true);
            
            if (onCreated) {
              onCreated();
            }
          } catch (error) {
            console.error('Error during template preview editor initialization:', error);
            setHasError(true);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error in template preview editor creation:', error);
      setHasError(true);
    }
  };

  // Handle content changes
  const handleContentChange = () => {
    if (!isEditorReady || !editorRef.current) return;
    
    if (onContentChange) {
      try {
        const content = editorRef.current.serialize();
        onContentChange(content);
      } catch (error) {
        console.error('Failed to get content in template preview:', error);
      }
    }
  };

  // Update content when initialContent prop changes
  useEffect(() => {
    if (isEditorReady && editorRef.current && initialContent) {
      const validContent = validateAndSanitizeContent(initialContent);
      if (validContent) {
        try {
          editorRef.current.open(validContent);
        } catch (error) {
          console.error('Failed to update content in template preview:', error);
          setHasError(true);
        }
      } else {
        console.warn('Invalid content update in template preview');
      }
    }
  }, [initialContent, isEditorReady]);

  if (hasError) {
    return (
      <div className="template-preview-error" style={{ height, padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#dc3545' }}>
          <h4>Preview Error</h4>
          <p>Unable to load template preview. Please try refreshing the page.</p>
          <button 
            onClick={() => {
              setHasError(false);
              setIsEditorReady(false);
            }}
            style={{ padding: '8px 16px', marginTop: '10px' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="template-preview-editor" style={{ height, minHeight: height }}>
      {!isEditorReady && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading template preview...
        </div>
      )}
      <DocumentEditorComponent
        ref={editorRef}
        id={`template-preview-editor-${Math.random().toString(36).substr(2, 9)}`}
        style={{ 
          display: isEditorReady ? 'block' : 'none', 
          height: height,
          minHeight: height,
          width: '100%'
        }}
        height={height}
        isReadOnly={isReadOnly}
        enablePrint={false}
        enableSfdtExport={false}
        enableWordExport={false}
        enableTextExport={false}
        enableSelection={false}  // Disable selection to prevent Selection.js errors
        enableEditor={false}     // Disable editor to prevent interaction errors
        enableEditorHistory={false}
        enableContextMenu={false}
        enableSearch={false}
        enableOptionsPane={false}
        enableBookmarkDialog={false}
        enableBordersAndShadingDialog={false}
        enableFontDialog={false}
        enableTableDialog={false}
        enableParagraphDialog={false}
        enableHyperlinkDialog={false}
        enableImageResizer={false}
        enableListDialog={false}
        enablePageSetupDialog={false}
        enableStyleDialog={false}
        enableTableOfContentsDialog={false}
        enableTableOptionsDialog={false}
        enableTablePropertiesDialog={false}
        created={handleCreated}
        contentChange={handleContentChange}
        serviceUrl=""
      />
    </div>
  );
});

TemplatePreviewEditor.displayName = 'TemplatePreviewEditor';

export default TemplatePreviewEditor;
