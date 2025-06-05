# Test Contract34 template with guillemet merge field format

$url = "http://localhost:5003/api/documents/generate"
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    templateId = 34
    data = @{
        ContractDate = "December 9, 2024"
        PartyA_Name = "ACME Corporation"
        PartyA_Address = "123 Business Street, City, State 12345"
        PartyB_Name = "Professional Services LLC"
        PartyB_Address = "456 Service Avenue, Town, State 67890"
        ServiceDescription = "Web development and consulting services"
        ContractValue = "`$50,000.00"
        PaymentTerms = "Net 30 days"
        StartDate = "January 1, 2025"
        EndDate = "December 31, 2025"
        SignatureDate = "December 9, 2024"
    }
    format = "docx"
} | ConvertTo-Json -Depth 3

Write-Host "Testing Contract34 template with guillemet format..."
Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    
    if ($response.success) {
        Write-Host "✅ SUCCESS: Document generated successfully!" -ForegroundColor Green
        Write-Host "Filename: $($response.data.filename)" -ForegroundColor Cyan
        Write-Host "Path: $($response.data.path)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ FAILED: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
} 