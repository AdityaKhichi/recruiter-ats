FROM python:3.13-slim

# Keep Python output unbuffered (helpful for container logs)
ENV PYTHONUNBUFFERED=1

# Create a non-root user to run the app
RUN groupadd -r app && useradd --no-log-init -r -g app app

WORKDIR /app

# Install minimal system dependencies. Keep layers cache-friendly by copying
# requirements first so Python packages are cached between builds.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

# Install Python dependencies first to leverage Docker layer cache. Also
# install PyMuPDF (pymupdf) explicitly so the PDF parser (fitz) is available.
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir pymupdf

# Copy application source
COPY . /app

# Ensure the non-root user owns the application files
RUN chown -R app:app /app

# Make the entrypoint executable
RUN chmod +x /app/entrypoint.sh || true

# Run as non-root user
USER app

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]

# If an alternate command is provided, keep it as the container CMD fallback.
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
