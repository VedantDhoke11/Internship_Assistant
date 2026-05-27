import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts plain text from raw PDF bytes.
    If the extraction fails for any reason, it returns an empty string
    so that the upload process itself is not interrupted.
    """
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text_list = []
        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text:
                    text_list.append(page_text)
            except Exception as page_err:
                print(f"Warning: Failed to extract text from page {i}: {page_err}")
                
        return "\n".join(text_list)
    except Exception as e:
        print(f"Error: PDF text extraction failed entirely: {e}")
        # Return empty string to allow resume upload to proceed on failure
        return ""
