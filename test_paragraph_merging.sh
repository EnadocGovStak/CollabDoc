#!/bin/bash

echo "=== Paragraph Merging Solution Test ==="
echo ""

# Check if backend is running
echo "1. Checking backend health..."
HEALTH_RESPONSE=$(curl -s http://localhost:5001/api/health)
if [[ $? -eq 0 ]]; then
    echo "✅ Backend is running"
    echo "Health status: $(echo $HEALTH_RESPONSE | grep -o '"status":"[^"]*"')"
else
    echo "❌ Backend is not running. Please start it with:"
    echo "   cd SyncfusionDocumentConverter && dotnet run"
    exit 1
fi

echo ""

# Test document conversion
echo "2. Testing document conversion..."
if [[ -f "Document Storage warehouse.docx" ]]; then
    echo "Found test document: Document Storage warehouse.docx"
    
    # Convert document and check for merged paragraphs
    CONVERSION_RESPONSE=$(curl -s -X POST http://localhost:5001/api/document/convert-to-sfdt \
        -F "file=@Document Storage warehouse.docx")
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Document conversion successful"
        
        # Check for evidence of paragraph merging
        LONG_PARAGRAPH_COUNT=$(echo $CONVERSION_RESPONSE | grep -o '"tlp":"[^"]\{100,\}"' | wc -l)
        TOTAL_PARAGRAPH_COUNT=$(echo $CONVERSION_RESPONSE | grep -o '"tlp":"[^"]*"' | wc -l)
        
        echo "📊 Conversion Results:"
        echo "   - Total paragraphs: $TOTAL_PARAGRAPH_COUNT"
        echo "   - Long paragraphs (>100 chars): $LONG_PARAGRAPH_COUNT"
        
        if [[ $LONG_PARAGRAPH_COUNT -gt 0 ]]; then
            echo "✅ Paragraph merging appears to be working!"
            echo "   Found $LONG_PARAGRAPH_COUNT merged paragraphs"
        else
            echo "⚠️  No long paragraphs found - merging may not be working as expected"
        fi
        
        # Show a sample of merged content
        echo ""
        echo "3. Sample merged paragraph:"
        SAMPLE_PARAGRAPH=$(echo $CONVERSION_RESPONSE | grep -o '"tlp":"[^"]\{100,\}"' | head -1 | sed 's/"tlp":"//; s/"$//')
        if [[ -n "$SAMPLE_PARAGRAPH" ]]; then
            echo "   \"${SAMPLE_PARAGRAPH:0:200}...\""
        else
            echo "   No long paragraphs found to display"
        fi
        
    else
        echo "❌ Document conversion failed"
        exit 1
    fi
else
    echo "❌ Test document 'Document Storage warehouse.docx' not found"
    echo "   Please ensure the test file is in the current directory"
    exit 1
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "To test in the frontend:"
echo "1. Open the frontend application"
echo "2. Use the document import feature"
echo "3. Import 'Document Storage warehouse.docx'"
echo "4. Verify that paragraphs are properly merged in the editor" 