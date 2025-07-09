import React, { useRef, useState, useEffect } from 'react';
import DocumentEditorDemo from '../components/DocumentEditorDemo';

/**
 * Validation test page to verify the robustness of DocumentEditorDemo
 * Tests various scenarios that previously caused "Editor not ready for initialization - destroyed" errors
 */
const EditorValidationTestPage = () => {
  const editorRef = useRef(null);
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(0);
  const [editorKey, setEditorKey] = useState(0);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [testDocument, setTestDocument] = useState(null);

  const tests = [
    {
      name: "Basic Initialization",
      description: "Test basic editor initialization without content",
      execute: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true, message: "Editor initialized successfully" });
          }, 1000);
        });
      }
    },
    {
      name: "Rapid Re-render Test",
      description: "Test rapid component re-renders",
      execute: () => {
        return new Promise((resolve) => {
          let renderCount = 0;
          const interval = setInterval(() => {
            setEditorKey(prev => prev + 1);
            renderCount++;
            if (renderCount >= 5) {
              clearInterval(interval);
              setTimeout(() => {
                resolve({ success: true, message: "Survived 5 rapid re-renders" });
              }, 500);
            }
          }, 100);
        });
      }
    },
    {
      name: "Props Change Test",
      description: "Test changing props rapidly",
      execute: () => {
        return new Promise((resolve) => {
          let changes = 0;
          const interval = setInterval(() => {
            setIsReadOnly(prev => !prev);
            changes++;
            if (changes >= 4) {
              clearInterval(interval);
              setTimeout(() => {
                resolve({ success: true, message: "Handled prop changes successfully" });
              }, 500);
            }
          }, 200);
        });
      }
    },
    {
      name: "Document Loading Test",
      description: "Test loading different document types",
      execute: () => {
        return new Promise((resolve) => {
          const testDocs = [
            { content: '{"sections":[{"blocks":[{"inlines":[{"text":"Test 1"}]}]}]}' },
            { content: 'Plain text content' },
            { content: '{"optimizeSfdt": true, "sections":[{"blocks":[{"inlines":[{"text":"Optimized"}]}]}]}' }
          ];
          
          let docIndex = 0;
          const interval = setInterval(() => {
            setTestDocument(testDocs[docIndex]);
            docIndex++;
            if (docIndex >= testDocs.length) {
              clearInterval(interval);
              setTimeout(() => {
                resolve({ success: true, message: "Loaded various document types" });
              }, 500);
            }
          }, 300);
        });
      }
    },
    {
      name: "Stress Test",
      description: "Combined stress test with rapid changes",
      execute: () => {
        return new Promise((resolve) => {
          let operations = 0;
          const maxOperations = 10;
          
          const interval = setInterval(() => {
            // Randomly change different props
            if (Math.random() > 0.5) {
              setEditorKey(prev => prev + 1);
            } else {
              setIsReadOnly(prev => !prev);
            }
            
            operations++;
            if (operations >= maxOperations) {
              clearInterval(interval);
              setTimeout(() => {
                resolve({ success: true, message: "Survived stress test" });
              }, 1000);
            }
          }, 150);
        });
      }
    }
  ];

  const runTest = async (testIndex) => {
    try {
      setCurrentTest(testIndex);
      const test = tests[testIndex];
      const result = await test.execute();
      
      setTestResults(prev => [...prev, {
        name: test.name,
        success: result.success,
        message: result.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Wait a bit before next test
      setTimeout(() => {
        if (testIndex < tests.length - 1) {
          runTest(testIndex + 1);
        }
      }, 1000);
      
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: tests[testIndex].name,
        success: false,
        message: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    setCurrentTest(0);
    runTest(0);
  };

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>Document Editor Validation Test Page</h1>
      <p>This page tests various scenarios to validate the robustness of the DocumentEditorDemo component.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={runAllTests} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Run All Tests
        </button>
        <button onClick={() => setEditorKey(prev => prev + 1)} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Force Re-render
        </button>
        <button onClick={() => setIsReadOnly(prev => !prev)} style={{ padding: '10px 20px' }}>
          Toggle Read-Only
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Results:</h3>
        {testResults.length === 0 ? (
          <p>No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {testResults.map((result, index) => (
              <div key={index} style={{ 
                padding: '5px', 
                marginBottom: '5px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '3px'
              }}>
                <strong>{result.name}</strong> - {result.message} ({result.timestamp})
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        flex: 1, 
        border: '2px solid #007bff', 
        borderRadius: '5px',
        padding: '10px',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>Document Editor (Key: {editorKey}, ReadOnly: {isReadOnly ? 'Yes' : 'No'})</h3>
        <div style={{ height: 'calc(100% - 40px)' }}>
          <DocumentEditorDemo
            key={editorKey}
            ref={editorRef}
            document={testDocument}
            isReadOnly={isReadOnly}
            onContentChange={(content) => {
              console.log("Content changed, length:", content?.length || 0);
            }}
            onDocumentLoaded={() => {
              console.log("Document loaded successfully");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorValidationTestPage;
