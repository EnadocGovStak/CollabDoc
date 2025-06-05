# Test Document API Creation
Write-Host "Testing Document API Creation..." -ForegroundColor Green

# Test 1: Create a simple document via SyncfusionDocumentConverter API
Write-Host "`n1. Testing SyncfusionDocumentConverter API (port 5003)..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
}

$createDocumentBody = @{
    Title = "Test Document via API"
    Content = "This is a test document created via API call at $(Get-Date)"
    DocumentType = "general"
    Classification = "internal"
    RetentionPeriod = "3years"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5003/api/Document/save" -Method POST -Body $createDocumentBody -Headers $headers
    Write-Host "✅ Document created successfully via SyncfusionDocumentConverter API" -ForegroundColor Green
    Write-Host "Document ID: $($response.data.id)" -ForegroundColor Cyan
    Write-Host "Title: $($response.data.title)" -ForegroundColor Cyan
    Write-Host "Content: $($response.data.content)" -ForegroundColor Cyan
    
    # Store document ID for verification
    $docId = $response.data.id
    
    # Test 2: Retrieve the created document
    Write-Host "`n2. Testing document retrieval..." -ForegroundColor Yellow
    $getResponse = Invoke-RestMethod -Uri "http://localhost:5003/api/Document/$docId" -Method GET
    Write-Host "✅ Document retrieved successfully" -ForegroundColor Green
    Write-Host "Retrieved Title: $($getResponse.data.title)" -ForegroundColor Cyan
    Write-Host "Created At: $($getResponse.data.createdAt)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error with SyncfusionDocumentConverter API: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

# Test 3: Test Web App API (port 5000) - Create with SFDT content
Write-Host "`n3. Testing Collabdoc.Web API (port 5000) for SFDT document..." -ForegroundColor Yellow

$sfdtContent = @"
{
    "sections": [{
        "sectionFormat": {
            "pageWidth": 612,
            "pageHeight": 792,
            "leftMargin": 72,
            "rightMargin": 72,
            "topMargin": 72,
            "bottomMargin": 72,
            "differentFirstPage": false,
            "differentOddAndEvenPages": false
        },
        "blocks": [{
            "paragraphFormat": {
                "styleName": "Normal"
            },
            "characterFormat": {},
            "inlines": [{
                "characterFormat": {},
                "text": "This is a test SFDT document created via API at $(Get-Date)"
            }]
        }]
    }],
    "characterFormat": {
        "bold": false,
        "italic": false,
        "fontSize": 11,
        "fontFamily": "Calibri"
    },
    "paragraphFormat": {
        "leftIndent": 0,
        "rightIndent": 0,
        "firstLineIndent": 0,
        "textAlignment": "Left",
        "beforeSpacing": 0,
        "afterSpacing": 0,
        "lineSpacing": 1.15,
        "lineSpacingType": "Multiple"
    },
    "defaultTabWidth": 36,
    "enforcement": false,
    "hashValue": "",
    "saltValue": "",
    "formatting": false,
    "protectionType": "NoProtection",
    "dontUseHTMLParagraphAutoSpacing": false,
    "formFieldShading": true,
    "compatibilityMode": "Word2013",
    "styles": [{
        "name": "Normal",
        "type": "Paragraph",
        "paragraphFormat": {
            "listFormat": {}
        },
        "characterFormat": {},
        "next": "Normal"
    }, {
        "name": "Default Paragraph Font",
        "type": "Character",
        "characterFormat": {}
    }],
    "lists": [],
    "abstractLists": [],
    "comments": [],
    "revisions": [],
    "customXml": []
}
"@

try {
    # Create form data for Web API
    $boundary = [System.Guid]::NewGuid().ToString()
    $bodyLines = @(
        "--$boundary",
        'Content-Disposition: form-data; name="documentName"',
        '',
        "Test_SFDT_Document_$(Get-Date -Format 'yyyyMMdd_HHmmss')",
        "--$boundary",
        'Content-Disposition: form-data; name="sfdtContent"',
        '',
        $sfdtContent,
        "--$boundary--"
    )
    $bodyString = $bodyLines -join "`r`n"
    
    $webHeaders = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    # Note: This may not work directly with Invoke-RestMethod for multipart data
    # Let's try a simpler approach with JSON
    $simpleWebBody = @{
        documentName = "Test_SFDT_Document_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        sfdtContent = $sfdtContent
    } | ConvertTo-Json
    
    $jsonHeaders = @{
        "Content-Type" = "application/json"
    }
    
    # Try web API save endpoint 
    Write-Host "Attempting to save SFDT document to Collabdoc.Web..." -ForegroundColor Cyan
    
    # This would need to be implemented as an endpoint in the web API
    Write-Host "⚠️ Web API SFDT save endpoint may not be directly exposed" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error with Collabdoc.Web API: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: List all documents from SyncfusionDocumentConverter
Write-Host "`n4. Testing document listing..." -ForegroundColor Yellow

try {
    $listResponse = Invoke-RestMethod -Uri "http://localhost:5003/api/Document/list" -Method GET
    Write-Host "✅ Document list retrieved successfully" -ForegroundColor Green
    Write-Host "Total documents found: $($listResponse.Count)" -ForegroundColor Cyan
    
    if ($listResponse.Count -gt 0) {
        Write-Host "Recent documents:" -ForegroundColor Cyan
        $listResponse | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - $($_.id): $($_.title) (Created: $($_.createdAt))" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ Error listing documents: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Document API test completed!" -ForegroundColor Green 