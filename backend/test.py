from pathlib import Path

from app.utils.pdf_parser import extract_text_from_pdf

text, pages = extract_text_from_pdf(
    Path("uploads/20220a147b1843c4871b3c8d0c7dabbd.pdf")
)

print(pages)
print(len(text))
print(text[:1000])