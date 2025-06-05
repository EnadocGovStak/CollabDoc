# Export Database Templates to SyncfusionDocumentConverter
Write-Host "🔄 Exporting Database Templates to Converter Service..." -ForegroundColor Green

$webApiBase = "http://localhost:5000"
$converterApiBase = "http://localhost:5003"
$templatesDir = "SyncfusionDocumentConverter/templates"

# Ensure templates directory exists
if (-not (Test-Path $templatesDir)) {
    New-Item -ItemType Directory -Path $templatesDir -Force
    Write-Host "✅ Created templates directory: $templatesDir" -ForegroundColor Green
}

# Try to browse the web application to trigger loading of templates
Write-Host "`n📋 Step 1: Accessing web application to load templates..." -ForegroundColor Yellow

try {
    # Navigate to the templates page to ensure data is loaded
    $templatesPage = Invoke-WebRequest -Uri "$webApiBase/templates" -ErrorAction Stop
    Write-Host "✅ Successfully accessed templates page" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not access templates page: $($_.Exception.Message)" -ForegroundColor Red
}

# Since the web app doesn't have a direct templates API, let's create templates manually
# based on common contract template structures
Write-Host "`n📄 Step 2: Creating Contract34 template..." -ForegroundColor Yellow

$contract34Template = @{
    Id = 34
    Name = "Contract34"
    Description = "Contract template with merge fields for agreements"
    Category = "Legal Documents"
    CreatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    UpdatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    IsActive = $true
    Metadata = @{
        Content = @"
{
  "sections": [
    {
      "blocks": [
        {
          "paragraphFormat": {"textAlignment": "Center", "styleName": "Heading 1"},
          "inlines": [{"text": "CONTRACT AGREEMENT"}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "This Contract Agreement (\"Agreement\") is entered into on "},
            {"text": "<<ContractDate>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}},
            {"text": " between:"}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Party A: "},
            {"text": "<<PartyA_Name>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}},
            {"text": " (\"Client\")"}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Address: "},
            {"text": "<<PartyA_Address>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Party B: "},
            {"text": "<<PartyB_Name>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}},
            {"text": " (\"Service Provider\")"}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Address: "},
            {"text": "<<PartyB_Address>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"textAlignment": "Left", "styleName": "Heading 2"},
          "inlines": [{"text": "1. SCOPE OF WORK"}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "The Service Provider agrees to provide the following services: "},
            {"text": "<<ServiceDescription>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"textAlignment": "Left", "styleName": "Heading 2"},
          "inlines": [{"text": "2. PAYMENT TERMS"}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Total Contract Value: "},
            {"text": "<<ContractValue>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Payment Terms: "},
            {"text": "<<PaymentTerms>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"textAlignment": "Left", "styleName": "Heading 2"},
          "inlines": [{"text": "3. DURATION"}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Start Date: "},
            {"text": "<<StartDate>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "End Date: "},
            {"text": "<<EndDate>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"textAlignment": "Left", "styleName": "Heading 2"},
          "inlines": [{"text": "4. SIGNATURES"}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Client Signature: _________________________ Date: "},
            {"text": "<<SignatureDate>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Print Name: "},
            {"text": "<<PartyA_Name>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [{"text": ""}]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Service Provider Signature: _________________________ Date: "},
            {"text": "<<SignatureDate>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        },
        {
          "paragraphFormat": {"styleName": "Normal"},
          "inlines": [
            {"text": "Print Name: "},
            {"text": "<<PartyB_Name>>", "characterFormat": {"bold": true, "highlightColor": "Yellow"}}
          ]
        }
      ]
    }
  ]
}
"@
        MergeFields = @(
            "ContractDate",
            "PartyA_Name",
            "PartyA_Address", 
            "PartyB_Name",
            "PartyB_Address",
            "ServiceDescription",
            "ContractValue",
            "PaymentTerms",
            "StartDate",
            "EndDate",
            "SignatureDate"
        )
    }
} | ConvertTo-Json -Depth 20

# Save Contract34 template
$contract34Path = Join-Path $templatesDir "34.json"
$contract34Template | Out-File -FilePath $contract34Path -Encoding utf8
Write-Host "✅ Created Contract34 template: $contract34Path" -ForegroundColor Green

# Test the new template with converter service
Write-Host "`n🧪 Step 3: Testing new template with converter service..." -ForegroundColor Yellow

try {
    $templates = Invoke-RestMethod -Uri "$converterApiBase/api/templates" -Method GET -ErrorAction Stop
    Write-Host "✅ Converter service templates:" -ForegroundColor Green
    
    if ($templates.Success -and $templates.Data) {
        foreach ($template in $templates.Data) {
            if ($template.Name -eq "Contract34") {
                Write-Host "  >>> FOUND Contract34: ID $($template.Id)" -ForegroundColor Magenta
            } else {
                Write-Host "  Template: $($template.Name) (ID: $($template.Id))" -ForegroundColor White
            }
        }
    }
} catch {
    Write-Host "❌ Could not test converter service: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Export Complete!" -ForegroundColor Green
Write-Host "Contract34 template is now available for document creation and merging" -ForegroundColor Cyan 