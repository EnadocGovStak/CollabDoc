import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import './DocumentEditor.css';

const IsolatedDocumentEditor = forwardRef((props, ref) => {
  const iframeRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [content, setContent] = useState('');
  
  const {
    initialContent,
    isReadOnly = false,
    onContentChange,
    onSave,
    enableToolbar = true
  } = props;

  // Create the iframe content with Syncfusion editor
  const createIframeContent = () => {
    // Safely handle initialContent - convert to string and escape properly
    let contentString = '';
    if (initialContent) {
      try {
        if (typeof initialContent === 'string') {
          contentString = initialContent;
        } else if (typeof initialContent === 'object') {
          contentString = JSON.stringify(initialContent);
        } else {
          contentString = String(initialContent);
        }
        // Escape quotes and newlines for safe injection into JavaScript
        contentString = contentString.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
      } catch (e) {
        console.warn('Error processing initialContent:', e);
        contentString = '';
      }
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Document Editor</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        #editor { height: 100vh; width: 100%; }
        .loading { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            background: #f5f5f5;
        }
        .error {
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            background: #ffe6e6;
            color: #d8000c;
        }
    </style>
    <link href="https://cdn.syncfusion.com/ej2/22.2.5/material.css" rel="stylesheet" />
    <script src="https://cdn.syncfusion.com/ej2/22.2.5/dist/ej2.min.js"></script>
</head>
<body>
    <div class="loading" id="loading">
        <p>Loading document editor...</p>
    </div>
    <div class="error" id="error" style="display: none;">
        <p>Error loading document editor</p>
    </div>
    <div id="editor" style="display: none;"></div>
    
    <script>
        let documentEditor = null;
        let isInitialized = false;
        
        // Function to show error
        function showError(message) {
            console.error('DocumentEditor Error:', message);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'flex';
            document.getElementById('error').innerHTML = '<p>' + message + '</p>';
        }
        
        // Initialize the document editor
        function initializeEditor() {
            try {
                // Check if Syncfusion is loaded
                if (typeof ej === 'undefined' || !ej.documenteditor) {
                    showError('Syncfusion DocumentEditor not loaded properly');
                    return;
                }
                
                // Inject required modules - ALL modules from DocumentEditorDemo for full functionality
                console.log('Available ej.documenteditor modules:', Object.keys(ej.documenteditor || {}));
                
                if (ej.documenteditor.DocumentEditorContainer && ej.documenteditor.DocumentEditorContainer.Inject) {
                    // Array of all modules to inject
                    const modules = [
                        'Toolbar',
                        'SfdtExport', 
                        'Selection',
                        'Editor',
                        'EditorHistory',
                        'ContextMenu',
                        'Print',
                        'WordExport',
                        'TextExport',
                        'Search',
                        'ImageResizer',
                        'OptionsPane',
                        'HyperlinkDialog',
                        'TableDialog',
                        'BookmarkDialog',
                        'TableOfContentsDialog',
                        'PageSetupDialog',
                        'StyleDialog',
                        'ListDialog',
                        'ParagraphDialog',
                        'BulletsAndNumberingDialog',
                        'FontDialog',
                        'TablePropertiesDialog',
                        'BordersAndShadingDialog',
                        'TableOptionsDialog',
                        'CellOptionsDialog',
                        'StylesDialog'
                    ];
                    
                    // Filter to only include modules that actually exist
                    const availableModules = modules
                        .filter(moduleName => ej.documenteditor[moduleName])
                        .map(moduleName => ej.documenteditor[moduleName]);
                    
                    console.log('Injecting modules:', modules.filter(moduleName => ej.documenteditor[moduleName]));
                    console.log('Missing modules:', modules.filter(moduleName => !ej.documenteditor[moduleName]));
                    
                    ej.documenteditor.DocumentEditorContainer.Inject(...availableModules);
                    console.log('Syncfusion modules injected successfully - toolbar functionality should be available');
                } else {
                    console.error('DocumentEditorContainer.Inject not available');
                }
                
                console.log('Creating DocumentEditorContainer with toolbar enabled:', ${enableToolbar});
                
                documentEditor = new ej.documenteditor.DocumentEditorContainer({
                    height: '100%',
                    width: '100%',
                    enableToolbar: ${enableToolbar},
                    showPropertiesPane: false,
                    enableContextMenu: true,
                    enableMiniToolbar: false,
                    enableSelection: true,
                    isReadOnly: ${isReadOnly},
                    enableAutoFocus: false,
                    contentChange: function() {
                        if (documentEditor && documentEditor.documentEditor) {
                            try {
                                const content = documentEditor.documentEditor.serialize();
                                parent.postMessage({ type: 'contentChange', content: content }, '*');
                            } catch (e) {
                                console.warn('Error getting content:', e);
                            }
                        }
                    },
                    created: function() {
                        console.log('DocumentEditor created successfully in iframe');
                        document.getElementById('loading').style.display = 'none';
                        document.getElementById('editor').style.display = 'block';
                        
                        // Load initial content
                        setTimeout(() => {
                            loadInitialContent();
                            
                            // Focus the editor to make it interactive
                            if (documentEditor && documentEditor.documentEditor) {
                                try {
                                    documentEditor.documentEditor.focusIn();
                                    // Also ensure editor is not read-only unless specified
                                    if (!${isReadOnly}) {
                                        documentEditor.documentEditor.isReadOnly = false;
                                    }
                                    
                                    // Add keyboard shortcut for save (Ctrl+S / Cmd+S)
                                    documentEditor.documentEditor.keyDown = function(args) {
                                        if ((args.ctrlKey || args.metaKey) && args.keyCode === 83) { // 83 is 'S'
                                            args.preventDefault();
                                            parent.postMessage({ type: 'save' }, '*');
                                            return true;
                                        }
                                        return false;
                                    };
                                    
                                } catch (e) {
                                    console.warn('Error focusing/setting up editor:', e);
                                }
                            }
                            
                            // Mark as ready
                            isInitialized = true;
                            parent.postMessage({ type: 'ready' }, '*');
                        }, 100);
                    }
                });
                
                console.log('Appending DocumentEditor to DOM...');
                documentEditor.appendTo('#editor');
                
            } catch (error) {
                showError('Error initializing editor: ' + error.message);
            }
        }
        
        // Load initial content
        function loadInitialContent() {
            if (!documentEditor || !documentEditor.documentEditor) {
                console.warn('DocumentEditor not ready for loading content');
                return;
            }
            
            const initialContentStr = '${contentString}';
            console.log('Loading initial content, length:', initialContentStr.length);
            
            try {
                if (initialContentStr && initialContentStr.trim()) {
                    const parsed = JSON.parse(initialContentStr);
                    console.log('Parsed initial content:', parsed);
                    if (parsed.sections || parsed.sec || parsed.optimizeSfdt) {
                        console.log('Opening SFDT content...');
                        documentEditor.documentEditor.open(initialContentStr);
                    } else {
                        console.log('Content not SFDT format, opening blank...');
                        documentEditor.documentEditor.openBlank();
                    }
                } else {
                    console.log('No initial content, opening blank...');
                    documentEditor.documentEditor.openBlank();
                }
            } catch (e) {
                console.warn('Error loading initial content, opening blank:', e);
                documentEditor.documentEditor.openBlank();
            }
        }
        
        // Handle messages from parent
        window.addEventListener('message', function(event) {
            if (!documentEditor || !documentEditor.documentEditor || !isInitialized) return;
            
            const { type, data } = event.data;
            
            switch (type) {
                case 'getContent':
                    try {
                        const content = documentEditor.documentEditor.serialize();
                        parent.postMessage({ type: 'contentResponse', content: content }, '*');
                    } catch (e) {
                        parent.postMessage({ type: 'contentResponse', content: null, error: e.message }, '*');
                    }
                    break;
                    
                case 'setContent':
                    try {
                        if (data && data.trim()) {
                            const parsed = JSON.parse(data);
                            if (parsed.sections || parsed.sec || parsed.optimizeSfdt) {
                                documentEditor.documentEditor.open(data);
                            } else {
                                documentEditor.documentEditor.openBlank();
                            }
                        } else {
                            documentEditor.documentEditor.openBlank();
                        }
                    } catch (e) {
                        console.warn('Error setting content:', e);
                        documentEditor.documentEditor.openBlank();
                    }
                    break;
                    
                case 'setReadOnly':
                    try {
                        documentEditor.documentEditor.isReadOnly = data;
                        console.log('Read-only mode set to:', data);
                    } catch (e) {
                        console.warn('Error setting read-only mode:', e);
                    }
                    break;
            }
        });
        
        // Initialize when DOM and Syncfusion are ready
        function waitForSyncfusion() {
            if (typeof ej !== 'undefined' && ej.documenteditor && ej.documenteditor.DocumentEditorContainer) {
                console.log('Syncfusion loaded, initializing editor...');
                initializeEditor();
            } else {
                console.log('Waiting for Syncfusion to load...');
                setTimeout(waitForSyncfusion, 100);
            }
        }
        
        // Start initialization when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForSyncfusion);
        } else {
            waitForSyncfusion();
        }
    </script>
</body>
</html>`;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getContent: () => {
      return new Promise((resolve) => {
        if (!isReady || !iframeRef.current) {
          resolve(null);
          return;
        }
        
        const messageHandler = (event) => {
          if (event.data.type === 'contentResponse') {
            window.removeEventListener('message', messageHandler);
            resolve(event.data.content);
          }
        };
        
        window.addEventListener('message', messageHandler);
        iframeRef.current.contentWindow.postMessage({ type: 'getContent' }, '*');
        
        // Timeout after 5 seconds
        setTimeout(() => {
          window.removeEventListener('message', messageHandler);
          resolve(null);
        }, 5000);
      });
    },

    setContent: (content) => {
      if (isReady && iframeRef.current) {
        iframeRef.current.contentWindow.postMessage({ 
          type: 'setContent', 
          data: content 
        }, '*');
      }
    },

    focus: () => {
      if (isReady && iframeRef.current) {
        iframeRef.current.focus();
      }
    },

    isReady: () => isReady
  }), [isReady]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      const { type, content } = event.data;
      
      switch (type) {
        case 'ready':
          setIsReady(true);
          break;
          
        case 'contentChange':
          if (onContentChange && content) {
            setContent(content);
            onContentChange(content);
          }
          break;
          
        case 'save':
          if (onSave) {
            onSave();
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onContentChange]);

  // Update read-only mode when prop changes
  useEffect(() => {
    if (isReady && iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'setReadOnly', 
        data: isReadOnly 
      }, '*');
    }
  }, [isReadOnly, isReady]);

  return (
    <div 
      className="isolated-document-editor" 
      style={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={createIframeContent()}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Document Editor"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-pointer-lock allow-top-navigation"
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
          <p>Initializing isolated document editor...</p>
        </div>
      )}
    </div>
  );
});

IsolatedDocumentEditor.displayName = 'IsolatedDocumentEditor';

export default IsolatedDocumentEditor;
