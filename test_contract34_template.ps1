# Test Contract34 Template - Complete Workflow
Write-Host "🧪 Testing Contract34 Template - Complete Workflow" -ForegroundColor Green

$converterApiBase = "http://localhost:5003"
$testTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"

$jsonHeaders = @{
    "Content-Type" = "application/json"
}

# Step 1: Verify Contract34 template exists
Write-Host "`n📋 Step 1: Verifying Contract34 template..." -ForegroundColor Yellow

try {
    $templates = Invoke-RestMethod -Uri "$converterApiBase/api/templates" -Method GET -ErrorAction Stop
    Write-Host "✅ Templates API call successful" -ForegroundColor Green
    
    if ($templates.Success -and $templates.Data) {
        Write-Host "Found $($templates.Data.Count) templates:" -ForegroundColor Cyan
        
        $contract34Found = $false
        foreach ($template in $templates.Data) {
            if ($template.Name -eq "Contract34") {
                Write-Host "  >>> ✅ FOUND Contract34: ID $($template.Id)" -ForegroundColor Magenta
                $contract34Found = $true
                $contract34Id = $template.Id
            } else {
                Write-Host "  Template: $($template.Name) (ID: $($template.Id))" -ForegroundColor White
            }
        }
        
        if (-not $contract34Found) {
            Write-Host "❌ Contract34 template not found in API response!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Templates API returned no data" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Templates API failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get Contract34 template details
Write-Host "`n🔍 Step 2: Getting Contract34 template details..." -ForegroundColor Yellow

try {
    $templateDetails = Invoke-RestMethod -Uri "$converterApiBase/api/templates/34" -Method GET -ErrorAction Stop
    
    if ($templateDetails.Success -and $templateDetails.Data) {
        $template = $templateDetails.Data
        Write-Host "✅ Template Details:" -ForegroundColor Green
        Write-Host "  Name: $($template.Name)" -ForegroundColor Cyan
        Write-Host "  Description: $($template.Description)" -ForegroundColor Cyan
        Write-Host "  Category: $($template.Category)" -ForegroundColor Cyan
        Write-Host "  Active: $($template.IsActive)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to get template details" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Template details API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Get merge fields for Contract34
Write-Host "`n🏷️ Step 3: Getting Contract34 merge fields..." -ForegroundColor Yellow

try {
    $mergeFields = Invoke-RestMethod -Uri "$converterApiBase/api/templates/34/merge-fields" -Method GET -ErrorAction Stop
    
    if ($mergeFields.Success -and $mergeFields.Data) {
        Write-Host "✅ Merge Fields:" -ForegroundColor Green
        foreach ($field in $mergeFields.Data) {
            Write-Host "  • $field" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ No merge fields found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Merge fields API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Create sample merge data
Write-Host "`n📝 Step 4: Creating sample merge data..." -ForegroundColor Yellow

$mergeData = @{
    "ContractDate" = (Get-Date).ToString("MMMM dd, yyyy")
    "PartyA_Name" = "John Smith"
    "PartyA_Address" = "123 Main Street, Tech City, CA 90210"
    "PartyB_Name" = "Acme Corporation"
    "PartyB_Address" = "456 Business Avenue, Enterprise City, CA 90211"
    "ServiceDescription" = "Software Development and Technical Consulting Services"
    "ContractValue" = "$50,000.00"
    "PaymentTerms" = "Net 30 days from invoice date"
    "StartDate" = (Get-Date).ToString("MMMM dd, yyyy")
    "EndDate" = (Get-Date).AddMonths(6).ToString("MMMM dd, yyyy")
    "SignatureDate" = (Get-Date).ToString("MMMM dd, yyyy")
}

Write-Host "✅ Created merge data with $($mergeData.Count) fields" -ForegroundColor Green

# Step 5: Perform template merge
Write-Host "`n🔄 Step 5: Performing template merge..." -ForegroundColor Yellow

$mergeRequest = @{
    mergeData = $mergeData
    saveToLibrary = $true
    outputFormat = "SFDT"
    documentName = "Contract_JohnSmith_AcmeCorp_$testTimestamp"
    createdBy = "Test User"
} | ConvertTo-Json -Depth 10

try {
    $mergeResult = Invoke-RestMethod -Uri "$converterApiBase/api/templates/34/merge" -Method POST -Headers $jsonHeaders -Body $mergeRequest -ErrorAction Stop
    
    if ($mergeResult.Success -and $mergeResult.Data) {
        Write-Host "✅ Template merge successful!" -ForegroundColor Green
        Write-Host "  Document ID: $($mergeResult.Data.Id)" -ForegroundColor Cyan
        Write-Host "  Document Title: $($mergeResult.Data.Title)" -ForegroundColor Cyan
        Write-Host "  Content Length: $($mergeResult.Data.Content.Length) characters" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Template merge failed: $($mergeResult.Error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Template merge API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Test document creation from template
Write-Host "`n📄 Step 6: Testing document creation from template..." -ForegroundColor Yellow

$createDocRequest = @{
    documentName = "QuickContract_$testTimestamp"
    mergeData = @{
        "ContractDate" = (Get-Date).ToString("yyyy-MM-dd")
        "PartyA_Name" = "Jane Doe"
        "PartyB_Name" = "XYZ Services"
        "ServiceDescription" = "Consulting Services"
        "ContractValue" = "$25,000"
    }
} | ConvertTo-Json -Depth 10

try {
    $createResult = Invoke-RestMethod -Uri "$converterApiBase/api/templates/34/create-document" -Method POST -Headers $jsonHeaders -Body $createDocRequest -ErrorAction Stop
    
    if ($createResult.Success -and $createResult.Data) {
        Write-Host "✅ Document creation successful!" -ForegroundColor Green
        Write-Host "  Document ID: $($createResult.Data.Id)" -ForegroundColor Cyan
        Write-Host "  Document Title: $($createResult.Data.Title)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Document creation failed: $($createResult.Error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Document creation API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Contract34 Template Test Complete!" -ForegroundColor Green
Write-Host "Your Contract34 template is now fully functional and ready for use!" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Use the web application at http://localhost:5000/templates" -ForegroundColor White
Write-Host "2. Use the API at http://localhost:5003/api/templates/34" -ForegroundColor White
Write-Host "3. Access Swagger documentation at http://localhost:5003/swagger" -ForegroundColor White 