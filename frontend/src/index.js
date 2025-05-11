import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/index.css';
import router from './router';
import reportWebVitals from './reportWebVitals';

// Import Syncfusion themes at the application level
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-react-buttons/styles/material.css';
import '@syncfusion/ej2-react-popups/styles/material.css';
import '@syncfusion/ej2-base/styles/material.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// Apply targeted styling fix for document editor
const fixDocumentEditorStyles = () => {
  // Create style element
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* Target the specific container with highest specificity */
    #container_editor_viewerContainer {
      background: white !important;
      background-image: none !important;
      background-color: white !important;
    }
    
    /* Ensure any pseudo-elements are also fixed */
    #container_editor_viewerContainer::before,
    #container_editor_viewerContainer::after {
      background: none !important;
      background-image: none !important;
    }
    
    /* Fix any related container elements */
    div[id*="_editor_"], 
    div[id*="_viewer_"] {
      background: white !important;
      background-image: none !important;
    }
  `;
  document.head.appendChild(styleEl);
  
  // Also apply direct inline style fixes
  const applyFix = () => {
    const container = document.getElementById('container_editor_viewerContainer');
    if (container) {
      container.style.cssText = container.style.cssText + '; background: white !important; background-image: none !important;';
      
      // Try to add a white overlay if needed
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: -1;';
      container.appendChild(overlay);
    }
  };
  
  // Run fix immediately and every 500ms
  setTimeout(applyFix, 1000);
  setTimeout(applyFix, 2000);
  setInterval(applyFix, 3000);
};

// Run the fix after the app loads
setTimeout(fixDocumentEditorStyles, 1000);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 