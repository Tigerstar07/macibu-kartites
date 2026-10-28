from datetime import datetime, timedelta, timezone
from concurrent.futures import ThreadPoolExecutor

import pytest
import jwt
from pydantic import ValidationError
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError

from app.config import Settings, get_settings
from app.database import SessionLocal, engine
from app.models import Deck, Score, User
from app.routers import password_hash


def signed_token(payload):
    settings = get_settings()
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def test_register_hashes_password_and_creates_score_atomically(client, account):
    response = client.post("/api/auth/register", json=account)
    assert response.status_code == 201
    result = response.json()
    assert result["user"]["email"] == "roberts@example.com"
    assert result["user"]["display_name"] == "Roberts"
    assert result["user"]["role"] == "user"
    assert "password_hash" not in result["user"]
    with SessionLocal() as db:
        user = db.scalar(select(User))
        assert user.password_hash != account["password"]
        assert password_hash.verify(account["password"], user.password_hash)
        assert db.get(Score, user.id).total_rp == 0
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {result['access_token']}"})
    assert me.status_code == 200
    assert me.json() == result["user"]


def test_duplicate_email_ignores_case(client, account):
    assert client.post("/api/auth/register", json=account).status_code == 201
    account["email"] = account["email"].upper()
    assert client.post("/api/auth/register", json=account).status_code == 409


def test_concurrent_registration_creates_only_one_account(client, account):
    with ThreadPoolExecutor(max_workers=4) as executor:
        statuses = list(executor.map(lambda _: client.post("/api/auth/register", json=account).status_code, range(4)))
    assert sorted(statuses) == [201, 409, 409, 409]
    with SessionLocal() as db:
        assert len(db.scalars(select(User)).all()) == 1
        assert len(db.scalars(select(Score)).all()) == 1


@pytest.mark.parametrize("name", ["  ", " a ", "\n\t"])
def test_register_validates_trimmed_name(client, account, name):
    account["display_name"] = name
    assert client.post("/api/auth/register", json=account).status_code == 422
    with SessionLocal() as db:
        assert db.scalar(select(User)) is None


@pytest.mark.parametrize("field,value", [("email", "broken"), ("password", "short"), ("password", "a" * 129)])
def test_registration_rejects_invalid_fields(client, account, field, value):
    account[field] = value
    assert client.post("/api/auth/register", json=account).status_code == 422


def test_login_checks_password_and_normalizes_email(client, account):
    client.post("/api/auth/register", json=account)
    credentials = {"email": account["email"].upper(), "password": account["password"]}
    assert client.post("/api/auth/login", json=credentials).status_code == 200
    credentials["password"] = "wrong-password"
    wrong = client.post("/api/auth/login", json=credentials)
    credentials["email"] = "unknown@example.com"
    unknown = client.post("/api/auth/login", json=credentials)
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()
    assert wrong.headers["www-authenticate"] == "Bearer"


@pytest.mark.parametrize("subject", [None, [], {}, "bad", "-1", "0"])
def test_invalid_token_subject_returns_401(client, subject):
    token = signed_token({"sub": subject, "exp": datetime.now(timezone.utc) + timedelta(minutes=5)})
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_token_requires_expiry(client, account):
    result = client.post("/api/auth/register", json=account).json()
    token = signed_token({"sub": str(result["user"]["id"])})
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_expired_token_and_missing_token_are_rejected(client):
    token = signed_token({"sub": "1", "exp": datetime.now(timezone.utc) - timedelta(seconds=10)})
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401
    assert client.get("/api/auth/me").status_code == 401


def test_sqlite_enforces_foreign_keys(client):
    with engine.connect() as connection:
        assert connection.scalar(text("PRAGMA foreign_keys")) == 1
    with SessionLocal() as db:
        db.add(Deck(owner_id=999, title="Neesošs īpašnieks"))
        with pytest.raises(IntegrityError):
            db.commit()


def test_configuration_rejects_public_default_secret():
    with pytest.raises(ValidationError):
        Settings(jwt_secret="change-this-development-secret", _env_file=None)


def test_default_database_is_in_backend_directory():
    settings = Settings(database_url=Settings.model_fields["database_url"].default, _env_file=None)
    assert settings.database_url.replace("\\", "/").endswith("/backend/macibu_kartites.db")


def test_health_and_cors(client):
    assert client.get("/health").json() == {"status": "ok"}
    response = client.options("/api/auth/login", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "access-control-allow-origin" not in client.get("/health", headers={"Origin": "https://other.example"}).headers
