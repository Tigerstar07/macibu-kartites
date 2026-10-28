import os
import tempfile

import pytest
from fastapi.testclient import TestClient

_database = tempfile.TemporaryDirectory(prefix="rrv-auth-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{_database.name}/test.db"
os.environ["JWT_SECRET"] = "test-secret-only-not-for-real-accounts-123456789"

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def cleanup_database():
    yield
    engine.dispose()
    _database.cleanup()


@pytest.fixture
def client():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def account():
    return {"email": "Roberts@example.com", "password": "Testa-parole-123", "display_name": " Roberts "}
