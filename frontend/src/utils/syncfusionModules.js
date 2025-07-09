// Centralized Syncfusion module injection
// This ensures modules are injected only once globally to avoid conflicts

import {
  DocumentEditorContainer,
  Toolbar,
  SfdtExport,
  Selection,
  Editor,
  EditorHistory,
  ContextMenu,
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

// Global flag to ensure injection happens only once
let modulesInjected = false;

export const initializeSyncfusionModules = () => {
  if (!modulesInjected) {
    console.log('Initializing Syncfusion modules globally...');
    
    DocumentEditorContainer.Inject(
      Toolbar,
      SfdtExport,
      Selection,
      Editor,
      EditorHistory,
      ContextMenu,
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
    );
    
    modulesInjected = true;
    console.log('Syncfusion modules initialized successfully');
  }
};

// Initialize modules immediately when this file is imported
initializeSyncfusionModules();
