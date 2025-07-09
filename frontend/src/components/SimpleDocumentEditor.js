import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import './DocumentEditor.css';

const SimpleDocumentEditor = forwardRef(({ initialContent, onContentChange, onDocumentLoaded, isReadOnly }, ref) => {
  const [content, setContent] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  // Initialize with content
  useEffect(() => {
    if (initialContent) {
      try {
        // Try to extract text from SFDT format
        let textContent = '';
        if (typeof initialContent === 'string') {
          try {
            const parsed = JSON.parse(initialContent);
            if (parsed.sfdt) {
              // This is a simplified SFDT parser - in a real implementation
              // you'd want to properly parse the SFDT structure
              textContent = extractTextFromSfdt(parsed.sfdt);
            } else {
              textContent = initialContent;
            }
          } catch (e) {
            textContent = initialContent;
          }
        } else if (typeof initialContent === 'object') {
          textContent = extractTextFromSfdt(initialContent);
        }
        
        setContent(textContent);
      } catch (error) {
        console.error('Error loading initial content:', error);
        setContent('');
      }
    }
    
    setIsEditorReady(true);
    if (onDocumentLoaded) {
      onDocumentLoaded();
    }
  }, [initialContent, onDocumentLoaded]);

  // Simple SFDT text extraction
  const extractTextFromSfdt = (sfdtData) => {
    try {
      if (typeof sfdtData === 'string') {
        sfdtData = JSON.parse(sfdtData);
      }
      
      let text = '';
      
      const extractFromSections = (sections) => {
        if (!sections || !Array.isArray(sections)) return '';
        
        return sections.map(section => {
          if (section.blocks) {
            return extractFromBlocks(section.blocks);
          }
          return '';
        }).join('\n');
      };
      
      const extractFromBlocks = (blocks) => {
        if (!blocks || !Array.isArray(blocks)) return '';
        
        return blocks.map(block => {
          if (block.inlines) {
            return extractFromInlines(block.inlines);
          }
          return '';
        }).join('\n');
      };
      
      const extractFromInlines = (inlines) => {
        if (!inlines || !Array.isArray(inlines)) return '';
        
        return inlines.map(inline => {
          if (inline.text) {
            return inline.text;
          }
          return '';
        }).join('');
      };
      
      if (sfdtData.sections) {
        text = extractFromSections(sfdtData.sections);
      }
      
      return text || 'Document content could not be extracted';
    } catch (error) {
      console.error('Error extracting text from SFDT:', error);
      return 'Error loading document content';
    }
  };

  // Convert plain text back to basic SFDT format
  const createBasicSfdt = (text) => {
    const lines = text.split('\n');
    const sections = [{
      blocks: lines.map(line => ({
        inlines: line ? [{ text: line }] : [{ text: '' }]
      }))
    }];
    
    return JSON.stringify({
      sfdt: JSON.stringify({ sections })
    });
  };

  // Update counts when content changes
  const updateCounts = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
  };

  // Handle content changes
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateCounts(newContent);
    
    if (onContentChange) {
      // Convert to basic SFDT format for compatibility
      const sfdtContent = createBasicSfdt(newContent);
      onContentChange(sfdtContent);
    }
  };

  // Expose methods via ref for compatibility
  useImperativeHandle(ref, () => ({
    editor: {
      serialize: () => createBasicSfdt(content),
      open: (newContent) => {
        try {
          let textContent = '';
          if (typeof newContent === 'string') {
            try {
              const parsed = JSON.parse(newContent);
              if (parsed.sfdt) {
                textContent = extractTextFromSfdt(parsed.sfdt);
              } else {
                textContent = newContent;
              }
            } catch (e) {
              textContent = newContent;
            }
          }
          setContent(textContent);
        } catch (error) {
          console.error('Error opening content:', error);
        }
      },
      openBlank: () => setContent(''),
      isReadOnly: isReadOnly
    },
    getContent: async () => createBasicSfdt(content),
    loadContent: (newContent) => {
      try {
        let textContent = '';
        if (typeof newContent === 'string') {
          try {
            const parsed = JSON.parse(newContent);
            if (parsed.sfdt) {
              textContent = extractTextFromSfdt(parsed.sfdt);
            } else {
              textContent = newContent;
            }
          } catch (e) {
            textContent = newContent;
          }
        }
        setContent(textContent);
      } catch (error) {
        console.error('Error loading content:', error);
      }
    },
    setReadOnly: () => {} // Not implemented for this simple editor
  }));

  // Update counts when content changes
  useEffect(() => {
    updateCounts(content);
  }, [content]);

  return (
    <div className="document-editor-container" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '8px 16px', 
        borderBottom: '1px solid #dee2e6',
        fontSize: '14px',
        color: '#495057',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>📝 Simple Document Editor (Text Mode)</span>
        <span style={{ fontSize: '12px', color: '#6c757d' }}>
          Advanced editor unavailable - using fallback mode
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        readOnly={isReadOnly}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          outline: 'none',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.6',
          resize: 'none',
          backgroundColor: 'white',
          color: '#212529'
        }}
        placeholder={isReadOnly ? 'Document content (read-only)' : 'Start typing your document...'}
      />
      <div style={{ 
        background: '#f8f9fa', 
        padding: '8px 16px', 
        borderTop: '1px solid #dee2e6',
        fontSize: '12px',
        color: '#6c757d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Words: {wordCount} | Characters: {charCount}</span>
        <span>{isReadOnly ? 'Read Only' : 'Editing'}</span>
      </div>
    </div>
  );
});

SimpleDocumentEditor.displayName = 'SimpleDocumentEditor';

export default SimpleDocumentEditor;
