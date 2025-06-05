# Simple Database Check
Write-Host "Checking Database for Templates..." -ForegroundColor Green

$webUrl = "http://localhost:5000"

# Check if database files exist
Write-Host "`nChecking for database files..." -ForegroundColor Yellow
$dbPaths = @(
    "Collabdoc.Web/CollabdocDb.db"
    "Collabdoc.Web/app.db"
)

foreach ($dbPath in $dbPaths) {
    if (Test-Path $dbPath) {
        Write-Host "FOUND DATABASE: $dbPath" -ForegroundColor Green
        $dbInfo = Get-Item $dbPath
        Write-Host "  Size: $($dbInfo.Length) bytes" -ForegroundColor Cyan
        Write-Host "  Modified: $($dbInfo.LastWriteTime)" -ForegroundColor Cyan
    }
}

Write-Host "`nTesting database via API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$webUrl/api/documents" -Method GET -ErrorAction Stop
    Write-Host "SUCCESS: API returned data" -ForegroundColor Green
    Write-Host "Response type: $($response.GetType().Name)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nCONCLUSION:" -ForegroundColor Yellow
Write-Host "Your Contract34 template is likely in the SQLite database" -ForegroundColor White
Write-Host "but the SyncfusionDocumentConverter service cannot see it" -ForegroundColor White
Write-Host "because it only looks at JSON files in templates/ directory" -ForegroundColor White

Write-Host "`nNEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Export template from database to JSON file" -ForegroundColor White
Write-Host "2. Or use the web app template system instead" -ForegroundColor White

Write-Host "`nTest complete!" -ForegroundColor Green 