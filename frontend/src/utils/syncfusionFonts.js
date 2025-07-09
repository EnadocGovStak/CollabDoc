/**
 * This file ensures that all necessary Syncfusion icon fonts are properly loaded
 * It should be imported in index.js
 */

// Import essential Syncfusion styles
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';
import '@syncfusion/ej2-icons/styles/material.css';

// This function loads font assets if needed
export const ensureFontsLoaded = () => {
  // Create a style element for custom font rules if needed
  const styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  styleEl.innerHTML = `
    /* Ensure e-icons font is loaded from CDN as fallback */
    @font-face {
      font-family: 'e-icons';
      src: url('https://cdn.syncfusion.com/ej2/23.1.36/material/e-icons.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    
    /* Fix icon display in toolbar */
    .e-toolbar .e-toolbar-items .e-toolbar-item .e-tbar-btn .e-icons {
      font-size: 16px !important;
      line-height: 1 !important;
      display: inline-block !important;
      font-style: normal !important;
      font-weight: normal !important;
    }
    
    /* Fix specific icons */
    .e-tbar-btn .e-icons.e-paste-icon::before { content: '\\e350'; }
    .e-tbar-btn .e-icons.e-cut-icon::before { content: '\\e328'; }
    .e-tbar-btn .e-icons.e-copy-icon::before { content: '\\e324'; }
    .e-tbar-btn .e-icons.e-undo-icon::before { content: '\\e333'; }
    .e-tbar-btn .e-icons.e-redo-icon::before { content: '\\e30d'; }
  `;
  document.head.appendChild(styleEl);
  
  console.log('Syncfusion fonts and icon styles loaded');
};

export default ensureFontsLoaded;
