"""
Unit tests for Risk Analyzer
"""
import unittest
import os
from unittest.mock import patch, MagicMock
from risk_analyzer import RiskAnalyzer

class TestRiskAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = RiskAnalyzer()

    def test_analyze_with_mock_data(self):
        """Test risk analysis with mock data"""
        result = self.analyzer.analyze("Sample invoice text", "invoice")
        
        self.assertIsInstance(result, dict)
        self.assertIn('risk_score', result)
        self.assertIn('valuation', result)
        self.assertIn('extracted_data', result)
        self.assertIn('confidence', result)
        
        # Check value ranges
        self.assertGreaterEqual(result['risk_score'], 0)
        self.assertLessEqual(result['risk_score'], 100)
        self.assertGreater(result['valuation'], 0)
        self.assertGreaterEqual(result['confidence'], 0)
        self.assertLessEqual(result['confidence'], 1)

    def test_analyze_different_asset_types(self):
        """Test analysis for different asset types"""
        asset_types = ['invoice', 'real_estate', 'bond']
        
        for asset_type in asset_types:
            result = self.analyzer.analyze("Sample text", asset_type)
            self.assertIsInstance(result, dict)
            self.assertIn('risk_score', result)

    def test_mock_analysis(self):
        """Test mock analysis fallback"""
        result = self.analyzer._mock_analysis('invoice')
        
        self.assertEqual(result['risk_score'], 10)  # Base risk for invoice
        self.assertEqual(result['valuation'], 150000)
        self.assertIn('extracted_data', result)

    @patch.dict(os.environ, {'USE_BACKEND_AI': 'true'})
    def test_analyze_via_backend(self):
        """Test analysis via backend"""
        result = self.analyzer._analyze_via_backend("Sample text", "invoice")
        self.assertIsInstance(result, dict)

    def test_empty_text(self):
        """Test analysis with empty text"""
        result = self.analyzer.analyze("", "invoice")
        self.assertIsInstance(result, dict)
        self.assertIn('risk_score', result)

if __name__ == '__main__':
    unittest.main()

