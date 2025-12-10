.PHONY: help build run dev test install-deps lint migrate-up migrate-down migrate-create docker-build docker-run clean

help:
	@echo "=== Rosa Mexicano API - Makefile ==="
	@echo ""
	@echo "Available commands:"
	@echo "  make install-deps    Install Go dependencies"
	@echo "  make build           Build the application"
	@echo "  make run             Run the application"
	@echo "  make dev             Run with hot reload (requires air)"
	@echo "  make test            Run tests"
	@echo "  make lint            Run linter"
	@echo "  make migrate-up      Run database migrations up"
	@echo "  make migrate-down    Rollback database migrations"
	@echo "  make migrate-create  Create new migration (use: make migrate-create name=migration_name)"
	@echo "  make docker-build    Build Docker image"
	@echo "  make docker-run      Run Docker container"
	@echo "  make clean           Clean build artifacts"
	@echo ""

install-deps:
	@echo "📦 Installing Go dependencies..."
	go mod download
	go mod tidy
	@echo "✓ Dependencies installed"

build:
	@echo "🔨 Building application..."
	go build -o bin/server cmd/server/main.go
	@echo "✓ Build complete: bin/server"

run: build
	@echo "🚀 Running application..."
	./bin/server

dev:
	@echo "🔄 Running with hot reload..."
	@command -v air > /dev/null || go install github.com/cosmtrek/air@latest
	air

test:
	@echo "🧪 Running tests..."
	go test -v ./...

lint:
	@echo "📋 Running linter..."
	@command -v golangci-lint > /dev/null || go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	golangci-lint run ./...

migrate-up:
	@echo "⬆️  Running migrations up..."
	@command -v migrate > /dev/null || (echo "migrate-tool not found. Install: https://github.com/golang-migrate/migrate" && exit 1)
	migrate -path internal/database/migrations -database "$(DATABASE_URL)" up

migrate-down:
	@echo "⬇️  Rolling back migrations..."
	@command -v migrate > /dev/null || (echo "migrate-tool not found. Install: https://github.com/golang-migrate/migrate" && exit 1)
	migrate -path internal/database/migrations -database "$(DATABASE_URL)" down

migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "Error: Please provide migration name with 'name=migration_name'"; \
		exit 1; \
	fi
	@echo "📝 Creating migration: $(name)"
	@command -v migrate > /dev/null || (echo "migrate-tool not found. Install: https://github.com/golang-migrate/migrate" && exit 1)
	migrate create -ext sql -dir internal/database/migrations -seq $(name)

docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t rosa-mexicano-api:latest .
	@echo "✓ Docker image built"

docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 8080:8080 --env-file .env rosa-mexicano-api:latest

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf bin/
	go clean
	@echo "✓ Clean complete"

.DEFAULT_GOAL := help
