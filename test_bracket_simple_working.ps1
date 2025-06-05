# Simple bracket pattern test
param(
    [string]$WebUrl = "http://localhost:5000",
    [string]$ApiUrl = "http://localhost:5003"
)

Write-Host "=== Simple Bracket Pattern Test ===" -ForegroundColor Green

# Test 1: Check if services are running
Write-Host "`n1. Testing service availability..." -ForegroundColor Yellow

try {
    $webTest = Invoke-RestMethod -Uri "$WebUrl/api/documents" -Method GET -TimeoutSec 5
    Write-Host "✓ Web service is responding" -ForegroundColor Green
} catch {
    Write-Host "✗ Web service not available: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    $apiTest = Invoke-RestMethod -Uri "$ApiUrl/api/documents" -Method GET -TimeoutSec 5
    Write-Host "✓ API service is responding" -ForegroundColor Green
} catch {
    Write-Host "✗ API service not available: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check existing templates for bracket patterns
Write-Host "`n2. Checking existing templates for various patterns..." -ForegroundColor Yellow

try {
    $templates = Invoke-RestMethod -Uri "$ApiUrl/api/documents" -Method GET
    
    if ($templates) {
        Write-Host "Found $($templates.Count) templates:" -ForegroundColor Cyan
        
        foreach ($template in $templates) {
            Write-Host "  Template: $($template.name)" -ForegroundColor White
            
            # Get merge fields for this template
            try {
                $mergeFields = Invoke-RestMethod -Uri "$ApiUrl/api/documents/$($template.id)/merge-fields" -Method GET
                
                if ($mergeFields -and $mergeFields.Count -gt 0) {
                    Write-Host "    Merge fields: $($mergeFields -join ', ')" -ForegroundColor Green
                } else {
                    Write-Host "    No merge fields detected" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "    Error getting merge fields: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "No templates found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error getting templates: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create a simple bracket pattern template
Write-Host "`n3. Creating a simple bracket pattern template..." -ForegroundColor Yellow

$simpleSfdt = @'
{
  "sections": [{
    "blocks": [
      {
        "paragraphFormat": {"styleName": "Normal"},
        "inlines": [
          {"text": "Hello "},
          {"text": "[Name]", "characterFormat": {"bold": true}},
          {"text": ", welcome to "},
          {"text": "[Company]", "characterFormat": {"bold": true}},
          {"text": "!"}
        ]
      }
    ]
  }]
}
'@

$templateRequest = @{
    Name = "Simple Bracket Test"
    Description = "Simple test with [Name] and [Company] fields"
    Category = "Test"
    Content = $simpleSfdt
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$WebUrl/api/documents" -Method POST -Body $templateRequest -ContentType "application/json"
    
    if ($response -and $response.id) {
        Write-Host "✓ Simple template created with ID: $($response.id)" -ForegroundColor Green
        
        # Test merge field detection
        $mergeFields = Invoke-RestMethod -Uri "$WebUrl/api/documents/$($response.id)/merge-fields" -Method GET
        
        if ($mergeFields -and $mergeFields.data) {
            Write-Host "✓ Detected fields: $($mergeFields.data | ForEach-Object { $_.name } | Join-String -Separator ', ')" -ForegroundColor Green
        } else {
            Write-Host "⚠ No merge fields detected" -ForegroundColor Yellow
        }
        
        # Test merge operation
        $mergeData = @{
            Name = "John Doe"
            Company = "ACME Corp"
        }
          $mergeRequest = @{
            templateId = $response.id
            documentName = "Simple Bracket Test Result"
            mergeData = $mergeData
        } | ConvertTo-Json -Depth 3
        
        try {
            $mergeResult = Invoke-RestMethod -Uri "$WebUrl/api/documents/merge" -Method POST -Body $mergeRequest -ContentType "application/json"
        
        if ($mergeResult -and $mergeResult.documentId) {
            Write-Host "✓ Merge successful! Document ID: $($mergeResult.documentId)" -ForegroundColor Green
            
            # Check if values were replaced
            $mergedDoc = Invoke-RestMethod -Uri "$WebUrl/api/documents/$($mergeResult.documentId)" -Method GET
            
            if ($mergedDoc.content -like "*John Doe*" -and $mergedDoc.content -like "*ACME Corp*") {
                Write-Host "✓ Bracket patterns successfully replaced with values!" -ForegroundColor Green            } else {
                Write-Host "⚠ Values may not have been replaced correctly" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "✗ Merge operation failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Template creation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error in template creation/merge: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Simple Test Complete ===" -ForegroundColor Green
