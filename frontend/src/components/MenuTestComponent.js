import React, { useState, useRef, useEffect } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { 
  DocumentEditorContainerComponent, 
  DocumentEditorContainer,
  Toolbar, 
  Editor, 
  Selection, 
  ContextMenu,
  SfdtExport,
  EditorHistory,
  Print,
  WordExport,
  TextExport,
  Search,
  ImageResizer,
  OptionsPane,
  HyperlinkDialog,
  TableDialog,
  BookmarkDialog,
  TableOfContentsDialog,
  PageSetupDialog,
  StyleDialog,
  ListDialog,
  ParagraphDialog,
  BulletsAndNumberingDialog,
  FontDialog,
  TablePropertiesDialog,
  BordersAndShadingDialog,
  TableOptionsDialog,
  CellOptionsDialog,
  StylesDialog
} from '@syncfusion/ej2-react-documenteditor';
import { MenuComponent } from '@syncfusion/ej2-react-navigations';

// Note: Modules are now injected globally in utils/syncfusionModules.js

// A more robust minimal SFDT document structure to prevent runtime errors
const MINIMAL_DOCUMENT = {
  "sections": [{
    "blocks": [{
      "paragraphFormat": {
        "styleName": "Normal"
      },
      "characterFormat": {
        "fontSize": 11,
        "fontFamily": "Calibri"
      },
      "inlines": [{
        "text": "Right-click here to test context menu. This is sample text you can select."
      }]
    }]
  }],
  "characterFormat": {
    "fontSize": 11,
    "fontFamily": "Calibri"
  },
  "paragraphFormat": {
    "styleName": "Normal"
  },
  "styles": [
    {
      "name": "Normal",
      "type": "Paragraph",
      "paragraphFormat": {
        "listFormat": {}
      },
      "characterFormat": {
        "fontSize": 11,
        "fontFamily": "Calibri"
      }
    }
  ]
};

const MenuTestComponent = () => {
  const editorRef = useRef(null);
  const menuRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [documentLoaded, setDocumentLoaded] = useState(false);

  // Menu items for the standard menu
  const menuItems = [
    {
      text: 'File',
      items: [
        { text: 'New', iconCss: 'e-icons e-file-new' },
        { text: 'Open', iconCss: 'e-icons e-folder-open' },
        { text: 'Save', iconCss: 'e-icons e-save' }
      ]
    },
    {
      text: 'Edit',
      items: [
        { text: 'Cut', iconCss: 'e-icons e-cut' },
        { text: 'Copy', iconCss: 'e-icons e-copy' },
        { text: 'Paste', iconCss: 'e-icons e-paste' }
      ]
    },
    {
      text: 'View',
      items: [
        { text: 'Outline', iconCss: 'e-icons e-outline' },
        { text: 'Properties', iconCss: 'e-icons e-properties' }
      ]
    }
  ];

  // Load basic content
  const loadSampleContent = () => {
    if (editorRef.current?.documentEditor) {
      try {
        editorRef.current.documentEditor.open(JSON.stringify(MINIMAL_DOCUMENT));
        console.log("Sample content loaded");
        setDocumentLoaded(true);
      } catch (error) {
        console.error("Error loading sample content:", error);
      }
    }
  };

  // Create a simple test document with a table
  const createComplexDocument = () => {
    if (editorRef.current?.documentEditor) {
      try {
        const editor = editorRef.current.documentEditor;
        editor.editor.insertText("This is a test document with formatting and tables.\n");
        
        // Apply some formatting
        editor.selection.selectAll();
        editor.editor.toggleBold();
        editor.selection.moveToDocumentEnd();
        editor.editor.insertText("\nNormal text continues here.\n\n");
        
        // Insert a table
        editor.editor.insertTable(3, 3);
        
        // Add some text to table cells
        editor.editor.insertText("Cell 1");
        editor.selection.moveToNextCell();
        editor.editor.insertText("Cell 2");
        editor.selection.moveToNextCell();
        editor.editor.insertText("Cell 3");
        
        console.log("Complex document created");
        setDocumentLoaded(true);
      } catch (error) {
        console.error("Error creating complex document:", error);
      }
    }
  };

  // Test actions
  const selectAllText = () => {
    if (editorRef.current?.documentEditor) {
      try {
        editorRef.current.documentEditor.selection.selectAll();
        console.log("Selected all text");
      } catch (error) {
        console.error("Error selecting text:", error);
      }
    }
  };

  const showEditorProperties = () => {
    if (editorRef.current?.documentEditor) {
      try {
        console.log("DocumentEditor properties:", Object.keys(editorRef.current.documentEditor));
        console.log("ContextMenu enabled:", editorRef.current.documentEditor.enableContextMenu);
        
        // Check if context menu exists
        if (editorRef.current.documentEditor.contextMenu) {
          console.log("ContextMenu object exists:", editorRef.current.documentEditor.contextMenu);
        } else {
          console.log("ContextMenu object does not exist");
        }
      } catch (error) {
        console.error("Error showing properties:", error);
      }
    }
  };

  // Menu item click handler
  const menuClick = (args) => {
    console.log("Menu item clicked:", args.item.text);
    
    if (!editorRef.current?.documentEditor) return;
    
    const editor = editorRef.current.documentEditor;
    
    switch (args.item.text) {
      case 'New':
        editor.open('');
        break;
      case 'Open':
        console.log("Open dialog would appear here");
        break;
      case 'Save':
        console.log("Document content:", editor.serialize());
        break;
      case 'Cut':
        editor.editor.cut();
        break;
      case 'Copy':
        editor.editor.copy();
        break;
      case 'Paste':
        editor.editor.paste();
        break;
      case 'Outline':
        console.log("Outline view would toggle here");
        break;
      case 'Properties':
        console.log("Properties would show here");
        break;
      default:
        break;
    }
  };

  // Setup context menu manually
  const setupContextMenu = () => {
    if (editorRef.current?.documentEditor) {
      try {
        const editor = editorRef.current.documentEditor;
        
        // Force enable context menu
        editor.enableContextMenu = true;
        
        // Define custom context menu items
        const contextMenuItems = [
          { text: 'Cut', id: 'cut', iconCss: 'e-icons e-cut' },
          { text: 'Copy', id: 'copy', iconCss: 'e-icons e-copy' },
          { text: 'Paste', id: 'paste', iconCss: 'e-icons e-paste' },
          { separator: true },
          { text: 'Select All', id: 'selectall', iconCss: 'e-icons e-select' },
          { separator: true },
          { text: 'Insert Table', id: 'inserttable', iconCss: 'e-icons e-table' },
          { text: 'Insert Image', id: 'insertimage', iconCss: 'e-icons e-image' }
        ];
        
        // Add custom menu items if the API exists
        if (editor.contextMenu && typeof editor.contextMenu.addCustomMenu === 'function') {
          editor.contextMenu.addCustomMenu(contextMenuItems, false);
          console.log("Context menu items added successfully");
          
          // Set up event handlers
          editor.customContextMenuSelect = (args) => {
            console.log('Context menu item selected:', args.id);
            switch (args.id) {
              case 'cut':
                editor.editor.cut();
                break;
              case 'copy':
                editor.editor.copy();
                break;
              case 'paste':
                editor.editor.paste();
                break;
              case 'selectall':
                editor.selection.selectAll();
                break;
              case 'inserttable':
                editor.editor.insertTable(2, 2);
                break;
              case 'insertimage':
                console.log("Insert image would be triggered here");
                break;
              default:
                break;
            }
          };
          
          // Add event handler for context menu opening
          editor.customContextMenuBeforeOpen = (args) => {
            console.log('Context menu opening:', args);
          };
        } else {
          console.log("Context menu API not available");
        }
        
        console.log("Context menu setup complete");
      } catch (error) {
        console.error("Error setting up context menu:", error);
      }
    }
  };

  useEffect(() => {
    if (isReady) {
      // Load content with a small delay
      setTimeout(() => {
        loadSampleContent();
        // Setup context menu after loading content
        setTimeout(() => {
          setupContextMenu();
        }, 500);
      }, 200);
    }
  }, [isReady]);

  return (
    <div className="menu-test-container">
      <h2>Menu Test Component</h2>
      <p>This component tests both standard menu and context menu functionality.</p>
      
      {/* Standard Menu Component */}
      <div className="standard-menu" style={{ marginBottom: '10px' }}>
        <MenuComponent 
          ref={menuRef}
          items={menuItems} 
          cssClass="e-documenteditor-menu"
          select={menuClick}
        />
      </div>
      
      <div className="test-controls" style={{ marginBottom: '10px' }}>
        <ButtonComponent onClick={loadSampleContent} style={{ marginRight: '8px' }}>
          Load Sample Content
        </ButtonComponent>
        <ButtonComponent onClick={createComplexDocument} style={{ marginRight: '8px' }}>
          Create Complex Document
        </ButtonComponent>
        <ButtonComponent onClick={selectAllText} style={{ marginRight: '8px' }}>
          Select All Text
        </ButtonComponent>
        <ButtonComponent onClick={showEditorProperties} style={{ marginRight: '8px' }}>
          Show Editor Properties
        </ButtonComponent>
        <ButtonComponent onClick={setupContextMenu}>
          Setup Context Menu
        </ButtonComponent>
      </div>
      
      <div style={{ height: '400px', border: '1px solid #ccc' }}>
        <DocumentEditorContainerComponent
          ref={editorRef}
          id="menu_test_container"
          style={{ display: 'block', height: '100%' }}
          enableToolbar={true}
          enableSelection={true}
          enableEditor={true}
          enableEditorHistory={true}
          enableContextMenu={true}
          enableSfdtExport={true}
          enablePrint={true}
          enableWordExport={true}
          enableTextExport={true}
          enableSearch={true}
          enableImageResizer={true}
          enableOptionsPane={true}
          enableBookmarkDialog={true}
          enableBordersAndShadingDialog={true}
          enableFontDialog={true}
          enableTableDialog={true}
          enableParagraphDialog={true}
          enableHyperlinkDialog={true}
          enableListDialog={true}
          enablePageSetupDialog={true}
          enableStyleDialog={true}
          enableTableOfContentsDialog={true}
          enableTableOptionsDialog={true}
          enableTablePropertiesDialog={true}
          serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
          documentEditorSettings={{
            enableContextMenu: true,
            enableSelection: true,
            enableEditor: true,
            enableEditorHistory: true,
            enableSfdtExport: true,
            enablePrint: true,
            enableImageResizer: true
          }}
          created={() => {
            console.log("MenuTest DocumentEditor created");
            setIsReady(true);
          }}
        />
      </div>
      
      {/* Status display */}
      <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p><strong>Status:</strong> {isReady ? 'Editor Ready' : 'Editor Initializing'} | 
        {documentLoaded ? ' Document Loaded' : ' No Document Loaded'}</p>
      </div>
    </div>
  );
};

export default MenuTestComponent;