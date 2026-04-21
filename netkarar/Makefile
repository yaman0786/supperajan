# NETKARAR — Makefile (macOS / Linux)
#
# One-command setup:   make start
# Install only:        make setup
# Run servers (assume installed):  make dev
# Stop background services:        make stop
# Run backend tests:               make test

SHELL := /bin/bash
ROOT  := $(abspath $(CURDIR))
BOOT  := $(ROOT)/scripts/bootstrap.sh
STOP  := $(ROOT)/scripts/stop.sh
VENV  := $(ROOT)/backend/.venv

.PHONY: help start setup dev stop test backend frontend clean reset

help:
	@echo "Targets:"
	@echo "  make start     Full bootstrap + run backend & frontend (one command)"
	@echo "  make setup     Install backend & frontend deps, init DB, .env"
	@echo "  make dev       Start backend & frontend (assumes setup done)"
	@echo "  make backend   Run only the backend (foreground)"
	@echo "  make frontend  Run only the frontend (foreground)"
	@echo "  make test      Run backend pytest suite"
	@echo "  make stop      Stop background services started by bootstrap"
	@echo "  make clean     Remove venv, node_modules, logs, PIDs"
	@echo "  make reset     clean + remove SQLite db"

start:
	@$(BOOT)

setup:
	@$(BOOT) --setup-only

dev:
	@$(BOOT) --start-only

stop:
	@$(STOP)

backend:
	@source $(VENV)/bin/activate && cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

frontend:
	@cd frontend && npm run dev

test:
	@source $(VENV)/bin/activate && cd backend && python -m pytest

clean:
	@rm -rf $(VENV) frontend/node_modules logs .pids
	@echo "Cleaned venv, node_modules, logs, PIDs."

reset: clean
	@rm -f data/netkarar.db
	@echo "Removed SQLite database."
