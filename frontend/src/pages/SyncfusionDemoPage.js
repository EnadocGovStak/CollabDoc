import React, { useEffect } from 'react';
import DocumentEditorDemo from '../components/DocumentEditorDemo';
import { Link } from 'react-router-dom';

const SyncfusionDemoPage = () => {
  // Add Syncfusion stylesheet links to the head
  useEffect(() => {
    // Add material theme stylesheets
    const addStylesheet = (href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.className = 'syncfusion-style';
      document.head.appendChild(link);
    };

    // Add necessary stylesheets
    addStylesheet('https://cdn.syncfusion.com/ej2/material.css');
    
    // Add custom styles for the demo page
    const styleElement = document.createElement('style');
    styleElement.className = 'syncfusion-style';
    styleElement.textContent = `
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        overflow: hidden;
      }
      
      /* Hide any warning/license banners */
      .e-de-ctn-warning {
        display: none !important;
      }
      
      /* Style toolbar buttons */
      .e-documenteditor-container .e-toolbar .e-tbar-btn .e-tbar-btn-text {
        font-size: 12px;
      }
      
      /* Make properties pane visible */
      .e-de-property-section {
        border-left: 1px solid #e0e0e0;
        visibility: visible !important;
        display: block !important;
      }
      
      /* Tab styling */
      .e-de-property-header {
        background-color: #f8f9fa;
        padding: 8px;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .e-de-property-header .e-tab {
        background-color: transparent;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Cleanup when component unmounts
    return () => {
      document.querySelectorAll('.syncfusion-style').forEach(el => el.remove());
    };
  }, []);
  
  return (
    <div className="document-editor-demo-page">
      <DocumentEditorDemo />
    </div>
  );
};

export default SyncfusionDemoPage; 