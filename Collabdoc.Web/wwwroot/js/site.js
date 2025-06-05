// Collabdoc - Document Management System - Custom JavaScript

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Collabdoc application initialized');
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Initialize file upload drag and drop
    initializeFileUpload();
});

// File upload drag and drop functionality
function initializeFileUpload() {
    const fileUploadAreas = document.querySelectorAll('.file-upload-area');
    
    fileUploadAreas.forEach(area => {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            area.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        area.addEventListener('drop', handleDrop, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    e.currentTarget.classList.add('dragover');
}

function unhighlight(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    console.log('Files dropped:', files.length);
    // Handle file processing here or pass to Blazor component
}

// Utility functions for Blazor interop
window.blazorCulture = {
    get: () => window.localStorage['BlazorCulture'],
    set: (value) => window.localStorage['BlazorCulture'] = value
};

// Loading indicator helpers
window.showLoading = function() {
    const loadingElement = document.querySelector('.loading-wrapper');
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
};

window.hideLoading = function() {
    const loadingElement = document.querySelector('.loading-wrapper');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
};

// Scroll to element helper
window.scrollToElement = function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// Download file helper
window.downloadFileFromStream = async function(fileName, contentStreamReference) {
    const arrayBuffer = await contentStreamReference.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);
    
    const anchorElement = document.createElement('a');
    anchorElement.href = url;
    anchorElement.download = fileName ?? '';
    anchorElement.click();
    anchorElement.remove();
    
    URL.revokeObjectURL(url);
};

// Copy to clipboard helper
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(function() {
        console.log('Text copied to clipboard');
        // Show success message if needed
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);
    });
};

// Notification helper for Blazor interop
window.showNotification = function(type, title, message, duration = 5000) {
    console.log(`Notification [${type}]: ${title} - ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification-toast`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
        <strong>${title}</strong>
        ${message ? `<div>${message}</div>` : ''}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
    
    // Enable Bootstrap dismiss functionality
    if (typeof bootstrap !== 'undefined') {
        new bootstrap.Alert(notification);
    }
};

// Theme helper
window.setTheme = function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

// Get saved theme or default to light
window.getTheme = function() {
    return localStorage.getItem('theme') || 'light';
};

// Application ready event for Blazor
window.onBlazorReady = function() {
    console.log('Blazor application is ready');
    
    // Apply saved theme
    const savedTheme = window.getTheme();
    window.setTheme(savedTheme);
    
    // Hide initial loading if visible
    window.hideLoading();
};

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
}); 