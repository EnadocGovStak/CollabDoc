import React, { useState, useRef, useEffect } from 'react';
import DocumentEditorDemo from '../DocumentEditorDemo';
import './TemplatePreviewModal.css';

/**
 * Modal for previewing an SFDT formatted document
 * @param {Object} props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Object} props.content Content to preview
 * @param {Function} props.onClose Function to call when closing the modal
 */
const SfdtPreviewModal = ({ isOpen, content, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef(null);
  
  // Document to display in the preview
  const previewDocument = {
    name: 'Document Preview',
    content: content,
  };
  
  // Handle editor loaded
  const handleEditorLoaded = () => {
    setIsLoading(false);
  };
  
  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);
  
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="sfdt-preview-modal">
      <div className="sfdt-preview-overlay" onClick={onClose}></div>
      <div className="sfdt-preview-container">
        <div className="sfdt-preview">
          <div className="sfdt-preview-header">
            <h2>Document Preview</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="sfdt-preview-content">
            {isLoading && (
              <div className="sfdt-preview-loading">
                <div className="spinner"></div>
                <p>Loading preview...</p>
              </div>
            )}
            
            <div className="sfdt-preview-document" style={{ opacity: isLoading ? 0.3 : 1 }}>
              <DocumentEditorDemo
                ref={editorRef}
                document={previewDocument}
                initialContent={content}
                isReadOnly={true}
                onContentChange={handleEditorLoaded}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SfdtPreviewModal;
