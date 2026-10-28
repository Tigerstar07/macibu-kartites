"""Izveido lokālo konfigurāciju, nepārrakstot esošu .env failu."""

import secrets
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

target = Path(__file__).resolve().parent / ".env"
try:
    with target.open("x", encoding="utf-8") as output:
        output.write(f"JWT_SECRET={secrets.token_urlsafe(48)}\nFRONTEND_URL=http://localhost:5173\nACCESS_TOKEN_MINUTES=1440\n")
    print("Izveidots backend/.env ar jaunu nejaušu JWT atslēgu.")
except FileExistsError:
    print("backend/.env jau pastāv. Esošā konfigurācija saglabāta.")
