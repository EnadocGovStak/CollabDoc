import React, { useEffect, useRef, useState } from 'react';
import { DocumentEditorContainerComponent, Toolbar } from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';
import './DocumentPreview.css';

// Register Syncfusion license
try {
  registerLicense('Ngo9BigBOggjHTQxAR8/V1NGaF1cXGFCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXpfeXRWRWZcVEB2V0tWYUs=');
} catch (error) {
  console.warn('Error registering Syncfusion license:', error);
}

// Inject required modules
DocumentEditorContainerComponent.Inject(Toolbar);

/**
 * Document Preview component for displaying merged documents
 * @param {Object} props Component props
 * @param {Object} props.document Document content object or string
 * @param {Object} props.mergeData Data to use for mail merge
 * @param {boolean} props.isLoading Loading state indicator
 */
const DocumentPreview = ({ document, mergeData, isLoading = false }) => {
  const editorRef = useRef(null);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const documentLoaded = useRef(false);
  const [editorKey, setEditorKey] = useState(1);

  // Called when editor component is created
  const created = () => {
    if (!editorRef.current?.documentEditor) {
      console.warn('Document editor not available in created callback');
      return;
    }
    
    try {
      console.log('DocumentPreview editor created');
      
      // Initialize with a blank document
      editorRef.current.documentEditor.openBlank();
      
      // Set to read-only mode
      editorRef.current.documentEditor.isReadOnly = true;
      
      // Disable toolbar items
      editorRef.current.toolbar.enableItems(0, false);
      
      setInitialized(true);
    } catch (err) {
      console.error('Error in DocumentPreview created:', err);
      setError('Failed to initialize document preview');
    }
  };

  // Handle document loading and mail merge
  useEffect(() => {
    const loadAndMerge = async () => {
      if (!initialized || !editorRef.current?.documentEditor || !document || isLoading) {
        return;
      }

      try {
        setPreviewReady(false);
        setError(null);
        
        console.log('Loading document for preview and mail merge');
        
        // Prepare document content
        let content = document;
        if (typeof content === 'object') {
          content = JSON.stringify(content);
        }
        
        // Load the document
        console.log('Opening document in preview editor');
        editorRef.current.documentEditor.open(content);
        documentLoaded.current = true;
        
        // If we have merge data, perform mail merge
        if (mergeData && Object.keys(mergeData).length > 0) {
          console.log('Performing mail merge with data:', mergeData);
          
          try {
            // Wait a moment to ensure document is fully loaded
            setTimeout(() => {
              try {
                const mailMerge = editorRef.current.documentEditor.mailMerge;
                
                // Prepare and execute mail merge
                const prepareData = () => {
                  // Check for table data to use executeGroup
                  const tableFields = Object.keys(mergeData).filter(key => 
                    Array.isArray(mergeData[key]) && mergeData[key].length > 0);
                  
                  if (tableFields.length > 0) {
                    // For each table field, execute group mail merge
                    tableFields.forEach(tableField => {
                      const tableData = mergeData[tableField];
                      if (tableData && tableData.length > 0) {
                        console.log(`Executing table mail merge for ${tableField}:`, tableData);
                        mailMerge.executeGroup(tableField, tableData);
                      }
                    });
                    
                    // Execute regular fields (non-array data)
                    const regularData = {};
                    Object.keys(mergeData).forEach(key => {
                      if (!Array.isArray(mergeData[key])) {
                        regularData[key] = mergeData[key];
                      }
                    });
                    
                    if (Object.keys(regularData).length > 0) {
                      console.log('Executing regular mail merge with fields:', regularData);
                      mailMerge.execute(regularData);
                    }
                  } else {
                    // No table data, just execute normal mail merge
                    console.log('Executing standard mail merge with fields:', mergeData);
                    mailMerge.execute(mergeData);
                  }
                };
                
                // Execute mail merge with a small delay
                prepareData();
                
                // Mark as ready
                setTimeout(() => {
                  setPreviewReady(true);
                }, 200);
              } catch (mergeError) {
                console.error('Error during mail merge execution:', mergeError);
                setError('Error merging document data');
                setPreviewReady(true); // Still mark as ready to show document
              }
            }, 300);
          } catch (err) {
            console.error('Error preparing mail merge:', err);
            setError('Error preparing document for mail merge');
            setPreviewReady(true);
          }
        } else {
          // No merge data, just display the document
          console.log('No merge data provided, displaying document as-is');
          setPreviewReady(true);
        }
      } catch (err) {
        console.error('Error loading document in preview:', err);
        setError('Error loading document preview');
        setPreviewReady(true);
      }
    };

    loadAndMerge();
  }, [document, mergeData, initialized, isLoading]);

  // Force refresh the component if needed
  const refreshPreview = () => {
    setEditorKey(prev => prev + 1);
    documentLoaded.current = false;
    setPreviewReady(false);
    
    // Clear out existing editor
    setTimeout(() => {
      if (editorRef.current?.documentEditor) {
        editorRef.current.documentEditor.openBlank();
        
        // Reload after a brief delay
        setTimeout(() => {
          loadAndMerge();
        }, 200);
      }
    }, 100);
  };

  return (
    <div className="document-preview-container">
      {isLoading && (
        <div className="document-preview-loader">
          <div className="spinner"></div>
          <p>Loading document...</p>
        </div>
      )}
      
      {error && (
        <div className="document-preview-error">
          <p>{error}</p>
          <button onClick={refreshPreview}>Retry</button>
        </div>
      )}
      
      {!previewReady && !isLoading && (
        <div className="document-preview-loader">
          <div className="spinner"></div>
          <p>Preparing preview...</p>
        </div>
      )}
      
      <DocumentEditorContainerComponent
        key={editorKey}
        ref={editorRef}
        enableToolbar={true}
        height="100%"
        width="100%"
        created={created}
        isReadOnly={true}
        enableEditor={true}
        enableSelection={true}
        enableContextMenu={false}
        style={{ visibility: previewReady ? 'visible' : 'hidden' }}
      />
    </div>
  );
};

export default DocumentPreview; 