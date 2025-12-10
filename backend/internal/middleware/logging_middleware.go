package middleware

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// LoggingMiddleware logs incoming HTTP requests
func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		startTime := time.Now()

		// Process request
		c.Next()

		// Calculate duration
		duration := time.Since(startTime)

		// Get request info
		statusCode := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		clientIP := c.ClientIP()
		userID, _ := c.Get("user_id")
		requestID := c.GetString("request_id")

		// Only log if query is not empty
		if query != "" {
			path = fmt.Sprintf("%s?%s", path, query)
		}

		// Determine status color and level
		level := "INFO"
		if statusCode >= 400 && statusCode < 500 {
			level = "WARN"
		} else if statusCode >= 500 {
			level = "ERROR"
		}

		// Format user info
		user := "-"
		if userID != nil {
			user = fmt.Sprintf("%v", userID)
		}

		// Log the request
		log.Printf(
			"[%s] [%s] %s %s | Status: %d | Duration: %v | IP: %s | User: %s | RequestID: %s",
			level,
			time.Now().Format("2006-01-02 15:04:05"),
			method,
			path,
			statusCode,
			duration,
			clientIP,
			user,
			requestID,
		)
	}
}

// RequestIDMiddleware generates and sets a unique request ID
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = fmt.Sprintf("%d-%s", time.Now().UnixNano(), c.ClientIP())
		}

		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)

		c.Next()
	}
}
