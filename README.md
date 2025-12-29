# Label Insight Engine

Monorepo with backend (Express + MongoDB) and frontend (React + Vite) to extract structured insights from product labels.

## Structure
- `backend/` — REST API: parse, normalize, rule/AI extract, persist
- `frontend/` — UI: upload labels, view extraction results

## Quickstart

Backend:
```
cd backend
npm install
npm run dev
```

Frontend (defaults to `http://localhost:4000/api/labels`):
```
cd frontend
npm install
npm run dev
```
Optionally set the API base:
```
VITE_API_URL=http://localhost:4000/api/labels npm run dev
```

## Notes
- Image OCR is a placeholder; integrate a real OCR provider for production.
- Gemini SDK is lazy-loaded; if not installed or API key missing, AI output will be empty but endpoints still work.
