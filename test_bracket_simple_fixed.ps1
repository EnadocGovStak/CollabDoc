# Comprehensive Bracket Pattern Test Script
# Tests end-to-end functionality of bracket patterns in Collabdoc

Write-Host "=== Testing Bracket Pattern Template Functionality ===" -ForegroundColor Cyan

# Test variables
$apiBaseUrl = "http://localhost:5003"
$webBaseUrl = "http://localhost:5000"

# Test merge data
$testValues = @{
    "FirstName" = "John"
    "LastName" = "Doe"
    "Company" = "Test Corp"
    "Date" = "December 15, 2023"
    "Email" = "john.doe@testcorp.com"
    "Phone" = "(555) 123-4567"
}

Write-Host "`n1. Testing API Service Connectivity..." -ForegroundColor Yellow
try {
    $apiHealth = Invoke-RestMethod -Uri "$apiBaseUrl/api/templates" -Method Get -TimeoutSec 10
    Write-Host "✓ API service is responding" -ForegroundColor Green
    Write-Host "  Found $($apiHealth.Count) templates" -ForegroundColor Gray
} catch {
    Write-Host "✗ API service not responding: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Creating Bracket Pattern Template..." -ForegroundColor Yellow
$bracketTemplate = @{
    name = "Bracket Pattern Test"
    content = @"
{
  "sections": [
    {
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
          "paragraphFormat": {
            "styleName": "Normal"
          },
          "characterFormat": {},
          "inlines": [
            {
              "characterFormat": {
                "fontSize": 12,
                "fontFamily": "Calibri"
              },
              "text": "Dear [FirstName] [LastName],\n\nThank you for your interest in [Company]. We are pleased to confirm your contact details:\n\nEmail: [Email]\nPhone: [Phone]\n\nDate: [Date]\n\nBest regards,\nCollabdoc Team"
            }
          ]
        }
      ]
    }
  ]
}
"@
    description = "Test template with bracket merge fields"
}

try {
    $createResponse = Invoke-RestMethod -Uri "$apiBaseUrl/api/templates" -Method Post -Body ($bracketTemplate | ConvertTo-Json -Depth 10) -ContentType "application/json"
    Write-Host "✓ Template created successfully with ID: $($createResponse.id)" -ForegroundColor Green
    $templateId = $createResponse.id
} catch {
    Write-Host "✗ Failed to create template: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Extracting Merge Fields..." -ForegroundColor Yellow
try {
    $mergeFields = Invoke-RestMethod -Uri "$apiBaseUrl/api/templates/$templateId/merge-fields" -Method Get
    Write-Host "✓ Found $($mergeFields.Count) merge fields:" -ForegroundColor Green
    foreach ($field in $mergeFields) {
        Write-Host "  - $field" -ForegroundColor Gray
    }
    
    # Verify we found the expected bracket fields
    $expectedFields = @("FirstName", "LastName", "Company", "Date", "Email", "Phone")
    $foundFields = $mergeFields
    $missingFields = $expectedFields | Where-Object { $_ -notin $foundFields }
    
    if ($missingFields.Count -eq 0) {
        Write-Host "✓ All expected bracket fields detected correctly" -ForegroundColor Green
    } else {
        Write-Host "⚠ Missing fields: $($missingFields -join ', ')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to extract merge fields: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Performing Document Merge..." -ForegroundColor Yellow
try {
    $mergeRequest = @{
        mergeData = $testValues
    }
    
    $mergedDoc = Invoke-RestMethod -Uri "$apiBaseUrl/api/templates/$templateId/merge" -Method Post -Body ($mergeRequest | ConvertTo-Json -Depth 10) -ContentType "application/json"
    Write-Host "✓ Document merge completed successfully" -ForegroundColor Green
    
    # Check if merge was successful by looking for test values in content
    if ($mergedDoc.content) {
        $contentStr = $mergedDoc.content
        $replacedCount = 0
        $remainingBrackets = @()
        
        foreach ($key in $testValues.Keys) {
            $value = $testValues[$key]
            if ($contentStr -like "*$value*") {
                $replacedCount++
                Write-Host "  ✓ Found replaced value: $value" -ForegroundColor Gray
            }
            
            # Check if bracket pattern still exists
            if ($contentStr -like "*[$key]*") {
                $remainingBrackets += "[$key]"
            }
        }
        
        if ($replacedCount -eq $testValues.Count -and $remainingBrackets.Count -eq 0) {
            Write-Host "✓ All bracket patterns were successfully replaced" -ForegroundColor Green
        } else {
            Write-Host "⚠ Some bracket patterns may not have been replaced" -ForegroundColor Yellow
            if ($remainingBrackets.Count -gt 0) {
                Write-Host "  Remaining brackets: $($remainingBrackets -join ', ')" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "✗ Document merge failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. Testing SFDT Validation..." -ForegroundColor Yellow
if ($mergedDoc -and $mergedDoc.content) {
    try {
        $sfdtContent = $mergedDoc.content | ConvertFrom-Json
        Write-Host "✓ Merged document has valid SFDT structure" -ForegroundColor Green
        
        if ($sfdtContent.sections -and $sfdtContent.sections.Count -gt 0) {
            Write-Host "✓ Document has valid sections structure" -ForegroundColor Green
        } else {
            Write-Host "⚠ Document missing sections structure" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Document content may not be valid SFDT: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n6. Cleanup - Deleting Test Template..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$apiBaseUrl/api/templates/$templateId" -Method Delete
    Write-Host "✓ Test template deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not delete test template: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Bracket Pattern Test Complete ===" -ForegroundColor Cyan
Write-Host "All bracket pattern functionality has been tested!" -ForegroundColor Green
