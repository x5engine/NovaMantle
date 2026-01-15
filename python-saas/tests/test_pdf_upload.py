"""
Test PDF Upload with Real PDF File
Tests the /api/analyze endpoint with actual PDF upload
"""
import requests
import os
import json
from pathlib import Path

# Base URL
BASE_URL = "http://localhost:5000"
TEST_PDF_DIR = Path(__file__).parent

def find_test_pdf():
    """Find test PDF file in tests directory"""
    pdf_files = list(TEST_PDF_DIR.glob("*.pdf"))
    if pdf_files:
        return pdf_files[0]
    return None

def test_pdf_upload():
    """Test uploading a real PDF file"""
    print("🧪 Testing PDF Upload Endpoint...")
    print("")
    
    # Find test PDF
    pdf_path = find_test_pdf()
    if not pdf_path:
        print("❌ No PDF file found in tests directory!")
        print("   Please add a test.pdf file to python-saas/tests/")
        return False
    
    print(f"📄 Found test PDF: {pdf_path.name}")
    print(f"   Size: {pdf_path.stat().st_size} bytes")
    print("")
    
    # Check if service is running
    try:
        health_response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if health_response.status_code != 200:
            print(f"❌ Service not healthy: {health_response.status_code}")
            return False
        print("✅ Service is healthy")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Python SaaS service!")
        print("   Make sure it's running: cd python-saas && python3 app.py")
        return False
    
    print("")
    print("📤 Uploading PDF...")
    
    # Upload PDF
    try:
        with open(pdf_path, 'rb') as f:
            files = {'pdf': (pdf_path.name, f, 'application/pdf')}
            response = requests.post(
                f"{BASE_URL}/api/analyze",
                files=files,
                timeout=30
            )
        
        print(f"   Status Code: {response.status_code}")
        print("")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! PDF uploaded and analyzed")
            print("")
            print("📊 Response:")
            print(f"   Status: {data.get('status')}")
            print(f"   Risk Score: {data.get('risk_score')}")
            print(f"   Valuation: {data.get('valuation')}")
            print(f"   Asset Type: {data.get('asset_type')}")
            print(f"   Confidence: {data.get('confidence')}")
            print("")
            print("📝 Extracted Data:")
            extracted = data.get('extracted_data', {})
            for key, value in extracted.items():
                if key != 'pdf_metadata':  # Skip metadata for now
                    print(f"   {key}: {value}")
            print("")
            
            # Check for errors in metadata
            metadata = extracted.get('pdf_metadata', {})
            if 'error' in metadata:
                print(f"⚠️  Metadata warning: {metadata.get('error')}")
            else:
                print("✅ PDF metadata extracted successfully")
                if metadata.get('num_pages'):
                    print(f"   Pages: {metadata.get('num_pages')}")
            
            return True
        else:
            print(f"❌ FAILED! Status: {response.status_code}")
            print("")
            try:
                error_data = response.json()
                print("Error Response:")
                print(json.dumps(error_data, indent=2))
            except:
                print("Response Text:")
                print(response.text[:500])
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_pdf_upload()
    exit(0 if success else 1)

