# Test Business Letter template with double angle brackets format

$url = "http://localhost:5003/api/templates/1/merge"
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    MergeData = @{
        Date = "December 9, 2024"
        FirstName = "John"
        LastName = "Doe"
        Company = "ACME Corp"
        Title = "Manager"
        Phone = "555-1234"
        Email = "john@acme.com"
        NotaryPublic = "Jane Smith"
    }
    SaveToLibrary = $false
    OutputFormat = "DOCX"
    DocumentName = "BusinessLetter_Test"
} | ConvertTo-Json -Depth 3

Write-Host "Testing Business Letter template with double angle brackets..."

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    
    if ($response.success) {
        Write-Host "SUCCESS: Business Letter generated" -ForegroundColor Green
        Write-Host "File Size: $($response.data.fileSize) bytes" -ForegroundColor Cyan
    } else {
        Write-Host "FAILED: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
} 