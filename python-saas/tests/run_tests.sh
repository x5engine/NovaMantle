#!/bin/bash
# Automated test runner for PDF upload

cd "$(dirname "$0")"

echo "🧪 Running automated PDF upload tests..."
echo ""

# Check if service is running
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "⚠️  Python SaaS not running. Starting it..."
    cd ..
    python3 app.py > /tmp/python-saas.log 2>&1 &
    sleep 3
    cd tests
fi

# Run the automated test
python3 test_pdf_upload_auto.py

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
else
    echo ""
    echo "❌ Tests failed!"
fi

exit $EXIT_CODE

