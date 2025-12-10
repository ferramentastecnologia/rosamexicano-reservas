package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Reservation struct {
	ID                string     `gorm:"primaryKey;type:varchar(30)" json:"id"`
	PaymentID         *string    `gorm:"uniqueIndex;type:varchar(100)" json:"payment_id"`
	ExternalRef       string     `gorm:"uniqueIndex;not null;type:varchar(100)" json:"external_ref"`
	Nome              string     `gorm:"not null;type:varchar(200)" json:"nome"`
	Email             string     `gorm:"not null;index;type:varchar(200)" json:"email"`
	EmailEncrypted    *string    `gorm:"type:text" json:"-"`
	Telefone          string     `gorm:"not null;type:varchar(20)" json:"telefone"`
	TelefoneEncrypted *string    `gorm:"type:text" json:"-"`
	Data              string     `gorm:"not null;index;type:varchar(10)" json:"data"` // YYYY-MM-DD
	Horario           string     `gorm:"not null;index;type:varchar(5)" json:"horario"` // HH:MM
	NumeroPessoas     int        `gorm:"not null" json:"numero_pessoas"`
	Valor             float64    `gorm:"not null;type:decimal(10,2)" json:"valor"`
	Status            string     `gorm:"default:'pending';index;type:varchar(20)" json:"status"`
	MesasSelecionadas *string    `gorm:"type:varchar(200)" json:"mesas_selecionadas"`
	Observacoes       *string    `gorm:"type:text" json:"observacoes"`
	CreatedAt         time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	Voucher           *Voucher   `gorm:"foreignKey:ReservationID;constraint:OnDelete:CASCADE" json:"voucher,omitempty"`
}

// TableName specifies the table name for Reservation
func (Reservation) TableName() string {
	return "reservations"
}

// BeforeCreate generates a CUID-like ID
func (r *Reservation) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = generateCUID()
	}
	return nil
}

// generateCUID generates a simple CUID-like identifier
func generateCUID() string {
	return "c_" + uuid.New().String()[:8] + "_" + uuid.New().String()[:8]
}

// Status constants
const (
	ReservationStatusPending   = "pending"
	ReservationStatusConfirmed = "confirmed"
	ReservationStatusApproved  = "approved"
	ReservationStatusCancelled = "cancelled"
	ReservationStatusRejected  = "rejected"
)

// IsValidStatus checks if the status is valid
func IsValidReservationStatus(status string) bool {
	validStatuses := map[string]bool{
		ReservationStatusPending:   true,
		ReservationStatusConfirmed: true,
		ReservationStatusApproved:  true,
		ReservationStatusCancelled: true,
		ReservationStatusRejected:  true,
	}
	return validStatuses[status]
}
