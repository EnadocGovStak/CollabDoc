import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { documentService } from '../services/DocumentService';
import NewDocumentModal from '../components/NewDocumentModal';
import './DocumentListPage.css';

const DocumentListPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const docs = await documentService.getDocuments();
            console.log("Documents loaded:", docs);
            setDocuments(docs);
            setError(null);
        } catch (error) {
            console.error('Error loading documents:', error);
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDocument = (documentId) => {
        navigate(`/editor/${encodeURIComponent(documentId)}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Get the document status based on metadata or defaults
    const getDocumentStatus = (doc) => {
        if (!doc) return 'Unknown';
        
        // If document has an explicit status, use it
        if (doc.status) return doc.status;
        
        // Check if document is marked as final
        if (doc.recordsManagement && doc.recordsManagement.isFinal) return 'Final';
        
        // Otherwise determine status based on version
        if (doc.version > 3) return 'Final';
        if (doc.version > 1) return 'In Progress';
        return 'Draft';
    };

    // Get appropriate icon and color for status
    const getStatusInfo = (status) => {
        switch (status.toLowerCase()) {
            case 'draft':
                return { icon: '🔵', className: 'status-draft' };
            case 'in progress':
                return { icon: '🟠', className: 'status-in-progress' };
            case 'final':
                return { icon: '🟢', className: 'status-final' };
            case 'archived':
                return { icon: '⚪', className: 'status-archived' };
            default:
                return { icon: '⚫', className: 'status-unknown' };
        }
    };

    // Get the record classification badge
    const getClassificationBadge = (doc) => {
        // Check if classification exists in different possible paths
        let classification = null;
        
        if (doc?.recordsManagement?.classification) {
            classification = doc.recordsManagement.classification;
        } else if (doc?.metadata?.recordsManagement?.classification) {
            classification = doc.metadata.recordsManagement.classification;
        } else if (doc?.classification) {
            classification = doc.classification;
        }
        
        if (!classification) {
            return null;
        }

        let badgeClass = '';
        
        switch (classification.toLowerCase()) {
            case 'confidential':
                badgeClass = 'badge-confidential';
                break;
            case 'restricted':
                badgeClass = 'badge-restricted';
                break;
            case 'internal':
                badgeClass = 'badge-internal';
                break;
            case 'public':
                badgeClass = 'badge-public';
                break;
            default:
                badgeClass = 'badge-default';
        }
        
        return (
            <div className={`document-classification ${badgeClass}`}>
                {classification}
            </div>
        );
    };

    // Get background color class based on document classification
    const getCardBackgroundClass = (doc) => {
        console.log("Document structure:", doc);
        
        // Full detailed structure logging
        console.log("Document recordsManagement:", doc.recordsManagement);
        if (doc.metadata) console.log("Document metadata:", doc.metadata);
        
        // Check if classification exists in different possible paths
        let classification = null;
        
        if (doc?.recordsManagement?.classification) {
            classification = doc.recordsManagement.classification.toLowerCase();
            console.log(`Found classification in recordsManagement: ${classification}`);
        } else if (doc?.metadata?.recordsManagement?.classification) {
            classification = doc.metadata.recordsManagement.classification.toLowerCase();
            console.log(`Found classification in metadata.recordsManagement: ${classification}`);
        } else if (doc?.classification) {
            classification = doc.classification.toLowerCase();
            console.log(`Found classification directly on doc: ${classification}`);
        }
        
        if (!classification) {
            console.log("No classification found for document:", doc.title);
            return 'card-background-default';
        }
        
        console.log(`Classification found: ${classification} for ${doc.title}`);
        
        switch (classification) {
            case 'confidential':
                return 'card-background-confidential';
            case 'restricted':
                return 'card-background-restricted';
            case 'internal':
                return 'card-background-internal';
            case 'public':
                return 'card-background-public';
            default:
                return 'card-background-default';
        }
    };

    // Check if document is final
    const isDocumentFinal = (doc) => {
        if (doc?.recordsManagement?.isFinal) {
            return true;
        } else if (doc?.metadata?.recordsManagement?.isFinal) {
            return true;
        } else if (doc?.isFinal) {
            return true;
        }
        return false;
    };

    // Calculate and format expiry date based on retention period
    const getExpiryDate = (doc) => {
        // Get retention period from possible paths
        let retentionPeriod = null;
        let createdAt = doc?.createdAt || doc?.modifiedAt || new Date().toISOString();
        
        if (doc?.recordsManagement?.retentionPeriod) {
            retentionPeriod = doc.recordsManagement.retentionPeriod;
        } else if (doc?.metadata?.recordsManagement?.retentionPeriod) {
            retentionPeriod = doc.metadata.recordsManagement.retentionPeriod;
        } else if (doc?.retentionPeriod) {
            retentionPeriod = doc.retentionPeriod;
        }
        
        if (!retentionPeriod || !createdAt) {
            return null;
        }

        // Parse retention period - handle different formats
        const periodMatch = retentionPeriod.match(/(\d+)\s*(Year|Month|Day|year|month|day)s?/i);
        
        if (!periodMatch) return null;

        const amount = parseInt(periodMatch[1], 10);
        const unit = periodMatch[2].toLowerCase();

        // Calculate expiry date
        const createdDate = new Date(createdAt);
        const expiryDate = new Date(createdDate);
        
        if (unit.includes('year')) {
            expiryDate.setFullYear(expiryDate.getFullYear() + amount);
        } else if (unit.includes('month')) {
            expiryDate.setMonth(expiryDate.getMonth() + amount);
        } else if (unit.includes('day')) {
            expiryDate.setDate(expiryDate.getDate() + amount);
        }

        return expiryDate;
    };

    // Format expiry date
    const formatExpiryDate = (date) => {
        if (!date) return null;
        
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if document is expired
    const isDocumentExpired = (doc) => {
        const expiryDate = getExpiryDate(doc);
        if (!expiryDate) return false;
        
        const now = new Date();
        return expiryDate < now;
    };

    // Get border color based on document classification
    const getBorderColor = (doc) => {
        if (!doc || !doc.recordsManagement || !doc.recordsManagement.classification) {
            return '#e9ecef'; // Default light gray
        }

        const classification = doc.recordsManagement.classification.toLowerCase();
        switch (classification) {
            case 'confidential':
                return '#dc3545'; // Red
            case 'restricted':
                return '#ffc107'; // Yellow/amber
            case 'internal':
                return '#0dcaf0'; // Blue
            case 'public':
                return '#28a745'; // Green
            default:
                return '#e9ecef'; // Light gray
        }
    };

    // Handle new document modal
    const openNewDocumentModal = () => {
        setShowNewDocumentModal(true);
    };

    const closeNewDocumentModal = () => {
        setShowNewDocumentModal(false);
    };

    return (
        <div className="document-list-page">
            <div className="document-list-header">
                <h1>My Documents</h1>
                <button 
                    className="new-document-button" 
                    onClick={openNewDocumentModal}
                >
                    Create Document
                </button>
            </div>

            {loading ? (
                <div className="loading-message">Loading documents...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : documents.length === 0 ? (
                <div className="empty-message">
                    No documents yet. Click "Create Document" to create one.
                </div>
            ) : (
                <div className="documents-grid">
                    {documents.map((doc) => {
                        const status = getDocumentStatus(doc);
                        const statusInfo = getStatusInfo(status);
                        const classificationBadge = getClassificationBadge(doc);
                        const backgroundClass = getCardBackgroundClass(doc);
                        const expiryDate = getExpiryDate(doc);
                        const formattedExpiry = formatExpiryDate(expiryDate);
                        const isExpired = isDocumentExpired(doc);
                        const isFinal = isDocumentFinal(doc);
                        
                        // Get classification directly for styling
                        let classification = null;
                        
                        if (doc?.recordsManagement?.classification) {
                            classification = doc.recordsManagement.classification.toLowerCase();
                        } else if (doc?.metadata?.recordsManagement?.classification) {
                            classification = doc.metadata.recordsManagement.classification.toLowerCase();
                        } else if (doc?.classification) {
                            classification = doc.classification.toLowerCase();
                        }
                        
                        // Determine background color based on classification
                        let bgColor = '#ffffff';
                        let borderColor = '#e9ecef';
                        
                        if (classification) {
                            switch (classification) {
                                case 'confidential':
                                    bgColor = 'rgba(255,200,200,0.6)';
                                    borderColor = '#dc3545';
                                    break;
                                case 'restricted':
                                    bgColor = 'rgba(255,240,180,0.6)';
                                    borderColor = '#ffc107';
                                    break;
                                case 'internal':
                                    bgColor = 'rgba(200,230,255,0.6)';
                                    borderColor = '#0dcaf0';
                                    break;
                                case 'public':
                                    bgColor = 'rgba(200,255,200,0.6)';
                                    borderColor = '#28a745';
                                    break;
                                default:
                                    bgColor = '#ffffff';
                                    borderColor = '#e9ecef';
                            }
                        }
                        
                        return (
                            <div 
                                key={doc.name || doc.id} 
                                className={`document-card ${isExpired ? 'document-expired' : ''} ${isFinal ? 'document-final' : ''}`} 
                                onClick={() => handleOpenDocument(doc.name || doc.id)}
                                style={{ 
                                    borderLeft: `6px solid ${borderColor}`,
                                    backgroundColor: bgColor
                                }}
                            >
                                {isFinal && <div className="final-document-overlay">FINAL</div>}
                                <div className="document-icon">📄</div>
                                <div className="document-info">
                                    <h3>{doc.title || 'Untitled'}</h3>
                                    
                                    <div className="document-meta">
                                        <div className={`document-status ${statusInfo.className}`}>
                                            <span className="status-icon">{statusInfo.icon}</span>
                                            <span className="status-text">{status}</span>
                                        </div>
                                        
                                        <div className="document-version">
                                            <span className="version-label">v{doc.version || 1}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="document-compact-info">
                                        {classificationBadge && (
                                            <div className="document-records-info">
                                                {classificationBadge}
                                                {(doc.recordsManagement?.documentType || doc.metadata?.recordsManagement?.documentType || doc.documentType) && (
                                                    <div className="document-type">
                                                        {doc.recordsManagement?.documentType || doc.metadata?.recordsManagement?.documentType || doc.documentType}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="document-dates">
                                            <p className="document-date">
                                                Modified: {formatDate(doc.modifiedDate || doc.modifiedAt || doc.lastModified).split(',')[0]}
                                            </p>
                                            
                                            {formattedExpiry && (
                                                <p className={`document-expiry ${isExpired ? 'document-expired-text' : ''}`}>
                                                    {isExpired ? 'EXPIRED: ' : 'Expires: '}{formattedExpiry}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="document-footer">
                                            <span className="document-id">
                                                ID: {(doc.name || doc.id).substring(0, 8)}...
                                            </span>
                                            
                                            {(doc.recordsManagement?.retentionPeriod || doc.metadata?.recordsManagement?.retentionPeriod || doc.retentionPeriod) && (
                                                <span className="document-retention">
                                                    {doc.recordsManagement?.retentionPeriod || doc.metadata?.recordsManagement?.retentionPeriod || doc.retentionPeriod}
                                                </span>
                                            )}
                                            
                                            {isFinal && (
                                                <div className="document-final-badge">
                                                    <span className="final-icon">🔒</span> Finalized
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New Document Modal */}
            <NewDocumentModal 
                isOpen={showNewDocumentModal} 
                onClose={closeNewDocumentModal}
            />
        </div>
    );
};

export default DocumentListPage; 