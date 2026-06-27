from __future__ import annotations

from pathlib import Path

try:
    import fitz  # PyMuPDF
except Exception:  # keep ImportError broad
    fitz = None


def extract_text_from_pdf(path: Path | str) -> tuple[str, int]:
    """Extract text from a PDF file using PyMuPDF (fitz).

    Returns a tuple of (extracted_text, page_count). Raises ImportError if PyMuPDF
    is not installed, or other exceptions on failure.
    """
    if fitz is None:
        raise ImportError("PyMuPDF (fitz) is not installed")

    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"PDF file not found: {p}")

    text_parts: list[str] = []
    # open document
    doc = fitz.open(str(p))
    try:
        page_count = doc.page_count
        for page in doc:
            # get_text("text") returns plain text
            text = page.get_text("text")
            if text:
                text_parts.append(text)
    finally:
        doc.close()

    return "\n".join(text_parts), page_count
