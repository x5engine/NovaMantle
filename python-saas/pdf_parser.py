"""
PDF Parser Module
Extracts text from PDF files using PyPDF2 and pdfplumber
"""
import PyPDF2
import pdfplumber
from typing import Optional, Dict, Any
import io

class PDFParser:
    def __init__(self):
        """Initialize PDF parser"""
        pass
    
    def extract_text_pypdf2(self, pdf_bytes: bytes) -> str:
        """
        Extract text using PyPDF2
        Good for simple PDFs
        """
        try:
            pdf_file = io.BytesIO(pdf_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise Exception(f"PyPDF2 extraction failed: {str(e)}")
    
    def extract_text_pdfplumber(self, pdf_bytes: bytes) -> str:
        """
        Extract text using pdfplumber
        Better for complex PDFs with tables
        """
        try:
            pdf_file = io.BytesIO(pdf_bytes)
            text = ""
            
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            return text.strip()
        except Exception as e:
            raise Exception(f"pdfplumber extraction failed: {str(e)}")
    
    def extract_text(self, pdf_bytes: bytes, method: str = 'auto') -> str:
        """
        Extract text from PDF bytes
        
        Args:
            pdf_bytes: PDF file as bytes
            method: 'pypdf2', 'pdfplumber', or 'auto' (tries both)
        
        Returns:
            Extracted text as string
        """
        if method == 'auto':
            # Try pdfplumber first (better for complex PDFs)
            try:
                return self.extract_text_pdfplumber(pdf_bytes)
            except:
                # Fallback to PyPDF2
                try:
                    return self.extract_text_pypdf2(pdf_bytes)
                except Exception as e:
                    raise Exception(f"Both PDF extraction methods failed. Last error: {str(e)}")
        elif method == 'pdfplumber':
            return self.extract_text_pdfplumber(pdf_bytes)
        elif method == 'pypdf2':
            return self.extract_text_pypdf2(pdf_bytes)
        else:
            raise ValueError(f"Unknown extraction method: {method}")
    
    def extract_metadata(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract metadata from PDF
        
        Returns:
            Dictionary with PDF metadata
        """
        try:
            pdf_file = io.BytesIO(pdf_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            metadata = pdf_reader.metadata or {}
            
            return {
                'title': metadata.get('/Title', ''),
                'author': metadata.get('/Author', ''),
                'subject': metadata.get('/Subject', ''),
                'creator': metadata.get('/Creator', ''),
                'producer': metadata.get('/Producer', ''),
                'creation_date': str(metadata.get('/CreationDate', '')),
                'modification_date': str(metadata.get('/ModDate', '')),
                'num_pages': len(pdf_reader.pages)
            }
        except Exception as e:
            return {
                'error': str(e),
                'num_pages': 0
            }
