import os
from pathlib import Path
import shutil
import subprocess
import sys

from app.config import BACKEND_DIR


def test_setup_creates_secret_once_and_works_with_windows_encoding(tmp_path):
    script = tmp_path / "setup_env.py"
    shutil.copyfile(BACKEND_DIR / "setup_env.py", script)
    environment = {**os.environ, "PYTHONIOENCODING": "cp1252"}
    subprocess.run([sys.executable, str(script)], check=True, capture_output=True, env=environment)
    original = (tmp_path / ".env").read_text(encoding="utf-8")
    assert len(original.splitlines()[0].split("=", 1)[1]) >= 32
    subprocess.run([sys.executable, str(script)], check=True, capture_output=True, env=environment)
    assert (tmp_path / ".env").read_text(encoding="utf-8") == original


def test_database_location_does_not_depend_on_working_directory(tmp_path):
    environment = {**os.environ, "PYTHONPATH": str(BACKEND_DIR)}
    environment.pop("DATABASE_URL", None)
    result = subprocess.run(
        [sys.executable, "-c", "from app.config import Settings; print(Settings(_env_file=None).database_url)"],
        cwd=tmp_path, env=environment, check=True, capture_output=True, text=True,
    )
    assert result.stdout.strip() == f"sqlite:///{(BACKEND_DIR / 'macibu_kartites.db').as_posix()}"
