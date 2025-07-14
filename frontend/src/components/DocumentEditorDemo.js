import React, { forwardRef, useImperativeHandle, useRef, useEffect, useMemo, useState } from 'react';
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

// Register Syncfusion license
registerLicense(config.syncfusion.licenseKey);

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
  const { 
    document, 
    initialContent, 
    isReadOnly = false, 
    onDocumentChange, 
    onSave,
    serviceUrl,
    mergeData,
    onContentChange,
    enableToolbar = true,
    isPreview = false
  } = props;

  // Add state for better user feedback
  const [mergeStatus, setMergeStatus] = useState('');

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
        container.current.documentEditor.open(content);
      }
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
    }
  }), [onSave]);

  // Handle content changes
  const handleContentChange = () => {
    if (onDocumentChange && container.current && container.current.documentEditor) {
      const content = container.current.documentEditor.serialize();
      onDocumentChange(content);
    }
  };

  // Initialize editor with content - use a ref to track if content has been loaded
  const contentLoadedRef = useRef(false);
  const lastLoadedContentRef = useRef(null);
  // Store original template content separately for non-destructive preview
  const originalTemplateRef = useRef(null);
  const isPreviewModeRef = useRef(false);
  
  // Memoize content string to avoid unnecessary re-renders
  const contentString = useMemo(() => {
    let contentToLoad = null;
    if (document && document.content) {
      contentToLoad = document.content;
    } else if (initialContent) {
      contentToLoad = initialContent;
    }
    return typeof contentToLoad === 'string' ? contentToLoad : JSON.stringify(contentToLoad);
  }, [document?.content, initialContent]);
  
  useEffect(() => {
    console.log('useEffect triggered - container.current:', !!container.current);
    if (!container.current || !container.current.documentEditor) {
      console.log('Editor not ready yet, waiting...');
      return;
    }

    const editor = container.current.documentEditor;
    console.log('Editor found:', !!editor);
    
    // Only load content if it's different from what was last loaded
    if (contentString === lastLoadedContentRef.current) {
      console.log('Content unchanged, skipping reload');
      return; // Don't reload the same content
    }
    
    console.log('Loading content:', contentString ? 'content available' : 'no content');
    
    // Simple 200ms delay for standard initialization
    const timeoutId = setTimeout(() => {
      try {
        // Check if component is still mounted and editor is available
        if (!container.current || !container.current.documentEditor) {
          console.log('Editor no longer available during content load');
          return;
        }
        
        // Determine content source again inside timeout
        let contentToLoad = null;
        
        if (document && document.content) {
          contentToLoad = document.content;
        } else if (initialContent) {
          contentToLoad = initialContent;
        }

        if (contentToLoad) {
          // Create a proper SFDT document structure for any content
          const createProperSfdt = (textContent) => {
            // Split text into lines and create proper paragraph blocks
            const lines = textContent.split('\n');
            const blocks = [];
            
            lines.forEach((line, lineIndex) => {
              // Create a paragraph block for each line
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
            
            return {
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
              "styles": [
                {
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
                }
              ]
            };
          };

          // Load the content
          if (typeof contentToLoad === 'string') {
            try {
              // Try to parse as JSON first
              const parsed = JSON.parse(contentToLoad);
              
              // Check if it's a proper SFDT document
              if (parsed.sections || parsed.sec || parsed.optimizeSfdt) {
                // It's already a proper SFDT document
                console.log('Loading pre-formatted SFDT document');
                const sfdtString = JSON.stringify(parsed);
                editor.open(sfdtString);
                // Store original template for non-destructive preview
                originalTemplateRef.current = sfdtString;
              } else if (parsed.sfdt && typeof parsed.sfdt === 'string') {
                // It's wrapped in a {sfdt: "text"} format - create proper SFDT from text
                console.log('Converting wrapped SFDT text to proper document');
                const properSfdt = createProperSfdt(parsed.sfdt);
                const sfdtString = JSON.stringify(properSfdt);
                editor.open(sfdtString);
                // Store original template for non-destructive preview
                originalTemplateRef.current = sfdtString;
              } else {
                // Unknown JSON format, treat as plain text
                console.log('Converting unknown JSON format to document');
                const properSfdt = createProperSfdt(JSON.stringify(parsed));
                const sfdtString = JSON.stringify(properSfdt);
                editor.open(sfdtString);
                // Store original template for non-destructive preview
                originalTemplateRef.current = sfdtString;
              }
            } catch (e) {
              // If parsing fails, it's plain text - create proper SFDT
              console.log('Converting plain text to SFDT document');
              const properSfdt = createProperSfdt(contentToLoad);
              const sfdtString = JSON.stringify(properSfdt);
              editor.open(sfdtString);
              // Store original template for non-destructive preview
              originalTemplateRef.current = sfdtString;
            }
          } else if (typeof contentToLoad === 'object') {
            // Already an object
            if (contentToLoad.sections || contentToLoad.sec || contentToLoad.optimizeSfdt) {
              // It's already a proper SFDT document
              console.log('Loading SFDT object document');
              const sfdtString = JSON.stringify(contentToLoad);
              editor.open(sfdtString);
              // Store original template for non-destructive preview
              originalTemplateRef.current = sfdtString;
            } else if (contentToLoad.sfdt && typeof contentToLoad.sfdt === 'string') {
              // It's wrapped in a {sfdt: "text"} format
              console.log('Converting wrapped SFDT object to proper document');
              const properSfdt = createProperSfdt(contentToLoad.sfdt);
              const sfdtString = JSON.stringify(properSfdt);
              editor.open(sfdtString);
              // Store original template for non-destructive preview
              originalTemplateRef.current = sfdtString;
            } else {
              // Unknown object format, convert to text first
              console.log('Converting unknown object format to document');
              const properSfdt = createProperSfdt(JSON.stringify(contentToLoad));
              const sfdtString = JSON.stringify(properSfdt);
              editor.open(sfdtString);
              // Store original template for non-destructive preview
              originalTemplateRef.current = sfdtString;
            }
          }
          
          // Mark content as loaded and store the loaded content
          lastLoadedContentRef.current = contentString;
          contentLoadedRef.current = true;
          
          // Signal content is loaded
          if (onContentChange) {
            console.log('Content loaded, signaling via onContentChange');
            setTimeout(onContentChange, 100);
          }
        } else {
          // Load blank document
          editor.openBlank();
          lastLoadedContentRef.current = '';
          contentLoadedRef.current = true;
          // Store blank template
          originalTemplateRef.current = editor.serialize();
        }

        // Set read-only mode
        if (isReadOnly) {
          editor.isReadOnly = true;
        }

      } catch (error) {
        console.error('Error loading content:', error);
        // Fallback to blank document
        if (container.current && container.current.documentEditor) {
          container.current.documentEditor.openBlank();
        }
      }
    }, 200);
    
    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [contentString, isReadOnly]); // Keep dependencies minimal and stable

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
          if (onContentChange) {
            setTimeout(onContentChange, 100);
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
        if (onContentChange) {
          onContentChange();
        }
      }
    }
  }, [mergeData, isPreview]); // Remove onContentChange from dependencies to prevent loops

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

  // Simple temp SFDT generation for preview (like the Generate button)
  const createTempMergedSfdt = (templateContent, mergeData) => {
    try {
      if (!templateContent || !mergeData) return templateContent;
      
      // Simple string replacement in the SFDT content - same as Generate button
      let mergedContent = templateContent;
      
      Object.entries(mergeData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
        mergedContent = mergedContent.replace(regex, String(value || ''));
      });
      
      return mergedContent;
    } catch (error) {
      console.error('Error creating temp merged SFDT:', error);
      return templateContent;
    }
  };
  const handlePreviewWithMergeFields = (templateContent, fieldsData) => {
    if (!container.current || !container.current.documentEditor) return;
    
    const editor = container.current.documentEditor;
    
    try {
      // Use the original template content or current content as fallback
      const contentToUse = templateContent || originalTemplateRef.current;
      
      if (!contentToUse) {
        console.warn('No template content available for preview');
        return;
      }
      
      // Only proceed if we have merge data
      if (!fieldsData || Object.keys(fieldsData).length === 0) {
        console.log('No merge data provided for preview - loading original template');
        editor.open(contentToUse);
        isPreviewModeRef.current = false;
        return;
      }
      
      console.log('Creating non-destructive preview with merge data:', fieldsData);
      setMergeStatus('Preparing preview...');
      
      // First, load the original template
      editor.open(contentToUse);
      
      // Wait a moment for document to be fully loaded before merging
      setTimeout(() => {
        try {
          isPreviewModeRef.current = true;
          
          // Create temp merged SFDT and load it (like Generate button)
          const tempMergedSfdt = createTempMergedSfdt(contentToUse, fieldsData);
          
          if (tempMergedSfdt && tempMergedSfdt !== contentToUse) {
            console.log('Loading temp merged SFDT for preview');
            setMergeStatus('Applying merge fields...');
            editor.open(tempMergedSfdt);
          } else {
            console.log('No merge changes made in preview');
          }
          
          // Ensure editor is in read-only mode for preview
          if (isPreview) {
            editor.isReadOnly = true;
          }
          
          setMergeStatus('Preview ready');
          
          // Signal that preview is ready
          if (onContentChange) {
            setTimeout(onContentChange, 100);
          }
          
          // Clear status after a moment
          setTimeout(() => setMergeStatus(''), 2000);
          
        } catch (mergeError) {
          console.error('Error during preview merge execution:', mergeError);
          // Reset to original template on error
          if (originalTemplateRef.current) {
            editor.open(originalTemplateRef.current);
            isPreviewModeRef.current = false;
          }
        }
      }, 300); // Give document time to load
      
    } catch (error) {
      console.error('Error in preview merge:', error);
      // Reset to original template on error
      if (originalTemplateRef.current) {
        editor.open(originalTemplateRef.current);
        isPreviewModeRef.current = false;
      }
    }
  };

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
            
            // Signal that content is loaded if requested
            if (onContentChange) {
              setTimeout(() => {
                console.log('Calling onContentChange after editor created');
                onContentChange();
              }, 300);
            }
            
            // Try to load a simple document to test if editor is working
            setTimeout(() => {
              if (container.current && container.current.documentEditor) {
                console.log('Testing editor with blank document');
                try {
                  container.current.documentEditor.openBlank();
                  console.log('Blank document loaded successfully');
                } catch (error) {
                  console.error('Error loading blank document:', error);
                }
              }
            }, 500);

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
                if (editorElement) {
                  if (isPreview) {
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
