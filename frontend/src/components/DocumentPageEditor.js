import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import {
  DocumentEditorContainerComponent,
  DocumentEditorContainer,
  Toolbar,
  SfdtExport,
  Selection,
  Editor,
  EditorHistory,
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
import DocumentEditorErrorBoundary from './DocumentEditorErrorBoundary';
import './DocumentEditor.css';

// Inject all required modules into the base class (NOT the React component)
DocumentEditorContainer.Inject(
  Toolbar,
  SfdtExport,
  Selection,
  Editor,
  EditorHistory,
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
);

const DocumentPageEditor = forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const contentChangeTimeout = useRef(null);
  // State for user notifications
  const [notification, setNotification] = useState(null);
  
  const {
    initialContent,
    isReadOnly = false,
    onContentChange,
    onSave,
    enableToolbar = true,
    sidebarHasFocus = false
  } = props;

  // Show notification to user
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Debounced content change handler to prevent excessive updates
  const handleContentChange = () => {
    if (!onContentChange || !containerRef.current?.documentEditor) return;
    
    // Clear any existing timeout
    if (contentChangeTimeout.current) {
      clearTimeout(contentChangeTimeout.current);
    }
    
    // Set a new timeout to debounce the content change
    contentChangeTimeout.current = setTimeout(() => {
      try {
        const content = containerRef.current.documentEditor.serialize();
        onContentChange(content);
      } catch (error) {
        console.warn('Error getting document content:', error);
      }
    }, 500); // 500ms debounce
  };

  // Validate if content looks like valid SFDT
  const isValidSfdt = (content) => {
    try {
      if (typeof content !== 'string') return false;
      
      const trimmed = content.trim();
      if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return false;
      
      const parsed = JSON.parse(content);
      
      // Check for required SFDT structure
      return !!(
        parsed && 
        typeof parsed === 'object' &&
        (parsed.sections || parsed.sec || parsed.optimizeSfdt || parsed.sfdt)
      );
    } catch {
      return false;
    }
  };

  // Safe wrapper for documentEditor.open() with error recovery
  const safeOpenDocument = (content) => {
    try {
      containerRef.current.documentEditor.open(content);
      console.log('Successfully loaded document content');
      return true;
    } catch (error) {
      console.error('Failed to load document content:', error);
      
      // Enhanced error detection for various content issues
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('invalid base64') || 
          errorMessage.includes('bad content length') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('malformed') ||
          errorMessage.includes('corrupted') ||
          errorMessage.includes('zip') ||
          errorMessage.includes('archive')) {
        console.warn('Content appears corrupted or improperly formatted, opening blank document instead');
        
        // Show user-friendly notification
        showNotification('Document content appears corrupted. Opening a blank document instead.', 'warning');
        
        try {
          containerRef.current.documentEditor.openBlank();
        } catch (blankError) {
          console.error('Failed to open blank document:', blankError);
        }
        return false;
      }
      
      // For other errors, still try to recover with blank document
      try {
        containerRef.current.documentEditor.openBlank();
      } catch (blankError) {
        console.error('Failed to open blank document:', blankError);
      }
      return false;
    }
  };

  // Clean and safe method to load content into the editor
  const loadContent = (content) => {
    if (!containerRef.current?.documentEditor) {
      console.warn('DocumentEditor not ready for content loading');
      return;
    }

    try {
      // Handle different content types
      if (!content || content === '') {
        console.log('Loading blank document - no content provided');
        containerRef.current.documentEditor.openBlank();
        return;
      }

      if (typeof content === 'string') {
        const trimmed = content.trim();
        
        // Check if it's valid SFDT JSON first
        if (isValidSfdt(content)) {
          console.log('Loading valid SFDT JSON content');
          safeOpenDocument(content);
          return;
        }
        
        // If it looks like malformed JSON or SFDT, don't try to open it
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          console.warn('Content looks like JSON but not valid SFDT, treating as plain text');
          containerRef.current.documentEditor.openBlank();
          if (trimmed.length < 10000) { // Prevent inserting huge content as plain text
            containerRef.current.documentEditor.editor.insertText(content);
          } else {
            containerRef.current.documentEditor.editor.insertText('Content too large to display as plain text');
          }
          return;
        }
        
        // If it's not JSON-like, treat as plain text
        if (trimmed.length > 0) {
          console.log('Loading content as plain text');
          containerRef.current.documentEditor.openBlank();
          if (trimmed.length < 10000) { // Prevent inserting huge content
            containerRef.current.documentEditor.editor.insertText(content);
          } else {
            containerRef.current.documentEditor.editor.insertText('Content too large to display');
          }
        } else {
          console.log('Loading blank document - empty content');
          containerRef.current.documentEditor.openBlank();
        }
      } else if (typeof content === 'object' && content !== null) {
        // Already an object, validate and stringify it
        console.log('Loading content as SFDT object');
        try {
          const stringified = JSON.stringify(content);
          if (isValidSfdt(stringified)) {
            safeOpenDocument(stringified);
          } else {
            console.warn('Object content is not valid SFDT, opening blank document');
            containerRef.current.documentEditor.openBlank();
          }
        } catch (stringifyError) {
          console.error('Error stringifying object content:', stringifyError);
          containerRef.current.documentEditor.openBlank();
        }
      } else {
        // Unknown content type, open blank
        console.log('Loading blank document - unknown content type');
        containerRef.current.documentEditor.openBlank();
      }
    } catch (error) {
      console.error('Error in loadContent:', error);
      // Always ensure we have a usable editor state
      try {
        containerRef.current.documentEditor.openBlank();
      } catch (blankError) {
        console.error('Critical error: Cannot even open blank document:', blankError);
      }
    }
  };

  // Simple and effective focus protection
  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    let focusTimeout;
    
    const handleEditorFocus = (event) => {
      // If sidebar has focus, prevent editor from taking it
      if (sidebarHasFocus) {
        console.log('DocumentPageEditor: Preventing focus while sidebar is active');
        event.preventDefault();
        event.stopImmediatePropagation();
        
        // Blur the editor element that tried to focus
        if (event.target) {
          event.target.blur();
        }
        
        return false;
      }
    };

    const handleEditorClick = (event) => {
      // If sidebar has focus, prevent clicks from focusing editor
      if (sidebarHasFocus) {
        console.log('DocumentPageEditor: Preventing click focus while sidebar is active');
        event.preventDefault();
        return false;
      }
    };

    // Add event listeners to the editor container
    const editorElement = containerRef.current.element;
    if (editorElement) {
      editorElement.addEventListener('focus', handleEditorFocus, true);
      editorElement.addEventListener('focusin', handleEditorFocus, true);
      editorElement.addEventListener('click', handleEditorClick, true);
      editorElement.addEventListener('mousedown', handleEditorClick, true);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('focus', handleEditorFocus, true);
        editorElement.removeEventListener('focusin', handleEditorFocus, true);
        editorElement.removeEventListener('click', handleEditorClick, true);
        editorElement.removeEventListener('mousedown', handleEditorClick, true);
      }
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
    };
  }, [isReady, sidebarHasFocus]);

  // Expose methods via ref for parent component to use
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (!containerRef.current?.documentEditor) {
        console.warn('DocumentEditor not available for getContent');
        return null;
      }
      try {
        return containerRef.current.documentEditor.serialize();
      } catch (error) {
        console.error('Error getting document content:', error);
        return null;
      }
    },

    setContent: (content) => {
      loadContent(content);
    },

    focus: () => {
      // Only focus if sidebar doesn't have focus
      if (!sidebarHasFocus && containerRef.current?.documentEditor) {
        try {
          containerRef.current.documentEditor.focusIn();
        } catch (error) {
          console.warn('Error focusing editor:', error);
        }
      }
    },

    isReady: () => isReady
  }), [isReady, sidebarHasFocus]);

  // Handle component creation and setup
  const handleCreated = () => {
    console.log('DocumentPageEditor created and initializing...');
    
    // Use setTimeout to ensure the component is fully initialized
    setTimeout(() => {
      if (!containerRef.current?.documentEditor) {
        console.error('DocumentEditor not available after creation');
        return;
      }

      try {
        // Set read-only mode
        containerRef.current.documentEditor.isReadOnly = isReadOnly;
        
        // Override context menu methods to prevent them from being called
        if (containerRef.current.documentEditor.contextMenu) {
          const originalOpen = containerRef.current.documentEditor.contextMenu.open;
          const originalBeforeOpen = containerRef.current.documentEditor.contextMenu.beforeOpen;
          
          containerRef.current.documentEditor.contextMenu.open = function(...args) {
            console.log('DocumentPageEditor: Blocked context menu open');
            return false;
          };
          
          containerRef.current.documentEditor.contextMenu.beforeOpen = function(...args) {
            console.log('DocumentPageEditor: Blocked context menu beforeOpen');
            return false;
          };
        }

        // Also check for any context menu on the container
        if (containerRef.current.contextMenu) {
          containerRef.current.contextMenu.open = function(...args) {
            console.log('DocumentPageEditor: Blocked container context menu open');
            return false;
          };
        }
        
        // Load initial content
        loadContent(initialContent);
        
        // Mark as ready
        setIsReady(true);
        
        console.log('DocumentPageEditor initialized successfully');
      } catch (error) {
        console.error('Error during DocumentEditor initialization:', error);
      }
    }, 100); // Small delay to ensure everything is ready
  };

  // Handle save keyboard shortcut
  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      if (onSave) {
        onSave();
      }
    }
  };

  // Handle component cleanup
  useEffect(() => {
    return () => {
      if (contentChangeTimeout.current) {
        clearTimeout(contentChangeTimeout.current);
      }
    };
  }, []);

  // Update read-only mode when prop changes
  useEffect(() => {
    if (isReady && containerRef.current?.documentEditor) {
      containerRef.current.documentEditor.isReadOnly = isReadOnly;
    }
  }, [isReadOnly, isReady]);

  return (
    <DocumentEditorErrorBoundary>
      <div 
        className="document-page-editor-container" 
        style={{ 
          height: '100%', 
          width: '100%', 
          flex: '1.5', 
          minWidth: '60%',
          position: 'relative'
        }}
        onKeyDown={handleKeyDown}
      >
        <DocumentEditorContainerComponent
          ref={containerRef}
          height="100%"
          width="100%"
          enableToolbar={enableToolbar}
          showPropertiesPane={true}
          enableContextMenu={false}
          enableMiniToolbar={false}
          enableSelection={true}
          isReadOnly={isReadOnly}
          enableAutoFocus={false}
          enableLocalPaste={false}
          contentChange={handleContentChange}
          created={handleCreated}
          serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
          onContextMenu={(e) => {
            console.log('DocumentPageEditor: Blocking onContextMenu event');
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          onMouseDown={(e) => {
            if (e.button === 2) { // Right mouse button
              console.log('DocumentPageEditor: Blocking right mouse button');
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }}
        />
        
        {!isReady && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '4px',
            zIndex: 1000
          }}>
            <p>Loading document editor...</p>
          </div>
        )}

        {notification && (
          <div className={`notification ${notification.type}`} style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '10px',
            borderRadius: '4px',
            zIndex: 1000,
            backgroundColor: notification.type === 'error' ? '#f8d7da' : '#d1e7dd',
            color: notification.type === 'error' ? '#721c24' : '#0f5132',
            border: notification.type === 'error' ? '1px solid #f5c6cb' : '1px solid #c3e6cb'
          }}>
            {notification.message}
          </div>
        )}
      </div>
    </DocumentEditorErrorBoundary>
  );
});

DocumentPageEditor.displayName = 'DocumentPageEditor';

export default DocumentPageEditor;
