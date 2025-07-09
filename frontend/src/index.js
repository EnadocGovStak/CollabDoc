import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/index.css';
import router from './router';
import reportWebVitals from './reportWebVitals';
import { registerLicense } from '@syncfusion/ej2-base';

// Initialize Syncfusion modules globally before anything else
import './utils/syncfusionModules';

// Import Syncfusion themes at the application level - following exact order from documentation
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-documenteditor/styles/material.css';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-react-buttons/styles/material.css';
import '@syncfusion/ej2-react-popups/styles/material.css';
import '@syncfusion/ej2-react-navigations/styles/material.css';
import '@syncfusion/ej2-icons/styles/material.css';

// Register Syncfusion license
registerLicense(process.env.REACT_APP_SYNCFUSION_KEY || 'Ngo9BigBOggjHTQxAR8/V1NGaF1cXGFCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXpeeXVXRGFZUk1zXUJWYUs=');

// Font loading function
const ensureFontsLoaded = () => {
  // Create a style element for custom font rules if needed
  const styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  styleEl.innerHTML = `
    /* Ensure e-icons font is loaded from CDN as fallback */
    @font-face {
      font-family: 'e-icons';
      src: url('https://cdn.syncfusion.com/ej2/22.2.5/material/e-icons.woff2') format('woff2'),
           url('https://cdn.syncfusion.com/ej2/22.2.5/material/e-icons.woff') format('woff'),
           url('https://cdn.syncfusion.com/ej2/22.2.5/material/e-icons.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: fallback;
    }
    
    /* Critical fix for context menu visibility */
    .e-contextmenu-wrapper, 
    .e-contextmenu-container,
    .e-contextmenu,
    .e-menu-parent {
      z-index: 10000 !important;
      visibility: visible !important;
      display: block !important;
      position: absolute !important;
    }
  `;
  document.head.appendChild(styleEl);
  
  console.log("Syncfusion fonts loaded");
};

// Call this to ensure fonts are loaded
ensureFontsLoaded();

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
    
    /* Make sure context menu is always visible */
    .e-documenteditor-contextmenu,
    .e-contextmenu-wrapper,
    .e-contextmenu-container {
      z-index: 100000 !important;
      visibility: visible !important;
      position: absolute !important;
      display: block !important;
    }
  `;
  document.head.appendChild(styleEl);
};

// Apply style fixes after a short delay to ensure DOM is ready
setTimeout(fixDocumentEditorStyles, 1000);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();