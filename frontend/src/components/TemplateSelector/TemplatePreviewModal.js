import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import TemplatePreview from './TemplatePreview';
import './TemplatePreviewModal.css';

/**
 * Modal component for displaying template previews
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {string} props.templateId The ID of the template to preview
 * @param {Object} props.template Optional template object (if already loaded)
 * @param {Function} props.onClose Function to call when closing the modal
 */
const TemplatePreviewModal = ({ isOpen, templateId, template, onClose }) => {
  // Prevent scrolling on the body when modal is open
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
  
  return ReactDOM.createPortal(
    <div className="template-preview-modal">
      <div className="template-preview-overlay" onClick={onClose}></div>
      <div className="template-preview-container">
        <TemplatePreview 
          templateId={templateId}
          template={template}
          isModal={true}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
};

export default TemplatePreviewModal;
