# Simple End-to-End Template Merge Test
Write-Host "🧪 Starting Template Merge Test..." -ForegroundColor Green

$converterApiBase = "http://localhost:5003"
$testTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"

$jsonHeaders = @{
    "Content-Type" = "application/json"
}

# Step 1: Get templates
Write-Host "`n📋 Step 1: Getting templates..." -ForegroundColor Yellow
try {
    $templatesResponse = Invoke-RestMethod -Uri "$converterApiBase/api/Templates" -Method GET
    
    if ($templatesResponse -and $templatesResponse.Count -gt 0) {
        Write-Host "✅ Found $($templatesResponse.Count) templates" -ForegroundColor Green
        $selectedTemplate = $templatesResponse[0]
        $templateId = $selectedTemplate.id
        $templateName = $selectedTemplate.name
        Write-Host "Selected: ID $templateId - $templateName" -ForegroundColor Cyan
    } else {
        Write-Host "❌ No templates found!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error getting templates: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get merge fields
Write-Host "`n🔍 Step 2: Getting merge fields..." -ForegroundColor Yellow
try {
    $mergeFieldsResponse = Invoke-RestMethod -Uri "$converterApiBase/api/Templates/$templateId/merge-fields" -Method GET
    Write-Host "✅ Merge fields response received" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error getting merge fields: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 3: Create merge data
Write-Host "`n📝 Step 3: Creating merge data..." -ForegroundColor Yellow

$mergeData = @{}
$mergeData["FirstName"] = "John"
$mergeData["LastName"] = "Smith"
$mergeData["FullName"] = "John Smith"
$mergeData["Name"] = "John Smith"
$mergeData["Title"] = "Senior Manager"
$mergeData["Company"] = "Acme Corporation"
$mergeData["Email"] = "john.smith@acmecorp.com"
$mergeData["Phone"] = "(555) 123-4567"
$mergeData["Address"] = "123 Business Street"
$mergeData["City"] = "Tech City"
$mergeData["State"] = "CA"
$mergeData["ZipCode"] = "90210"
$mergeData["NotaryPublic"] = "Jane Doe, Notary Public"
$mergeData["Date"] = (Get-Date).ToString("MMMM dd, yyyy")
$mergeData["Amount"] = "25000.00"

Write-Host "✅ Created merge data with $($mergeData.Count) fields" -ForegroundColor Green

# Step 4: Perform merge
Write-Host "`n🔄 Step 4: Performing merge..." -ForegroundColor Yellow

$mergedDocumentName = "Merged_Test_$testTimestamp"

$mergeRequest = @{
    MergeData = $mergeData
    SaveToLibrary = $true
    OutputFormat = "SFDT"
    DocumentName = $mergedDocumentName
    CreatedBy = "API_Test"
}

$mergeRequestJson = $mergeRequest | ConvertTo-Json -Depth 10

try {
    $mergeResponse = Invoke-RestMethod -Uri "$converterApiBase/api/Templates/$templateId/merge" -Method POST -Body $mergeRequestJson -Headers $jsonHeaders
    
    if ($mergeResponse -and $mergeResponse.success) {
        Write-Host "✅ Merge completed successfully!" -ForegroundColor Green
        Write-Host "Document: $($mergeResponse.data.name)" -ForegroundColor Cyan
        Write-Host "Document ID: $($mergeResponse.data.documentId)" -ForegroundColor Cyan
        Write-Host "Size: $($mergeResponse.data.size) bytes" -ForegroundColor Cyan
        
        $mergedDocumentId = $mergeResponse.data.documentId
        
        # Step 5: Verify document
        Write-Host "`n✅ Step 5: Verifying document..." -ForegroundColor Yellow
        
        try {
            $verifyResponse = Invoke-RestMethod -Uri "$converterApiBase/api/Document/$mergedDocumentId" -Method GET
            
            if ($verifyResponse -and $verifyResponse.data) {
                Write-Host "✅ Document verified!" -ForegroundColor Green
                Write-Host "Title: $($verifyResponse.data.title)" -ForegroundColor Cyan
                Write-Host "Content length: $($verifyResponse.data.content.Length)" -ForegroundColor Cyan
                
                # Check for merged content
                $hasJohn = $verifyResponse.data.content -like "*John*"
                $hasSmith = $verifyResponse.data.content -like "*Smith*"
                $hasAcme = $verifyResponse.data.content -like "*Acme*"
                
                if ($hasJohn -or $hasSmith -or $hasAcme) {
                    Write-Host "✅ Merged data found in content!" -ForegroundColor Green
                    if ($hasJohn) { Write-Host "  • Found: John" -ForegroundColor White }
                    if ($hasSmith) { Write-Host "  • Found: Smith" -ForegroundColor White }
                    if ($hasAcme) { Write-Host "  • Found: Acme" -ForegroundColor White }
                } else {
                    Write-Host "⚠️ No merged data found in content" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Merge failed!" -ForegroundColor Red
        if ($mergeResponse.error) {
            Write-Host "Error: $($mergeResponse.error)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Merge request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Test Complete!" -ForegroundColor Green
Write-Host "Check document: $mergedDocumentName" -ForegroundColor Cyan
Write-Host "Web app: http://localhost:5000" -ForegroundColor Cyan 