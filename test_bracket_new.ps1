# Test Bracket Pattern Template Creation and Merge
Write-Host "Creating and testing bracket pattern template..." -ForegroundColor Cyan

# Step 1: Create bracket pattern template
$createUrl = "http://localhost:5003/api/templates"
$createHeaders = @{
    "Content-Type" = "application/json"
}

$bracketTemplate = @{
    name = "Bracket Pattern Test Template"
    content = @"
{
    "sections": [{
        "sectionFormat": {
            "pageWidth": 612,
            "pageHeight": 792,
            "leftMargin": 72,
            "rightMargin": 72,
            "topMargin": 72,
            "bottomMargin": 72
        },
        "blocks": [{
            "paragraphFormat": {
                "styleName": "Normal"
            },
            "characterFormat": {},
            "inlines": [{
                "characterFormat": {
                    "fontSize": 12,
                    "fontFamily": "Calibri"
                },
                "text": "Dear [FirstName] [LastName],\n\nThank you for your interest in [Company]. We are pleased to confirm your contact details:\n\nEmail: [Email]\nPhone: [Phone]\nDate: [Date]\n\nBest regards,\n[SenderName]\n[SenderTitle]"
            }]
        }]
    }]
}
"@
    description = "Test template with bracket merge fields"
    category = "Test"
} | ConvertTo-Json -Depth 10

Write-Host "Step 1: Creating bracket pattern template..." -ForegroundColor Yellow

try {
    $createResponse = Invoke-RestMethod -Uri $createUrl -Method POST -Headers $createHeaders -Body $bracketTemplate
    
    if ($createResponse.success) {
        $templateId = $createResponse.data.id
        Write-Host "✓ Template created successfully with ID: $templateId" -ForegroundColor Green
        
        # Step 2: Test merge fields detection
        Write-Host "`nStep 2: Testing merge fields detection..." -ForegroundColor Yellow
        $fieldsUrl = "http://localhost:5003/api/templates/$templateId/merge-fields"
        $fieldsResponse = Invoke-RestMethod -Uri $fieldsUrl -Method GET
        
        if ($fieldsResponse.success) {
            Write-Host "✓ Found $($fieldsResponse.data.Count) merge fields:" -ForegroundColor Green
            foreach ($field in $fieldsResponse.data) {
                Write-Host "  - [$field]" -ForegroundColor Gray
            }
        }
        
        # Step 3: Test document merge
        Write-Host "`nStep 3: Testing document merge with bracket patterns..." -ForegroundColor Yellow
        $mergeUrl = "http://localhost:5003/api/templates/$templateId/merge"
        $mergeData = @{
            MergeData = @{
                FirstName = "Alice"
                LastName = "Johnson"
                Company = "TechCorp Solutions"
                Email = "alice.johnson@techcorp.com"
                Phone = "(555) 987-6543"
                Date = "June 4, 2025"
                SenderName = "Bob Wilson"
                SenderTitle = "HR Manager"
            }
            SaveToLibrary = $false
            OutputFormat = "DOCX"
            DocumentName = "BracketPattern_Test"
        } | ConvertTo-Json -Depth 3
        
        $mergeResponse = Invoke-RestMethod -Uri $mergeUrl -Method POST -Headers $createHeaders -Body $mergeData
        
        if ($mergeResponse.success) {
            Write-Host "✓ Document merge successful!" -ForegroundColor Green
            Write-Host "  File Size: $($mergeResponse.data.fileSize) bytes" -ForegroundColor Cyan
            Write-Host "  Document ID: $($mergeResponse.data.id)" -ForegroundColor Cyan
            
            # Verify the merge worked by checking if we can retrieve the content
            Write-Host "`nStep 4: Verifying merged content..." -ForegroundColor Yellow
            $docUrl = "http://localhost:5003/api/documents/$($mergeResponse.data.id)"
            try {
                $docResponse = Invoke-RestMethod -Uri $docUrl -Method GET
                if ($docResponse.success -and $docResponse.data.content) {
                    Write-Host "✓ Merged document content retrieved successfully" -ForegroundColor Green
                    
                    # Check if bracket patterns were replaced
                    $content = $docResponse.data.content
                    $testValues = @("Alice", "Johnson", "TechCorp Solutions", "alice.johnson@techcorp.com", "(555) 987-6543", "June 4, 2025", "Bob Wilson", "HR Manager")
                    $foundValues = @()
                    
                    foreach ($value in $testValues) {
                        if ($content -like "*$value*") {
                            $foundValues += $value
                        }
                    }
                    
                    Write-Host "✓ Found $($foundValues.Count)/$($testValues.Count) replaced values in merged document" -ForegroundColor Green
                    
                    # Check for remaining bracket patterns
                    $patterns = @("[FirstName]", "[LastName]", "[Company]", "[Email]", "[Phone]", "[Date]", "[SenderName]", "[SenderTitle]")
                    $remainingPatterns = @()
                    
                    foreach ($pattern in $patterns) {
                        if ($content -like "*$pattern*") {
                            $remainingPatterns += $pattern
                        }
                    }
                    
                    if ($remainingPatterns.Count -eq 0) {
                        Write-Host "✓ All bracket patterns [FieldName] were successfully replaced!" -ForegroundColor Green
                    } else {
                        Write-Host "⚠ Remaining bracket patterns: $($remainingPatterns -join ', ')" -ForegroundColor Yellow
                    }
                }
            } catch {
                Write-Host "⚠ Could not retrieve merged document content: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "✗ Document merge failed: $($mergeResponse.message)" -ForegroundColor Red
        }
        
        # Step 5: Cleanup
        Write-Host "`nStep 5: Cleaning up test template..." -ForegroundColor Yellow
        try {
            $deleteUrl = "http://localhost:5003/api/templates/$templateId"
            Invoke-RestMethod -Uri $deleteUrl -Method DELETE
            Write-Host "✓ Test template deleted successfully" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Could not delete test template: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "✗ Failed to create template: $($createResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "✗ Error during template creation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== BRACKET PATTERN TEST COMPLETE ===" -ForegroundColor Cyan
