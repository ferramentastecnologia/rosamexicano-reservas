package middleware

import (
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupCORS configures CORS settings for the application
func SetupCORS() gin.HandlerFunc {
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	// Parse multiple allowed origins if separated by comma
	var allowedOrigins []string
	for _, origin := range strings.Split(frontendURL, ",") {
		allowedOrigins = append(allowedOrigins, strings.TrimSpace(origin))
	}

	config := cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-CSRF-Token", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	return cors.New(config)
}

// AllowOrigins returns the configured allowed origins
func AllowOrigins() []string {
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		return []string{"http://localhost:3000"}
	}

	var origins []string
	for _, origin := range strings.Split(frontendURL, ",") {
		origins = append(origins, strings.TrimSpace(origin))
	}

	return origins
}

// IsAllowedOrigin checks if a given origin is allowed
func IsAllowedOrigin(origin string) bool {
	allowed := AllowOrigins()
	for _, o := range allowed {
		if o == origin || o == "*" {
			return true
		}
	}
	return false
}
