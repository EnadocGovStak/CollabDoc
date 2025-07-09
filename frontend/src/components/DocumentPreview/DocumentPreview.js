import React, { useMemo, useState, useRef, useEffect } from 'react';
import DocumentEditorDemo from '../DocumentEditorDemo';
import './DocumentPreview.css';

const DocumentPreview = ({ content, template, formData }) => {
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'rendered'
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const editorRef = useRef(null);
  
  // Create a merged document content for the editor
  const mergedDocument = useMemo(() => {
    if (!template) return null;
    
    return {
      ...template,
      name: template.name || 'Document Preview',
      // For the editor, we need the original content
      content: template.content
    };
  }, [template]);
  
  // Handle editor loaded event
  const handleEditorLoaded = () => {
    console.log('Document preview editor loaded');
    setIsEditorLoading(false);
  };
  
  // Simple text preview by replacing merge fields in template content
  const previewContent = useMemo(() => {
    if (!template?.content) return '';
    
    // Simple preview by replacing merge fields in template content
    let preview = template.content;
    
    // If content is SFDT object, extract text content
    if (typeof preview === 'object' && preview.sfdt) {
      preview = preview.sfdt;
    }
    
    // Replace merge fields with form data
    Object.entries(formData || {}).forEach(([key, value]) => {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      preview = preview.replace(pattern, value || `[${key}]`);
    });
    
    // Highlight unfilled merge fields
    preview = preview.replace(/{{([^}]+)}}/g, '<span class="unfilled-field">[$1]</span>');
    
    return preview;
  }, [template, formData]);

  // Add state for preview modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Open/close preview modal
  const handleOpenPreviewModal = () => setIsPreviewModalOpen(true);
  const handleClosePreviewModal = () => setIsPreviewModalOpen(false);

  const hasUnfilledFields = useMemo(() => {
    return previewContent.includes('<span class="unfilled-field">');
  }, [previewContent]);

  if (!template) {
    return (
      <div className="document-preview">
        <div className="preview-placeholder">
          No template selected
        </div>
      </div>
    );
  }

  return (
    <div className="document-preview">
      <div className="preview-header">
        <div className="preview-title">
          <h3>Document Preview</h3>
          {hasUnfilledFields && (
            <div className="preview-notice">
              <p>Fields highlighted in <span className="unfilled-sample">[brackets]</span> need to be filled in</p>
            </div>
          )}
        </div>
        <div className="view-mode-toggle">
          <button 
            className={`view-mode-btn ${viewMode === 'simple' ? 'active' : ''}`}
            onClick={() => setViewMode('simple')}
          >
            Simple View
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'rendered' ? 'active' : ''}`}
            onClick={() => setViewMode('rendered')}
          >
            Rendered View
          </button>
        </div>
      </div>
      
      {viewMode === 'simple' ? (
        <div className="preview-content simple-view">
          <div 
            className="preview-text"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>
      ) : (
        <div className="preview-content rendered-view">
          {isEditorLoading && (
            <div className="editor-loading">
              <div className="spinner"></div>
              <p>Loading document editor...</p>
            </div>
          )}
          <div className="document-editor-container" style={{ opacity: isEditorLoading ? 0.3 : 1 }}>
            <DocumentEditorDemo
              ref={editorRef}
              document={mergedDocument}
              initialContent={template.content}
              isReadOnly={true}
              onContentChange={handleEditorLoaded}
              // Use form data for mail merge
              mergeData={formData}
              enableToolbar={false}
            />
          </div>
        </div>
      )}
      
      {!hasUnfilledFields && Object.keys(formData || {}).length > 0 && (
        <div className="preview-ready">
          <p>✓ All required fields are filled. Ready to generate document!</p>
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
