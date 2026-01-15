#!/usr/bin/env python3
"""
Automated PDF Upload Test
Runs automatically and verifies the fix works
"""
import requests
import json
import sys
import time
from pathlib import Path

BASE_URL = "http://localhost:5000"
TEST_PDF = Path(__file__).parent / "test.pdf"
MAX_RETRIES = 5
RETRY_DELAY = 2

def wait_for_service():
    """Wait for service to be available"""
    print("⏳ Waiting for service to be ready...")
    for i in range(MAX_RETRIES):
        try:
            response = requests.get(f"{BASE_URL}/api/health", timeout=2)
            if response.status_code == 200:
                print("✅ Service is ready")
                return True
        except:
            pass
        time.sleep(RETRY_DELAY)
        print(f"   Retry {i+1}/{MAX_RETRIES}...")
    return False

def test_pdf_upload():
    """Test PDF upload and verify no IndirectObject errors"""
    print("\n" + "="*60)
    print("🧪 AUTOMATED PDF UPLOAD TEST")
    print("="*60 + "\n")
    
    # Check if PDF exists
    if not TEST_PDF.exists():
        print(f"❌ ERROR: Test PDF not found at {TEST_PDF}")
        print("   Please ensure test.pdf is in python-saas/tests/")
        return False
    
    print(f"📄 Test PDF: {TEST_PDF.name} ({TEST_PDF.stat().st_size} bytes)\n")
    
    # Wait for service
    if not wait_for_service():
        print("❌ ERROR: Service not available after retries")
        return False
    
    # Upload PDF
    print("\n📤 Uploading PDF...")
    try:
        with open(TEST_PDF, 'rb') as f:
            files = {'pdf': (TEST_PDF.name, f, 'application/pdf')}
            response = requests.post(
                f"{BASE_URL}/api/analyze",
                files=files,
                timeout=30
            )
        
        print(f"   Status: {response.status_code}")
        
        # Verify status
        if response.status_code != 200:
            print(f"\n❌ FAILED: Status code {response.status_code}")
            try:
                error = response.json()
                print(f"   Error: {error.get('message', 'Unknown error')}")
            except:
                print(f"   Response: {response.text[:200]}")
            return False
        
        # Parse response
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            print(f"\n❌ FAILED: Invalid JSON response")
            print(f"   Error: {e}")
            print(f"   Response: {response.text[:200]}")
            return False
        
        # Verify response structure
        print("\n✅ Response received successfully")
        print(f"   Status: {data.get('status')}")
        print(f"   Risk Score: {data.get('risk_score')}")
        print(f"   Valuation: {data.get('valuation')}")
        
        # Check for IndirectObject errors
        response_str = json.dumps(data)
        if 'IndirectObject' in response_str:
            print("\n❌ FAILED: IndirectObject found in response!")
            print("   The fix did not work properly")
            return False
        
        # Verify metadata extraction
        extracted_data = data.get('extracted_data', {})
        metadata = extracted_data.get('pdf_metadata', {})
        
        if 'error' in metadata and 'IndirectObject' in str(metadata.get('error', '')):
            print("\n❌ FAILED: IndirectObject error in metadata!")
            return False
        
        # Verify all metadata values are serializable
        try:
            json.dumps(metadata)
            print("✅ Metadata is JSON serializable")
        except (TypeError, ValueError) as e:
            print(f"\n❌ FAILED: Metadata not JSON serializable: {e}")
            return False
        
        # Success
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED")
        print("="*60)
        print("\n✅ PDF uploaded successfully")
        print("✅ No IndirectObject errors")
        print("✅ Metadata extracted correctly")
        print("✅ Response is valid JSON")
        print(f"✅ Extracted {extracted_data.get('text_length', 0)} characters")
        print(f"✅ PDF has {metadata.get('num_pages', 0)} page(s)")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ FAILED: Request error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ FAILED: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_pdf_upload()
    sys.exit(0 if success else 1)

