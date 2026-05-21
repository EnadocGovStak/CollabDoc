import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
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
import { createStyledSfdtFromText, normalizeSfdtContent } from '../../utils/sfdtContent';

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
    return normalizeSfdtContent(content);
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
  const editorIdRef = useRef(`template-preview-editor-${Math.random().toString(36).substr(2, 9)}`);
  const initTimeoutRef = useRef(null);
  const onCreatedRef = useRef(onCreated);
  const onContentChangeRef = useRef(onContentChange);
  const initialContentRef = useRef(initialContent);
  const isReadOnlyRef = useRef(isReadOnly);
  const isEditorReadyRef = useRef(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    onCreatedRef.current = onCreated;
    onContentChangeRef.current = onContentChange;
    initialContentRef.current = initialContent;
    isReadOnlyRef.current = isReadOnly;
  }, [onCreated, onContentChange, initialContent, isReadOnly]);

  useEffect(() => {
    isEditorReadyRef.current = isEditorReady;
  }, [isEditorReady]);

  useEffect(() => () => {
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }
  }, []);

  const fitPreviewToContainer = useCallback(() => {
    if (!editorRef.current) return;

    try {
      editorRef.current.resize?.();
      editorRef.current.fitPage?.('FitPageWidth');
    } catch (error) {
      console.warn('Unable to fit template preview to container:', error);
    }
  }, []);

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
  const handleCreated = useCallback(() => {
    console.log('Template preview editor created');
    console.log('Initial content provided:', initialContentRef.current);
    console.log('Initial content type:', typeof initialContentRef.current);
    setHasError(false);
    
    try {
      if (editorRef.current) {
        // Wait a moment for the editor to fully initialize
        initTimeoutRef.current = setTimeout(() => {
          try {
            // Configure the editor for preview mode
            editorRef.current.isReadOnly = isReadOnlyRef.current;
            
            // Load initial content if provided
            if (initialContentRef.current) {
              console.log('Processing initial content for template preview...');
              const validContent = validateAndSanitizeContent(initialContentRef.current);
              console.log('Validated content:', validContent ? 'Valid' : 'Invalid');
              if (validContent) {
                console.log('Opening content in template preview editor...');
                editorRef.current.open(validContent);
                fitPreviewToContainer();
                console.log('Content loaded successfully in template preview');
              } else {
                console.warn('Invalid initial content provided to template preview, creating document from text');
                // Create a proper document with the template content as text
                const textContent = typeof initialContentRef.current === 'string' ? initialContentRef.current : JSON.stringify(initialContentRef.current);
                const properDoc = createStyledSfdtFromText(textContent);
                editorRef.current.open(properDoc);
                fitPreviewToContainer();
              }
            } else {
              console.log('No initial content provided, loading blank document');
              editorRef.current.openBlank();
              fitPreviewToContainer();
            }
            
            isEditorReadyRef.current = true;
            setIsEditorReady(true);
            
            if (onCreatedRef.current) {
              onCreatedRef.current();
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
  }, [fitPreviewToContainer]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!isEditorReadyRef.current || !editorRef.current) return;
    
    if (onContentChangeRef.current) {
      try {
        const content = editorRef.current.serialize();
        onContentChangeRef.current(content);
      } catch (error) {
        console.error('Failed to get content in template preview:', error);
      }
    }
  }, []);

  // Update content when initialContent prop changes
  useEffect(() => {
    if (isEditorReady && editorRef.current && initialContent) {
      const validContent = validateAndSanitizeContent(initialContent);
      if (validContent) {
        try {
          editorRef.current.open(validContent);
          fitPreviewToContainer();
        } catch (error) {
          console.error('Failed to update content in template preview:', error);
          setHasError(true);
        }
      } else {
        console.warn('Invalid content update in template preview');
      }
    }
  }, [initialContent, isEditorReady, fitPreviewToContainer]);

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
        id={editorIdRef.current}
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
