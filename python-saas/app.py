"""
MantleForge Python Risk Analysis SaaS
Provides AI-powered risk analysis for RWA assets
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from risk_analyzer import RiskAnalyzer
from pdf_parser import PDFParser

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
PORT = int(os.getenv("PORT", 5000))
# Note: AI analysis is handled by backend using EmbedAPI
# This service focuses on PDF parsing and data extraction

# Initialize services
risk_analyzer = RiskAnalyzer()
pdf_parser = PDFParser()

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "mantle-forge-risk-analyzer"
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_asset():
    """
    Main risk analysis endpoint
    Accepts PDF upload (multipart/form-data) or JSON with pdf_text
    Returns risk score and analysis
    """
    try:
        pdf_text = ''
        pdf_bytes = None
        asset_type = 'invoice'
        
        # Check if PDF file was uploaded (multipart/form-data)
        if 'pdf' in request.files:
            file = request.files['pdf']
            if file and file.filename:
                if not file.filename.endswith('.pdf'):
                    return jsonify({
                        "status": "error",
                        "message": "Only PDF files are supported"
                    }), 400
                
                # Read PDF bytes
                pdf_bytes = file.read()
                
                # Extract text from PDF
                try:
                    pdf_text = pdf_parser.extract_text(pdf_bytes)
                    if not pdf_text or len(pdf_text.strip()) < 10:
                        return jsonify({
                            "status": "error",
                            "message": "Could not extract text from PDF. File may be corrupted or image-based."
                        }), 400
                except Exception as e:
                    return jsonify({
                        "status": "error",
                        "message": f"PDF parsing failed: {str(e)}"
                    }), 400
        
        # Check for JSON data (alternative method)
        elif request.is_json:
            data = request.json or {}
            pdf_text = data.get('pdf_text', '')
            asset_type = data.get('asset_type', 'invoice')
            
            if not pdf_text:
                return jsonify({
                    "status": "error",
                    "message": "No PDF file or pdf_text provided"
                }), 400
        else:
            return jsonify({
                "status": "error",
                "message": "No PDF file or pdf_text provided"
            }), 400
        
        # Perform risk analysis
        # Note: Actual AI analysis is done by backend using EmbedAPI
        # This service provides PDF parsing and basic risk scoring
        analysis_result = risk_analyzer.analyze(pdf_text, asset_type)
        
        # Extract metadata if PDF was provided
        metadata = {}
        if pdf_bytes:
            try:
                metadata = pdf_parser.extract_metadata(pdf_bytes)
                # Ensure all metadata values are JSON-serializable
                metadata = {k: str(v) if not isinstance(v, (str, int, float, bool, type(None))) else v 
                           for k, v in metadata.items()}
            except Exception as e:
                # Log error but don't fail the request
                print(f"Warning: Metadata extraction failed: {e}")
                metadata = {'error': 'Metadata extraction failed', 'num_pages': 0}
        
        return jsonify({
            "status": "success",
            "risk_score": analysis_result["risk_score"],
            "valuation": analysis_result["valuation"],
            "asset_type": asset_type,
            "extracted_data": {
                **analysis_result["extracted_data"],
                "pdf_metadata": metadata,
                "text_length": len(pdf_text)
            },
            "confidence": analysis_result.get("confidence", 0.85),
            "pdf_text": pdf_text[:1000]  # First 1000 chars for backend AI analysis
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    print(f"🚀 MantleForge Risk Analyzer starting on port {PORT}")
    print(f"📊 AI Analysis: Handled by backend (EmbedAPI + Claude)")
    app.run(host='0.0.0.0', port=PORT, debug=True)

