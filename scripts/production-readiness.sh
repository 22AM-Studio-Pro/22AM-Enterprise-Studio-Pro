#!/bin/bash

# Production Readiness Verification Script
# Comprehensive checks before production deployment

set -e

echo "🚀 Production Readiness Verification"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

run_check() {
  local check_name=$1
  local check_command=$2
  local is_warning=${3:-false}

  echo -ne "${BLUE}✓${NC} $check_name... "
  if eval "$check_command" > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((CHECKS_PASSED++))
  else
    if [ "$is_warning" = true ]; then
      echo -e "${YELLOW}WARN${NC}"
      ((WARNINGS++))
    else
      echo -e "${RED}FAIL${NC}"
      ((CHECKS_FAILED++))
    fi
  fi
}

echo -e "${BLUE}=== Code Quality ===${NC}"
run_check "TypeScript Compilation" "npm run build"
run_check "ESLint" "npm run lint" true
run_check "Prettier Formatting" "npm run format:check" true

echo ""
echo -e "${BLUE}=== Testing ===${NC}"
run_check "Unit Tests" "npm run test"
run_check "Integration Tests" "npm run test:integration"
run_check "End-to-End Tests" "npm run test:e2e"
run_check "Code Coverage >= 80%" "npm run test:coverage | grep -q 'Lines.*[89][0-9]\|100'"

echo ""
echo -e "${BLUE}=== Security ===${NC}"
run_check "Dependency Audit" "npm audit --audit-level=moderate" true
run_check "Security Scan" "npm run security:scan" true
run_check "No Hardcoded Secrets" "! grep -r 'password\|api[_-]?key\|secret' src --include='*.ts' --include='*.js' | grep -v 'test\|example'"

echo ""
echo -e "${BLUE}=== Performance ===${NC}"
run_check "Bundle Size Check" "npm run build:analyze" true
run_check "Performance Benchmarks" "npm run bench" true
run_check "Memory Leak Detection" "npm run test:memory" true

echo ""
echo -e "${BLUE}=== Accessibility ===${NC}"
run_check "Accessibility Audit" "npm run audit:a11y" true

echo ""
echo -e "${BLUE}=== Database ===${NC}"
run_check "Migration Verification" "npm run db:verify-migrations"
run_check "Database Integrity" "npm run db:check-integrity"

echo ""
echo -e "${BLUE}=== Build ===${NC}"
run_check "Production Build" "npm run build:prod"
run_check "Installer Validation" "npm run validate:installer" true

echo ""
echo "═══════════════════════════════════════"
echo -e "${GREEN}✓ Passed: $CHECKS_PASSED${NC}"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS${NC}"
echo -e "${RED}✗ Failed: $CHECKS_FAILED${NC}"
echo "═══════════════════════════════════════"

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Ready for production.${NC}"
  exit 0
else
  echo -e "${RED}✗ Some critical checks failed. Please fix before deployment.${NC}"
  exit 1
fi
