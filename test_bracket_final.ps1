# Create Bracket Pattern Template
Write-Host "Creating bracket pattern template..." -ForegroundColor Cyan

$bracketTemplate = @{
    name = "Bracket Pattern Test Template"
    content = '{"sections":[{"sectionFormat":{"pageWidth":612,"pageHeight":792,"leftMargin":72,"rightMargin":72,"topMargin":72,"bottomMargin":72},"blocks":[{"paragraphFormat":{"styleName":"Normal"},"characterFormat":{},"inlines":[{"characterFormat":{"fontSize":12,"fontFamily":"Calibri"},"text":"Dear [FirstName] [LastName],\n\nThank you for your interest in [Company]. We are pleased to confirm your contact details:\n\nEmail: [Email]\nPhone: [Phone]\n\nDate: [Date]\n\nBest regards,\nCollabdoc Team"}]}]}]}'
    description = "Test template with bracket merge fields"
}

try {
    $json = $bracketTemplate | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:5003/api/templates" -Method Post -Body $json -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✓ Template created successfully with ID: $($response.data.id)" -ForegroundColor Green
        $templateId = $response.data.id
        
        # Test merge fields detection
        Write-Host "`nTesting merge fields detection..." -ForegroundColor Yellow
        $mergeFields = Invoke-RestMethod -Uri "http://localhost:5003/api/templates/$templateId/merge-fields" -Method Get
        Write-Host "✓ Found $($mergeFields.data.Count) merge fields: $($mergeFields.data -join ', ')" -ForegroundColor Green
        
        # Test document merge
        Write-Host "`nTesting document merge..." -ForegroundColor Yellow
        $mergeData = @{
            mergeData = @{
                FirstName = "John"
                LastName = "Doe"
                Company = "Test Corp"
                Email = "john.doe@testcorp.com"
                Phone = "(555) 123-4567"
                Date = "December 15, 2023"
            }
        }
        
        $mergeJson = $mergeData | ConvertTo-Json -Depth 10
        $mergeResult = Invoke-RestMethod -Uri "http://localhost:5003/api/templates/$templateId/merge" -Method Post -Body $mergeJson -ContentType "application/json"
        
        if ($mergeResult.success) {
            Write-Host "✓ Document merge completed successfully!" -ForegroundColor Green
            
            # Check if bracket patterns were replaced
            $content = $mergeResult.data.content
            $replacedValues = @("John", "Doe", "Test Corp", "john.doe@testcorp.com", "(555) 123-4567", "December 15, 2023")
            $allReplaced = $true
            
            foreach ($value in $replacedValues) {
                if ($content -notlike "*$value*") {
                    $allReplaced = $false
                    Write-Host "⚠ Value not found in merged document: $value" -ForegroundColor Yellow
                }
            }
            
            if ($allReplaced) {
                Write-Host "✓ All bracket patterns [FieldName] were successfully replaced!" -ForegroundColor Green
            }
            
            # Check for remaining bracket patterns
            $remainingBrackets = @()
            if ($content -like "*[FirstName]*") { $remainingBrackets += "[FirstName]" }
            if ($content -like "*[LastName]*") { $remainingBrackets += "[LastName]" }
            if ($content -like "*[Company]*") { $remainingBrackets += "[Company]" }
            if ($content -like "*[Email]*") { $remainingBrackets += "[Email]" }
            if ($content -like "*[Phone]*") { $remainingBrackets += "[Phone]" }
            if ($content -like "*[Date]*") { $remainingBrackets += "[Date]" }
            
            if ($remainingBrackets.Count -eq 0) {
                Write-Host "✓ No bracket patterns remain in the document" -ForegroundColor Green
            } else {
                Write-Host "⚠ Remaining bracket patterns: $($remainingBrackets -join ', ')" -ForegroundColor Yellow
            }
        } else {
            Write-Host "✗ Document merge failed: $($mergeResult.error)" -ForegroundColor Red
        }
        
        # Cleanup
        Write-Host "`nCleaning up test template..." -ForegroundColor Yellow
        try {
            Invoke-RestMethod -Uri "http://localhost:5003/api/templates/$templateId" -Method Delete
            Write-Host "✓ Test template deleted" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Could not delete template: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "✗ Failed to create template: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Bracket Pattern Test Complete ===" -ForegroundColor Cyan
