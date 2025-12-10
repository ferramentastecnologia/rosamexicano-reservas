package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"rosamexicano/api/internal/models"
	"rosamexicano/api/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

// NewAuthHandler creates a new AuthHandler instance
func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// LoginRequest represents the login request payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Success       bool             `json:"success"`
	AccessToken   string           `json:"access_token"`
	RefreshToken  string           `json:"refresh_token"`
	ExpiresIn     int              `json:"expires_in"`
	TokenType     string           `json:"token_type"`
	User          models.AdminResponse `json:"user"`
}

// Login authenticates a user and returns JWT tokens
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest

	// Bind and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	// Authenticate user
	admin, tokenPair, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Return response
	c.JSON(http.StatusOK, LoginResponse{
		Success:      true,
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		ExpiresIn:    tokenPair.ExpiresIn,
		TokenType:    tokenPair.TokenType,
		User:         admin.ToResponse(),
	})
}

// RefreshTokenRequest represents the refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// RefreshTokenResponse represents the refresh token response
type RefreshTokenResponse struct {
	Success     bool   `json:"success"`
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
	TokenType   string `json:"token_type"`
}

// RefreshToken generates a new access token using a refresh token
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest

	// Bind and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request payload",
		})
		return
	}

	// Generate new access token
	newAccessToken, err := h.authService.RefreshAccessToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Return response
	c.JSON(http.StatusOK, RefreshTokenResponse{
		Success:     true,
		AccessToken: newAccessToken,
		ExpiresIn:   15 * 60, // 15 minutes
		TokenType:   "Bearer",
	})
}

// LogoutResponse represents the logout response
type LogoutResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// Logout logs out the user (typically client-side token deletion)
func (h *AuthHandler) Logout(c *gin.Context) {
	// Note: Since we're using stateless JWT tokens, logout is handled client-side
	// by deleting the tokens from localStorage/sessionStorage.
	// In production, you might want to blacklist tokens using Redis.

	c.JSON(http.StatusOK, LogoutResponse{
		Success: true,
		Message: "Successfully logged out. Please delete the tokens on client side.",
	})
}

// ProfileResponse represents the user profile response
type ProfileResponse struct {
	Success bool                 `json:"success"`
	User    models.AdminResponse `json:"user"`
}

// GetProfile returns the current user's profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "User not found in context",
		})
		return
	}

	// In a real application, you would fetch the user from the database here
	// For now, we'll return the user info from the JWT claims
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user_id": userID,
	})
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
}

// Health checks if the API is running
func (h *AuthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status:    "ok",
		Timestamp: c.GetString("request_id"),
	})
}
