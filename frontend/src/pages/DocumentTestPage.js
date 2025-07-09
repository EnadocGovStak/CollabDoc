import React, { useState, useRef } from 'react';
import DocumentEditorDemo from '../components/DocumentEditorDemo';

const DocumentTestPage = () => {
  const editorRef = useRef(null);
  const [testDocument, setTestDocument] = useState({
    id: 'test-doc',
    title: 'Test Document',
    content: '{"optimizeSfdt":true,"sec":[{"secpr":{"pw":612,"ph":792,"lm":72,"rm":72,"tm":72,"bm":72,"dfp":0,"doep":0,"hd":36,"fd":36,"bi":0,"bc":"NewPage","pgns":"Arabic","ncols":1,"eqw":1,"lbtc":0,"cols":[]},"b":[{"pf":{"bdrs":{"tp":{},"lt":{},"rg":{},"bt":{},"h":{},"v":{}},"stn":"Normal","lif":{}},"cf":{"bi":false},"i":[{"cf":{"bi":false},"tlp":"This is test content from the test page."}]}],"hf":{}}],"cf":{"b":false,"i":false,"fsz":11,"ff":"Calibri","u":0,"st":0,"ba":0,"hc":0,"fc":"#00000000","bbi":false,"ibi":false,"fszbi":11,"ffbi":"Calibri","ac":false,"ffa":"Calibri","ffnfe":"Calibri","fffe":"Calibri"},"pf":{"bdrs":{"tp":{},"lt":{},"rg":{},"bt":{},"h":{},"v":{}},"lin":0,"rin":0,"fin":0,"ta":0,"bs":0,"as":0,"ls":1,"lst":0,"bi":false,"klt":false,"kwn":false,"wc":true,"lif":{}},"tfl":{},"dtw":36,"tc":0,"enf":0,"hv":"","sv":"","fmt":0,"pt":0,"dhtml":0,"ffs":1,"comp":0,"stytbl":0,"sty":[{"n":"Normal","t":0,"pf":{"bdrs":{"tp":{},"lt":{},"rg":{},"bt":{},"h":{},"v":{}},"lif":{}},"cf":{},"nx":"Normal"}],"li":[],"al":[],"cm":[],"r":[],"cx":[],"imgs":{}}',
    version: 1
  });

  const handleContentChange = (content) => {
    console.log('Content changed:', content);
  };

  const loadSampleDocument = () => {
    console.log('Loading sample document');
    setTestDocument({
      id: 'sample-doc',
      title: 'Sample Document',
      content: '{"optimizeSfdt":true,"sec":[{"secpr":{"pw":612,"ph":792,"lm":72,"rm":72,"tm":72,"bm":72,"dfp":0,"doep":0,"hd":36,"fd":36,"bi":0,"bc":"NewPage","pgns":"Arabic","ncols":1,"eqw":1,"lbtc":0,"cols":[]},"b":[{"pf":{"bdrs":{"tp":{},"lt":{},"rg":{},"bt":{},"h":{},"v":{}},"stn":"Normal","lif":{}},"cf":{"bi":false},"i":[{"cf":{"bi":false},"tlp":"Sample document content loaded successfully."}]}],"hf":{}}],"cf":{"b":false,"i":false,"fsz":11,"ff":"Calibri","u":0,"st":0,"ba":0,"hc":0,"fc":"#00000000","bbi":false,"ibi":false,"fszbi":11,"ffbi":"Calibri","ac":false,"ffa":"Calibri","ffnfe":"Calibri","fffe":"Calibri"},"pf":{"bdrs":{"tp":{},"lt":{},"rg":{},"bt":{},"h":{},"v":{}},"lin":0,"rin":0,"fin":0,"ta":0,"bs":0,"as":0,"ls":1,"lst":0,"bi":false,"klt":false,"kwn":false,"wc":true,"lif":{}},"tfl":{},"dtw":36,"tc":0,"enf":0,"hv":"","sv":"","fmt":0,"pt":0,"dhtml":0,"ffs":1,"comp":0,"stytbl":0,"sty":[{"n":"Normal","t":0,"pf":{"bdrs":{"tp":{},"lt":{},"rg":{},"bt":{},"h":{},"v":{}},"lif":{}},"cf":{},"nx":"Normal"}],"li":[],"al":[],"cm":[],"r":[],"cx":[],"imgs":{}}',
      version: 1
    });
  };

  const loadEmptyDocument = () => {
    console.log('Loading empty document');
    setTestDocument({
      id: 'empty-doc',
      title: 'Empty Document',
      content: '',
      version: 1
    });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <h1>Document Editor Test Page</h1>
        <p>Current document: {testDocument.title} (ID: {testDocument.id})</p>
        <button onClick={loadSampleDocument} style={{ marginRight: '10px' }}>
          Load Sample Document
        </button>
        <button onClick={loadEmptyDocument}>
          Load Empty Document
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <DocumentEditorDemo
          ref={editorRef}
          document={testDocument}
          onContentChange={handleContentChange}
          isReadOnly={false}
          key={testDocument.id}
        />
      </div>
    </div>
  );
};

export default DocumentTestPage;
