# Test script to verify bracket pattern template merging works end-to-end
Write-Host "Testing Bracket Pattern Template Merging - Complete Workflow" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Test parameters
$apiUrl = "http://localhost:5003"
$webUrl = "http://localhost:5000"

# Step 1: Test API Health
Write-Host "`n1. Testing API Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$apiUrl/health" -Method Get -TimeoutSec 10
    Write-Host "✓ API is healthy: $($healthResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "✗ API health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create a template with bracket patterns
Write-Host "`n2. Creating template with bracket patterns..." -ForegroundColor Yellow
$templateContent = @"
{
  "sections": [
    {
      "blocks": [
        {
          "paragraphs": [
            {
              "inlines": [
                {
                  "text": "Dear [FirstName] [LastName],\n\nThank you for your interest in [Company]. We are pleased to inform you that your application for the position of [Position] has been received.\n\nYour contact information:\nEmail: [Email]\nPhone: [Phone]\nDate: [Date]\n\nBest regards,\nHR Department"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
"@

$createTemplateRequest = @{
    Name = "Bracket Pattern Test Template"
    Description = "Template with bracket merge fields for testing"
    Content = $templateContent
} | ConvertTo-Json -Depth 10

try {
    $templateResponse = Invoke-RestMethod -Uri "$apiUrl/api/templates" -Method Post -Body $createTemplateRequest -ContentType "application/json" -TimeoutSec 30
    $templateId = $templateResponse.data.id
    Write-Host "✓ Template created successfully with ID: $templateId" -ForegroundColor Green
} catch {
    Write-Host "✗ Template creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseBody)
        $responseText = $reader.ReadToEnd()
        Write-Host "Response: $responseText" -ForegroundColor Red
    }
    exit 1
}

# Step 3: Extract merge fields from the template
Write-Host "`n3. Extracting merge fields from template..." -ForegroundColor Yellow
try {
    $mergeFieldsResponse = Invoke-RestMethod -Uri "$apiUrl/api/templates/$templateId/merge-fields" -Method Get -TimeoutSec 30
    $mergeFields = $mergeFieldsResponse.data
    Write-Host "✓ Extracted merge fields: $($mergeFields -join ', ')" -ForegroundColor Green
    
    # Verify we found bracket patterns
    $expectedFields = @('FirstName', 'LastName', 'Company', 'Position', 'Email', 'Phone', 'Date')
    $foundAll = $true
    foreach ($field in $expectedFields) {
        if ($mergeFields -notcontains $field) {
            Write-Host "✗ Missing expected field: $field" -ForegroundColor Red
            $foundAll = $false
        }
    }
    if ($foundAll) {
        Write-Host "✓ All expected bracket pattern fields found" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Merge field extraction failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Create a record with test data
Write-Host "`n4. Creating test record..." -ForegroundColor Yellow
$recordData = @{
    FirstName = "John"
    LastName = "Doe"
    Company = "Acme Corporation"
    Position = "Software Developer"
    Email = "john.doe@acme.com"
    Phone = "(555) 123-4567"
    Date = "June 4, 2025"
} | ConvertTo-Json

try {
    $recordResponse = Invoke-RestMethod -Uri "$apiUrl/api/records" -Method Post -Body $recordData -ContentType "application/json" -TimeoutSec 30
    $recordId = $recordResponse.data.id
    Write-Host "✓ Test record created with ID: $recordId" -ForegroundColor Green
} catch {
    Write-Host "✗ Record creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Perform template merge
Write-Host "`n5. Performing template merge..." -ForegroundColor Yellow
$mergeRequest = @{
    TemplateId = $templateId
    RecordId = $recordId
} | ConvertTo-Json

try {
    $mergeResponse = Invoke-RestMethod -Uri "$apiUrl/api/templates/merge" -Method Post -Body $mergeRequest -ContentType "application/json" -TimeoutSec 30
    Write-Host "✓ Template merge completed successfully" -ForegroundColor Green
    
    # Check if the response contains merged content
    if ($mergeResponse.data -and $mergeResponse.data.Length -gt 0) {
        $mergedContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($mergeResponse.data))
        Write-Host "✓ Merged document size: $($mergedContent.Length) characters" -ForegroundColor Green
        
        # Verify field replacements
        $replacements = @{
            '[FirstName]' = 'John'
            '[LastName]' = 'Doe'
            '[Company]' = 'Acme Corporation'
            '[Position]' = 'Software Developer'
            '[Email]' = 'john.doe@acme.com'
            '[Phone]' = '(555) 123-4567'
            '[Date]' = 'June 4, 2025'
        }
        
        $allReplaced = $true
        foreach ($pattern in $replacements.Keys) {
            if ($mergedContent -like "*$pattern*") {
                Write-Host "✗ Bracket pattern '$pattern' still found in merged content" -ForegroundColor Red
                $allReplaced = $false
            } else {
                Write-Host "✓ Pattern '$pattern' successfully replaced with '$($replacements[$pattern])'" -ForegroundColor Green
            }
        }
        
        if ($allReplaced) {
            Write-Host "✓ All bracket patterns successfully replaced" -ForegroundColor Green
        } else {
            Write-Host "✗ Some bracket patterns were not replaced" -ForegroundColor Red
        }
        
        # Save merged content for inspection
        $mergedContent | Out-File -FilePath "merged_bracket_test.json" -Encoding UTF8
        Write-Host "✓ Merged content saved to merged_bracket_test.json" -ForegroundColor Green
        
    } else {
        Write-Host "✗ Merge response is empty or invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Template merge failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseBody)
        $responseText = $reader.ReadToEnd()
        Write-Host "Response: $responseText" -ForegroundColor Red
    }
    exit 1
}

# Step 6: Test web application template access
Write-Host "`n6. Testing web application template access..." -ForegroundColor Yellow
try {
    # Test if we can access templates through web app (this will test the DI registration)
    $webResponse = Invoke-RestMethod -Uri "$webUrl/api/templates" -Method Get -TimeoutSec 30
    Write-Host "✓ Web application can access templates: $($webResponse.Count) templates found" -ForegroundColor Green
} catch {
    Write-Host "⚠ Web application template access test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This might indicate a dependency injection issue in the web app" -ForegroundColor Yellow
}

# Cleanup
Write-Host "`n7. Cleaning up test data..." -ForegroundColor Yellow
try {
    # Delete test record
    Invoke-RestMethod -Uri "$apiUrl/api/records/$recordId" -Method Delete -TimeoutSec 30
    Write-Host "✓ Test record deleted" -ForegroundColor Green
    
    # Delete test template
    Invoke-RestMethod -Uri "$apiUrl/api/templates/$templateId" -Method Delete -TimeoutSec 30
    Write-Host "✓ Test template deleted" -ForegroundColor Green
} catch {
    Write-Host "⚠ Cleanup failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=============================================================" -ForegroundColor Cyan
Write-Host "Bracket Pattern Template Merging Test Complete" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
