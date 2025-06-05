# Test script to create and test bracket pattern template directly
param(
    [string]$ApiUrl = "http://localhost:5003"
)

Write-Host "=== Testing Bracket Pattern Template Creation and Merge ===" -ForegroundColor Green

# Create a simple SFDT content with bracket patterns
$sfdtContent = @"
{
    "sections": [{
        "sectionFormat": {
            "pageWidth": 612,
            "pageHeight": 792,
            "leftMargin": 72,
            "rightMargin": 72,
            "topMargin": 72,
            "bottomMargin": 72,
            "differentFirstPage": false,
            "differentOddAndEvenPages": false
        },
        "blocks": [
            {
                "paragraphFormat": {
                    "styleName": "Heading 1",
                    "textAlignment": "Center"
                },
                "characterFormat": {},
                "inlines": [{
                    "characterFormat": {
                        "fontSize": 16,
                        "bold": true
                    },
                    "text": "Bracket Pattern Test Template"
                }]
            },
            {
                "paragraphFormat": {
                    "styleName": "Normal",
                    "afterSpacing": 12
                },
                "characterFormat": {},
                "inlines": [{
                    "characterFormat": {},
                    "text": ""
                }]
            },
            {
                "paragraphFormat": {
                    "styleName": "Normal"
                },
                "characterFormat": {},
                "inlines": [
                    {
                        "characterFormat": {},
                        "text": "Name: "
                    },
                    {
                        "characterFormat": {
                            "bold": true
                        },
                        "text": "[RecipientName]"
                    }
                ]
            },
            {
                "paragraphFormat": {
                    "styleName": "Normal"
                },
                "characterFormat": {},
                "inlines": [
                    {
                        "characterFormat": {},
                        "text": "Company: "
                    },
                    {
                        "characterFormat": {
                            "bold": true
                        },
                        "text": "[CompanyName]"
                    }
                ]
            },
            {
                "paragraphFormat": {
                    "styleName": "Normal"
                },
                "characterFormat": {},
                "inlines": [
                    {
                        "characterFormat": {},
                        "text": "Email: "
                    },
                    {
                        "characterFormat": {
                            "bold": true
                        },
                        "text": "[Email]"
                    }
                ]
            }
        ]
    }],
    "characterFormat": {
        "bold": false,
        "italic": false,
        "fontSize": 11,
        "fontFamily": "Calibri"
    },
    "paragraphFormat": {
        "leftIndent": 0,
        "rightIndent": 0,
        "firstLineIndent": 0,
        "textAlignment": "Left",
        "beforeSpacing": 0,
        "afterSpacing": 0,
        "lineSpacing": 1.15,
        "lineSpacingType": "Multiple"
    },
    "defaultTabWidth": 36,
    "enforcement": false,
    "hashValue": "",
    "saltValue": "",
    "formatting": false,
    "protectionType": "NoProtection",
    "dontUseHTMLParagraphAutoSpacing": false,
    "formFieldShading": true,
    "compatibilityMode": "Word2013",
    "styles": [
        {
            "name": "Normal",
            "type": "Paragraph",
            "paragraphFormat": {
                "listFormat": {}
            },
            "characterFormat": {
                "fontSize": 11,
                "fontFamily": "Calibri"
            },
            "next": "Normal"
        },
        {
            "name": "Heading 1",
            "type": "Paragraph",
            "basedOn": "Normal",
            "paragraphFormat": {
                "beforeSpacing": 12,
                "afterSpacing": 6,
                "textAlignment": "Center"
            },
            "characterFormat": {
                "fontSize": 16,
                "fontFamily": "Calibri",
                "bold": true
            }
        }
    ],
    "lists": [],
    "abstractLists": [],
    "comments": [],
    "revisions": [],
    "customXml": []
}
"@

# Create template
$templateRequest = @{
    name = "Bracket Pattern Test Template"
    description = "Template with [FieldName] bracket patterns for testing"
    category = "Test"
    content = $sfdtContent
} | ConvertTo-Json -Depth 10

Write-Host "`n1. Creating bracket pattern template..." -ForegroundColor Yellow

try {
    $templateResponse = Invoke-RestMethod -Uri "$ApiUrl/api/templates" -Method POST -Body $templateRequest -ContentType "application/json"
    
    if ($templateResponse.success) {
        $templateId = $templateResponse.data.id
        Write-Host "SUCCESS: Template created with ID: $templateId" -ForegroundColor Green
        
        # Step 2: Test merge with bracket pattern data
        Write-Host "`n2. Testing merge with bracket pattern data..." -ForegroundColor Yellow
        
        $mergeData = @{
            RecipientName = "John Doe"
            CompanyName = "Acme Corp"
            Email = "john.doe@acme.com"
        }
        
        $mergeRequest = @{
            mergeData = $mergeData
        } | ConvertTo-Json -Depth 3
        
        Write-Host "Merge request data:" -ForegroundColor Gray
        Write-Host $mergeRequest -ForegroundColor Gray
        
        try {
            $mergeResponse = Invoke-RestMethod -Uri "$ApiUrl/api/templates/$templateId/merge" -Method POST -Body $mergeRequest -ContentType "application/json"
            
            if ($mergeResponse.success) {
                Write-Host "SUCCESS: Merge completed!" -ForegroundColor Green
                
                # Check if bracket patterns were replaced
                $mergedContent = $mergeResponse.data.content
                
                $hasJohnDoe = $mergedContent -like "*John Doe*"
                $hasAcmeCorp = $mergedContent -like "*Acme Corp*"
                $hasEmail = $mergedContent -like "*john.doe@acme.com*"
                $hasUnreplacedBrackets = $mergedContent -like "*[RecipientName]*" -or $mergedContent -like "*[CompanyName]*" -or $mergedContent -like "*[Email]*"
                
                Write-Host "`nMerge result analysis:" -ForegroundColor Yellow
                Write-Host "  - Contains 'John Doe': $hasJohnDoe" -ForegroundColor $(if($hasJohnDoe) { "Green" } else { "Red" })
                Write-Host "  - Contains 'Acme Corp': $hasAcmeCorp" -ForegroundColor $(if($hasAcmeCorp) { "Green" } else { "Red" })
                Write-Host "  - Contains email: $hasEmail" -ForegroundColor $(if($hasEmail) { "Green" } else { "Red" })
                Write-Host "  - Has unreplaced brackets: $hasUnreplacedBrackets" -ForegroundColor $(if($hasUnreplacedBrackets) { "Yellow" } else { "Green" })
                
                if ($hasJohnDoe -and $hasAcmeCorp -and $hasEmail -and -not $hasUnreplacedBrackets) {
                    Write-Host "`nSUCCESS: Bracket pattern merge is working correctly!" -ForegroundColor Green
                } elseif ($hasJohnDoe -or $hasAcmeCorp -or $hasEmail) {
                    Write-Host "`nPARTIAL SUCCESS: Some bracket patterns were replaced" -ForegroundColor Yellow
                } else {
                    Write-Host "`nFAILED: Bracket patterns were not replaced" -ForegroundColor Red
                    
                    # Show a snippet of the content for debugging
                    if ($mergedContent.Length -gt 200) {
                        $snippet = $mergedContent.Substring(0, 200) + "..."
                        Write-Host "`nContent snippet:" -ForegroundColor Gray
                        Write-Host $snippet -ForegroundColor Gray
                    }
                }
                
            } else {
                Write-Host "ERROR: Merge failed: $($mergeResponse.error)" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "ERROR: Failed to perform merge: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "ERROR: Template creation failed: $($templateResponse.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR: Failed to create template: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
