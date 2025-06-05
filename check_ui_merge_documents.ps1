# Check documents created via UI merge
Write-Host "=== CHECKING UI MERGE DOCUMENTS ===" -ForegroundColor Green

$dbPath = "c:\Users\User\Collabdoc\Collabdoc.Web\CollabdocDb.db"

if (Test-Path $dbPath) {
    Write-Host "Database found at: $dbPath" -ForegroundColor Green
    
    # Check all documents in database
    Write-Host "`n=== ALL DOCUMENTS ===" -ForegroundColor Yellow
    sqlite3 $dbPath "SELECT Id, Name, IsTemplate, Category, CreatedAt, CreatedBy FROM Documents ORDER BY CreatedAt DESC;"
    
    # Check specifically for merged documents (recent ones)
    Write-Host "`n=== RECENT NON-TEMPLATE DOCUMENTS (Last 10) ===" -ForegroundColor Yellow  
    sqlite3 $dbPath "SELECT Id, Name, IsTemplate, Category, CreatedAt, CreatedBy, Description FROM Documents WHERE IsTemplate = 0 ORDER BY CreatedAt DESC LIMIT 10;"
    
    # Check if any documents have merge-related names
    Write-Host "`n=== DOCUMENTS WITH MERGE-RELATED NAMES ===" -ForegroundColor Yellow
    sqlite3 $dbPath "SELECT Id, Name, IsTemplate, Category, CreatedAt, CreatedBy FROM Documents WHERE (Name LIKE '%merge%' OR Name LIKE '%template%' OR Description LIKE '%merge%') AND IsTemplate = 0 ORDER BY CreatedAt DESC;"
    
    # Count documents
    Write-Host "`n=== DOCUMENT COUNTS ===" -ForegroundColor Yellow
    $totalDocs = sqlite3 $dbPath "SELECT COUNT(*) FROM Documents;"
    $templates = sqlite3 $dbPath "SELECT COUNT(*) FROM Documents WHERE IsTemplate = 1;"
    $documents = sqlite3 $dbPath "SELECT COUNT(*) FROM Documents WHERE IsTemplate = 0;"
    
    Write-Host "Total Documents: $totalDocs"
    Write-Host "Templates: $templates" 
    Write-Host "Non-Templates (Documents): $documents"
    
} else {
    Write-Host "Database not found at: $dbPath" -ForegroundColor Red
}

Write-Host "`n=== DONE ===" -ForegroundColor Green
