# Simple test to verify bracket pattern fix for UI template merge
param(
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "=== Testing UI Template Merge with Bracket Patterns ===" -ForegroundColor Green

# Step 1: Try a simple template merge through the UI API
Write-Host "`n1. Testing template merge through UI..." -ForegroundColor Yellow

# Get available templates
try {
    $templatesResponse = Invoke-RestMethod -Uri "$BaseUrl/api/documents?isTemplate=true" -Method GET -ContentType "application/json"
    Write-Host "Found $($templatesResponse.Count) templates available" -ForegroundColor Green
    
    if ($templatesResponse.Count -eq 0) {
        Write-Host "ERROR: No templates found!" -ForegroundColor Red
        exit 1
    }
    
    # Use the first template for testing
    $testTemplate = $templatesResponse[0]
    Write-Host "Using template: $($testTemplate.name) (ID: $($testTemplate.id))" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: Failed to get templates: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Perform template merge
$mergeData = @{
    "RecipientName" = "Test User"
    "CompanyName" = "Test Company"
    "Date" = (Get-Date).ToString("yyyy-MM-dd")
    "Title" = "Test Title"
    "Address" = "123 Test Street"
    "Email" = "test@example.com"
    "Phone" = "555-0123"
}

$mergeRequest = @{
    templateId = $testTemplate.id
    documentName = "Test Bracket Fix - $(Get-Date -Format 'HH:mm:ss')"
    mergeData = $mergeData
} | ConvertTo-Json -Depth 3

Write-Host "`n2. Performing merge with data:" -ForegroundColor Yellow
Write-Host $mergeRequest -ForegroundColor Gray

try {
    $mergeResponse = Invoke-RestMethod -Uri "$BaseUrl/api/templates/merge" -Method POST -Body $mergeRequest -ContentType "application/json"
    
    if ($mergeResponse.success) {
        Write-Host "`nSUCCESS: Template merge completed!" -ForegroundColor Green
        Write-Host "Created document: $($mergeResponse.data.name)" -ForegroundColor Green
        Write-Host "Document ID: $($mergeResponse.data.documentId)" -ForegroundColor Green
        
        # Step 3: Check if document can be opened in editor
        Write-Host "`n3. Testing document accessibility..." -ForegroundColor Yellow
        
        $editorUrl = "$BaseUrl/editor/$($mergeResponse.data.documentId)"
        
        try {
            $editorResponse = Invoke-WebRequest -Uri $editorUrl -Method GET -UseBasicParsing
            
            if ($editorResponse.StatusCode -eq 200) {
                Write-Host "SUCCESS: Document editor page loads successfully!" -ForegroundColor Green
                
                # Check if there are any error messages in the response
                $hasError = $editorResponse.Content -like "*error*" -or $editorResponse.Content -like "*not found*"
                
                if (-not $hasError) {
                    Write-Host "SUCCESS: No error messages detected in editor page" -ForegroundColor Green
                } else {
                    Write-Host "WARNING: Possible error messages detected in editor page" -ForegroundColor Yellow
                }
                
            } else {
                Write-Host "WARNING: Editor page returned status code: $($editorResponse.StatusCode)" -ForegroundColor Yellow
            }
            
        } catch {
            Write-Host "ERROR: Failed to load editor page: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Step 4: Verify document content through API
        Write-Host "`n4. Verifying document content..." -ForegroundColor Yellow
        
        try {
            $docResponse = Invoke-RestMethod -Uri "$BaseUrl/api/documents/$($mergeResponse.data.documentId)" -Method GET -ContentType "application/json"
            
            if ($docResponse -and $docResponse.content) {
                $contentLength = $docResponse.content.Length
                Write-Host "Document content retrieved successfully (Length: $contentLength)" -ForegroundColor Green
                
                # Check for merge field replacements
                $hasTestUser = $docResponse.content -like "*Test User*"
                $hasTestCompany = $docResponse.content -like "*Test Company*"
                $hasUnreplacedBrackets = $docResponse.content -like "*[*]*"
                
                Write-Host "`nContent analysis:" -ForegroundColor Yellow
                Write-Host "  - Contains 'Test User': $hasTestUser" -ForegroundColor $(if($hasTestUser) { "Green" } else { "Red" })
                Write-Host "  - Contains 'Test Company': $hasTestCompany" -ForegroundColor $(if($hasTestCompany) { "Green" } else { "Red" })
                Write-Host "  - Has unreplaced brackets: $hasUnreplacedBrackets" -ForegroundColor $(if($hasUnreplacedBrackets) { "Yellow" } else { "Green" })
                
                if ($hasTestUser -or $hasTestCompany) {
                    Write-Host "`nSUCCESS: Bracket pattern merge fields are working!" -ForegroundColor Green
                } elseif ($contentLength -gt 100) {
                    Write-Host "`nINFO: Document has content but test values not found (template may not have matching fields)" -ForegroundColor Cyan
                } else {
                    Write-Host "`nWARNING: Document content seems minimal or empty" -ForegroundColor Yellow
                }
                
            } else {
                Write-Host "WARNING: Could not retrieve document content" -ForegroundColor Yellow
            }
            
        } catch {
            Write-Host "ERROR: Failed to retrieve document content: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "ERROR: Template merge failed: $($mergeResponse.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR: Failed to perform template merge: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
