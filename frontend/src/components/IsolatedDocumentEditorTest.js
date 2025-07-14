import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';

const IsolatedDocumentEditorTest = forwardRef((props, ref) => {
  const iframeRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  
  const {
    initialContent,
    isReadOnly = false,
    onContentChange,
    enableToolbar = true
  } = props;

  // Create simplified iframe content for testing
  const createIframeContent = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Document Editor Test</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        #editor { height: 100vh; width: 100%; }
        .loading { 
            display: flex; 
            flex-direction: column;
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            background: #f5f5f5;
        }
        .status {
            margin: 10px 0;
            padding: 10px;
            background: #e8f4f8;
            border-radius: 4px;
        }
    </style>
    <link href="https://cdn.syncfusion.com/ej2/22.2.5/material.css" rel="stylesheet" />
    <script src="https://cdn.syncfusion.com/ej2/22.2.5/dist/ej2.min.js"></script>
</head>
<body>
    <div class="loading" id="loading">
        <p>Testing Syncfusion DocumentEditor...</p>
        <div class="status" id="status">Initializing...</div>
    </div>
    <div id="editor" style="display: none;"></div>
    
    <script>
        let documentEditor = null;
        let isInitialized = false;
        
        function updateStatus(message) {
            document.getElementById('status').textContent = message;
            console.log('Status:', message);
        }
        
        function showError(message) {
            updateStatus('ERROR: ' + message);
            document.getElementById('loading').style.background = '#ffe6e6';
        }
        
        function testSyncfusion() {
            updateStatus('Checking Syncfusion availability...');
            
            if (typeof ej === 'undefined') {
                showError('ej global object not found');
                return false;
            }
            
            updateStatus('ej object found, checking documenteditor...');
            
            if (!ej.documenteditor) {
                showError('ej.documenteditor not found');
                return false;
            }
            
            updateStatus('documenteditor module found, checking DocumentEditorContainer...');
            
            if (!ej.documenteditor.DocumentEditorContainer) {
                showError('DocumentEditorContainer not found');
                return false;
            }
            
            updateStatus('All Syncfusion components found!');
            return true;
        }
        
        function initializeEditor() {
            try {
                updateStatus('Creating DocumentEditorContainer...');
                
                documentEditor = new ej.documenteditor.DocumentEditorContainer({
                    height: '100%',
                    width: '100%',
                    enableToolbar: true,
                    isReadOnly: false,
                    created: function() {
                        updateStatus('DocumentEditor created successfully!');
                        document.getElementById('loading').style.display = 'none';
                        document.getElementById('editor').style.display = 'block';
                        
                        // Open a blank document
                        setTimeout(() => {
                            try {
                                documentEditor.documentEditor.openBlank();
                                updateStatus('Blank document loaded');
                                isInitialized = true;
                                parent.postMessage({ type: 'ready' }, '*');
                            } catch (e) {
                                showError('Error opening blank document: ' + e.message);
                            }
                        }, 100);
                    }
                });
                
                updateStatus('Appending to DOM...');
                documentEditor.appendTo('#editor');
                
            } catch (error) {
                showError('Error creating editor: ' + error.message);
            }
        }
        
        function waitForSyncfusion() {
            if (testSyncfusion()) {
                initializeEditor();
            } else {
                setTimeout(waitForSyncfusion, 200);
            }
        }
        
        // Start when ready
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
    isReady: () => isReady
  }), [isReady]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'ready') {
        setIsReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div 
      style={{ 
        height: '500px', 
        width: '100%', 
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
          border: 'none'
        }}
        title="Document Editor Test"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
});

IsolatedDocumentEditorTest.displayName = 'IsolatedDocumentEditorTest';

export default IsolatedDocumentEditorTest;
