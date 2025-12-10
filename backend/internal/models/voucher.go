package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Voucher struct {
	ID             string     `gorm:"primaryKey;type:varchar(30)" json:"id"`
	ReservationID  string     `gorm:"uniqueIndex;not null;type:varchar(30)" json:"reservation_id"`
	Codigo         string     `gorm:"uniqueIndex;not null;index;type:varchar(50)" json:"codigo"`
	Valor          float64    `gorm:"not null;type:decimal(10,2)" json:"valor"`
	QrCodeData     string     `gorm:"not null;type:text" json:"qr_code_data"`
	QrCodeImage    *string    `gorm:"type:longtext" json:"-"` // Base64 encoded PNG
	Utilizado      bool       `gorm:"default:false;index" json:"utilizado"`
	DataUtilizacao *time.Time `json:"data_utilizacao"`
	DataValidade   time.Time  `gorm:"not null" json:"data_validade"`
	PdfUrl         *string    `gorm:"type:varchar(500)" json:"pdf_url"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	Reservation    *Reservation `gorm:"foreignKey:ReservationID;references:ID" json:"reservation,omitempty"`
}

// TableName specifies the table name for Voucher
func (Voucher) TableName() string {
	return "vouchers"
}

// BeforeCreate generates a CUID-like ID
func (v *Voucher) BeforeCreate(tx *gorm.DB) error {
	if v.ID == "" {
		v.ID = generateCUID()
	}
	if v.Codigo == "" {
		v.Codigo = generateVoucherCode()
	}
	return nil
}

// generateVoucherCode generates a voucher code in format: RM-XXXXXXXX-XXXXXXXX
func generateVoucherCode() string {
	part1 := uuid.New().String()[:8]
	part2 := uuid.New().String()[:8]
	return "RM-" + part1 + "-" + part2
}

// IsExpired checks if the voucher has expired
func (v *Voucher) IsExpired() bool {
	return time.Now().After(v.DataValidade)
}

// CanBeUsed checks if the voucher can still be used
func (v *Voucher) CanBeUsed() bool {
	return !v.Utilizado && !v.IsExpired()
}

// MarkAsUsed marks the voucher as used with current timestamp
func (v *Voucher) MarkAsUsed() {
	now := time.Now()
	v.Utilizado = true
	v.DataUtilizacao = &now
}
