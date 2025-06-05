# Simple test for bracket pattern merge functionality
$apiUrl = "http://localhost:5003"

Write-Host "Testing Bracket Pattern Merge Functionality" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Test data
$testMergeFields = @{
    "FirstName" = "Alice"
    "LastName" = "Johnson"
    "Company" = "Tech Solutions Inc"
    "Position" = "Senior Developer"
    "Email" = "alice@techsolutions.com"
    "Phone" = "(555) 987-6543"
    "Date" = "June 4, 2025"
}

# Test SFDT content with bracket patterns
$testSfdtContent = @"
{
  "sections": [
    {
      "blocks": [
        {
          "paragraphFormat": {"styleName": "Normal"},
          "characterFormat": {},
          "inlines": [
            {"characterFormat": {}, "text": "Dear [FirstName] [LastName],"},
            {"characterFormat": {}, "text": "\n\nWelcome to [Company]! Your position as [Position] starts soon."},
            {"characterFormat": {}, "text": "\n\nContact: [Email] or [Phone]"},
            {"characterFormat": {}, "text": "\n\nDate: [Date]"}
          ]
        }
      ]
    }
  ]
}
"@

Write-Host "`n1. Creating template with bracket patterns..." -ForegroundColor Yellow

$createRequest = @{
    Name = "Simple Bracket Test"
    Description = "Test template with bracket merge fields"
    Content = $testSfdtContent
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/templates" -Method Post -Body $createRequest -ContentType "application/json" -TimeoutSec 30
    $templateId = $response.data.id
    Write-Host "✓ Template created with ID: $templateId" -ForegroundColor Green
    
    # Test merge field extraction
    Write-Host "`n2. Testing merge field extraction..." -ForegroundColor Yellow
    $fieldsResponse = Invoke-RestMethod -Uri "$apiUrl/api/templates/$templateId/merge-fields" -Method Get -TimeoutSec 30
    $extractedFields = $fieldsResponse.data
    Write-Host "✓ Extracted fields: $($extractedFields -join ', ')" -ForegroundColor Green
    
    # Verify all expected fields found
    $expectedFields = @('FirstName', 'LastName', 'Company', 'Position', 'Email', 'Phone', 'Date')
    $missingFields = $expectedFields | Where-Object { $extractedFields -notcontains $_ }
    if ($missingFields.Count -eq 0) {
        Write-Host "✓ All bracket pattern fields correctly extracted" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing fields: $($missingFields -join ', ')" -ForegroundColor Red
    }
    
    # Create record for merge
    Write-Host "`n3. Creating test record..." -ForegroundColor Yellow
    $recordRequest = $testMergeFields | ConvertTo-Json
    $recordResponse = Invoke-RestMethod -Uri "$apiUrl/api/records" -Method Post -Body $recordRequest -ContentType "application/json" -TimeoutSec 30
    $recordId = $recordResponse.data.id
    Write-Host "✓ Record created with ID: $recordId" -ForegroundColor Green
    
    # Perform merge
    Write-Host "`n4. Performing template merge..." -ForegroundColor Yellow
    $mergeRequest = @{
        TemplateId = $templateId
        RecordId = $recordId
    } | ConvertTo-Json
    
    $mergeResponse = Invoke-RestMethod -Uri "$apiUrl/api/templates/merge" -Method Post -Body $mergeRequest -ContentType "application/json" -TimeoutSec 30
    Write-Host "✓ Merge completed successfully" -ForegroundColor Green
    
    # Verify merge results
    if ($mergeResponse.data -and $mergeResponse.data.Length -gt 0) {
        $mergedContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($mergeResponse.data))
        Write-Host "✓ Merged content received ($($mergedContent.Length) chars)" -ForegroundColor Green
        
        # Check if bracket patterns were replaced
        $patterns = @('[FirstName]', '[LastName]', '[Company]', '[Position]', '[Email]', '[Phone]', '[Date]')
        $unreplacedPatterns = @()
        
        foreach ($pattern in $patterns) {
            if ($mergedContent -like "*$pattern*") {
                $unreplacedPatterns += $pattern
            }
        }
        
        if ($unreplacedPatterns.Count -eq 0) {
            Write-Host "✓ All bracket patterns successfully replaced" -ForegroundColor Green
            
            # Verify actual values were inserted
            $testValues = @('Alice', 'Johnson', 'Tech Solutions Inc', 'Senior Developer', 'alice@techsolutions.com', '(555) 987-6543', 'June 4, 2025')
            $foundValues = 0
            foreach ($value in $testValues) {
                if ($mergedContent -like "*$value*") {
                    $foundValues++
                }
            }
            Write-Host "✓ Found $foundValues/$($testValues.Count) expected values in merged content" -ForegroundColor Green
            
        } else {
            Write-Host "✗ Unreplaced patterns: $($unreplacedPatterns -join ', ')" -ForegroundColor Red
        }
        
        # Save merged content for inspection
        $mergedContent | Out-File -FilePath "simple_bracket_merge_result.json" -Encoding UTF8
        Write-Host "✓ Merged content saved to simple_bracket_merge_result.json" -ForegroundColor Green
    } else {
        Write-Host "✗ No merged content received" -ForegroundColor Red
    }
    
    # Cleanup
    Write-Host "`n5. Cleaning up..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$apiUrl/api/records/$recordId" -Method Delete -TimeoutSec 30 | Out-Null
        Invoke-RestMethod -Uri "$apiUrl/api/templates/$templateId" -Method Delete -TimeoutSec 30 | Out-Null
        Write-Host "✓ Test data cleaned up" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Cleanup warning: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "Bracket Pattern Test Complete" -ForegroundColor Cyan
