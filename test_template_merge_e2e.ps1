# End-to-End Template Merge Test
# This script tests the complete template merge workflow:
# 1. Get templates from library
# 2. Extract merge fields from a template
# 3. Create sample merge data
# 4. Perform the merge
# 5. Verify the merged document

Write-Host "🧪 Starting End-to-End Template Merge Test..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Test configuration
$webApiBase = "http://localhost:5000"
$converterApiBase = "http://localhost:5003"
$testTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Headers for API calls
$jsonHeaders = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

try {
    # Step 1: Get available templates
    Write-Host "`n📋 Step 1: Fetching available templates..." -ForegroundColor Yellow
    
    $templatesResponse = Invoke-RestMethod -Uri "$converterApiBase/api/Templates" -Method GET -Headers $jsonHeaders
    
    if ($templatesResponse -and $templatesResponse.Count -gt 0) {
        Write-Host "✅ Found $($templatesResponse.Count) templates:" -ForegroundColor Green
        
        for ($i = 0; $i -lt [Math]::Min(5, $templatesResponse.Count); $i++) {
            $template = $templatesResponse[$i]
            Write-Host "  [$($i+1)] ID: $($template.id) - Name: $($template.name)" -ForegroundColor Cyan
        }
        
        # Select the first template for testing
        $selectedTemplate = $templatesResponse[0]
        $templateId = $selectedTemplate.id
        $templateName = $selectedTemplate.name
        
        Write-Host "`n🎯 Selected template for testing:" -ForegroundColor Magenta
        Write-Host "   ID: $templateId" -ForegroundColor Cyan
        Write-Host "   Name: $templateName" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ No templates found in the library!" -ForegroundColor Red
        Write-Host "Please create at least one template before running this test." -ForegroundColor Yellow
        exit 1
    }
    
    # Step 2: Extract merge fields from the selected template
    Write-Host "`n🔍 Step 2: Extracting merge fields from template..." -ForegroundColor Yellow
    
    try {
        $mergeFieldsResponse = Invoke-RestMethod -Uri "$converterApiBase/api/Templates/$templateId/merge-fields" -Method GET -Headers $jsonHeaders
        
        if ($mergeFieldsResponse -and $mergeFieldsResponse.fields) {
            $mergeFields = $mergeFieldsResponse.fields
            Write-Host "✅ Found $($mergeFields.Count) merge fields:" -ForegroundColor Green
            
            foreach ($field in $mergeFields.PSObject.Properties) {
                $fieldName = $field.Name
                $fieldInfo = $field.Value
                Write-Host "   • $fieldName (Type: $($fieldInfo.type), Required: $($fieldInfo.required))" -ForegroundColor Cyan
            }
        } else {
            Write-Host "⚠️  No merge fields found or empty response" -ForegroundColor Yellow
            Write-Host "Creating generic test data..." -ForegroundColor Yellow
            $mergeFields = @{}
        }
    } catch {
        Write-Host "⚠️  Error extracting merge fields: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "Will proceed with common merge field names..." -ForegroundColor Yellow
        $mergeFields = @{}
    }
    
    # Step 3: Create sample merge data
    Write-Host "`n📝 Step 3: Creating sample merge data..." -ForegroundColor Yellow
    
    # Create comprehensive sample data covering common merge fields
    $sampleMergeData = @{
        "FirstName" = "John"
        "LastName" = "Smith"
        "FullName" = "John Smith"
        "Name" = "John Smith"
        "Title" = "Senior Manager"
        "Company" = "Acme Corporation"
        "Department" = "Technology Services"
        "Position" = "Senior Software Engineer"
        "Email" = "john.smith@acmecorp.com"
        "Phone" = "(555) 123-4567"
        "Address" = "123 Business Street"
        "City" = "Tech City"
        "State" = "CA"
        "ZipCode" = "90210"
        "NotaryPublic" = "Jane Doe, Notary Public"
        "NotaryCommission" = "Commission #12345"
        "NotaryExpiry" = "December 31, 2025"
        "WitnessName" = "Robert Johnson"
        "WitnessAddress" = "456 Witness Lane, Tech City, CA 90211"
        "DocumentDate" = (Get-Date).ToString("MMMM dd, yyyy")
        "ContractNumber" = "CONTRACT-$testTimestamp"
        "ReferenceNumber" = "REF-$testTimestamp"
        "Amount" = "`$25,000.00"
        "Currency" = "USD"
        "PaymentTerms" = "Net 30 days"
        "Date" = (Get-Date).ToString("MMMM dd, yyyy")
        "EffectiveDate" = (Get-Date).AddDays(1).ToString("MMMM dd, yyyy")
        "ExpiryDate" = (Get-Date).AddYears(1).ToString("MMMM dd, yyyy")
    }
    
    # If we found specific merge fields, prioritize those
    if ($mergeFields -and $mergeFields.Count -gt 0) {
        $finalMergeData = @{}
        foreach ($field in $mergeFields.PSObject.Properties) {
            $fieldName = $field.Name
            if ($sampleMergeData.ContainsKey($fieldName)) {
                $finalMergeData[$fieldName] = $sampleMergeData[$fieldName]
            } else {
                # Create generic data for unknown fields
                $finalMergeData[$fieldName] = "Sample data for $fieldName"
            }
        }
    } else {
        $finalMergeData = $sampleMergeData
    }
    
    Write-Host "✅ Created merge data with $($finalMergeData.Count) fields:" -ForegroundColor Green
    foreach ($key in $finalMergeData.Keys) {
        Write-Host "   • $key = '$($finalMergeData[$key])'" -ForegroundColor Cyan
    }
    
    # Step 4: Perform the template merge
    Write-Host "`n🔄 Step 4: Performing template merge..." -ForegroundColor Yellow
    
    $mergedDocumentName = "Merged_${templateName}_$testTimestamp"
    
    $mergeRequest = @{
        MergeData = $finalMergeData
        SaveToLibrary = $true
        OutputFormat = "SFDT"
        DocumentName = $mergedDocumentName
        CreatedBy = "API_Test_User"
    } | ConvertTo-Json -Depth 10
    
    Write-Host "Merge request payload:" -ForegroundColor Gray
    Write-Host $mergeRequest -ForegroundColor DarkGray
    
    try {
        $mergeResponse = Invoke-RestMethod -Uri "$converterApiBase/api/Templates/$templateId/merge" -Method POST -Body $mergeRequest -Headers $jsonHeaders
        
        if ($mergeResponse -and $mergeResponse.success) {
            Write-Host "✅ Template merge completed successfully!" -ForegroundColor Green
            Write-Host "   Document Name: $($mergeResponse.data.name)" -ForegroundColor Cyan
            Write-Host "   Document ID: $($mergeResponse.data.documentId)" -ForegroundColor Cyan
            Write-Host "   Size: $($mergeResponse.data.size) bytes" -ForegroundColor Cyan
            Write-Host "   Created: $($mergeResponse.data.createdAt)" -ForegroundColor Cyan
            
            $mergedDocumentId = $mergeResponse.data.documentId
            
            # Step 5: Verify the merged document
            Write-Host "`n✅ Step 5: Verifying merged document..." -ForegroundColor Yellow
            
            try {
                # Try to retrieve the document
                $verifyResponse = Invoke-RestMethod -Uri "$converterApiBase/api/Document/$mergedDocumentId" -Method GET -Headers $jsonHeaders
                
                if ($verifyResponse -and $verifyResponse.data) {
                    Write-Host "✅ Document verification successful!" -ForegroundColor Green
                    Write-Host "   Retrieved Document: $($verifyResponse.data.title)" -ForegroundColor Cyan
                    Write-Host "   Content Length: $($verifyResponse.data.content.Length) characters" -ForegroundColor Cyan
                    Write-Host "   File Size: $($verifyResponse.data.fileSize) bytes" -ForegroundColor Cyan
                    
                    # Check if content contains merged data
                    $contentHasMergedData = $false
                    $mergedFieldsFound = @()
                    
                    foreach ($key in $finalMergeData.Keys) {
                        $value = $finalMergeData[$key]
                        if ($verifyResponse.data.content -like "*$value*") {
                            $contentHasMergedData = $true
                            $mergedFieldsFound += "$key = '$value'"
                        }
                    }
                    
                    if ($contentHasMergedData) {
                        Write-Host "✅ Merge data found in document content!" -ForegroundColor Green
                        Write-Host "   Fields successfully merged:" -ForegroundColor Cyan
                        foreach ($field in $mergedFieldsFound) {
                            Write-Host "     • $field" -ForegroundColor White
                        }
                    } else {
                        Write-Host "⚠️  Warning: No merge data found in document content" -ForegroundColor Yellow
                        Write-Host "   This may indicate merge field replacement didn't work properly" -ForegroundColor Yellow
                    }
                    
                } else {
                    Write-Host "❌ Document verification failed - could not retrieve merged document" -ForegroundColor Red
                }
                
            } catch {
                Write-Host "❌ Document verification failed: $($_.Exception.Message)" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ Template merge failed!" -ForegroundColor Red
            if ($mergeResponse.error) {
                Write-Host "   Error: $($mergeResponse.error)" -ForegroundColor Red
            }
            if ($mergeResponse.message) {
                Write-Host "   Message: $($mergeResponse.message)" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "❌ Error during template merge: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   This may indicate the merge API endpoint is not working properly" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Critical error during template listing: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure both services are running:" -ForegroundColor Yellow
    Write-Host "   - Collabdoc.Web: $webApiBase" -ForegroundColor Yellow
    Write-Host "   - SyncfusionDocumentConverter: $converterApiBase" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n================================================" -ForegroundColor Green
Write-Host "🏁 End-to-End Template Merge Test Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n📖 Next Steps:" -ForegroundColor Magenta
Write-Host "   1. Check the merged document in your document library" -ForegroundColor White
Write-Host "   2. Open the document in the editor to verify merge results" -ForegroundColor White
Write-Host "   3. Look for the document named: Merged_*_$testTimestamp" -ForegroundColor Cyan

Write-Host "`n🌐 Access your application:" -ForegroundColor Magenta
Write-Host "   • Web Application: $webApiBase" -ForegroundColor Cyan
Write-Host "   • Document Editor: $webApiBase/editor" -ForegroundColor Cyan
Write-Host "   • Document Library: $webApiBase/documents" -ForegroundColor Cyan 