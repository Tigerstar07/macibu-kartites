# Backend: Mācību kartītes

Python 3.12 + FastAPI REST API (Pydantic datu validācija, SQLAlchemy ORM,
JWT autentifikācija ar lomām guest / user / admin).

## Palaišana

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Pēc pirmās palaišanas SQLite datubāze `macibu_kartites.db` tiek izveidota
automātiski. PostgreSQL izmantošanai `.env` failā nomainiet `DATABASE_URL`,
piemēram, uz `postgresql+psycopg://user:password@localhost/macibu_kartites`.

## Autentifikācija

- `POST /api/auth/register` — Gmail/e-pasta konta izveide ar paroli (vismaz 8 simboli)
- `POST /api/auth/login` — JWT piekļuves marķiera saņemšana
- `GET /api/auth/me` — pašreizējā lietotāja pārbaude
