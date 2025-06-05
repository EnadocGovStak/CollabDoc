# Test script to verify bracket pattern merge field support
param(
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "=== Testing Bracket Pattern Merge Field Support ===" -ForegroundColor Green

# Step 1: First check what templates we have
Write-Host "`n1. Getting available templates..." -ForegroundColor Yellow
try {
    $templatesResponse = Invoke-RestMethod -Uri "$BaseUrl/api/templates" -Method GET -ContentType "application/json"
    Write-Host "Found $($templatesResponse.Count) templates" -ForegroundColor Green
    
    # Find a template with bracket patterns
    $testTemplate = $templatesResponse | Where-Object { $_.name -like "*Business Letter*" -or $_.name -like "*Contract*" } | Select-Object -First 1
    
    if (-not $testTemplate) {
        Write-Host "No suitable template found. Using first available template." -ForegroundColor Yellow
        $testTemplate = $templatesResponse | Select-Object -First 1
    }
    
    if (-not $testTemplate) {
        Write-Host "ERROR: No templates found!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Using template: $($testTemplate.name) (ID: $($testTemplate.id))" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to get templates: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check what merge fields the template has
Write-Host "`n2. Getting template merge fields..." -ForegroundColor Yellow
try {
    $mergeFieldsUrl = "$BaseUrl/api/templates/$($testTemplate.id)/merge-fields"
    $mergeFieldsResponse = Invoke-RestMethod -Uri $mergeFieldsUrl -Method GET -ContentType "application/json"
    
    if ($mergeFieldsResponse.success) {
        Write-Host "Template has $($mergeFieldsResponse.data.Count) merge fields:" -ForegroundColor Green
        foreach ($field in $mergeFieldsResponse.data) {
            Write-Host "  - $($field.name) ($($field.displayName)) - Type: $($field.type)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "WARNING: Failed to get merge fields: $($mergeFieldsResponse.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: Failed to get merge fields: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 3: Perform a test merge with sample data
Write-Host "`n3. Testing template merge with bracket patterns..." -ForegroundColor Yellow

$mergeData = @{
    "RecipientName" = "John Smith"
    "CompanyName" = "Acme Corporation"
    "Title" = "Senior Manager"
    "Address" = "123 Business Street, Suite 456"
    "City" = "New York"
    "State" = "NY"
    "ZIPCode" = "10001"
    "Date" = (Get-Date).ToString("yyyy-MM-dd")
    "YourCompanyName" = "Test Company Inc."
    "YourAddress" = "456 Test Ave"
    "YourName" = "Jane Doe"
    "YourTitle" = "Director"
}

$mergeRequest = @{
    templateId = $testTemplate.id
    documentName = "Test Bracket Merge - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    mergeData = $mergeData
} | ConvertTo-Json -Depth 3

Write-Host "Merge request data:" -ForegroundColor Cyan
Write-Host $mergeRequest -ForegroundColor Gray

try {
    $mergeUrl = "$BaseUrl/api/templates/merge"
    $mergeResponse = Invoke-RestMethod -Uri $mergeUrl -Method POST -Body $mergeRequest -ContentType "application/json"
    
    if ($mergeResponse.success) {
        Write-Host "`nSUCCESS: Template merge completed!" -ForegroundColor Green
        Write-Host "Created document: $($mergeResponse.data.name)" -ForegroundColor Green
        Write-Host "Document ID: $($mergeResponse.data.documentId)" -ForegroundColor Green
        Write-Host "Size: $($mergeResponse.data.size) bytes" -ForegroundColor Green
        
        # Step 4: Try to retrieve the created document to verify content
        Write-Host "`n4. Verifying created document..." -ForegroundColor Yellow
        
        $documentId = $mergeResponse.data.documentId
        $docUrl = "$BaseUrl/api/documents/$documentId"
        
        try {
            $docResponse = Invoke-RestMethod -Uri $docUrl -Method GET -ContentType "application/json"
            
            if ($docResponse -and $docResponse.length -gt 100) {
                Write-Host "Document content retrieved successfully (Length: $($docResponse.length))" -ForegroundColor Green
                
                # Check if merge data was actually replaced
                $hasRecipientName = $docResponse -like "*John Smith*"
                $hasCompanyName = $docResponse -like "*Acme Corporation*"
                $hasBrackets = $docResponse -like "*[*]*"
                
                Write-Host "`nMerge verification:" -ForegroundColor Yellow
                Write-Host "  - Contains 'John Smith': $hasRecipientName" -ForegroundColor $(if($hasRecipientName) { "Green" } else { "Red" })
                Write-Host "  - Contains 'Acme Corporation': $hasCompanyName" -ForegroundColor $(if($hasCompanyName) { "Green" } else { "Red" })
                Write-Host "  - Still has unreplaced brackets: $hasBrackets" -ForegroundColor $(if($hasBrackets) { "Yellow" } else { "Green" })
                
                if ($hasRecipientName -and $hasCompanyName) {
                    Write-Host "`nSUCCESS: Bracket pattern merge fields are working!" -ForegroundColor Green
                } elseif (-not $hasBrackets) {
                    Write-Host "`nSUCCESS: All bracket patterns were processed (though test values may not be present)" -ForegroundColor Green  
                } else {
                    Write-Host "`nWARNING: Merge may not have processed all bracket patterns correctly" -ForegroundColor Yellow
                }
            } else {
                Write-Host "WARNING: Document content seems too short or empty" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "WARNING: Could not retrieve document content: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "ERROR: Template merge failed: $($mergeResponse.error)" -ForegroundColor Red
        if ($mergeResponse.message) {
            Write-Host "Message: $($mergeResponse.message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "ERROR: Failed to perform template merge: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorBody)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
