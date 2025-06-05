# Direct Database Template Check
Write-Host "🔍 Checking Database for All Templates..." -ForegroundColor Green

# Database path (SQLite)
$dbPath = "Collabdoc.Web/app.db"

if (-not (Test-Path $dbPath)) {
    Write-Host "❌ Database file not found at: $dbPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database file found: $dbPath" -ForegroundColor Green

# Try to use sqlite3 command line tool if available
$sqliteCommand = "sqlite3"

try {
    # Check if sqlite3 is available
    $null = Get-Command $sqliteCommand -ErrorAction Stop
    Write-Host "✅ SQLite3 command line tool available" -ForegroundColor Green
    
    # Query all documents
    Write-Host "`n📋 All Documents in Database:" -ForegroundColor Yellow
    $allDocsQuery = "SELECT Id, Name, Description, IsTemplate, Category, CreatedBy, CreatedAt FROM Documents ORDER BY CreatedAt DESC;"
    $allDocs = & $sqliteCommand $dbPath $allDocsQuery
    
    if ($allDocs) {
        Write-Host $allDocs -ForegroundColor White
    } else {
        Write-Host "No documents found" -ForegroundColor Yellow
    }
    
    # Query only templates
    Write-Host "`n🎯 Templates Only (IsTemplate = 1):" -ForegroundColor Yellow
    $templatesQuery = "SELECT Id, Name, Description, Category, CreatedBy, CreatedAt, LENGTH(Content) as ContentLength FROM Documents WHERE IsTemplate = 1 ORDER BY CreatedAt DESC;"
    $templates = & $sqliteCommand $dbPath $templatesQuery
    
    if ($templates) {
        Write-Host $templates -ForegroundColor Cyan
    } else {
        Write-Host "No templates found (IsTemplate = 1)" -ForegroundColor Yellow
    }
    
    # Search for any document containing "Contract" or "contract"
    Write-Host "`n🔍 Searching for 'Contract' in names:" -ForegroundColor Yellow
    $contractQuery = "SELECT Id, Name, Description, IsTemplate, Category, CreatedBy, CreatedAt FROM Documents WHERE LOWER(Name) LIKE '%contract%' ORDER BY CreatedAt DESC;"
    $contractDocs = & $sqliteCommand $dbPath $contractQuery
    
    if ($contractDocs) {
        Write-Host $contractDocs -ForegroundColor Magenta
    } else {
        Write-Host "No documents found containing 'contract'" -ForegroundColor Yellow
    }
    
    # Check database schema
    Write-Host "`n📊 Database Schema Info:" -ForegroundColor Yellow
    $schemaQuery = ".schema Documents"
    $schema = & $sqliteCommand $dbPath $schemaQuery
    if ($schema) {
        Write-Host $schema -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ SQLite3 command line tool not available: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 You may need to install SQLite3 command line tools" -ForegroundColor Yellow
    Write-Host "   - Download from: https://sqlite.org/download.html" -ForegroundColor White
    Write-Host "   - Or use: winget install SQLite.SQLite" -ForegroundColor White
}

Write-Host "`n🏁 Database Template Check Complete!" -ForegroundColor Green 