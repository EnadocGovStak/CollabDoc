# Comprehensive test for bracket pattern [FieldName] templates
param(
    [string]$WebUrl = "http://localhost:5000",
    [string]$ApiUrl = "http://localhost:5003"
)

Write-Host "=== Comprehensive Bracket Pattern Template Test ===" -ForegroundColor Green
Write-Host "Testing [FieldName] patterns end-to-end" -ForegroundColor Yellow

# Step 1: Create a template with bracket patterns through the web API
Write-Host "`n1. Creating template with bracket patterns..." -ForegroundColor Yellow

$sfdtContent = @'
{
  "sections": [{
    "sectionFormat": {
      "pageWidth": 612,
      "pageHeight": 792,
      "leftMargin": 72,
      "rightMargin": 72,
      "topMargin": 72,
      "bottomMargin": 72
    },
    "blocks": [
      {
        "paragraphFormat": {"styleName": "Heading 1", "textAlignment": "Center"},
        "inlines": [{"text": "Customer Information Form", "characterFormat": {"fontSize": 16, "bold": true}}]
      },
      {
        "paragraphFormat": {"styleName": "Normal"},
        "inlines": [{"text": ""}]
      },
      {
        "paragraphFormat": {"styleName": "Normal"},
        "inlines": [
          {"text": "Customer Name: "},
          {"text": "[CustomerName]", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
        ]
      },
      {
        "paragraphFormat": {"styleName": "Normal"},
        "inlines": [
          {"text": "Company: "},
          {"text": "[CompanyName]", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
        ]
      },
      {
        "paragraphFormat": {"styleName": "Normal"},
        "inlines": [
          {"text": "Email: "},
          {"text": "[Email]", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
        ]
      },
      {
        "paragraphFormat": {"styleName": "Normal"},
        "inlines": [
          {"text": "Date: "},
          {"text": "[Date]", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
        ]
      },
      {
        "paragraphFormat": {"styleName": "Normal"},
        "inlines": [
          {"text": "Reference Number: "},
          {"text": "[ReferenceNumber]", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
        ]
      }
    ]
  }],
  "characterFormat": {"fontSize": 11, "fontFamily": "Calibri"},
  "paragraphFormat": {"lineSpacing": 1.15, "lineSpacingType": "Multiple"},
  "styles": [
    {
      "name": "Normal",
      "type": "Paragraph",
      "paragraphFormat": {"listFormat": {}},
      "characterFormat": {"fontSize": 11, "fontFamily": "Calibri"},
      "next": "Normal"
    },
    {
      "name": "Heading 1",
      "type": "Paragraph",
      "basedOn": "Normal",
      "paragraphFormat": {"beforeSpacing": 12, "afterSpacing": 6, "textAlignment": "Center"},
      "characterFormat": {"fontSize": 16, "fontFamily": "Calibri", "bold": true}
    }
  ]
}
'@

$createTemplateRequest = @{
    Name = "Bracket Pattern Test Template"
    Description = "Test template with [FieldName] bracket patterns"
    Category = "Test"
    IsTemplate = $true
    Content = $sfdtContent
} | ConvertTo-Json -Depth 10

try {
    $createResponse = Invoke-RestMethod -Uri "$WebUrl/api/documents" -Method POST -Body $createTemplateRequest -ContentType "application/json"
    
    if ($createResponse -and $createResponse.id) {
        $templateId = $createResponse.id
        Write-Host "✓ Template created successfully with ID: $templateId" -ForegroundColor Green
    } else {
        Write-Host "✗ Template creation failed" -ForegroundColor Red
        Write-Host "Response: $($createResponse | ConvertTo-Json)" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "✗ Error creating template: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Verify merge fields are detected
Write-Host "`n2. Checking if bracket patterns are detected as merge fields..." -ForegroundColor Yellow

try {
    $mergeFieldsResponse = Invoke-RestMethod -Uri "$WebUrl/api/documents/$templateId/merge-fields" -Method GET -ContentType "application/json"
    
    if ($mergeFieldsResponse -and $mergeFieldsResponse.data) {
        Write-Host "✓ Found $($mergeFieldsResponse.data.Count) merge fields:" -ForegroundColor Green
        foreach ($field in $mergeFieldsResponse.data) {
            Write-Host "  - $($field.name) ($($field.displayName))" -ForegroundColor Cyan
        }
        
        # Check if bracket pattern fields are detected
        $expectedFields = @("CustomerName", "CompanyName", "Email", "Date", "ReferenceNumber")
        $foundFields = $mergeFieldsResponse.data | ForEach-Object { $_.name }
        
        $missingFields = $expectedFields | Where-Object { $_ -notin $foundFields }
        if ($missingFields.Count -eq 0) {
            Write-Host "✓ All expected bracket pattern fields detected!" -ForegroundColor Green
        } else {
            Write-Host "⚠ Missing fields: $($missingFields -join ', ')" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ No merge fields detected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error getting merge fields: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test merge functionality
Write-Host "`n3. Testing template merge with bracket pattern data..." -ForegroundColor Yellow

$mergeData = @{
    CustomerName = "Alice Johnson"
    CompanyName = "TechCorp Industries"
    Email = "alice.johnson@techcorp.com"
    Date = (Get-Date).ToString("yyyy-MM-dd")
    ReferenceNumber = "REF-2024-001"
}

$mergeRequest = @{
    templateId = $templateId
    documentName = "Bracket Pattern Test - $(Get-Date -Format 'HH:mm:ss')"
    mergeData = $mergeData
} | ConvertTo-Json -Depth 3

Write-Host "Merge data:" -ForegroundColor Gray
$mergeData | ConvertTo-Json | Write-Host -ForegroundColor Gray

try {
    $mergeResponse = Invoke-RestMethod -Uri "$WebUrl/api/documents/merge" -Method POST -Body $mergeRequest -ContentType "application/json"
    
    if ($mergeResponse -and $mergeResponse.documentId) {
        Write-Host "✓ Template merge successful!" -ForegroundColor Green
        Write-Host "  Merged document ID: $($mergeResponse.documentId)" -ForegroundColor Cyan
        Write-Host "  Document name: $($mergeResponse.documentName)" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Template merge failed" -ForegroundColor Red
        Write-Host "Response: $($mergeResponse | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error during merge: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
