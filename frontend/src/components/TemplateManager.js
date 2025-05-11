import React, { useState, useEffect } from 'react';
import './TemplateManager.css';
import { documentService } from '../services/DocumentService';

// Modal component for merge fields
const MergeFieldsModal = ({ isOpen, onClose, templateId, onSubmit }) => {
    const [mergeFields, setMergeFields] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && templateId) {
            loadTemplateDetails();
        }
    }, [isOpen, templateId]);

    const loadTemplateDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Load the template to extract merge fields
            const template = await documentService.getTemplate(templateId);
            
            // Extract merge fields from template content
            const mergeFieldsObj = {};
            const regex = /{{([^}]+)}}/g;
            let match;
            const content = template.content || '';
            
            while ((match = regex.exec(content)) !== null) {
                const fieldName = match[1].trim();
                if (fieldName !== 'signature_field' && !mergeFieldsObj[fieldName]) {
                    mergeFieldsObj[fieldName] = '';
                }
            }
            
            setMergeFields(mergeFieldsObj);
        } catch (err) {
            console.error('Error loading template details:', err);
            setError('Failed to load template details');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (fieldName, value) => {
        setMergeFields(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(mergeFields);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="merge-fields-modal">
                <div className="modal-header">
                    <h2>Enter Merge Field Values</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}
                    
                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : Object.keys(mergeFields).length === 0 ? (
                        <p className="no-fields-message">
                            No merge fields found in this template.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {Object.keys(mergeFields).map(fieldName => (
                                <div key={fieldName} className="merge-field-input">
                                    <label htmlFor={`field-${fieldName}`}>{fieldName}:</label>
                                    <input
                                        id={`field-${fieldName}`}
                                        type="text"
                                        value={mergeFields[fieldName]}
                                        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                                        placeholder={`Enter ${fieldName}`}
                                    />
                                </div>
                            ))}
                        </form>
                    )}
                </div>
                
                <div className="modal-footer">
                    <button 
                        className="cancel-button" 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="merge-button"
                        onClick={handleSubmit}
                        disabled={loading || Object.keys(mergeFields).length === 0}
                    >
                        Merge and Sign
                    </button>
                </div>
            </div>
        </div>
    );
};

const TemplateManager = ({ document, onMergeComplete }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mergeStatus, setMergeStatus] = useState(null);
    const [showMergeFieldsModal, setShowMergeFieldsModal] = useState(false);

    // Fetch available templates
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const templatesData = await documentService.getTemplates();
                setTemplates(templatesData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load templates');
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    // Handle template selection
    const handleTemplateSelect = (e) => {
        setSelectedTemplate(e.target.value);
    };

    // Open merge fields modal
    const handleOpenMergeModal = () => {
        if (!selectedTemplate) {
            setError('Please select a template');
            return;
        }
        setShowMergeFieldsModal(true);
    };

    // Close merge fields modal
    const handleCloseMergeModal = () => {
        setShowMergeFieldsModal(false);
    };

    // Handle document merge with template and provided merge fields
    const handleMergeWithTemplate = async (mergeFields) => {
        try {
            setLoading(true);
            setMergeStatus('Merging document with template...');
            setShowMergeFieldsModal(false);

            // Call the merge service with the merge fields
            await documentService.mergeWithTemplate(document.id, selectedTemplate, mergeFields);
            
            setMergeStatus('Document merged successfully. Preparing for evia sign...');
            
            // Call the signing service after a short delay
            setTimeout(async () => {
                try {
                    await documentService.sendForSigning(document.id);
                    setMergeStatus('Document sent to evia sign for digital sealing.');
                    setLoading(false);
                    
                    // Notify parent component that merge is complete
                    if (onMergeComplete) {
                        onMergeComplete({
                            success: true,
                            message: 'Document successfully merged and sent for signing',
                            templateId: selectedTemplate
                        });
                    }
                } catch (signError) {
                    setError('Error sending document for signing: ' + signError.message);
                    setLoading(false);
                }
            }, 1500);
        } catch (err) {
            setError('Failed to merge document with template: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="template-manager">
            <h3>Document Template Manager</h3>
            
            {error && <div className="template-error">{error}</div>}
            
            <div className="template-selection">
                <label htmlFor="template-select">Select a template for merging:</label>
                <select 
                    id="template-select"
                    value={selectedTemplate}
                    onChange={handleTemplateSelect}
                    disabled={loading || document?.recordsManagement?.isFinal}
                >
                    <option value="">-- Select Template --</option>
                    {templates.map(template => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>
                
                {selectedTemplate && (
                    <div className="template-description">
                        {templates.find(t => t.id === selectedTemplate)?.description}
                    </div>
                )}
            </div>
            
            <div className="template-actions">
                {document?.recordsManagement?.isFinal ? (
                    <div className="document-already-final">
                        <span className="final-icon">🔒</span> This document is already finalized
                    </div>
                ) : (
                    <button 
                        className="merge-button"
                        onClick={handleOpenMergeModal}
                        disabled={!selectedTemplate || loading}
                    >
                        Merge with Template & Send for Signing
                    </button>
                )}
            </div>
            
            {loading && (
                <div className="template-loading">
                    <div className="loading-spinner"></div>
                    {mergeStatus && <div className="merge-status">{mergeStatus}</div>}
                </div>
            )}
            
            <div className="template-info">
                <h4>About Document Finalization</h4>
                <p>
                    Merging with a template will prepare your document for the finalization process. 
                    The document will be:
                </p>
                <ol>
                    <li>Merged with the selected template</li>
                    <li>Converted to PDF format</li>
                    <li>Sent to evia sign for digital sealing</li>
                    <li>Returned to the application as a finalized document</li>
                </ol>
                <p>
                    <strong>Note:</strong> Finalized documents cannot be edited but can be checked out 
                    for creating new versions.
                </p>
            </div>
            
            {/* Merge Fields Modal */}
            <MergeFieldsModal 
                isOpen={showMergeFieldsModal}
                onClose={handleCloseMergeModal}
                templateId={selectedTemplate}
                onSubmit={handleMergeWithTemplate}
            />
        </div>
    );
};

export default TemplateManager; 