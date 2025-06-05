# Template Merge Test
Write-Host "Starting Template Merge Test..." -ForegroundColor Green

$apiBase = "http://localhost:5003"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

$headers = @{
    "Content-Type" = "application/json"
}

# Step 1: Get templates
Write-Host "Step 1: Getting templates..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiBase/api/Templates" -Method GET
    
    if ($response -and $response.success -and $response.data -and $response.data.Count -gt 0) {
        Write-Host "Found $($response.data.Count) templates" -ForegroundColor Green
        $template = $response.data[0]
        $templateId = $template.id
        $templateName = $template.name
        Write-Host "Selected template: $templateName (ID: $templateId)" -ForegroundColor Cyan
    } else {
        Write-Host "No templates found in response!" -ForegroundColor Red
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "Error getting templates: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create merge data
Write-Host "Step 2: Creating merge data..." -ForegroundColor Yellow

$mergeData = @{
    "FirstName" = "John"
    "LastName" = "Smith"
    "FullName" = "John Smith"
    "Name" = "John Smith"
    "Title" = "Senior Manager"
    "Company" = "Acme Corporation"
    "Email" = "john.smith@acme.com"
    "Phone" = "555-123-4567"
    "Address" = "123 Main Street"
    "City" = "Anytown"
    "State" = "CA"
    "ZipCode" = "90210"
    "NotaryPublic" = "Jane Doe"
    "Date" = (Get-Date).ToString("MMMM dd, yyyy")
    "Amount" = "25000.00"
}

Write-Host "Created merge data with $($mergeData.Count) fields" -ForegroundColor Green

# Step 3: Perform merge
Write-Host "Step 3: Performing merge..." -ForegroundColor Yellow

$docName = "MergedDoc_$timestamp"

$mergeRequest = @{
    MergeData = $mergeData
    SaveToLibrary = $true
    OutputFormat = "SFDT"
    DocumentName = $docName
    CreatedBy = "TestUser"
}

$requestJson = $mergeRequest | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$apiBase/api/Templates/$templateId/merge" -Method POST -Body $requestJson -Headers $headers
      if ($response -and $response.success) {
        Write-Host "Merge successful!" -ForegroundColor Green
        Write-Host "Document: $($response.data.title)" -ForegroundColor Cyan
        Write-Host "Document ID: $($response.data.id)" -ForegroundColor Cyan
        Write-Host "Size: $($response.data.fileSize) bytes" -ForegroundColor Cyan
        
        $docId = $response.data.id
        
        # Step 4: Verify document
        Write-Host "Step 4: Verifying document..." -ForegroundColor Yellow
        
        $verify = Invoke-RestMethod -Uri "$apiBase/api/document/$docId" -Method GET
        
        if ($verify -and $verify.data) {
            Write-Host "Document verified!" -ForegroundColor Green
            Write-Host "Title: $($verify.data.title)" -ForegroundColor Cyan
            
            # Check for merged content
            $content = $verify.data.content
            $foundJohn = $content -like "*John*"
            $foundAcme = $content -like "*Acme*"
            
            if ($foundJohn -or $foundAcme) {
                Write-Host "SUCCESS: Merged data found!" -ForegroundColor Green
                if ($foundJohn) { Write-Host "  Found: John" -ForegroundColor White }
                if ($foundAcme) { Write-Host "  Found: Acme" -ForegroundColor White }
            } else {
                Write-Host "WARNING: No merged data found" -ForegroundColor Yellow
            }
        }
        
    } else {
        Write-Host "Merge failed!" -ForegroundColor Red
        if ($response.error) {
            Write-Host "Error: $($response.error)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "Request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test complete!" -ForegroundColor Green
Write-Host "Document name: $docName" -ForegroundColor Cyan
Write-Host "Web app: http://localhost:5000" -ForegroundColor Cyan 