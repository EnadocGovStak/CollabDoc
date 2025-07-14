import React, { useState, useRef, useEffect } from 'react';
import TemplatePreviewEditor from './TemplatePreviewEditor';
import TemplateMergeEngine from './TemplateMergeEngine';
import './TemplateMergePreview.css';

/**
 * Template Merge Preview Component
 * Uses TemplatePreviewEditor (DocumentEditorComponent) instead of DocumentEditorDemo
 * This maintains complete separation from the main document editor
 */
const TemplateMergePreview = ({ 
  template, 
  mergeData = {}, 
  showRawContent = false,
  height = '400px' 
}) => {
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'text'
  const [isLoading, setIsLoading] = useState(true);
  const [mergedContent, setMergedContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const editorRef = useRef(null);

  // Generate merged content whenever template or data changes
  useEffect(() => {
    if (template?.content) {
      try {
        console.log('Generating merged content for template:', template.name);
        console.log('Template content type:', typeof template.content);
        console.log('Merge data keys:', Object.keys(mergeData));
        
        const merged = TemplateMergeEngine.mergeTemplate(template.content, mergeData);
        console.log('Merged content length:', merged?.length);
        setMergedContent(merged);
        
        const preview = TemplateMergeEngine.previewTemplate(template.content, mergeData);
        setPreviewContent(preview);
        
        console.log('Template merge completed successfully');
      } catch (error) {
        console.error('Error generating template preview:', error);
        setMergedContent('');
        setPreviewContent('Error generating preview: ' + error.message);
      }
    } else {
      console.warn('Template content is missing');
      setMergedContent('');
      setPreviewContent('No template content available');
    }
  }, [template, mergeData]);

  const handleEditorCreated = () => {
    console.log('Template preview editor created');
    setIsLoading(false);
  };

  const renderTextPreview = () => {
    if (!previewContent) return <div className="no-preview">No preview available</div>;
    
    return (
      <div className="text-preview">
        <div 
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </div>
    );
  };

  const renderEditorPreview = () => {
    if (!template || !mergedContent) {
      return <div className="no-preview">No template content available</div>;
    }

    // Log the merged content for debugging
    console.log('Rendering editor preview with merged content:', typeof mergedContent, mergedContent);

    return (
      <div className="editor-preview" style={{ height }}>
        {isLoading && (
          <div className="preview-loading">
            <div className="loading-spinner">Loading preview...</div>
          </div>
        )}
        <TemplatePreviewEditor
          ref={editorRef}
          initialContent={mergedContent}
          isReadOnly={true}
          enableToolbar={false}
          onCreated={handleEditorCreated}
          height={height}
        />
      </div>
    );
  };

  const renderRawContent = () => {
    if (!mergedContent) return <div className="no-preview">No content available</div>;
    
    const displayContent = typeof mergedContent === 'object' 
      ? JSON.stringify(mergedContent, null, 2)
      : mergedContent;

    return (
      <div className="raw-content">
        <pre className="raw-content-display">
          {displayContent}
        </pre>
      </div>
    );
  };

  return (
    <div className="template-merge-preview">
      <div className="preview-header">
        <h3>Document Preview</h3>
        <div className="preview-controls">
          <div className="view-mode-selector">
            <button 
              className={`mode-btn ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => setViewMode('editor')}
              title="Rich editor preview"
            >
              📄 Editor
            </button>
            <button 
              className={`mode-btn ${viewMode === 'text' ? 'active' : ''}`}
              onClick={() => setViewMode('text')}
              title="Text preview with highlighted fields"
            >
              📝 Text
            </button>
            {showRawContent && (
              <button 
                className={`mode-btn ${viewMode === 'raw' ? 'active' : ''}`}
                onClick={() => setViewMode('raw')}
                title="Raw content view"
              >
                🔧 Raw
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="preview-content-wrapper">
        {viewMode === 'editor' && renderEditorPreview()}
        {viewMode === 'text' && renderTextPreview()}
        {viewMode === 'raw' && showRawContent && renderRawContent()}
      </div>
      
      <div className="preview-info">
        <small>
          Template: <strong>{template?.name || 'Untitled'}</strong> | 
          Fields filled: <strong>{Object.keys(mergeData).length}</strong>
        </small>
      </div>
    </div>
  );
};

export default TemplateMergePreview;
