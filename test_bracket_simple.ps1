# Simple test for bracket pattern support
Write-Host "=== Testing Bracket Pattern Support ===" -ForegroundColor Green

# Test the Business Letter Template (ID 1) with bracket pattern data
$templateId = 1
$mergeData = @{
    Date = "2024-06-04"
    FirstName = "John"
    LastName = "Doe"
    Company = "TechCorp"
    Title = "Software Engineer"
    Phone = "555-0123"
    Email = "john.doe@techcorp.com"
    NotaryPublic = "Jane Smith"
} | ConvertTo-Json

Write-Host "Testing merge with Business Letter Template..." -ForegroundColor Yellow
Write-Host "Template ID: $templateId" -ForegroundColor Cyan
Write-Host "Merge data: $mergeData" -ForegroundColor Gray

$mergeRequest = @{
    templateId = $templateId
    mergeData = ($mergeData | ConvertFrom-Json)
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5003/api/templates/$templateId/merge" -Method POST -Body $mergeRequest -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "SUCCESS: Merge completed!" -ForegroundColor Green
        Write-Host "Merged document size: $($response.data.Length) chars" -ForegroundColor Cyan
        
        # Check if values were replaced in the content
        $content = $response.data
        $testValues = @("John", "Doe", "TechCorp", "Software Engineer", "2024-06-04")
        
        Write-Host "`nChecking for replaced values..." -ForegroundColor Yellow
        foreach ($value in $testValues) {
            if ($content -like "*$value*") {
                Write-Host "  ✓ Found: $value" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Missing: $value" -ForegroundColor Red
            }
        }
        
        # Check if any merge field patterns remain unreplaced
        $patterns = @("<<", ">>", "«", "»", "[", "]")
        $hasUnreplacedFields = $false
        
        foreach ($pattern in $patterns) {
            if ($content -like "*$pattern*") {
                $hasUnreplacedFields = $true
                break
            }
        }
        
        if ($hasUnreplacedFields) {
            Write-Host "  ⚠ Some merge field patterns may still be present" -ForegroundColor Yellow
        } else {
            Write-Host "  ✓ All merge field patterns appear to be processed" -ForegroundColor Green
        }
        
    } else {
        Write-Host "FAILED: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
