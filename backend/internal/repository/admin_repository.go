package repository

import (
	"errors"

	"gorm.io/gorm"

	"rosamexicano/api/internal/models"
)

type AdminRepository struct {
	db *gorm.DB
}

// NewAdminRepository creates a new AdminRepository instance
func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

// Create creates a new admin user
func (r *AdminRepository) Create(admin *models.Admin) error {
	if err := r.db.Create(admin).Error; err != nil {
		return err
	}
	return nil
}

// FindByID finds an admin by ID
func (r *AdminRepository) FindByID(id string) (*models.Admin, error) {
	var admin models.Admin
	if err := r.db.Where("id = ?", id).First(&admin).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("admin not found")
		}
		return nil, err
	}
	return &admin, nil
}

// FindByEmail finds an admin by email
func (r *AdminRepository) FindByEmail(email string) (*models.Admin, error) {
	var admin models.Admin
	if err := r.db.Where("email = ?", email).First(&admin).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("admin not found")
		}
		return nil, err
	}
	return &admin, nil
}

// FindAll finds all admin users
func (r *AdminRepository) FindAll() ([]models.Admin, error) {
	var admins []models.Admin
	if err := r.db.Find(&admins).Error; err != nil {
		return nil, err
	}
	return admins, nil
}

// FindActive finds all active admin users
func (r *AdminRepository) FindActive() ([]models.Admin, error) {
	var admins []models.Admin
	if err := r.db.Where("active = ?", true).Find(&admins).Error; err != nil {
		return nil, err
	}
	return admins, nil
}

// Update updates an admin user
func (r *AdminRepository) Update(admin *models.Admin) error {
	if err := r.db.Save(admin).Error; err != nil {
		return err
	}
	return nil
}

// UpdatePassword updates only the password field
func (r *AdminRepository) UpdatePassword(id, newPassword string) error {
	if err := r.db.Model(&models.Admin{}).Where("id = ?", id).Update("password", newPassword).Error; err != nil {
		return err
	}
	return nil
}

// Delete deletes an admin user (soft delete via active flag)
func (r *AdminRepository) Delete(id string) error {
	if err := r.db.Model(&models.Admin{}).Where("id = ?", id).Update("active", false).Error; err != nil {
		return err
	}
	return nil
}

// HardDelete permanently deletes an admin user
func (r *AdminRepository) HardDelete(id string) error {
	if err := r.db.Delete(&models.Admin{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}

// Exists checks if an admin exists by ID
func (r *AdminRepository) Exists(id string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Admin{}).Where("id = ?", id).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// EmailExists checks if an email already exists
func (r *AdminRepository) EmailExists(email string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.Admin{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetByRole finds all admins with a specific role
func (r *AdminRepository) GetByRole(role string) ([]models.Admin, error) {
	var admins []models.Admin
	if err := r.db.Where("role = ?", role).Find(&admins).Error; err != nil {
		return nil, err
	}
	return admins, nil
}

// Count returns the total count of admins
func (r *AdminRepository) Count() (int64, error) {
	var count int64
	if err := r.db.Model(&models.Admin{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
