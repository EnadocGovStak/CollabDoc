#!/bin/bash

# Bash script to run DirectDocx tests
TEST_TYPE=${1:-"all"}
COVERAGE=${2:-false}
VERBOSE=${3:-false}

echo "🧪 DirectDocx Test Runner"
echo "========================="

# Set test project path
TEST_PROJECT="SyncfusionDocumentConverter.Tests"

# Check if test project exists
if [ ! -d "$TEST_PROJECT" ]; then
    echo "❌ Test project not found: $TEST_PROJECT"
    exit 1
fi

# Build the solution first
echo "🔨 Building solution..."
dotnet build --configuration Release
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Prepare test command
TEST_COMMAND="dotnet test $TEST_PROJECT --configuration Release --no-build"

# Add verbosity if requested
if [ "$VERBOSE" = "true" ]; then
    TEST_COMMAND="$TEST_COMMAND --logger \"console;verbosity=detailed\""
fi

# Add coverage if requested
if [ "$COVERAGE" = "true" ]; then
    TEST_COMMAND="$TEST_COMMAND --collect:\"XPlat Code Coverage\""
    echo "📊 Code coverage enabled"
fi

# Run tests based on type
case ${TEST_TYPE,,} in
    "unit")
        echo "🔬 Running Unit Tests..."
        TEST_COMMAND="$TEST_COMMAND --filter \"Category=Unit\""
        ;;
    "integration")
        echo "🌐 Running Integration Tests..."
        TEST_COMMAND="$TEST_COMMAND --filter \"Category=Integration\""
        ;;
    "performance")
        echo "⚡ Running Performance Tests..."
        TEST_COMMAND="$TEST_COMMAND --filter \"Category=Performance\""
        ;;
    "service")
        echo "🔧 Running Service Tests..."
        TEST_COMMAND="$TEST_COMMAND --filter \"DirectDocxServiceTests\""
        ;;
    "controller")
        echo "🎮 Running Controller Tests..."
        TEST_COMMAND="$TEST_COMMAND --filter \"DirectDocxControllerTests\""
        ;;
    "all")
        echo "🚀 Running All Tests..."
        ;;
    *)
        echo "❌ Invalid test type: $TEST_TYPE"
        echo "Valid options: all, unit, integration, performance, service, controller"
        exit 1
        ;;
esac

# Execute the test command
echo "Executing: $TEST_COMMAND"
eval $TEST_COMMAND

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    
    if [ "$COVERAGE" = "true" ]; then
        echo "📊 Coverage report generated in TestResults folder"
    fi
else
    echo "❌ Some tests failed"
    exit 1
fi

echo ""
echo "🎉 Test execution completed!" 