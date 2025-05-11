/**
 * Title bar implementation for the document editor component
 */
import DocumentService from '../services/DocumentService';
import OneDriveService from '../services/OneDriveService';

export class TitleBar {
    constructor(element, docEditor, isShareNeeded) {
        if (!element || !docEditor) {
            console.error('Title bar initialization failed: Missing element or document editor');
            return;
        }
        
        this.documentEditor = docEditor;
        this.titleBarDiv = element;
        this.isShareNeeded = isShareNeeded;
        this.documentId = null;
        this.initializeTitleBar();
        this.wireEvents();
    }

    initializeTitleBar() {
        // Set the title bar inner HTML with content
        this.titleBarDiv.innerHTML = ''; // Clear any existing content
        
        // Create Save, Download and Print buttons
        const saveBtn = document.createElement('button');
        saveBtn.className = 'e-btn e-primary save-btn';
        saveBtn.textContent = 'Save';
        saveBtn.style.marginLeft = 'auto';
        saveBtn.style.marginRight = '10px';
        saveBtn.onclick = this.save.bind(this);
        
        const saveToOneDriveBtn = document.createElement('button');
        saveToOneDriveBtn.className = 'e-btn e-primary onedrive-btn';
        saveToOneDriveBtn.textContent = 'Save to OneDrive';
        saveToOneDriveBtn.style.marginRight = '10px';
        saveToOneDriveBtn.onclick = this.saveToOneDrive.bind(this);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'e-btn e-primary download-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.style.marginRight = '10px';
        downloadBtn.onclick = this.download.bind(this);
        
        const printBtn = document.createElement('button');
        printBtn.className = 'e-btn e-primary print-btn';
        printBtn.textContent = 'Print';
        printBtn.style.marginRight = '10px';
        printBtn.onclick = this.print.bind(this);
        
        // Create document title element
        this.documentTitle = document.createElement('span');
        this.documentTitle.id = 'documenteditor_title_name';
        this.documentTitle.className = 'e-de-title-bar-docname';
        this.documentTitle.innerHTML = 'Getting Started';
        
        // Create save time element
        this.saveTime = document.createElement('span');
        this.saveTime.className = 'e-de-title-bar-savetime';
        this.saveTime.innerHTML = 'Last saved: ' + this.formatDateTime(new Date());
        this.saveTime.style.marginLeft = '15px';
        this.saveTime.style.fontSize = '12px';
        this.saveTime.style.opacity = '0.6';
        
        // Create status message element
        this.statusMessage = document.createElement('span');
        this.statusMessage.className = 'e-de-title-bar-status';
        this.statusMessage.style.marginLeft = '15px';
        this.statusMessage.style.fontSize = '12px';
        this.statusMessage.style.fontWeight = 'bold';
        this.statusMessage.style.color = '#4CAF50';
        this.statusMessage.style.opacity = '0';
        this.statusMessage.style.transition = 'opacity 0.5s';
        
        // Append all elements to the title bar
        this.titleBarDiv.appendChild(this.documentTitle);
        this.titleBarDiv.appendChild(this.saveTime);
        this.titleBarDiv.appendChild(this.statusMessage);
        this.titleBarDiv.appendChild(saveBtn);
        this.titleBarDiv.appendChild(saveToOneDriveBtn);
        this.titleBarDiv.appendChild(downloadBtn);
        this.titleBarDiv.appendChild(printBtn);
    }
    
    // Format date time
    formatDateTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minutes}:00 ${ampm}`;
    }

    // Save document
    async save() {
        if (!this.documentEditor) {
            return;
        }
        
        try {
            // Get the document name
            const documentName = this.documentEditor.documentName || 'Untitled';
            
            // Get the document content (SFDT)
            const sfdtContent = await this.documentEditor.serialize();
            
            // Get auth context from the window if available
            const authContext = window.authContext || {};
            const accessToken = authContext.accessToken;
            
            if (accessToken) {
                // Save to backend if authenticated
                const documentData = {
                    name: documentName,
                    content: sfdtContent
                };
                
                // If we have a document ID, update it, otherwise create a new one
                let result;
                if (this.documentId) {
                    // Update existing document
                    const success = await DocumentService.updateDocument(
                        this.documentId,
                        documentData,
                        accessToken
                    );
                    
                    if (success) {
                        result = { 
                            documentId: this.documentId,
                            name: documentName,
                            updatedAt: new Date().toISOString()
                        };
                    }
                } else {
                    // Create new document
                    result = await DocumentService.createDocument(
                        documentData,
                        accessToken
                    );
                }
                
                if (result) {
                    this.documentId = result.documentId;
                    this.updateSaveTime(new Date());
                    this.showStatusMessage('Document saved to server successfully');
                } else {
                    // Fallback to localStorage if backend save failed
                    const localResult = await DocumentService.saveDocument(documentName, sfdtContent);
                    if (localResult) {
                        this.documentId = localResult.documentId;
                        this.updateSaveTime(new Date());
                        this.showStatusMessage('Document saved locally (server unavailable)');
                    } else {
                        this.showStatusMessage('Failed to save document', true);
                    }
                }
            } else {
                // No authentication - save to localStorage as fallback
                const result = await DocumentService.saveDocument(documentName, sfdtContent);
                
                if (result) {
                    this.documentId = result.documentId;
                    this.updateSaveTime(new Date());
                    this.showStatusMessage('Document saved locally');
                } else {
                    this.showStatusMessage('Failed to save document', true);
                }
            }
        } catch (error) {
            console.error('Error saving document:', error);
            this.showStatusMessage('Error saving document', true);
        }
    }
    
    // Download document
    download() {
        if (this.documentEditor) {
            this.documentEditor.save('Document.docx', 'Docx');
        }
    }
    
    // Print document
    print() {
        if (this.documentEditor) {
            this.documentEditor.print();
        }
    }

    wireEvents() {
        if (this.documentEditor) {
            this.documentEditor.documentChange = () => {
                this.updateDocumentTitle();
            };
        }
    }

    updateDocumentTitle() {
        if (!this.documentEditor || !this.documentTitle) {
            return;
        }
        
        if (this.documentEditor.documentName === '') {
            this.documentEditor.documentName = 'Untitled';
        }
        this.documentTitle.innerHTML = this.documentEditor.documentName;
    }
    
    updateSaveTime(date) {
        if (this.saveTime) {
            this.saveTime.innerHTML = 'Last saved: ' + this.formatDateTime(date);
        }
    }
    
    showStatusMessage(message, isError = false) {
        if (this.statusMessage) {
            this.statusMessage.innerHTML = message;
            this.statusMessage.style.color = isError ? '#F44336' : '#4CAF50';
            this.statusMessage.style.opacity = '1';
            
            // Hide the message after 3 seconds
            setTimeout(() => {
                this.statusMessage.style.opacity = '0';
            }, 3000);
        }
    }

    // Save document to OneDrive
    async saveToOneDrive() {
        if (!this.documentEditor) {
            return;
        }
        
        try {
            // Get the document name
            const documentName = this.documentEditor.documentName || 'Untitled';
            
            // Get the document content (SFDT)
            const sfdtContent = await this.documentEditor.serialize();
            
            // Get auth context from the window if available
            const authContext = window.authContext || {};
            const graphToken = authContext.graphToken || authContext.accessToken;
            
            if (!graphToken) {
                this.showStatusMessage('Microsoft Graph access token required for OneDrive', true);
                return;
            }
            
            // Save to OneDrive
            const result = await OneDriveService.saveDocumentToOneDrive(
                documentName,
                sfdtContent,
                graphToken
            );
            
            if (result) {
                this.documentId = result.documentId;
                this.oneDriveUrl = result.webUrl;
                this.updateSaveTime(new Date());
                this.showStatusMessage('Document saved to OneDrive successfully');
                
                // Open the document in OneDrive in a new tab if available
                if (result.webUrl) {
                    window.open(result.webUrl, '_blank');
                }
            } else {
                this.showStatusMessage('Failed to save document to OneDrive', true);
            }
        } catch (error) {
            console.error('Error saving document to OneDrive:', error);
            this.showStatusMessage('Error saving document to OneDrive', true);
        }
    }
} 