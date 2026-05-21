import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react';
import { registerLicense } from '@syncfusion/ej2-base';
import {
  DocumentEditorContainerComponent,
  Toolbar,
  SfdtExport,
  Selection,
  Editor,
  EditorHistory,
  ContextMenu,
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
import config from '../config';
import { normalizeSfdtContent } from '../utils/sfdtContent';

// Register Syncfusion license immediately at module load time
try {
  if (config.syncfusion && config.syncfusion.licenseKey) {
    registerLicense(config.syncfusion.licenseKey);
    console.log('Syncfusion license registered at module load');
  } else {
    console.warn('No Syncfusion license key found in config');
  }
} catch (error) {
  console.error('Error registering Syncfusion license at module load:', error);
}

// Inject necessary modules for Document Editor features
DocumentEditorContainerComponent.Inject(
  Toolbar,
  SfdtExport,
  Selection,
  Editor,
  EditorHistory,
  ContextMenu,
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

const DocumentEditorDemo = forwardRef((props, ref) => {
  const container = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const loadContentTimeoutRef = useRef(null);

  // Add missing refs
  const originalTemplateRef = useRef(null);
  const isPreviewModeRef = useRef(false);
  const {
    document: documentData,
    initialContent,
    isReadOnly = false,
    onDocumentChange,
    onSave,
    serviceUrl,
    mergeData,
    onContentChange,
    isPreview = false
  } = props;
  const documentContent = documentData?.content;
  const documentName = documentData?.name;
  const onContentChangeRef = useRef(onContentChange);
  const documentNameRef = useRef(documentName);

  // Add state for better user feedback
  const [, setMergeStatus] = useState('');

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  useEffect(() => {
    documentNameRef.current = documentName;
  }, [documentName]);

  // Simple temp SFDT generation for preview (like the Generate button)
  const createTempMergedSfdt = useCallback((templateContent, fieldsData) => {
    try {
      if (!templateContent || !fieldsData) return templateContent;

      let mergedContent = templateContent;

      Object.entries(fieldsData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
        mergedContent = mergedContent.replace(regex, String(value || ''));
      });

      return mergedContent;
    } catch (error) {
      console.error('Error creating temp merged SFDT:', error);
      return templateContent;
    }
  }, []);

  const handlePreviewWithMergeFields = useCallback((templateContent, fieldsData) => {
    if (!container.current || !container.current.documentEditor) return;

    const editor = container.current.documentEditor;

    try {
      const contentToUse = templateContent || originalTemplateRef.current;

      if (!contentToUse) {
        console.warn('No template content available for preview');
        return;
      }

      if (!fieldsData || Object.keys(fieldsData).length === 0) {
        console.log('No merge data provided for preview - loading original template');
        editor.open(contentToUse);
        isPreviewModeRef.current = false;
        return;
      }

      console.log('Creating non-destructive preview with merge data:', fieldsData);
      setMergeStatus('Preparing preview...');
      editor.open(contentToUse);

      setTimeout(() => {
        try {
          isPreviewModeRef.current = true;
          const tempMergedSfdt = createTempMergedSfdt(contentToUse, fieldsData);

          if (tempMergedSfdt && tempMergedSfdt !== contentToUse) {
            console.log('Loading temp merged SFDT for preview');
            setMergeStatus('Applying merge fields...');
            editor.open(tempMergedSfdt);
          } else {
            console.log('No merge changes made in preview');
          }

          if (isPreview) {
            editor.isReadOnly = true;
          }

          setMergeStatus('Preview ready');

          if (onContentChangeRef.current) {
            setTimeout(onContentChangeRef.current, 100);
          }

          setTimeout(() => setMergeStatus(''), 2000);
        } catch (mergeError) {
          console.error('Error during preview merge execution:', mergeError);
          if (originalTemplateRef.current) {
            editor.open(originalTemplateRef.current);
            isPreviewModeRef.current = false;
          }
        }
      }, 300);
    } catch (error) {
      console.error('Error in preview merge:', error);
      if (originalTemplateRef.current) {
        editor.open(originalTemplateRef.current);
        isPreviewModeRef.current = false;
      }
    }
  }, [createTempMergedSfdt, isPreview]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (container.current && container.current.documentEditor) {
        return container.current.documentEditor.serialize();
      }
      return null;
    },
    setContent: (content) => {
      if (container.current && container.current.documentEditor && content) {
        const normalizedContent = normalizeSfdtContent(content, { title: documentNameRef.current });
        if (normalizedContent) {
          container.current.documentEditor.open(normalizedContent);
          originalTemplateRef.current = normalizedContent;
          return true;
        }
      }
      return false;
    },
    saveDocument: () => {
      if (container.current && container.current.documentEditor) {
        const content = container.current.documentEditor.serialize();
        if (onSave) {
          onSave(content);
        }
        return content;
      }
      return null;
    },
    previewWithMergeFields: (fieldsData) => {
      if (container.current && container.current.documentEditor) {
        // Use the original template, not the current editor content
        const templateContent = originalTemplateRef.current;
        handlePreviewWithMergeFields(templateContent, fieldsData);
        return true;
      }
      return false;
    },
    resetToOriginalTemplate: () => {
      if (container.current && container.current.documentEditor && originalTemplateRef.current) {
        container.current.documentEditor.open(originalTemplateRef.current);
        isPreviewModeRef.current = false;
        return true;
      }
      return false;
    },
    insertTextAtCursor: (text) => {
      const editor = container.current?.documentEditor;

      if (!editor || !text) {
        return false;
      }

      try {
        if (editor.focusIn) {
          editor.focusIn();
        }

        const editorModule = editor.editorModule || editor.editor;

        if (editorModule?.insertText) {
          editorModule.insertText(text);
        } else {
          return false;
        }

        if (onContentChangeRef.current) {
          setTimeout(onContentChangeRef.current, 100);
        }

        return true;
      } catch (error) {
        console.error('Error inserting text into document editor:', error);
        return false;
      }
    }
  }), [onSave, handlePreviewWithMergeFields]);

  // Handle content changes
  const handleContentChange = () => {
    if (onDocumentChange && container.current && container.current.documentEditor) {
      const content = container.current.documentEditor.serialize();
      onDocumentChange(content);
    }
  };

  // Initialize editor with content - simplified approach
  useEffect(() => {
    if (!editorReady || !container.current?.documentEditor) {
      return;
    }

    const editor = container.current.documentEditor;
    if (loadContentTimeoutRef.current) {
      clearTimeout(loadContentTimeoutRef.current);
    }
    
    // Simple content loading
    const loadContent = () => {
      try {
        let contentToLoad = null;
        
        if (documentContent) {
          contentToLoad = documentContent;
        } else if (initialContent) {
          contentToLoad = initialContent;
        }

        if (contentToLoad) {
          const normalizedContent = normalizeSfdtContent(contentToLoad, { title: documentNameRef.current });

          if (normalizedContent) {
            editor.open(normalizedContent);
            originalTemplateRef.current = normalizedContent;
          } else {
            editor.openBlank();
            originalTemplateRef.current = editor.serialize();
          }
        } else {
          editor.openBlank();
          originalTemplateRef.current = editor.serialize();
        }

        if (isReadOnly) {
          editor.isReadOnly = true;
        }

        if (onContentChangeRef.current) {
          setTimeout(onContentChangeRef.current, 100);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        editor.openBlank();
        originalTemplateRef.current = editor.serialize();
      }
    };

    // Load content after a short delay
    loadContentTimeoutRef.current = setTimeout(loadContent, 100);

    return () => {
      if (loadContentTimeoutRef.current) {
        clearTimeout(loadContentTimeoutRef.current);
        loadContentTimeoutRef.current = null;
      }
    };
  }, [editorReady, documentContent, initialContent, isReadOnly]);

  // Separate effect for handling merge data without interfering with content loading
  useEffect(() => {
    if (!container.current || !container.current.documentEditor) return;
    
    // Only perform automatic merge if not in preview mode and we have merge data
    if (mergeData && Object.keys(mergeData).length > 0 && 
        !isPreview && 
        container.current.documentEditor && 
        container.current.documentEditor.isDocumentLoaded &&
        !isPreviewModeRef.current) { // Don't auto-merge if we're in preview mode
      
      try {
        console.log('Auto-performing mail merge with data:', Object.keys(mergeData));
        
        const timeoutId = setTimeout(() => {
          if (!container.current || !container.current.documentEditor || isPreviewModeRef.current) {
            console.log('Editor no longer available for merge or in preview mode');
            return;
          }
          
          const editor = container.current.documentEditor;
          
          // Create temp merged SFDT and load it (like Generate button)
          const tempMergedSfdt = createTempMergedSfdt(originalTemplateRef.current, mergeData);
          
          if (tempMergedSfdt && tempMergedSfdt !== originalTemplateRef.current) {
            console.log('Loading temp merged SFDT for auto-merge');
            editor.open(tempMergedSfdt);
          } else {
            console.log('No changes made during auto-merge');
          }
          
          // Call onContentChange callback if provided
          if (onContentChangeRef.current) {
            setTimeout(onContentChangeRef.current, 100);
          }
        }, 500); // Delay to ensure document is loaded
        
        // Cleanup function
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      } catch (error) {
        console.error('Error performing auto mail merge:', error);
        if (onContentChangeRef.current) {
          onContentChangeRef.current();
        }
      }
    }
  }, [mergeData, isPreview, createTempMergedSfdt]);

  // Fix context menu positioning after editor loads
  useEffect(() => {
    if (!container.current || !container.current.documentEditor) return;

    const fixContextMenuPositioning = () => {
      // Add event listener to fix context menu positioning
      const handleContextMenu = (e) => {
        setTimeout(() => {
          // Check if document and querySelectorAll are available
          if (typeof document !== 'undefined' && document.querySelectorAll) {
            // Find any context menu containers
            const contextMenus = document.querySelectorAll(
              '.e-contextmenu-container, .e-contextmenu-wrapper, .e-menu-container'
            );
            
            contextMenus.forEach(menu => {
              const rect = menu.getBoundingClientRect();
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;
              
              // Fix horizontal positioning
              if (rect.right > viewportWidth) {
                const newLeft = Math.max(10, viewportWidth - rect.width - 10);
                menu.style.left = newLeft + 'px';
                menu.style.right = 'auto';
              }
              
              // Fix vertical positioning
              if (rect.bottom > viewportHeight) {
                const newTop = Math.max(10, viewportHeight - rect.height - 10);
                menu.style.top = newTop + 'px';
                menu.style.bottom = 'auto';
              }
            });
          }
        }, 0);
      };
      
      // Add context menu event listener to the editor
      const editorElement = container.current.documentEditor.element;
      if (editorElement) {
        editorElement.addEventListener('contextmenu', handleContextMenu);
        return () => {
          editorElement.removeEventListener('contextmenu', handleContextMenu);
        };
      }
    };

    let cleanup = null;
    
    // Wait for editor to be fully loaded
    if (container.current.documentEditor.isDocumentLoaded) {
      cleanup = fixContextMenuPositioning();
    } else {
      // Listen for document loaded event
      const handleDocumentLoad = () => {
        cleanup = fixContextMenuPositioning();
      };
      
      container.current.documentEditor.documentChange = handleDocumentLoad;
    }
    
    // Return cleanup function
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []); // Empty dependency array - this only needs to run once

  return (
    <DocumentEditorErrorBoundary>
      <div className="document-editor-demo-container" style={{ height: '100%', width: '100%', flex: '1.5', minWidth: '60%' }}>
        <DocumentEditorContainerComponent
          ref={container}
          height="100%"
          enableToolbar={false}
          showPropertiesPane={false}
          serviceUrl={serviceUrl}
          contentChange={handleContentChange}
          enableContextMenu={!isPreview}
          enableMiniToolbar={false}
          enableOptionsPane={false}
          enableSelection={!isPreview}
          isReadOnly={isReadOnly || isPreview}
          created={() => {
            console.log('DocumentEditorComponent created');
            console.log('Container ref:', container.current);
            console.log('DocumentEditor:', container.current?.documentEditor);
            setEditorReady(true);
            
            // Signal that content is loaded if requested
            if (onContentChangeRef.current) {
              setTimeout(() => {
                console.log('Calling onContentChange after editor created');
                onContentChangeRef.current();
              }, 300);
            }

            // Disable context menu if it exists
            try {
              if (container.current && container.current.documentEditor) {
                const editor = container.current.documentEditor;
                
                // Hide properties pane programmatically
                if (container.current.showPropertiesPane) {
                  container.current.showPropertiesPane = false;
                }
                
                // Also hide it via the container properties
                if (container.current.documentEditor.enablePropertiesPane !== undefined) {
                  container.current.documentEditor.enablePropertiesPane = false;
                }
                
                // Find and hide properties pane elements
                setTimeout(() => {
                  // Check if document and querySelectorAll are available
                  if (typeof document !== 'undefined' && document.querySelectorAll) {
                    const propsPanes = document.querySelectorAll('.e-de-prop-pane, .e-documenteditor-container .e-de-prop-pane');
                    propsPanes.forEach(pane => {
                      pane.style.display = 'none';
                      pane.style.visibility = 'hidden';
                      pane.style.width = '0px';
                      pane.style.height = '0px';
                    });
                    
                    // Also adjust container layout
                    const containers = document.querySelectorAll('.e-de-container-right');
                    containers.forEach(container => {
                      container.style.display = 'none';
                      container.style.width = '0px';
                    });
                    
                    const leftContainers = document.querySelectorAll('.e-de-container-left');
                    leftContainers.forEach(container => {
                      container.style.width = '100%';
                      container.style.flex = '1';
                    });
                  }
                }, 100);
                
                // Disable context menu completely
                if (editor.contextMenu) {
                  editor.contextMenu.enableItems = [];
                  editor.contextMenu.destroy();
                }
                
                // Also try to disable the selection context menu
                if (editor.selection && editor.selection.contextMenu) {
                  editor.selection.contextMenu.enableItems = [];
                  editor.selection.contextMenu.destroy();
                }
                
                // For preview mode, disable selection and interaction completely
                if (isPreview) {
                  // Make editor truly read-only by disabling selection
                  editor.isReadOnly = true;
                  editor.enableSelection = false;
                  
                  // Disable all interactions
                  if (editor.editorHistory) {
                    editor.editorHistory.isEnabled = false;
                  }
                  
                  // Ensure no context menu appears
                  editor.enableContextMenu = false;
                }
                
                // Disable any context menu events
                const editorElement = editor.element;
                if (editorElement && isPreview) {
                    // For preview mode, block all context menus at the root level
                    editorElement.addEventListener('contextmenu', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }, true);
                    
                    // Add a class to the editor element for CSS targeting
                    editorElement.classList.add('preview-mode');
                    
                    // Also prevent selection by adding another layer
                    const overlay = document.createElement('div');
                    overlay.className = 'editor-preview-overlay';
                    overlay.style.position = 'absolute';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.right = '0';
                    overlay.style.bottom = '0';
                    overlay.style.zIndex = '10';
                    overlay.style.pointerEvents = 'none';
                    editorElement.parentNode.style.position = 'relative';
                    editorElement.parentNode.appendChild(overlay);
                    
                    // Find any existing context menus and remove them
                    setTimeout(() => {
                      if (typeof document !== 'undefined' && document.querySelectorAll) {
                        const contextMenus = document.querySelectorAll('.e-contextmenu-wrapper, .e-contextmenu-container');
                        contextMenus.forEach(menu => {
                          if (menu.parentNode) {
                            menu.parentNode.removeChild(menu);
                          }
                        });
                      }
                    }, 100);
                }
              }
            } catch (error) {
              console.warn('Error disabling context menu:', error);
            }
          }}
      />
      </div>
    </DocumentEditorErrorBoundary>
  );
});

DocumentEditorDemo.displayName = 'DocumentEditorDemo';

export default DocumentEditorDemo;
