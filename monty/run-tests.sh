#!/bin/bash

# Monty Test Runner
# Comprehensive test execution script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Print section header
print_header() {
    echo ""
    print_color "$BLUE" "=========================================="
    print_color "$BLUE" "$1"
    print_color "$BLUE" "=========================================="
    echo ""
}

# Check if servers are running
check_servers() {
    print_header "Checking Servers"
    
    # Check backend
    if curl -s http://localhost:5002/api/files > /dev/null 2>&1; then
        print_color "$GREEN" "✓ Backend server is running (port 5002)"
    else
        print_color "$RED" "✗ Backend server is NOT running (port 5002)"
        print_color "$YELLOW" "  Please start backend: cd dev-agent/backend && npm start"
        exit 1
    fi
    
    # Check frontend
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        print_color "$GREEN" "✓ Frontend server is running (port 3001)"
    else
        print_color "$YELLOW" "⚠ Frontend server is NOT running (port 3001)"
        print_color "$YELLOW" "  E2E tests will be skipped"
        SKIP_E2E=true
    fi
}

# Install dependencies
install_deps() {
    print_header "Installing Dependencies"
    
    if [ ! -d "node_modules" ]; then
        print_color "$YELLOW" "Installing npm packages..."
        npm install
        print_color "$GREEN" "✓ Dependencies installed"
    else
        print_color "$GREEN" "✓ Dependencies already installed"
    fi
}

# Run backend tests
run_backend_tests() {
    print_header "Running Backend Tests"
    npm run test:backend
}

# Run frontend tests
run_frontend_tests() {
    print_header "Running Frontend Tests"
    npm run test:frontend
}

# Run integration tests
run_integration_tests() {
    print_header "Running Integration Tests"
    npm run test:integration
}

# Run E2E tests
run_e2e_tests() {
    if [ "$SKIP_E2E" = true ]; then
        print_color "$YELLOW" "Skipping E2E tests (frontend not running)"
        return
    fi
    
    print_header "Running E2E Tests"
    npm run test:e2e
}

# Run performance tests
run_performance_tests() {
    print_header "Running Performance Tests"
    npm run test:performance
}

# Generate coverage report
generate_coverage() {
    print_header "Generating Coverage Report"
    npm run test:coverage
    
    if [ -f "reports/coverage/index.html" ]; then
        print_color "$GREEN" "✓ Coverage report generated"
        print_color "$BLUE" "  Open: reports/coverage/index.html"
    fi
}

# Main execution
main() {
    print_header "Monty Testing Framework"
    print_color "$BLUE" "Starting comprehensive test suite..."
    
    # Parse arguments
    TEST_TYPE=${1:-all}
    
    case $TEST_TYPE in
        backend)
            check_servers
            run_backend_tests
            ;;
        frontend)
            run_frontend_tests
            ;;
        integration)
            check_servers
            run_integration_tests
            ;;
        e2e)
            check_servers
            run_e2e_tests
            ;;
        performance)
            check_servers
            run_performance_tests
            ;;
        coverage)
            check_servers
            generate_coverage
            ;;
        all)
            install_deps
            check_servers
            run_backend_tests
            run_frontend_tests
            run_integration_tests
            run_e2e_tests
            run_performance_tests
            generate_coverage
            ;;
        *)
            print_color "$RED" "Unknown test type: $TEST_TYPE"
            echo ""
            echo "Usage: ./run-tests.sh [test-type]"
            echo ""
            echo "Test types:"
            echo "  all          - Run all tests (default)"
            echo "  backend      - Run backend tests only"
            echo "  frontend     - Run frontend tests only"
            echo "  integration  - Run integration tests only"
            echo "  e2e          - Run E2E tests only"
            echo "  performance  - Run performance tests only"
            echo "  coverage     - Generate coverage report"
            exit 1
            ;;
    esac
    
    print_header "Test Suite Complete"
    print_color "$GREEN" "✓ All tests passed!"
}

# Run main function
main "$@"

