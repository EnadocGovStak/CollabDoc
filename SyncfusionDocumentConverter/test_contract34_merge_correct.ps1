# Test Contract34 template with correct endpoint and guillemet merge field format

$url = "http://localhost:5003/api/templates/34/merge"
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    MergeData = @{
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
    SaveToLibrary = $false
    OutputFormat = "DOCX"
    DocumentName = "Contract34_Test"
} | ConvertTo-Json -Depth 3

Write-Host "Testing Contract34 template with guillemet format using correct endpoint..."
Write-Host "URL: $url"
Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    
    if ($response.success) {
        Write-Host "SUCCESS: Document generated successfully!" -ForegroundColor Green
        Write-Host "Document ID: $($response.data.id)" -ForegroundColor Cyan
        Write-Host "Title: $($response.data.title)" -ForegroundColor Cyan
        Write-Host "File Size: $($response.data.fileSize) bytes" -ForegroundColor Cyan
        
        # Now let's also check for merge field replacement by creating a simple test
        Write-Host ""
        Write-Host "Checking if merge fields were properly replaced..." -ForegroundColor Yellow
        
        # The response will tell us if the merge was successful
        if ($response.data.content -and $response.data.content.Length -gt 0) {
            Write-Host "Document content generated successfully" -ForegroundColor Green
            
            # Check if guillemets are still present (indicating failed merge)
            if ($response.data.content -match "«.*»") {
                Write-Host "WARNING: Guillemets still present - merge may have failed" -ForegroundColor Yellow
            } else {
                Write-Host "No remaining guillemets - merge likely successful" -ForegroundColor Green
            }
        }
        
    } else {
        Write-Host "FAILED: $($response.message)" -ForegroundColor Red
        if ($response.error) {
            Write-Host "Error: $($response.error)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
} 