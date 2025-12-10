package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Admin struct {
	ID          string      `gorm:"primaryKey;type:varchar(30)" json:"id"`
	Email       string      `gorm:"uniqueIndex;not null;type:varchar(200)" json:"email"`
	Password    string      `gorm:"not null;type:varchar(100)" json:"-"` // Never return password
	Name        string      `gorm:"not null;type:varchar(200)" json:"name"`
	Role        string      `gorm:"default:'user';type:varchar(20)" json:"role"` // admin, user
	Permissions Permissions `gorm:"type:jsonb;default:'[]'" json:"permissions"`
	Active      bool        `gorm:"default:true" json:"active"`
	CreatedAt   time.Time   `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time   `gorm:"autoUpdateTime" json:"updated_at"`
}

// Permissions is a list of permission strings
type Permissions []string

// Value implements the driver.Valuer interface for storing JSON in database
func (p Permissions) Value() (driver.Value, error) {
	return json.Marshal(p)
}

// Scan implements the sql.Scanner interface for reading JSON from database
func (p *Permissions) Scan(value interface{}) error {
	bytes, _ := value.([]byte)
	return json.Unmarshal(bytes, &p)
}

// TableName specifies the table name for Admin
func (Admin) TableName() string {
	return "admins"
}

// BeforeCreate generates a CUID-like ID
func (a *Admin) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = generateCUID()
	}
	return nil
}

// Permission constants
const (
	PermissionDashboard    = "dashboard"
	PermissionReservations = "reservations"
	PermissionVouchers     = "vouchers"
	PermissionReports      = "reports"
	PermissionUsers        = "users"
)

// Role constants
const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)

// HasPermission checks if the admin has a specific permission
func (a *Admin) HasPermission(permission string) bool {
	// Admins have all permissions
	if a.Role == RoleAdmin {
		return true
	}

	for _, perm := range a.Permissions {
		if perm == permission || perm == "*" {
			return true
		}
	}
	return false
}

// HasAnyPermission checks if the admin has any of the given permissions
func (a *Admin) HasAnyPermission(permissions ...string) bool {
	for _, permission := range permissions {
		if a.HasPermission(permission) {
			return true
		}
	}
	return false
}

// IsActive checks if the admin account is active
func (a *Admin) IsActive() bool {
	return a.Active
}

// GetDefaultPermissions returns default permissions for a new user role
func GetDefaultPermissions(role string) Permissions {
	switch role {
	case RoleAdmin:
		return Permissions{
			PermissionDashboard,
			PermissionReservations,
			PermissionVouchers,
			PermissionReports,
			PermissionUsers,
		}
	case RoleUser:
		return Permissions{
			PermissionDashboard,
			PermissionReservations,
			PermissionVouchers,
		}
	default:
		return Permissions{}
	}
}

// AdminResponse is the response struct for admin endpoints (without sensitive data)
type AdminResponse struct {
	ID          string      `json:"id"`
	Email       string      `json:"email"`
	Name        string      `json:"name"`
	Role        string      `json:"role"`
	Permissions Permissions `json:"permissions"`
	Active      bool        `json:"active"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// ToResponse converts Admin to AdminResponse (safe for API responses)
func (a *Admin) ToResponse() AdminResponse {
	return AdminResponse{
		ID:          a.ID,
		Email:       a.Email,
		Name:        a.Name,
		Role:        a.Role,
		Permissions: a.Permissions,
		Active:      a.Active,
		CreatedAt:   a.CreatedAt,
		UpdatedAt:   a.UpdatedAt,
	}
}
