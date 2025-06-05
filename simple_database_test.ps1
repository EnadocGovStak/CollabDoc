# Simple Database Template Test
Write-Host "Testing Database Templates..." -ForegroundColor Green

$webApiBase = "http://localhost:5000"

# Test basic API endpoints
Write-Host "Checking API endpoints..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$webApiBase/api/documents" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: Found /api/documents endpoint" -ForegroundColor Green
    
    if ($response -is [array]) {
        Write-Host "Returned $($response.Count) documents" -ForegroundColor Cyan
        
        # Show all documents with template info
        foreach ($doc in $response) {
            if ($doc.Name -match "contract" -or $doc.Name -match "Contract") {
                Write-Host "FOUND CONTRACT: $($doc.Name) (ID: $($doc.Id), IsTemplate: $($doc.IsTemplate))" -ForegroundColor Magenta
            } else {
                Write-Host "Document: $($doc.Name) (ID: $($doc.Id), IsTemplate: $($doc.IsTemplate))" -ForegroundColor White
            }
        }
    }
} catch {
    Write-Host "FAILED: /api/documents - $($_.Exception.Message)" -ForegroundColor Red
}

# Test templates endpoint
try {
    $response = Invoke-RestMethod -Uri "$webApiBase/api/templates" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: Found /api/templates endpoint" -ForegroundColor Green
    Write-Host "Templates: $($response.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "No /api/templates endpoint" -ForegroundColor Yellow
}

Write-Host "Test complete!" -ForegroundColor Green 