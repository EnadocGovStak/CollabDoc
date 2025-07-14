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

// Inject modules directly into DocumentEditorContainer
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

const DocumentEditorPreview = forwardRef((props, ref) => {
  const container = useRef(null);
  const { 
    document, 
    initialContent, 
    serviceUrl,
    mergeData,
    onContentChange
  } = props;

  // Add state for better user feedback
  const [mergeStatus, setMergeStatus] = useState('');

  // Store original template content separately for non-destructive preview
  const originalTemplateRef = useRef(null);
  const lastLoadedContentRef = useRef(null);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (container.current && container.current.documentEditor) {
        return container.current.documentEditor.serialize();
      }
      return null;
    },
    previewWithMergeFields: (templateContent, fieldsData) => {
      handlePreviewWithMergeFields(templateContent, fieldsData);
      return true;
    },
    resetToOriginalTemplate: () => {
      if (container.current && container.current.documentEditor && originalTemplateRef.current) {
        container.current.documentEditor.open(originalTemplateRef.current);
        return true;
      }
      return false;
    }
  }), []);
  
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
    console.log('Preview useEffect triggered - container.current:', !!container.current);
    if (!container.current || !container.current.documentEditor) {
      console.log('Preview editor not ready yet, waiting...');
      return;
    }

    const editor = container.current.documentEditor;
    console.log('Preview editor found:', !!editor);
    
    // Only load content if it's different from what was last loaded
    if (contentString === lastLoadedContentRef.current) {
      console.log('Preview content unchanged, skipping reload');
      return;
    }
    
    console.log('Loading preview content:', contentString ? 'content available' : 'no content');
    
    // Simple 200ms delay for standard initialization
    const timeoutId = setTimeout(() => {
      try {
        if (!container.current || !container.current.documentEditor) {
          console.log('Preview editor no longer available during content load');
          return;
        }
        
        let contentToLoad = null;
        
        if (document && document.content) {
          contentToLoad = document.content;
        } else if (initialContent) {
          contentToLoad = initialContent;
        }

        if (contentToLoad) {
          // Create a proper SFDT document structure for any content
          const createProperSfdt = (textContent) => {
            const lines = textContent.split('\n');
            const blocks = [];
            
            lines.forEach((line, lineIndex) => {
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
                paragraph.inlines.push({
                  "characterFormat": {
                    "fontSize": 11,
                    "fontFamily": "Calibri"
                  },
                  "text": ""
                });
              } else {
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
              const parsed = JSON.parse(contentToLoad);
              
              if (parsed.sections || parsed.sec || parsed.optimizeSfdt) {
                console.log('Loading pre-formatted SFDT document in preview');
                const sfdtString = JSON.stringify(parsed);
                editor.open(sfdtString);
                originalTemplateRef.current = sfdtString;
              } else if (parsed.sfdt && typeof parsed.sfdt === 'string') {
                console.log('Converting wrapped SFDT text to proper document in preview');
                const properSfdt = createProperSfdt(parsed.sfdt);
                const sfdtString = JSON.stringify(properSfdt);
                editor.open(sfdtString);
                originalTemplateRef.current = sfdtString;
              } else {
                console.log('Converting unknown JSON format to document in preview');
                const properSfdt = createProperSfdt(JSON.stringify(parsed));
                const sfdtString = JSON.stringify(properSfdt);
                editor.open(sfdtString);
                originalTemplateRef.current = sfdtString;
              }
            } catch (e) {
              console.log('Converting plain text to SFDT document in preview');
              const properSfdt = createProperSfdt(contentToLoad);
              const sfdtString = JSON.stringify(properSfdt);
              editor.open(sfdtString);
              originalTemplateRef.current = sfdtString;
            }
          } else if (typeof contentToLoad === 'object') {
            if (contentToLoad.sections || contentToLoad.sec || contentToLoad.optimizeSfdt) {
              console.log('Loading SFDT object document in preview');
              const sfdtString = JSON.stringify(contentToLoad);
              editor.open(sfdtString);
              originalTemplateRef.current = sfdtString;
            } else if (contentToLoad.sfdt && typeof contentToLoad.sfdt === 'string') {
              console.log('Converting wrapped SFDT object to proper document in preview');
              const properSfdt = createProperSfdt(contentToLoad.sfdt);
              const sfdtString = JSON.stringify(properSfdt);
              editor.open(sfdtString);
              originalTemplateRef.current = sfdtString;
            } else {
              console.log('Converting unknown object format to document in preview');
              const properSfdt = createProperSfdt(JSON.stringify(contentToLoad));
              const sfdtString = JSON.stringify(properSfdt);
              editor.open(sfdtString);
              originalTemplateRef.current = sfdtString;
            }
          }
          
          lastLoadedContentRef.current = contentString;
          
          if (onContentChange) {
            console.log('Preview content loaded, signaling via onContentChange');
            setTimeout(onContentChange, 100);
          }
        } else {
          editor.openBlank();
          lastLoadedContentRef.current = '';
          originalTemplateRef.current = editor.serialize();
        }

        // Always set to read-only for preview
        editor.isReadOnly = true;

      } catch (error) {
        console.error('Error loading preview content:', error);
        if (container.current && container.current.documentEditor) {
          container.current.documentEditor.openBlank();
        }
      }
    }, 200);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [contentString]);

  // Separate effect for handling merge data
  useEffect(() => {
    if (!container.current || !container.current.documentEditor) return;
    
    if (mergeData && Object.keys(mergeData).length > 0 && 
        container.current.documentEditor && 
        container.current.documentEditor.isDocumentLoaded) {
      
      try {
        console.log('Auto-performing preview merge with data:', Object.keys(mergeData));
        
        const timeoutId = setTimeout(() => {
          if (!container.current || !container.current.documentEditor) {
            console.log('Preview editor no longer available for merge');
            return;
          }
          
          const editor = container.current.documentEditor;
          
          const tempMergedSfdt = createTempMergedSfdt(originalTemplateRef.current, mergeData);
          
          if (tempMergedSfdt && tempMergedSfdt !== originalTemplateRef.current) {
            console.log('Loading temp merged SFDT for preview');
            editor.open(tempMergedSfdt);
          } else {
            console.log('No changes made during preview merge');
          }
          
          if (onContentChange) {
            setTimeout(onContentChange, 100);
          }
        }, 500);
        
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      } catch (error) {
        console.error('Error performing preview merge:', error);
        if (onContentChange) {
          onContentChange();
        }
      }
    }
  }, [mergeData]);

  // Simple temp SFDT generation for preview
  const createTempMergedSfdt = (templateContent, mergeData) => {
    try {
      if (!templateContent || !mergeData) return templateContent;
      
      let mergedContent = templateContent;
      
      Object.entries(mergeData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
        mergedContent = mergedContent.replace(regex, String(value || ''));
      });
      
      return mergedContent;
    } catch (error) {
      console.error('Error creating temp merged SFDT for preview:', error);
      return templateContent;
    }
  };

  const handlePreviewWithMergeFields = (templateContent, fieldsData) => {
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
        return;
      }
      
      console.log('Creating preview with merge data:', fieldsData);
      setMergeStatus('Preparing preview...');
      
      editor.open(contentToUse);
      
      setTimeout(() => {
        try {
          const tempMergedSfdt = createTempMergedSfdt(contentToUse, fieldsData);
          
          if (tempMergedSfdt && tempMergedSfdt !== contentToUse) {
            console.log('Loading temp merged SFDT for preview');
            setMergeStatus('Applying merge fields...');
            editor.open(tempMergedSfdt);
          } else {
            console.log('No merge changes made in preview');
          }
          
          editor.isReadOnly = true;
          
          setMergeStatus('Preview ready');
          
          if (onContentChange) {
            setTimeout(onContentChange, 100);
          }
          
          setTimeout(() => setMergeStatus(''), 2000);
          
        } catch (mergeError) {
          console.error('Error during preview merge execution:', mergeError);
          if (originalTemplateRef.current) {
            editor.open(originalTemplateRef.current);
          }
        }
      }, 300);
      
    } catch (error) {
      console.error('Error in preview merge:', error);
      if (originalTemplateRef.current) {
        editor.open(originalTemplateRef.current);
      }
    }
  };

  return (
    <DocumentEditorErrorBoundary>
      <div className="document-editor-preview-container" style={{ height: '100%', width: '100%', flex: '1.5', minWidth: '60%' }}>
        <DocumentEditorContainerComponent
          ref={container}
          height="100%"
          enableToolbar={false}
          showPropertiesPane={false}
          serviceUrl={serviceUrl}
          enableContextMenu={false}
          enableMiniToolbar={false}
          enableOptionsPane={false}
          enableSelection={false}
          isReadOnly={true}
          created={() => {
            console.log('DocumentEditorPreview created');
            
            if (onContentChange) {
              setTimeout(() => {
                console.log('Calling onContentChange after preview editor created');
                onContentChange();
              }, 300);
            }
            
            setTimeout(() => {
              if (container.current && container.current.documentEditor) {
                console.log('Testing preview editor with blank document');
                try {
                  container.current.documentEditor.openBlank();
                  console.log('Blank document loaded successfully in preview');
                } catch (error) {
                  console.error('Error loading blank document in preview:', error);
                }
              }
            }, 500);

            // Disable all interactions for preview
            try {
              if (container.current && container.current.documentEditor) {
                const editor = container.current.documentEditor;
                
                // Make sure editor is truly read-only
                editor.isReadOnly = true;
                editor.enableSelection = false;
                
                // Disable all interactions
                if (editor.editorHistory) {
                  editor.editorHistory.isEnabled = false;
                }
                
                // Ensure no context menu appears
                editor.enableContextMenu = false;
                
                // Disable any context menu events at the root level
                const editorElement = editor.element;
                if (editorElement) {
                  editorElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }, true);
                  
                  // Add a class for CSS targeting
                  editorElement.classList.add('preview-mode');
                  
                  // Hide properties pane
                  setTimeout(() => {
                    if (typeof document !== 'undefined' && document.querySelectorAll) {
                      const propsPanes = document.querySelectorAll('.e-de-prop-pane, .e-documenteditor-container .e-de-prop-pane');
                      propsPanes.forEach(pane => {
                        pane.style.display = 'none';
                        pane.style.visibility = 'hidden';
                        pane.style.width = '0px';
                        pane.style.height = '0px';
                      });
                      
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
                }
              }
            } catch (error) {
              console.warn('Error configuring preview mode:', error);
            }
          }}
        />
      </div>
    </DocumentEditorErrorBoundary>
  );
});

DocumentEditorPreview.displayName = 'DocumentEditorPreview';

export default DocumentEditorPreview;
