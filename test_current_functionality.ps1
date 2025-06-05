# Test bracket pattern functionality step by step
Write-Host "Testing Bracket Pattern Support" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

$apiUrl = "http://localhost:5003"

# Test 1: Check existing template merge field extraction  
Write-Host "`n1. Testing existing template merge field extraction..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/templates/1/merge-fields" -Method Get -TimeoutSec 30
    Write-Host "✓ Business Letter Template fields: $($response.data -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get merge fields: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create simple test record
Write-Host "`n2. Creating test record..." -ForegroundColor Yellow
$recordData = @{
    FirstName = "TestFirst"
    LastName = "TestLast"  
    Company = "TestCompany"
    Title = "TestTitle"
    Phone = "555-1234"
    Email = "test@test.com"
    Date = "2025-06-04"
    NotaryPublic = "TestNotary"
} | ConvertTo-Json

try {
    $recordResponse = Invoke-RestMethod -Uri "$apiUrl/api/records" -Method Post -Body $recordData -ContentType "application/json" -TimeoutSec 30
    $recordId = $recordResponse.data.id
    Write-Host "✓ Test record created with ID: $recordId" -ForegroundColor Green

    # Test 3: Perform merge with existing template
    Write-Host "`n3. Testing merge with Business Letter Template..." -ForegroundColor Yellow
    $mergeRequest = @{
        TemplateId = 1
        RecordId = $recordId
    } | ConvertTo-Json

    $mergeResponse = Invoke-RestMethod -Uri "$apiUrl/api/templates/merge" -Method Post -Body $mergeRequest -ContentType "application/json" -TimeoutSec 30
    
    if ($mergeResponse.data -and $mergeResponse.data.Length -gt 0) {
        Write-Host "✓ Merge completed successfully" -ForegroundColor Green
        $mergedContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($mergeResponse.data))
        
        # Check if merge worked correctly
        if ($mergedContent -like "*TestFirst*" -and $mergedContent -like "*TestLast*" -and $mergedContent -like "*TestCompany*") {
            Write-Host "✓ Merge field replacement verified" -ForegroundColor Green
        } else {
            Write-Host "⚠ Merge field replacement may not have worked correctly" -ForegroundColor Yellow
        }
        
        # Save merged content
        $mergedContent | Out-File -FilePath "test_merge_result.json" -Encoding UTF8
        Write-Host "✓ Merged content saved to test_merge_result.json" -ForegroundColor Green
    } else {
        Write-Host "✗ No merged content received" -ForegroundColor Red
    }

    # Cleanup
    Write-Host "`n4. Cleaning up..." -ForegroundColor Yellow
    Invoke-RestMethod -Uri "$apiUrl/api/records/$recordId" -Method Delete -TimeoutSec 30 | Out-Null
    Write-Host "✓ Test record cleaned up" -ForegroundColor Green

} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n===============================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
