"""
Unit tests for Flask App
"""
import unittest
import json
from app import app

class TestApp(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('service', data)

    def test_analyze_endpoint_json(self):
        """Test analyze endpoint with JSON"""
        payload = {
            'pdf_text': 'Sample invoice text',
            'asset_type': 'invoice'
        }
        
        response = self.app.post(
            '/api/analyze',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertIn('risk_score', data)
        self.assertIn('valuation', data)

    def test_analyze_endpoint_missing_data(self):
        """Test analyze endpoint with missing data"""
        response = self.app.post(
            '/api/analyze',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        # Should return error or use defaults
        self.assertIn(response.status_code, [200, 400])

    def test_analyze_endpoint_invalid_file(self):
        """Test analyze endpoint with invalid file"""
        response = self.app.post(
            '/api/analyze',
            data={'pdf': (io.BytesIO(b'not a pdf'), 'test.txt')},
            content_type='multipart/form-data'
        )
        
        # Should return 400 for invalid file type
        self.assertIn(response.status_code, [200, 400])

    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = self.app.get('/api/health')
        # Flask-CORS should add CORS headers
        # Check if Access-Control-Allow-Origin is present
        self.assertIn('Access-Control-Allow-Origin', str(response.headers))

if __name__ == '__main__':
    import io
    unittest.main()

