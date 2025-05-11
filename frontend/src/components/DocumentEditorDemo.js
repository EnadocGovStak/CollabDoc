import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { DocumentEditorContainerComponent, Toolbar } from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';
import './DocumentEditor.css';

// Register Syncfusion license
registerLicense('Ngo9BigBOggjHTQxAR8/V1NGaF1cXGFCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXpeeXVXRGFZUk1zXUJWYUs=');

// Inject required modules
DocumentEditorContainerComponent.Inject(Toolbar);

const DocumentEditorDemo = forwardRef(({ document, onContentChange, readOnly = false }, ref) => {
    const editorRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editorInitialized, setEditorInitialized] = useState(false);
    const initialLoadCompleted = useRef(false);
    const contentChangeTimeout = useRef(null);
    const isContentChangeInProgress = useRef(false);
    const lastLoadedContent = useRef(null);
    const [editorKey, setEditorKey] = useState(1); // Add key to force re-render when needed

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        getContent: async () => {
            if (!editorRef.current?.documentEditor) return null;
            
            try {
                setIsLoading(true);
                // Prevent content change handler from firing during save
                isContentChangeInProgress.current = true;
                const content = await editorRef.current.documentEditor.serialize();
                return content;
            } catch (error) {
                console.error('Error serializing document:', error);
                return null;
            } finally {
                setIsLoading(false);
                // Re-enable content change handler
                setTimeout(() => {
                    isContentChangeInProgress.current = false;
                }, 100);
            }
        },
        loadContent: async (content) => {
            if (!editorRef.current || !editorRef.current.documentEditor) {
                console.warn('Editor reference not available for loading content');
                return false;
            }

            try {
                console.log('Loading content into editor');
                setIsLoading(true);
                isContentChangeInProgress.current = true;

                // Ensure content is parsed as object if it's a string
                let contentObj = content;
                if (typeof content === 'string') {
                    try {
                        contentObj = JSON.parse(content);
                    } catch (e) {
                        console.error('Error parsing content:', e);
                        return false;
                    }
                }
                
                // Save a reference to this content
                lastLoadedContent.current = contentObj;
                
                // Load the content into the editor
                editorRef.current.documentEditor.open(JSON.stringify(contentObj));
                initialLoadCompleted.current = true;
                
                // Force refresh if we have issues with content not showing
                setTimeout(() => {
                    if (editorRef.current?.documentEditor) {
                        try {
                            // Trigger a slight refresh of the editor
                            editorRef.current.documentEditor.selection.selectAll();
                            editorRef.current.documentEditor.selection.clearFormatting();
                        } catch (err) {
                            console.warn('Minor refresh error:', err);
                        }
                    }
                }, 300);
                
                return true;
            } catch (error) {
                console.error('Error loading content into editor:', error);
                // If loading fails, try to force a complete re-render of the editor
                setEditorKey(prevKey => prevKey + 1);
                return false;
            } finally {
                setIsLoading(false);
                // Re-enable content change handler after a delay
                setTimeout(() => {
                    isContentChangeInProgress.current = false;
                }, 500);
            }
        },
        reload: () => {
            if (lastLoadedContent.current && editorRef.current?.documentEditor) {
                try {
                    console.log('Reloading editor content from last saved content');
                    editorRef.current.documentEditor.open(JSON.stringify(lastLoadedContent.current));
                    return true;
                } catch (error) {
                    console.error('Error reloading document:', error);
                    // If reload fails, force complete re-render
                    setEditorKey(prevKey => prevKey + 1);
                    return false;
                }
            }
            return false;
        },
        forceRefresh: () => {
            // Force a complete re-render of the editor component
            setEditorKey(prevKey => prevKey + 1);
        }
    }));

    // Handle the editor creation
    const created = () => {
        if (!editorRef.current?.documentEditor) {
            console.warn('Editor reference not available on creation');
            return;
        }
        
        try {
            // Always start with a blank document first
            editorRef.current.documentEditor.openBlank();
            
            // Set up custom handlers
            const container = editorRef.current;
            
            // Handle document changes with debouncing
            container.documentEditor.contentChange = () => {
                // Don't update during save or initial load
                if (isContentChangeInProgress.current || !initialLoadCompleted.current) {
                    return;
                }
                
                // Clear any existing timeout to debounce rapid changes
                if (contentChangeTimeout.current) {
                    clearTimeout(contentChangeTimeout.current);
                }
                
                // Debounce content changes to prevent interrupting typing
                contentChangeTimeout.current = setTimeout(() => {
                    if (onContentChange && container.documentEditor) {
                        try {
                            const content = container.documentEditor.serialize();
                            onContentChange(content);
                        } catch (error) {
                            console.error('Error handling content change:', error);
                        }
                    }
                }, 1000); // Only update after 1 second of no typing
            };
            
            // Disable default save dialog
            container.documentEditor.saveAsEvent = () => {
                return false;
            };

            // Disable default open dialog
            container.documentEditor.beforeFileOpen = () => {
                return false;
            };

            // Mark the editor as initialized
            setEditorInitialized(true);
            console.log('Document editor initialized successfully');
        } catch (error) {
            console.error('Error creating document editor:', error);
        }
    };

    // Apply read-only mode when it changes
    useEffect(() => {
        if (editorRef.current?.documentEditor) {
            editorRef.current.documentEditor.isReadOnly = readOnly;
        }
    }, [readOnly]);

    // When editor is initialized and we have document content, try to load it
    useEffect(() => {
        const loadContent = async () => {
            // Skip if not initialized or no document
            if (!editorInitialized || !editorRef.current?.documentEditor || !document) {
                return;
            }

            // Prevent content change callbacks during loading
            isContentChangeInProgress.current = true;

            try {
                console.log('Attempting to load document content on initialization');
                
                // If we received actual content, try to open it
                if (document.content && typeof document.content === 'object') {
                    console.log('Loading content from document object');
                    lastLoadedContent.current = document.content;
                    editorRef.current.documentEditor.open(JSON.stringify(document.content));
                    initialLoadCompleted.current = true;
                }
                else if (document.content && typeof document.content === 'string' && document.content.length > 10) {
                    console.log('Loading content from document string');
                    try {
                        const contentObj = JSON.parse(document.content);
                        lastLoadedContent.current = contentObj;
                        editorRef.current.documentEditor.open(JSON.stringify(contentObj));
                    } catch (error) {
                        // If not valid JSON, try using directly
                        editorRef.current.documentEditor.open(document.content);
                        lastLoadedContent.current = document.content;
                    }
                    initialLoadCompleted.current = true;
                }
                else {
                    console.log('No valid content found, opening blank document');
                    editorRef.current.documentEditor.openBlank();
                    initialLoadCompleted.current = true;
                }
            } catch (error) {
                console.error('Error loading document content:', error);
                // If there's an error, ensure we have a blank document
                try {
                    editorRef.current.documentEditor.openBlank();
                    initialLoadCompleted.current = true; 
                } catch (innerError) {
                    console.error('Error opening blank document:', innerError);
                }
            } finally {
                // Re-enable content change callbacks
                setTimeout(() => {
                    isContentChangeInProgress.current = false;
                }, 500);
            }
        };

        loadContent();
    }, [editorInitialized, document?.id, document?.version]); // Add document.version to dependencies

    return (
        <div className="document-editor-container">
            {/* Loading Indicator */}
            {isLoading && (
                <div className="loading-overlay">
                    <span>Loading...</span>
                </div>
            )}

            {/* Document Editor */}
            <DocumentEditorContainerComponent 
                key={editorKey} // Add key for forcing re-renders
                ref={editorRef}
                enableToolbar={true}
                height="100%"
                created={created}
                enableEditor={true}
                enableSelection={true}
                enableSfdtExport={true}
                enableWordExport={true}
                showPropertiesPane={false}
                enableContextMenu={true}
                isReadOnly={readOnly}
            />
        </div>
    );
});

DocumentEditorDemo.displayName = 'DocumentEditorDemo';

export default DocumentEditorDemo; 