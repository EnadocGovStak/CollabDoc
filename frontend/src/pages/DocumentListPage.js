import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/DocumentService';
import NewDocumentModal from '../components/NewDocumentModal';
import './DocumentListPage.css';

const DocumentListPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const docs = await documentService.getDocuments();
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

    const getRawDocumentTitle = (doc) => {
        return doc?.title?.trim() || doc?.metadata?.title?.trim() || '';
    };

    const isPlaceholderTitle = (title) => {
        return !title || /^untitled( document)?$/i.test(title.trim());
    };

    const getDocumentTitle = (doc) => {
        const title = getRawDocumentTitle(doc);
        return isPlaceholderTitle(title) ? 'Untitled document' : title;
    };

    const getDocumentInitials = (title) => {
        const words = title
            .split(/\s+/)
            .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
            .filter(Boolean);

        if (words.length === 0) {
            return 'DO';
        }

        return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
    };

    const getDocumentModifiedDate = (doc) => {
        return doc?.modifiedDate || doc?.modifiedAt || doc?.lastModified || doc?.createdAt || '';
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
                return { className: 'status-draft' };
            case 'in progress':
                return { className: 'status-in-progress' };
            case 'final':
                return { className: 'status-final' };
            case 'archived':
                return { className: 'status-archived' };
            default:
                return { className: 'status-unknown' };
        }
    };

    const getDocumentClassification = (doc) => {
        if (doc?.recordsManagement?.classification) {
            return doc.recordsManagement.classification;
        }
        if (doc?.metadata?.recordsManagement?.classification) {
            return doc.metadata.recordsManagement.classification;
        }
        if (doc?.classification) {
            return doc.classification;
        }
        return null;
    };

    // Get the record classification badge
    const getClassificationBadge = (doc) => {
        const classification = getDocumentClassification(doc);
        
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

    // Handle new document modal
    const openNewDocumentModal = () => {
        setShowNewDocumentModal(true);
    };

    const closeNewDocumentModal = () => {
        setShowNewDocumentModal(false);
    };

    const filteredDocuments = documents
        .filter((doc) => {
            const status = getDocumentStatus(doc).toLowerCase();
            if (statusFilter !== 'all' && status !== statusFilter) {
                return false;
            }

            if (!searchTerm.trim()) {
                return true;
            }

            const searchText = [
                getDocumentTitle(doc),
                doc?.name,
                doc?.id,
                getDocumentClassification(doc),
                doc?.recordsManagement?.documentType,
                doc?.metadata?.recordsManagement?.documentType,
                doc?.documentType
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchText.includes(searchTerm.trim().toLowerCase());
        })
        .sort((firstDoc, secondDoc) => {
            const firstHasPlaceholderTitle = isPlaceholderTitle(getRawDocumentTitle(firstDoc));
            const secondHasPlaceholderTitle = isPlaceholderTitle(getRawDocumentTitle(secondDoc));

            if (firstHasPlaceholderTitle !== secondHasPlaceholderTitle) {
                return firstHasPlaceholderTitle ? 1 : -1;
            }

            const firstTime = new Date(getDocumentModifiedDate(firstDoc)).getTime() || 0;
            const secondTime = new Date(getDocumentModifiedDate(secondDoc)).getTime() || 0;
            return secondTime - firstTime;
        });

    return (
        <div className="document-list-page">
            <div className="document-list-header">
                <div>
                    <p className="documents-eyebrow">Document Workspace</p>
                    <h1>My Documents</h1>
                    <p className="documents-page-subtitle">
                        Track drafts, finalized records, retention status, and document ownership from one governed workspace.
                    </p>
                </div>
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
                <>
                <div className="documents-toolbar">
                    <input
                        className="documents-search-input"
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search documents..."
                    />
                    <select
                        className="documents-status-filter"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        aria-label="Filter documents by status"
                    >
                        <option value="all">All statuses</option>
                        <option value="draft">Draft</option>
                        <option value="in progress">In Progress</option>
                        <option value="final">Final</option>
                        <option value="archived">Archived</option>
                    </select>
                    <span className="documents-result-count">
                        {filteredDocuments.length} of {documents.length} documents
                    </span>
                    {(searchTerm || statusFilter !== 'all') && (
                        <button
                            type="button"
                            className="documents-clear-filters"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {filteredDocuments.length === 0 ? (
                    <div className="empty-message">
                        No documents match the current filters.
                    </div>
                ) : (
                <div className="documents-grid">
                    {filteredDocuments.map((doc) => {
                        const status = getDocumentStatus(doc);
                        const statusInfo = getStatusInfo(status);
                        const classificationBadge = getClassificationBadge(doc);
                        const expiryDate = getExpiryDate(doc);
                        const formattedExpiry = formatExpiryDate(expiryDate);
                        const isExpired = isDocumentExpired(doc);
                        const isFinal = isDocumentFinal(doc);
                        const classification = getDocumentClassification(doc)?.toLowerCase().replace(/\s+/g, '-') || 'default';
                        const documentId = doc.name || doc.id;
                        const documentTitle = getDocumentTitle(doc);
                        const modifiedDate = getDocumentModifiedDate(doc);
                        const documentInitials = getDocumentInitials(documentTitle);

                        return (
                            <div
                                key={documentId}
                                className={`document-card classification-${classification} ${isExpired ? 'document-expired' : ''} ${isFinal ? 'document-final' : ''}`}
                                onClick={() => handleOpenDocument(documentId)}
                            >
                                {isFinal && <div className="final-document-overlay">FINAL</div>}
                                <div className="document-card-preview" aria-hidden="true">
                                    <span>{documentInitials}</span>
                                    <div className="document-preview-sheet">
                                        <i />
                                        <i />
                                        <i />
                                    </div>
                                </div>
                                <div className="document-info">
                                    <h3>{documentTitle}</h3>
                                    
                                    <div className="document-meta">
                                        <div className={`document-status ${statusInfo.className}`}>
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
                                                Modified: {formatDate(modifiedDate).split(',')[0]}
                                            </p>
                                            
                                            {formattedExpiry && (
                                                <p className={`document-expiry ${isExpired ? 'document-expired-text' : ''}`}>
                                                    {isExpired ? 'EXPIRED: ' : 'Expires: '}{formattedExpiry}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="document-footer">
                                            <span className="document-id">
                                                ID: {documentId.substring(0, 8)}...
                                            </span>
                                            
                                            {(doc.recordsManagement?.retentionPeriod || doc.metadata?.recordsManagement?.retentionPeriod || doc.retentionPeriod) && (
                                                <span className="document-retention">
                                                    {doc.recordsManagement?.retentionPeriod || doc.metadata?.recordsManagement?.retentionPeriod || doc.retentionPeriod}
                                                </span>
                                            )}
                                            
                                            {isFinal && (
                                                <div className="document-final-badge">
                                                    Finalized
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="document-open-button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleOpenDocument(documentId);
                                            }}
                                        >
                                            Open
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}
                </>
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