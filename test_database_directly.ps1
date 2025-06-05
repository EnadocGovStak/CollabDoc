# Test Database Templates via Web API
Write-Host "🔍 Testing Database Templates via Web Application API..." -ForegroundColor Green

$webApiBase = "http://localhost:5000"

$jsonHeaders = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Test 1: Try to access an API endpoint that lists documents/templates
Write-Host "`n📋 Test 1: Checking for API endpoints..." -ForegroundColor Yellow

# Common API endpoints to try
$endpoints = @(
    "/api/documents"
    "/api/templates" 
    "/api/Documents"
    "/api/Templates"
    "/documents/api"
    "/templates/api"
)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "  Trying: $webApiBase$endpoint" -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri "$webApiBase$endpoint" -Method GET -Headers $jsonHeaders -TimeoutSec 10 -ErrorAction SilentlyContinue
        Write-Host "  ✅ Success: $endpoint returned data" -ForegroundColor Green
        
        if ($response -is [array]) {
            Write-Host "    📊 Returned array with $($response.Count) items" -ForegroundColor Cyan
        } elseif ($response -is [object]) {
            Write-Host "    📦 Returned object with properties: $($response.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
        }
        
        # Show first few items if it's an array
        if ($response -is [array] -and $response.Count -gt 0) {
            Write-Host "    🔍 First few items:" -ForegroundColor White
            $response | Select-Object -First 3 | ForEach-Object {
                if ($_.Name) {
                    Write-Host "      - $($_.Name) (ID: $($_.Id))" -ForegroundColor White
                } else {
                    Write-Host "      - $($_)" -ForegroundColor White
                }
            }
        }
        
        Write-Host ""
        break
    } catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Try to create a simple document via API to test database connection
Write-Host "`n📝 Test 2: Testing Database Write Access..." -ForegroundColor Yellow

$testDoc = @{
    Name = "API_Test_Document_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Description = "Test document created via API to verify database connectivity"
    Content = '{"sections":[{"blocks":[{"inlines":[{"text":"Test content"}]}]}]}'
    IsTemplate = $false
    Category = "API Test"
} | ConvertTo-Json

# Try to create a document
try {
    Write-Host "  Attempting to create test document..." -ForegroundColor Gray
    $createResponse = Invoke-RestMethod -Uri "$webApiBase/api/documents" -Method POST -Headers $jsonHeaders -Body $testDoc -TimeoutSec 10 -ErrorAction SilentlyContinue
    Write-Host "  ✅ Document creation successful!" -ForegroundColor Green
    Write-Host "    📄 Created document ID: $($createResponse.Id)" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ Document creation failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try alternative endpoints
    $altEndpoints = @("/api/Documents", "/documents", "/Documents")
    foreach ($altEndpoint in $altEndpoints) {
        try {
            Write-Host "  Trying alternative endpoint: $altEndpoint" -ForegroundColor Gray
            $createResponse = Invoke-RestMethod -Uri "$webApiBase$altEndpoint" -Method POST -Headers $jsonHeaders -Body $testDoc -TimeoutSec 10 -ErrorAction SilentlyContinue
            Write-Host "  ✅ Success with $altEndpoint!" -ForegroundColor Green
            break
        } catch {
            Write-Host "  ❌ $altEndpoint also failed" -ForegroundColor Red
        }
    }
}

# Test 3: Search for your specific template
Write-Host "`n🎯 Test 3: Searching for Contract Template..." -ForegroundColor Yellow

# Try different search approaches
$searchTerms = @("Contract", "contract", "Conract34", "conract34")

foreach ($term in $searchTerms) {
    Write-Host "  Searching for: '$term'" -ForegroundColor Gray
    
    # Try various search endpoints
    $searchEndpoints = @(
        "/api/documents/search?q=$term"
        "/api/templates/search?q=$term"
        "/documents/search?query=$term"
        "/templates/search?query=$term"
    )
    
    foreach ($searchEndpoint in $searchEndpoints) {
        try {
            $searchResponse = Invoke-RestMethod -Uri "$webApiBase$searchEndpoint" -Method GET -Headers $jsonHeaders -TimeoutSec 10 -ErrorAction SilentlyContinue
            if ($searchResponse -and ($searchResponse -is [array] -and $searchResponse.Count -gt 0) -or ($searchResponse.Data -and $searchResponse.Data.Count -gt 0)) {
                Write-Host "  ✅ Found results with $searchEndpoint" -ForegroundColor Green
                $results = if ($searchResponse.Data) { $searchResponse.Data } else { $searchResponse }
                $results | ForEach-Object {
                    Write-Host "    📄 Found: $($_.Name) (ID: $($_.Id), Template: $($_.IsTemplate))" -ForegroundColor Cyan
                }
            }
        } catch {
            # Silently continue - most endpoints won't exist
        }
    }
}

Write-Host "`n🏁 Database API Test Complete!" -ForegroundColor Green
Write-Host "If no templates were found, the issue might be:" -ForegroundColor Yellow
Write-Host "  1. Templates were created but not properly saved to the database" -ForegroundColor White
Write-Host "  2. Templates are in a different database file" -ForegroundColor White  
Write-Host "  3. The template creation process has a bug" -ForegroundColor White
Write-Host "  4. There's a caching issue preventing template retrieval" -ForegroundColor White 