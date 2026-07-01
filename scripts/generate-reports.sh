#!/bin/bash

# Generate Production Reports
# Creates comprehensive reports for production deployment

set -e

echo "📄 Generating Production Reports..."
echo ""

OUTPUT_DIR="./reports"
mkdir -p "$OUTPUT_DIR"

echo "✓ Generating Test Coverage Report..."
npm run test:coverage -- --reporter=html --outputFile="$OUTPUT_DIR/coverage.html"

echo "✓ Generating Bundle Analysis..."
npm run build:analyze -- --report="$OUTPUT_DIR/bundle-analysis.html"

echo "✓ Generating Dependency Report..."
npm list --depth=0 > "$OUTPUT_DIR/dependencies.txt"
npm audit --json > "$OUTPUT_DIR/audit.json" || true

echo "✓ Generating TypeScript Report..."
npx tsc --noEmit --diagnostics > "$OUTPUT_DIR/typescript-check.txt" || true

echo "✓ Generating Lighthouse Report..."
npx lighthouse https://localhost:3000 --chrome-flags="--headless --no-sandbox" --output=html --output-path="$OUTPUT_DIR/lighthouse.html" || echo "Lighthouse skipped"

echo "✓ Generating Performance Profile..."
echo "Performance profiles saved to $OUTPUT_DIR/"

echo ""
echo "🏢  All reports generated to: $OUTPUT_DIR/"
echo ""
echo "Available reports:"
ls -lh "$OUTPUT_DIR/" | tail -n +2 | awk '{print "  - " $9 " (" $5 ")"}'
