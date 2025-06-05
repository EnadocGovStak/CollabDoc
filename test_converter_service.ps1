# Test SyncfusionDocumentConverter Service Templates
Write-Host "Testing SyncfusionDocumentConverter Service (Port 5003)..." -ForegroundColor Green

$converterApiBase = "http://localhost:5003"

# Test health endpoint
Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$converterApiBase/api/health" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: Service is healthy" -ForegroundColor Green
    Write-Host "Service: $($health.service)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Health check failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test templates endpoint
Write-Host "`nTesting templates endpoint..." -ForegroundColor Yellow
try {
    $templates = Invoke-RestMethod -Uri "$converterApiBase/api/templates" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: Found templates endpoint" -ForegroundColor Green
    
    if ($templates.Success -and $templates.Data) {
        Write-Host "Found $($templates.Data.Count) templates:" -ForegroundColor Cyan
        foreach ($template in $templates.Data) {
            if ($template.Name -match "contract" -or $template.Name -match "Contract") {
                Write-Host "  >>> FOUND CONTRACT: $($template.Name) (ID: $($template.Id))" -ForegroundColor Magenta
            } else {
                Write-Host "  Template: $($template.Name) (ID: $($template.Id))" -ForegroundColor White
            }
        }
    } else {
        Write-Host "No templates found in response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAILED: Templates endpoint failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Check templates directory
Write-Host "`nChecking templates directory..." -ForegroundColor Yellow
$templatesDir = "SyncfusionDocumentConverter/templates"
if (Test-Path $templatesDir) {
    $templateFiles = Get-ChildItem $templatesDir -Filter "*.json"
    Write-Host "Found $($templateFiles.Count) template files:" -ForegroundColor Cyan
    foreach ($file in $templateFiles) {
        Write-Host "  File: $($file.Name)" -ForegroundColor White
        if ($file.Name -match "contract" -or $file.Name -match "Contract") {
            Write-Host "    >>> CONTRACT TEMPLATE FILE FOUND!" -ForegroundColor Magenta
        }
    }
} else {
    Write-Host "Templates directory not found at: $templatesDir" -ForegroundColor Yellow
}

Write-Host "`nTest complete!" -ForegroundColor Green 