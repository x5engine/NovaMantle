"""
Risk Analysis Module
Handles AI-powered risk scoring for RWA assets using EmbedAPI
"""
import os
import requests
from typing import Dict, Any

class RiskAnalyzer:
    def __init__(self):
        # For Python, we'll use EmbedAPI REST API
        # Or call the backend which has embedapi/core
        self.api_key = os.getenv("EMBEDAPI_KEY")
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:3000")
        self.use_backend = os.getenv("USE_BACKEND_AI", "true").lower() == "true"
        
        if not self.api_key and not self.use_backend:
            print("⚠️  EMBEDAPI_KEY not set. Risk analysis will use mock data or call backend.")
    
    def analyze(self, pdf_text: str, asset_type: str = "invoice") -> Dict[str, Any]:
        """
        Analyze asset and return risk score
        
        Args:
            pdf_text: Extracted text from PDF
            asset_type: Type of asset (invoice, real_estate, bond)
        
        Returns:
            Dictionary with risk_score, valuation, and extracted data
        """
        # Option 1: Use backend's EmbedAPI (recommended)
        if self.use_backend:
            return self._analyze_via_backend(pdf_text, asset_type)
        
        # Option 2: Use EmbedAPI REST API directly (if available)
        if self.api_key:
            return self._analyze_via_embedapi(pdf_text, asset_type)
        
        # Fallback: Mock data
        return self._mock_analysis(asset_type)
    
    def _analyze_via_backend(self, pdf_text: str, asset_type: str) -> Dict[str, Any]:
        """Call backend's EmbedAPI integration"""
        try:
            # Backend will handle the AI analysis
            # For now, return structured response
            # In production, backend can expose an /api/analyze-risk endpoint
            return self._mock_analysis(asset_type)
        except Exception as e:
            print(f"Error calling backend: {e}")
            return self._mock_analysis(asset_type)
    
    def _analyze_via_embedapi(self, pdf_text: str, asset_type: str) -> Dict[str, Any]:
        """Use EmbedAPI REST API directly"""
        try:
            # TODO: Implement EmbedAPI REST API call if available
            # For now, use mock
            return self._mock_analysis(asset_type)
        except Exception as e:
            print(f"Error in EmbedAPI analysis: {e}")
            return self._mock_analysis(asset_type)
    
    def _mock_analysis(self, asset_type: str) -> Dict[str, Any]:
        """Mock risk analysis for development"""
        base_risk = {
            "invoice": 10,
            "real_estate": 25,
            "bond": 15
        }.get(asset_type, 20)
        
        return {
            "risk_score": base_risk,
            "valuation": 150000,
            "extracted_data": {
                "amount": 150000,
                "date": "2024-01-01",
                "parties": ["Party A", "Party B"],
                "asset_type": asset_type
            },
            "confidence": 0.85
        }
