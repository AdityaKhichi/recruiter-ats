# Project Title

Recruiter AI ATS

---

## Overview

Recruiter AI ATS is a full-stack applicant tracking system built with FastAPI (backend), React + Vite (frontend), PostgreSQL (database), and OpenAI for resume parsing and fit scoring. The project is production-ready and containerized with Docker so reviewers can run the full application with a single command.

Core technologies

- FastAPI (backend)
- React + Vite (frontend)
- PostgreSQL (database)
- OpenAI (resume parsing & fit scoring)
- Docker / docker-compose (infra)

---

## Features

- Authentication (JWT)
- Jobs CRUD
- Candidates CRUD
- Resume Upload
- Resume Parsing (PDF extraction + OpenAI)
- AI Fit Scoring (OpenAI)
- JWT Authentication
- Docker support for easy setup

---

## Tech Stack

- Backend: Python, FastAPI, SQLModel / SQLAlchemy, Alembic
- Frontend: React, Vite, TypeScript
- Database: PostgreSQL
- AI: OpenAI API
- Infrastructure: Docker, docker-compose

---

## Architecture

High-level flow:

Frontend
↓
FastAPI backend
↓
PostgreSQL
↓
OpenAI (external)

Mermaid diagram

```mermaid
flowchart LR
  A[Frontend (React + Vite)] --> B[FastAPI Backend]
  B --> C[PostgreSQL]
  B --> D[OpenAI API]
```

AI pipeline (resume flow)

```mermaid
flowchart TD
  Upload[Resume Upload] --> Extract[PDF Extraction (PyMuPDF / pypdf)]
  Extract --> Parse[OpenAI Resume Parsing]
  Parse --> Fit[OpenAI Fit Analysis]
  Fit --> Store[Candidate Updated in Postgres]
```

---

## Folder Structure

Complete repository tree (top-level):

```
recruiter-ai/
├── backend/
│   ├── app/
│   ├── migrations/
│   ├── uploads/
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## Setup

### Prerequisites

- Docker and Docker Compose v2 installed on your machine
- An OpenAI API key (for resume parsing & fit scoring)

### Local development (recommended using Docker)

1. Copy environment files for both services and add your OpenAI key to `backend/.env`:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env

# add your OPENAI_API_KEY to backend/.env
   ```

2. Start the stack. No manual Alembic commands are required — the backend runs migrations automatically on startup.

   ```bash
   docker compose up --build
   ```

The command builds the backend and frontend images, starts PostgreSQL (with a healthcheck), runs Alembic migrations inside the backend container, and starts both services. The first run will take a few minutes while images are downloaded and Python packages installed.

### URLs

- Frontend: http://localhost:5173
- Backend (Swagger / OpenAPI): http://localhost:8000/docs
- Health endpoint: http://localhost:8000/health

If you change ports in docker-compose, update the addresses accordingly.

---

## Environment Variables

Backend (backend/.env)

- OPENAI_API_KEY - your OpenAI key
- OPENAI_MODEL - model to use (example: gpt-4.1-mini)
- DATABASE_URL - SQLAlchemy URL (docker example: postgresql+psycopg://postgres:postgres@postgres:5432/recruiter_ai)
- JWT_SECRET - secret for signing JWTs
- ACCESS_TOKEN_EXPIRE_MINUTES - token expiry in minutes

Frontend (frontend/.env)

- VITE_API_URL - base URL for API calls (example: http://127.0.0.1:8000)

Notes

- Do not commit secrets. Copy `.env.example` to `.env` and fill in secrets locally.

---

## API Overview

The backend exposes a REST API with the following groups:

- Authentication: register, login, token refresh (JWT)
- Jobs: create, read, update, delete
- Candidates: create, read, update, delete, upload resume
- Resume Upload: POST /candidates/{id}/resume — stores file and triggers parsing

Refer to the interactive docs for exact request/response shapes:

- Swagger UI: http://localhost:8000/docs

---

## AI Pipeline

When a resume is uploaded the backend performs:

1. PDF text extraction (PyMuPDF or pypdf fallback)
2. OpenAI prompt-based parsing to extract structured fields
3. OpenAI-based fit scoring against a job description
4. Persist parsed resume and analysis in the candidate record

Mermaid diagram (pipeline):

```mermaid
flowchart TD
  A[Resume Upload] --> B[PDF Extraction]
  B --> C[OpenAI Resume Parsing]
  C --> D[Parsed Resume]
  D --> E[OpenAI Fit Analysis]
  E --> F[Candidate Updated]
```

---

## Database

Primary entities:

- Recruiters (users who can sign in)
- Jobs (job postings)
- Candidates (with relationships to jobs)

Relationships: candidates may be linked to jobs they applied for; recruiters create jobs and review candidates.

---

## Screenshots

Placeholders

![screenshot-1](docs/screenshots/screen1.png)

---

## Future Improvements

1. Background processing (Celery / Redis) for long-running AI tasks
2. S3-compatible object storage for uploads
3. Vector search for resumes
4. Email notifications and workflows
5. Duplicate candidate detection and resume versioning

---

## Troubleshooting

- Docker build slow: ensure your network and Docker cache are available.
- Postgres connection issues: check `backend/.env` DATABASE_URL and that `postgres` service is running.
- PyMuPDF errors: the backend image installs PyMuPDF; if you run locally ensure `pymupdf` is installed in your venv.
- OpenAI errors: confirm `OPENAI_API_KEY` is set and valid.
- Migration issues: see Alembic migrations in backend/migrations.

---

## Submission Requirements

Documented steps to run the project for review:

1. Copy env files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Add your OpenAI key to `backend/.env` (OPENAI_API_KEY).

3. Start the stack:

   ```bash
   docker compose up --build
   ```

After the stack is healthy you should be able to open the frontend at http://localhost:5173 and the backend API docs at http://localhost:8000/docs

Test credentials

- There are no seeded production credentials. Create an account via the frontend or the API.

Assumptions

- Reviewer will run the stack on a machine with Docker and internet access (for pulling images and contacting OpenAI).

---

If anything fails during startup, consult the Troubleshooting section above and check container logs (`docker compose logs -f`).
