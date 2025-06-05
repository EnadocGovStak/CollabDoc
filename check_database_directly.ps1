# Check SQLite Database for Templates Directly
Write-Host "🔍 Checking SQLite Database for Templates..." -ForegroundColor Green

# Try using the web application's templates debug endpoint via browser automation
$webUrl = "http://localhost:5000"

Write-Host "`n📡 Testing web application database via API..." -ForegroundColor Yellow

# First, let's try to use the debug page via a simple HTTP request
# Since it's a Blazor page, let's try to trigger the database load via JavaScript
$debugPageUrl = "$webUrl/templates/debug"

Write-Host "Debug page URL: $debugPageUrl" -ForegroundColor Cyan

# Try to hit a more direct endpoint if it exists
try {
    # Check if there's a direct API endpoint for getting templates
    $templatesResponse = Invoke-RestMethod -Uri "$webUrl/api/documents" -Method GET -ErrorAction SilentlyContinue
    if ($templatesResponse) {
        Write-Host "✅ Got response from /api/documents endpoint" -ForegroundColor Green
        if ($templatesResponse -is [array]) {
            Write-Host "Found $($templatesResponse.Count) documents total" -ForegroundColor Cyan
            $templates = $templatesResponse | Where-Object { $_.IsTemplate -eq $true }
            Write-Host "Templates in database: $($templates.Count)" -ForegroundColor Magenta
            
            foreach ($template in $templates) {
                $contractMatch = $template.Name -match "contract" -or $template.Name -match "Contract" -or $template.Name -match "Conract"
                if ($contractMatch) {
                    Write-Host "  >>> FOUND CONTRACT TEMPLATE: $($template.Name) (ID: $($template.Id))" -ForegroundColor Magenta
                } else {
                    Write-Host "  Template: $($template.Name) (ID: $($template.Id))" -ForegroundColor White
                }
            }
        }
    }
} catch {
    Write-Host "❌ Could not access /api/documents: $($_.Exception.Message)" -ForegroundColor Red
}

# Alternative: Check for any documents that might be templates
Write-Host "`n🔍 Alternative approach: Looking for any documents..." -ForegroundColor Yellow

# Check if the database file exists
$dbPaths = @(
    "Collabdoc.Web/CollabdocDb.db"
    "Collabdoc.Web/app.db"
    "CollabdocDb.db"
    "app.db"
)

foreach ($dbPath in $dbPaths) {
    if (Test-Path $dbPath) {
        Write-Host "✅ Found database file: $dbPath" -ForegroundColor Green
        $dbInfo = Get-Item $dbPath
        Write-Host "  Size: $($dbInfo.Length) bytes" -ForegroundColor Cyan
        Write-Host "  Modified: $($dbInfo.LastWriteTime)" -ForegroundColor Cyan
        break
    }
}

Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Templates created in the web app are stored in SQLite database" -ForegroundColor White
Write-Host "2. The SyncfusionDocumentConverter service uses JSON files" -ForegroundColor White
Write-Host "3. There's no synchronization between the two systems" -ForegroundColor White
Write-Host "4. Your 'Contract34' template is likely in the SQLite database" -ForegroundColor White
Write-Host "5. We need to either:" -ForegroundColor White
Write-Host "   a) Export templates from SQLite to JSON files" -ForegroundColor Cyan
Write-Host "   b) Make the converter service read from SQLite" -ForegroundColor Cyan
Write-Host "   c) Use the web app's template system directly" -ForegroundColor Cyan

Write-Host "`n🏁 Database Check Complete!" -ForegroundColor Green 