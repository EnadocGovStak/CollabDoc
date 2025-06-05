# PowerShell script to run DirectDocx tests
param(
    [string]$TestType = "all",
    [switch]$Coverage = $false,
    [switch]$Verbose = $false
)

Write-Host "🧪 DirectDocx Test Runner" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Set test project path
$TestProject = "SyncfusionDocumentConverter.Tests"

# Check if test project exists
if (!(Test-Path $TestProject)) {
    Write-Host "❌ Test project not found: $TestProject" -ForegroundColor Red
    exit 1
}

# Build the solution first
Write-Host "🔨 Building solution..." -ForegroundColor Yellow
dotnet build --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Prepare test command
$TestCommand = "dotnet test $TestProject --configuration Release --no-build"

# Add verbosity if requested
if ($Verbose) {
    $TestCommand += " --logger `"console;verbosity=detailed`""
}

# Add coverage if requested
if ($Coverage) {
    $TestCommand += " --collect:`"XPlat Code Coverage`""
    Write-Host "📊 Code coverage enabled" -ForegroundColor Green
}

# Run tests based on type
switch ($TestType.ToLower()) {
    "unit" {
        Write-Host "🔬 Running Unit Tests..." -ForegroundColor Green
        $TestCommand += " --filter `"Category=Unit`""
    }
    "integration" {
        Write-Host "🌐 Running Integration Tests..." -ForegroundColor Green
        $TestCommand += " --filter `"Category=Integration`""
    }
    "performance" {
        Write-Host "⚡ Running Performance Tests..." -ForegroundColor Green
        $TestCommand += " --filter `"Category=Performance`""
    }
    "service" {
        Write-Host "🔧 Running Service Tests..." -ForegroundColor Green
        $TestCommand += " --filter `"DirectDocxServiceTests`""
    }
    "controller" {
        Write-Host "🎮 Running Controller Tests..." -ForegroundColor Green
        $TestCommand += " --filter `"DirectDocxControllerTests`""
    }
    "all" {
        Write-Host "🚀 Running All Tests..." -ForegroundColor Green
    }
    default {
        Write-Host "❌ Invalid test type: $TestType" -ForegroundColor Red
        Write-Host "Valid options: all, unit, integration, performance, service, controller" -ForegroundColor Yellow
        exit 1
    }
}

# Execute the test command
Write-Host "Executing: $TestCommand" -ForegroundColor Gray
Invoke-Expression $TestCommand

# Check test results
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    
    if ($Coverage) {
        Write-Host "📊 Coverage report generated in TestResults folder" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Test execution completed!" -ForegroundColor Cyan 