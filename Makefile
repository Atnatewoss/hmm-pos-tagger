.PHONY: install train serve client data lint clean

PYTHON = python
UVICORN = uvicorn
SERVER = server
CLIENT = client

install: server/venv/Scripts/python.exe client/node_modules

server/venv/Scripts/python.exe: $(SERVER)/pyproject.toml
	cd $(SERVER) && $(PYTHON) -m venv venv
	cd $(SERVER) && venv/Scripts/python -m pip install --upgrade pip setuptools
	cd $(SERVER) && venv/Scripts/python -m pip install -e .
	@echo ""

client/node_modules: $(CLIENT)/package.json
	cd $(CLIENT) && npm install
	@echo ""

train: server/venv/Scripts/python.exe
	cd $(SERVER) && venv/Scripts/python scripts/train.py

serve: server/venv/Scripts/python.exe
	cd $(SERVER) && venv/Scripts/$(UVICORN) app.main:app --host 0.0.0.0 --port 8000 --reload

client:
	cd $(CLIENT) && npm run dev

data: server/venv/Scripts/python.exe
	cd $(SERVER) && venv/Scripts/python -c "from app.core.dataset import download_data; download_data('data')"

lint: server/venv/Scripts/python.exe
	cd $(SERVER) && venv/Scripts/python -m pip install ruff
	cd $(SERVER) && venv/Scripts/python -m ruff check app/ scripts/

clean:
	rm -rf $(SERVER)/venv $(CLIENT)/node_modules $(SERVER)/models $(SERVER)/data
	rm -rf $(SERVER)/**/__pycache__ $(SERVER)/**/*.pyc
