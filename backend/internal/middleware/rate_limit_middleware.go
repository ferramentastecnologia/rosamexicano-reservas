package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// IPRateLimiter manages rate limiters per IP address
type IPRateLimiter struct {
	ips map[string]*rate.Limiter
	mu  *sync.RWMutex
	r   rate.Limit
	b   int
}

// NewIPRateLimiter creates a new IP rate limiter
func NewIPRateLimiter(requestsPerSecond float64, burst int) *IPRateLimiter {
	return &IPRateLimiter{
		ips: make(map[string]*rate.Limiter),
		mu:  &sync.RWMutex{},
		r:   rate.Limit(requestsPerSecond),
		b:   burst,
	}
}

// GetLimiter returns or creates a limiter for the given IP
func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	limiter, exists := i.ips[ip]
	if !exists {
		limiter = rate.NewLimiter(i.r, i.b)
		i.ips[ip] = limiter
	}

	return limiter
}

// RateLimitMiddleware applies rate limiting based on IP address
func RateLimitMiddleware(requestsPerSecond float64, burst int) gin.HandlerFunc {
	limiter := NewIPRateLimiter(requestsPerSecond, burst)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		ipLimiter := limiter.GetLimiter(ip)

		if !ipLimiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// StrictRateLimitMiddleware applies stricter rate limiting for sensitive endpoints
func StrictRateLimitMiddleware() gin.HandlerFunc {
	// 5 requests per minute for auth endpoints
	limiter := NewIPRateLimiter(rate.Every(time.Minute/5), 1)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		ipLimiter := limiter.GetLimiter(ip)

		if !ipLimiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Too many authentication attempts. Please try again in a few minutes.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// WebhookRateLimitMiddleware applies rate limiting for webhook endpoints
func WebhookRateLimitMiddleware() gin.HandlerFunc {
	// 100 requests per minute for webhooks
	limiter := NewIPRateLimiter(rate.Every(time.Minute/100), 10)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		ipLimiter := limiter.GetLimiter(ip)

		if !ipLimiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Webhook rate limit exceeded.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// DynamicRateLimitMiddleware applies rate limiting based on authentication status
func DynamicRateLimitMiddleware() gin.HandlerFunc {
	// Unauthenticated: 30 req/min
	// Authenticated: 300 req/min
	unAuthLimiter := NewIPRateLimiter(rate.Every(time.Minute/30), 5)
	authLimiter := NewIPRateLimiter(rate.Every(time.Minute/300), 50)

	return func(c *gin.Context) {
		ip := c.ClientIP()

		// Check if user is authenticated
		userID, exists := c.Get("user_id")
		var ipLimiter *rate.Limiter

		if exists && userID != nil {
			// Use authenticated limiter
			ipLimiter = authLimiter.GetLimiter(fmt.Sprintf("auth:%s", ip))
		} else {
			// Use unauthenticated limiter
			ipLimiter = unAuthLimiter.GetLimiter(fmt.Sprintf("unauth:%s", ip))
		}

		if !ipLimiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Rate limit exceeded. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
