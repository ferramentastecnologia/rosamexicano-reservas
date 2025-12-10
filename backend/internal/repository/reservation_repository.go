package repository

import (
	"errors"

	"gorm.io/gorm"

	"rosamexicano/api/internal/models"
)

type ReservationRepository struct {
	db *gorm.DB
}

// NewReservationRepository creates a new ReservationRepository instance
func NewReservationRepository(db *gorm.DB) *ReservationRepository {
	return &ReservationRepository{db: db}
}

// Create creates a new reservation
func (r *ReservationRepository) Create(reservation *models.Reservation) error {
	return r.db.Create(reservation).Error
}

// FindByID finds a reservation by ID
func (r *ReservationRepository) FindByID(id string) (*models.Reservation, error) {
	var reservation models.Reservation
	if err := r.db.Where("id = ?", id).First(&reservation).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("reservation not found")
		}
		return nil, err
	}
	return &reservation, nil
}

// FindByPaymentID finds a reservation by payment ID
func (r *ReservationRepository) FindByPaymentID(paymentID string) (*models.Reservation, error) {
	var reservation models.Reservation
	if err := r.db.Where("payment_id = ?", paymentID).First(&reservation).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("reservation not found")
		}
		return nil, err
	}
	return &reservation, nil
}

// FindAll finds all reservations with optional filters
func (r *ReservationRepository) FindAll(status string, limit, offset int) ([]models.Reservation, error) {
	var reservations []models.Reservation
	query := r.db

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Limit(limit).Offset(offset).Find(&reservations).Error; err != nil {
		return nil, err
	}

	return reservations, nil
}

// FindByDate finds reservations for a specific date
func (r *ReservationRepository) FindByDate(date string) ([]models.Reservation, error) {
	var reservations []models.Reservation
	if err := r.db.Where("data = ?", date).Find(&reservations).Error; err != nil {
		return nil, err
	}
	return reservations, nil
}

// FindByDateAndStatus finds reservations by date and status
func (r *ReservationRepository) FindByDateAndStatus(date, status string) ([]models.Reservation, error) {
	var reservations []models.Reservation
	if err := r.db.Where("data = ? AND status = ?", date, status).Find(&reservations).Error; err != nil {
		return nil, err
	}
	return reservations, nil
}

// Update updates a reservation
func (r *ReservationRepository) Update(reservation *models.Reservation) error {
	return r.db.Save(reservation).Error
}

// UpdateStatus updates only the status field
func (r *ReservationRepository) UpdateStatus(id, status string) error {
	return r.db.Model(&models.Reservation{}).Where("id = ?", id).Update("status", status).Error
}

// Delete deletes a reservation
func (r *ReservationRepository) Delete(id string) error {
	return r.db.Delete(&models.Reservation{}, "id = ?", id).Error
}

// Count returns the total count of reservations
func (r *ReservationRepository) Count() (int64, error) {
	var count int64
	if err := r.db.Model(&models.Reservation{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// CountByStatus returns the count of reservations by status
func (r *ReservationRepository) CountByStatus(status string) (int64, error) {
	var count int64
	if err := r.db.Model(&models.Reservation{}).Where("status = ?", status).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
