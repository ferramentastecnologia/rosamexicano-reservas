package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"

	"rosamexicano/api/internal/config"
	"rosamexicano/api/internal/database"
)

func main() {
	// Load configuration
	cfg := config.Load()
	log.Println(cfg.String())

	// Set Gin mode
	gin.SetMode(cfg.GinMode)

	// Connect to database
	err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer func() {
		if err := database.Close(); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}()

	// Create Gin router
	router := gin.Default()

	// Setup routes
	setupRoutes(router, cfg)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 Server starting on http://localhost%s", addr)

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("\n⏱️  Shutting down server gracefully...")
		if err := router.Run(addr); err != nil {
			log.Printf("Error: %v", err)
		}
	}()

	// Run server
	if err := router.Run(addr); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

func setupRoutes(r *gin.Engine, cfg *config.Config) {
	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"timestamp": gin.H{
				"database": database.HealthCheck(),
			},
		})
	})

	// API routes
	api := r.Group("/api")
	{
		// Public endpoints (no authentication required)
		public := api.Group("")
		{
			// Payment endpoints
			public.POST("/payments/create", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Payment endpoint (TODO)"})
			})
			public.GET("/payments/:id/status", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Payment status endpoint (TODO)"})
			})

			// Reservation endpoints
			public.POST("/reservations/check-availability", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Check availability endpoint (TODO)"})
			})
			public.POST("/tables/available", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Get available tables endpoint (TODO)"})
			})

			// Voucher endpoints
			public.GET("/vouchers/:code", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Get voucher endpoint (TODO)"})
			})

			// Webhook endpoint
			public.POST("/webhooks/asaas", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Asaas webhook endpoint (TODO)"})
			})
		}

		// Admin endpoints
		admin := api.Group("/admin")
		{
			// Auth endpoint (no authentication required)
			admin.POST("/login", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Login endpoint (TODO)"})
			})

			// Protected admin routes
			protected := admin.Group("")
			// TODO: Add auth middleware here
			{
				// Reservation management
				protected.GET("/reservations", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "List reservations endpoint (TODO)"})
				})
				protected.GET("/reservations/:id", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Get reservation endpoint (TODO)"})
				})
				protected.POST("/reservations", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Create reservation endpoint (TODO)"})
				})
				protected.PUT("/reservations/:id", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Update reservation endpoint (TODO)"})
				})
				protected.DELETE("/reservations/:id", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Delete reservation endpoint (TODO)"})
				})

				// Voucher management
				protected.GET("/vouchers", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "List vouchers endpoint (TODO)"})
				})
				protected.GET("/vouchers/:codigo", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Get voucher by code endpoint (TODO)"})
				})
				protected.POST("/vouchers/:codigo/validate", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Validate voucher endpoint (TODO)"})
				})

				// User management
				protected.GET("/users", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "List users endpoint (TODO)"})
				})
				protected.GET("/users/:id", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Get user endpoint (TODO)"})
				})
				protected.POST("/users", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Create user endpoint (TODO)"})
				})
				protected.PUT("/users/:id", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Update user endpoint (TODO)"})
				})
				protected.DELETE("/users/:id", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Delete user endpoint (TODO)"})
				})

				// Dashboard
				protected.GET("/stats", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Dashboard stats endpoint (TODO)"})
				})
				protected.GET("/reports", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Reports endpoint (TODO)"})
				})
				protected.GET("/table-occupancy", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "Table occupancy endpoint (TODO)"})
				})
			}
		}
	}

	log.Println("✓ Routes configured successfully")
}
