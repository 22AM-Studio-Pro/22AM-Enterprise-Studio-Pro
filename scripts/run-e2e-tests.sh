#!/bin/bash

# End-to-End Test Runner
# Runs the complete integration test suite

set -e

echo "🧪 Running End-to-End Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
  local test_name=$1
  local test_command=$2

  echo -e "${YELLOW}→ $test_name${NC}"
  if eval "$test_command"; then
    echo -e "${GREEN}✓ $test_name passed${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ $test_name failed${NC}"
    ((TESTS_FAILED++))
  fi
  echo ""
}

# Test 1: Platform Initialization
run_test "Platform Initialization" "npm run test -- e2e.integration.test.ts"

# Test 2: Full Pipeline
run_test "Full Pipeline" "npm run test -- e2e.full-pipeline.test.ts"

# Test 3: Configuration & Secrets
run_test "Configuration & Secrets" "npm run test -- config"

# Test 4: Error Handling
run_test "Error Handling" "npm run test -- error"

echo ""
echo "═══════════════════════════════════════"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo "═══════════════════════════════════════"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
