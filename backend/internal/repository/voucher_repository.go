package repository

import (
	"errors"

	"gorm.io/gorm"

	"rosamexicano/api/internal/models"
)

type VoucherRepository struct {
	db *gorm.DB
}

// NewVoucherRepository creates a new VoucherRepository instance
func NewVoucherRepository(db *gorm.DB) *VoucherRepository {
	return &VoucherRepository{db: db}
}

// Create creates a new voucher
func (r *VoucherRepository) Create(voucher *models.Voucher) error {
	return r.db.Create(voucher).Error
}

// FindByID finds a voucher by ID
func (r *VoucherRepository) FindByID(id string) (*models.Voucher, error) {
	var voucher models.Voucher
	if err := r.db.Where("id = ?", id).First(&voucher).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("voucher not found")
		}
		return nil, err
	}
	return &voucher, nil
}

// FindByCodigo finds a voucher by code
func (r *VoucherRepository) FindByCodigo(codigo string) (*models.Voucher, error) {
	var voucher models.Voucher
	if err := r.db.Where("codigo = ?", codigo).First(&voucher).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("voucher not found")
		}
		return nil, err
	}
	return &voucher, nil
}

// FindByReservationID finds a voucher by reservation ID
func (r *VoucherRepository) FindByReservationID(reservationID string) (*models.Voucher, error) {
	var voucher models.Voucher
	if err := r.db.Where("reservation_id = ?", reservationID).First(&voucher).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("voucher not found")
		}
		return nil, err
	}
	return &voucher, nil
}

// FindAll finds all vouchers with optional filters
func (r *VoucherRepository) FindAll(utilizado *bool, limit, offset int) ([]models.Voucher, error) {
	var vouchers []models.Voucher
	query := r.db

	if utilizado != nil {
		query = query.Where("utilizado = ?", *utilizado)
	}

	if err := query.Limit(limit).Offset(offset).Find(&vouchers).Error; err != nil {
		return nil, err
	}

	return vouchers, nil
}

// Update updates a voucher
func (r *VoucherRepository) Update(voucher *models.Voucher) error {
	return r.db.Save(voucher).Error
}

// MarkAsUsed marks a voucher as used
func (r *VoucherRepository) MarkAsUsed(id string) error {
	voucher := &models.Voucher{}
	if err := r.db.Model(voucher).Where("id = ?", id).Update("utilizado", true).Error; err != nil {
		return err
	}
	return nil
}

// Delete deletes a voucher
func (r *VoucherRepository) Delete(id string) error {
	return r.db.Delete(&models.Voucher{}, "id = ?", id).Error
}

// Count returns the total count of vouchers
func (r *VoucherRepository) Count() (int64, error) {
	var count int64
	if err := r.db.Model(&models.Voucher{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// CountByUtilizado returns the count of vouchers by utilizado status
func (r *VoucherRepository) CountByUtilizado(utilizado bool) (int64, error) {
	var count int64
	if err := r.db.Model(&models.Voucher{}).Where("utilizado = ?", utilizado).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
