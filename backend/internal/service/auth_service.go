package service

import (
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"rosamexicano/api/internal/config"
	"rosamexicano/api/internal/models"
	"rosamexicano/api/internal/repository"
)

type AuthService struct {
	adminRepo *repository.AdminRepository
	cfg       *config.Config
}

// Claims represents JWT token claims
type Claims struct {
	UserID      string                `json:"user_id"`
	Email       string                `json:"email"`
	Role        string                `json:"role"`
	Permissions models.Permissions    `json:"permissions"`
	TokenID     string                `json:"jti"` // For revocation
	jwt.RegisteredClaims
}

// TokenPair contains both access and refresh tokens
type TokenPair struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresIn    int       `json:"expires_in"`
	TokenType    string    `json:"token_type"`
	IssuedAt     time.Time `json:"issued_at"`
}

// NewAuthService creates a new AuthService instance
func NewAuthService(adminRepo *repository.AdminRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		adminRepo: adminRepo,
		cfg:       cfg,
	}
}

// Login authenticates a user and returns JWT tokens
func (s *AuthService) Login(email, password string) (*models.Admin, *TokenPair, error) {
	// Validate input
	if email == "" || password == "" {
		return nil, nil, errors.New("email and password are required")
	}

	// Find admin by email (case-insensitive)
	admin, err := s.adminRepo.FindByEmail(strings.ToLower(email))
	if err != nil {
		// Use generic error to avoid user enumeration
		return nil, nil, errors.New("invalid email or password")
	}

	// Check if active
	if !admin.IsActive() {
		return nil, nil, errors.New("user account is inactive")
	}

	// Verify password
	if !s.VerifyPassword(password, admin.Password) {
		return nil, nil, errors.New("invalid email or password")
	}

	// Generate tokens
	tokenPair, err := s.GenerateTokenPair(admin)
	if err != nil {
		return nil, nil, errors.New("failed to generate tokens")
	}

	return admin, tokenPair, nil
}

// GenerateTokenPair generates both access and refresh tokens
func (s *AuthService) GenerateTokenPair(admin *models.Admin) (*TokenPair, error) {
	// Generate access token
	accessToken, err := s.generateAccessToken(admin)
	if err != nil {
		return nil, err
	}

	// Generate refresh token
	refreshToken, err := s.generateRefreshToken(admin)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    15 * 60, // 15 minutes in seconds
		TokenType:    "Bearer",
		IssuedAt:     time.Now(),
	}, nil
}

// generateAccessToken generates a short-lived access token
func (s *AuthService) generateAccessToken(admin *models.Admin) (string, error) {
	claims := Claims{
		UserID:      admin.ID,
		Email:       admin.Email,
		Role:        admin.Role,
		Permissions: admin.Permissions,
		TokenID:     generateTokenID(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "rosa-mexicano-api",
			Subject:   admin.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.cfg.JWTAccessSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// generateRefreshToken generates a long-lived refresh token
func (s *AuthService) generateRefreshToken(admin *models.Admin) (string, error) {
	claims := jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		NotBefore: jwt.NewNumericDate(time.Now()),
		Issuer:    "rosa-mexicano-api",
		Subject:   admin.ID,
		ID:        generateTokenID(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.cfg.JWTRefreshSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateAccessToken validates an access token and returns claims
func (s *AuthService) ValidateAccessToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(s.cfg.JWTAccessSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// ValidateRefreshToken validates a refresh token and returns claims
func (s *AuthService) ValidateRefreshToken(tokenString string) (*jwt.RegisteredClaims, error) {
	claims := &jwt.RegisteredClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(s.cfg.JWTRefreshSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// RefreshAccessToken generates a new access token using a refresh token
func (s *AuthService) RefreshAccessToken(refreshToken string) (string, error) {
	// Validate refresh token
	claims, err := s.ValidateRefreshToken(refreshToken)
	if err != nil {
		return "", err
	}

	// Get admin user
	admin, err := s.adminRepo.FindByID(claims.Subject)
	if err != nil || !admin.IsActive() {
		return "", errors.New("user not found or inactive")
	}

	// Generate new access token
	accessToken, err := s.generateAccessToken(admin)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

// HashPassword hashes a password using bcrypt
func (s *AuthService) HashPassword(password string) (string, error) {
	// Cost 12 = ~250ms on modern hardware (good security/performance balance)
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

// VerifyPassword verifies a password against its hash
func (s *AuthService) VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// ValidatePasswordStrength checks if password meets requirements
func (s *AuthService) ValidatePasswordStrength(password string) error {
	if len(password) < 12 {
		return errors.New("password must be at least 12 characters long")
	}

	// Add more checks as needed
	var (
		hasUpper   bool
		hasLower   bool
		hasNumber  bool
		hasSpecial bool
	)

	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasNumber = true
		case !((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9')):
			hasSpecial = true
		}
	}

	if !hasUpper || !hasLower || !hasNumber || !hasSpecial {
		return errors.New("password must contain uppercase, lowercase, number, and special character")
	}

	return nil
}

// CreateAdmin creates a new admin user
func (s *AuthService) CreateAdmin(email, password, name, role string) (*models.Admin, error) {
	// Validate password strength
	if err := s.ValidatePasswordStrength(password); err != nil {
		return nil, err
	}

	// Hash password
	hashedPassword, err := s.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// Create admin
	admin := &models.Admin{
		Email:       strings.ToLower(email),
		Password:    hashedPassword,
		Name:        name,
		Role:        role,
		Permissions: models.GetDefaultPermissions(role),
		Active:      true,
	}

	// Save to database
	if err := s.adminRepo.Create(admin); err != nil {
		return nil, err
	}

	return admin, nil
}

// generateTokenID generates a unique token ID for revocation tracking
func generateTokenID() string {
	return time.Now().Unix() + (int64(len(time.Now().String())))
}

// Helper function to convert permissions to JSON string for storage
func (s *AuthService) PermissionsToJSON(perms models.Permissions) (string, error) {
	data, err := json.Marshal(perms)
	return string(data), err
}

// Helper function to convert JSON string to permissions
func (s *AuthService) JSONToPermissions(jsonStr string) (models.Permissions, error) {
	var perms models.Permissions
	err := json.Unmarshal([]byte(jsonStr), &perms)
	return perms, err
}
