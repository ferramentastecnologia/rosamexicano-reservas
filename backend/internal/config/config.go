package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	Port    string
	GinMode string

	// Database
	DatabaseURL string
	AutoMigrate bool

	// JWT
	JWTAccessSecret  string
	JWTRefreshSecret string

	// Encryption
	EncryptionKey string

	// Asaas
	AsaasAPIURL       string
	AsaasAPIKey       string
	AsaasWebhookSecret string

	// Email
	EmailHost string
	EmailPort int
	EmailUser string
	EmailPass string

	// CORS
	FrontendURL      string
	AdminFrontendURL string

	// Redis
	RedisURL string

	// Rate Limiting
	RateLimitRequests int
	RateLimitWindow   string

	// Logging
	LogLevel string

	// Environment
	Environment string
}

func Load() *Config {
	// Load .env file (optional, if it exists)
	_ = godotenv.Load()

	cfg := &Config{
		Port:              getEnv("PORT", "8080"),
		GinMode:           getEnv("GIN_MODE", "debug"),
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		AutoMigrate:       getEnvBool("AUTO_MIGRATE", true),
		JWTAccessSecret:   getEnv("JWT_ACCESS_SECRET", ""),
		JWTRefreshSecret:  getEnv("JWT_REFRESH_SECRET", ""),
		EncryptionKey:     getEnv("ENCRYPTION_KEY", ""),
		AsaasAPIURL:       getEnv("ASAAS_API_URL", "https://sandbox.asaas.com/api/v3"),
		AsaasAPIKey:       getEnv("ASAAS_API_KEY", ""),
		AsaasWebhookSecret: getEnv("ASAAS_WEBHOOK_SECRET", ""),
		EmailHost:         getEnv("EMAIL_HOST", "smtp.gmail.com"),
		EmailPort:         getEnvInt("EMAIL_PORT", 587),
		EmailUser:         getEnv("EMAIL_USER", ""),
		EmailPass:         getEnv("EMAIL_PASS", ""),
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:3000"),
		AdminFrontendURL:  getEnv("ADMIN_FRONTEND_URL", "http://localhost:3000"),
		RedisURL:          getEnv("REDIS_URL", "redis://localhost:6379"),
		RateLimitRequests: getEnvInt("RATE_LIMIT_REQUESTS", 10),
		RateLimitWindow:   getEnv("RATE_LIMIT_WINDOW", "1s"),
		LogLevel:          getEnv("LOG_LEVEL", "debug"),
		Environment:       getEnv("ENVIRONMENT", "development"),
	}

	// Validate required fields
	cfg.validate()

	return cfg
}

func (c *Config) validate() {
	required := map[string]string{
		"DATABASE_URL":         c.DatabaseURL,
		"JWT_ACCESS_SECRET":    c.JWTAccessSecret,
		"JWT_REFRESH_SECRET":   c.JWTRefreshSecret,
		"ENCRYPTION_KEY":       c.EncryptionKey,
		"ASAAS_API_KEY":        c.AsaasAPIKey,
		"ASAAS_WEBHOOK_SECRET": c.AsaasWebhookSecret,
		"EMAIL_USER":           c.EmailUser,
		"EMAIL_PASS":           c.EmailPass,
	}

	for key, value := range required {
		if value == "" {
			log.Fatalf("Missing required environment variable: %s", key)
		}
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		parsed, err := strconv.ParseBool(value)
		if err == nil {
			return parsed
		}
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		parsed, err := strconv.Atoi(value)
		if err == nil {
			return parsed
		}
	}
	return defaultValue
}

func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

func (c *Config) String() string {
	return fmt.Sprintf(`
	=== Configuration ===
	Port:            %s
	Gin Mode:        %s
	Environment:     %s
	Database:        %s
	Frontend URL:    %s
	Asaas URL:       %s
	Email:           %s
	Redis:           %s
	===================
	`, c.Port, c.GinMode, c.Environment, "PostgreSQL", c.FrontendURL, c.AsaasAPIURL, c.EmailUser, c.RedisURL)
}
