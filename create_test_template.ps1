# Create Test Template for SyncfusionDocumentConverter
Write-Host "Creating test template..." -ForegroundColor Green

$templatesPath = "SyncfusionDocumentConverter/templates"

# Ensure templates directory exists
if (!(Test-Path $templatesPath)) {
    New-Item -ItemType Directory -Path $templatesPath -Force
    Write-Host "Created templates directory: $templatesPath" -ForegroundColor Yellow
}

# Create a sample template with merge fields
$templateContent = @"
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
                    "text": "Business Letter Template"
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
                "inlines": [{
                    "characterFormat": {},
                    "text": "Date: "
                }, {
                    "characterFormat": {
                        "bold": true
                    },
                    "text": "<<Date>>"
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
                "inlines": [{
                    "characterFormat": {},
                    "text": "Dear "
                }, {
                    "characterFormat": {
                        "bold": true
                    },
                    "text": "<<FirstName>>"
                }, {
                    "characterFormat": {},
                    "text": " "
                }, {
                    "characterFormat": {
                        "bold": true
                    },
                    "text": "<<LastName>>"
                }, {
                    "characterFormat": {},
                    "text": ","
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
                "inlines": [{
                    "characterFormat": {},
                    "text": "We are pleased to inform you that your application with "
                }, {
                    "characterFormat": {
                        "bold": true
                    },
                    "text": "<<Company>>"
                }, {
                    "characterFormat": {},
                    "text": " has been approved. Your position as "
                }, {
                    "characterFormat": {
                        "bold": true
                    },
                    "text": "<<Title>>"
                }, {
                    "characterFormat": {},
                    "text": " will begin on the specified date."
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
                "inlines": [{
                    "characterFormat": {},
                    "text": "Please contact us at "
                }, {
                    "characterFormat": {
                        "bold": true
                    },
                    "text": "<<Phone>>"
                }, {
                    "characterFormat": {},
                    "text": " or email us at "
                }, {
                    "characterFormat": {
                        "bold": true
                    },
                    "text": "<<Email>>"
                }, {
                    "characterFormat": {},
                    "text": " if you have any questions."
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
                "inlines": [{
                    "characterFormat": {},
                    "text": "Sincerely,"
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
                "inlines": [{
                    "characterFormat": {
                        "bold": true
                    },
                    "text": "<<NotaryPublic>>"
                }]
            },
            {
                "paragraphFormat": {
                    "styleName": "Normal"
                },
                "characterFormat": {},
                "inlines": [{
                    "characterFormat": {},
                    "text": "HR Manager"
                }]
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
    "styles": [{
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
    }, {
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
    }],
    "lists": [],
    "abstractLists": [],
    "comments": [],
    "revisions": [],
    "customXml": []
}
"@

# Create template metadata
$templateMetadata = @{
    "Id" = 1
    "Name" = "Business Letter Template"
    "Description" = "Professional business letter with merge fields"
    "Category" = "Business"
    "IsActive" = $true
    "CreatedBy" = "System"
    "CreatedAt" = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
    "UpdatedAt" = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
    "FilePath" = $null
    "FileSize" = $templateContent.Length
    "Metadata" = @{
        "Content" = $templateContent
    }
    "MergeFields" = @("Date", "FirstName", "LastName", "Company", "Title", "Phone", "Email", "NotaryPublic")
} | ConvertTo-Json -Depth 10

# Save template metadata file
$templateFile = Join-Path $templatesPath "1.json"
$templateMetadata | Out-File -FilePath $templateFile -Encoding UTF8

Write-Host "✅ Template created successfully!" -ForegroundColor Green
Write-Host "File: $templateFile" -ForegroundColor Cyan
Write-Host "Template ID: 1" -ForegroundColor Cyan
Write-Host "Merge fields: Date, FirstName, LastName, Company, Title, Phone, Email, NotaryPublic" -ForegroundColor Cyan

Write-Host "`nYou can now run the merge test with:" -ForegroundColor Yellow
Write-Host "powershell.exe -ExecutionPolicy Bypass -File test_merge.ps1" -ForegroundColor White 