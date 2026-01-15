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
            Dictionary with PDF metadata (all values converted to strings)
        """
        def safe_get_metadata(metadata_dict, key, default=''):
            """Safely extract metadata value, handling IndirectObject types"""
            try:
                value = metadata_dict.get(key, default)
                # Handle IndirectObject and other non-serializable types
                if hasattr(value, '__str__'):
                    # Convert to string, handling IndirectObject
                    str_value = str(value)
                    # If it's an IndirectObject representation, try to get actual value
                    if 'IndirectObject' in str(type(value)):
                        try:
                            # Try to resolve the indirect object
                            if hasattr(value, 'get_object'):
                                resolved = value.get_object()
                                return str(resolved) if resolved else default
                        except:
                            pass
                    return str_value
                return str(value) if value else default
            except Exception:
                return default
        
        try:
            pdf_file = io.BytesIO(pdf_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            metadata = pdf_reader.metadata or {}
            
            return {
                'title': safe_get_metadata(metadata, '/Title', ''),
                'author': safe_get_metadata(metadata, '/Author', ''),
                'subject': safe_get_metadata(metadata, '/Subject', ''),
                'creator': safe_get_metadata(metadata, '/Creator', ''),
                'producer': safe_get_metadata(metadata, '/Producer', ''),
                'creation_date': safe_get_metadata(metadata, '/CreationDate', ''),
                'modification_date': safe_get_metadata(metadata, '/ModDate', ''),
                'num_pages': len(pdf_reader.pages)
            }
        except Exception as e:
            return {
                'error': str(e),
                'num_pages': 0
            }
