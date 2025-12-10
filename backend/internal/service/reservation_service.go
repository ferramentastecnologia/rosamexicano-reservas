package service

import (
	"errors"
	"fmt"
	"log"
	"time"

	"rosamexicano/api/internal/models"
	"rosamexicano/api/internal/repository"
)

type ReservationService struct {
	reservationRepo *repository.ReservationRepository
	voucherRepo     *repository.VoucherRepository
	emailService    *EmailService
	paymentService  *PaymentService
}

// NewReservationService creates a new ReservationService instance
func NewReservationService(
	reservationRepo *repository.ReservationRepository,
	voucherRepo *repository.VoucherRepository,
	emailService *EmailService,
	paymentService *PaymentService,
) *ReservationService {
	return &ReservationService{
		reservationRepo: reservationRepo,
		voucherRepo:     voucherRepo,
		emailService:    emailService,
		paymentService:  paymentService,
	}
}

// CreateReservation creates a new reservation
func (s *ReservationService) CreateReservation(reservation *models.Reservation) error {
	log.Printf("📝 Creating reservation: %s (%s)", reservation.Nome, reservation.Email)

	if err := s.reservationRepo.Create(reservation); err != nil {
		return fmt.Errorf("failed to create reservation: %w", err)
	}

	log.Printf("✓ Reservation created: %s", reservation.ID)
	return nil
}

// GetReservation retrieves a reservation by ID
func (s *ReservationService) GetReservation(id string) (*models.Reservation, error) {
	return s.reservationRepo.FindByID(id)
}

// GetReservationByPaymentID retrieves a reservation by payment ID
func (s *ReservationService) GetReservationByPaymentID(paymentID string) (*models.Reservation, error) {
	return s.reservationRepo.FindByPaymentID(paymentID)
}

// GetAllReservations retrieves all reservations with filters
func (s *ReservationService) GetAllReservations(status string, limit, offset int) ([]models.Reservation, error) {
	return s.reservationRepo.FindAll(status, limit, offset)
}

// UpdateReservation updates a reservation
func (s *ReservationService) UpdateReservation(reservation *models.Reservation) error {
	log.Printf("📝 Updating reservation: %s", reservation.ID)

	if err := s.reservationRepo.Update(reservation); err != nil {
		return fmt.Errorf("failed to update reservation: %w", err)
	}

	log.Printf("✓ Reservation updated: %s", reservation.ID)
	return nil
}

// ApproveReservation approves a reservation
func (s *ReservationService) ApproveReservation(id string) error {
	reservation, err := s.reservationRepo.FindByID(id)
	if err != nil {
		return err
	}

	log.Printf("✓ Approving reservation: %s", id)

	reservation.Status = models.ReservationStatusApproved
	if err := s.reservationRepo.Update(reservation); err != nil {
		return err
	}

	// TODO: Send approval email
	// s.emailService.SendApprovalEmail(...)

	return nil
}

// RejectReservation rejects a reservation
func (s *ReservationService) RejectReservation(id, reason string) error {
	reservation, err := s.reservationRepo.FindByID(id)
	if err != nil {
		return err
	}

	log.Printf("❌ Rejecting reservation: %s (%s)", id, reason)

	reservation.Status = models.ReservationStatusRejected
	if err := s.reservationRepo.Update(reservation); err != nil {
		return err
	}

	// TODO: Send rejection email
	// s.emailService.SendRejectionEmail(...)

	return nil
}

// CancelReservation cancels a reservation
func (s *ReservationService) CancelReservation(id string) error {
	reservation, err := s.reservationRepo.FindByID(id)
	if err != nil {
		return err
	}

	log.Printf("📖 Cancelling reservation: %s", id)

	reservation.Status = models.ReservationStatusCancelled
	return s.reservationRepo.Update(reservation)
}

// DeleteReservation deletes a reservation
func (s *ReservationService) DeleteReservation(id string) error {
	return s.reservationRepo.Delete(id)
}

// CheckAvailability checks if tables are available for a date and time
func (s *ReservationService) CheckAvailability(data, horario string, numeroPessoas int) (bool, int, error) {
	// Get all confirmed reservations for the date and time
	reservations, err := s.reservationRepo.FindByDateAndStatus(data, models.ReservationStatusConfirmed)
	if err != nil && !errors.Is(err, errors.New("record not found")) {
		return false, 0, err
	}

	// Calculate occupied seats
	var occupiedSeats int
	for _, res := range reservations {
		if res.Horario == horario {
			occupiedSeats += res.NumeroPessoas
		}
	}

	// Total capacity is 208 people (48 tables * 4 per table)
	const totalCapacity = 208
	availableSeats := totalCapacity - occupiedSeats

	// Check if enough seats are available
	isAvailable := availableSeats >= numeroPessoas

	log.Printf("🍽️  Availability check: %s %s - %d seats needed, %d available",
		data, horario, numeroPessoas, availableSeats)

	return isAvailable, availableSeats, nil
}

// GetReservationStats returns statistics about reservations
func (s *ReservationService) GetReservationStats() (map[string]interface{}, error) {
	total, _ := s.reservationRepo.Count()
	pending, _ := s.reservationRepo.CountByStatus(models.ReservationStatusPending)
	confirmed, _ := s.reservationRepo.CountByStatus(models.ReservationStatusConfirmed)
	approved, _ := s.reservationRepo.CountByStatus(models.ReservationStatusApproved)

	stats := map[string]interface{}{
		"total":     total,
		"pending":   pending,
		"confirmed": confirmed,
		"approved":  approved,
		"cancelled": total - pending - confirmed - approved,
	}

	return stats, nil
}

// ConfirmPayment confirms payment for a reservation (called by webhook)
func (s *ReservationService) ConfirmPayment(paymentID string) error {
	reservation, err := s.reservationRepo.FindByPaymentID(paymentID)
	if err != nil {
		return err
	}

	log.Printf("💰 Confirming payment for reservation: %s", reservation.ID)

	reservation.Status = models.ReservationStatusConfirmed
	if err := s.reservationRepo.Update(reservation); err != nil {
		return err
	}

	log.Printf("✓ Payment confirmed for reservation: %s", reservation.ID)
	return nil
}

// VoucherService handles voucher operations
type VoucherService struct {
	voucherRepo *repository.VoucherRepository
	pdfService  *PDFService
}

// NewVoucherService creates a new VoucherService
func NewVoucherService(voucherRepo *repository.VoucherRepository, pdfService *PDFService) *VoucherService {
	return &VoucherService{
		voucherRepo: voucherRepo,
		pdfService:  pdfService,
	}
}

// GenerateVoucher generates a new voucher for a reservation
func (s *VoucherService) GenerateVoucher(reservationID string) (*models.Voucher, error) {
	voucher := &models.Voucher{
		ReservationID: reservationID,
		Valor:         50.00,
		DataValidade:  time.Now().AddDate(0, 0, 30), // Valid for 30 days
	}

	// Generate codes
	voucher.Codigo = models.GenerateVoucherCode()
	voucher.QrCodeData = voucher.Codigo

	if err := s.voucherRepo.Create(voucher); err != nil {
		return nil, fmt.Errorf("failed to create voucher: %w", err)
	}

	return voucher, nil
}

// GetVoucher retrieves a voucher by code
func (s *VoucherService) GetVoucher(codigo string) (*models.Voucher, error) {
	return s.voucherRepo.FindByCodigo(codigo)
}

// ValidateVoucher validates and marks a voucher as used
func (s *VoucherService) ValidateVoucher(codigo string) error {
	voucher, err := s.voucherRepo.FindByCodigo(codigo)
	if err != nil {
		return err
	}

	if !voucher.CanBeUsed() {
		return errors.New("voucher cannot be used (expired or already used)")
	}

	voucher.MarkAsUsed()
	return s.voucherRepo.Update(voucher)
}

// PDFService handles PDF operations
type PDFService struct {
	// Dependencies if needed
}

// NewPDFService creates a new PDFService
func NewPDFService() *PDFService {
	return &PDFService{}
}

// GeneratePDF generates a PDF (placeholder)
func (s *PDFService) GeneratePDF(data interface{}) ([]byte, error) {
	// TODO: Implement PDF generation using gofpdf
	return []byte{}, nil
}

// EmailService handles email operations
type EmailService struct {
	// Dependencies if needed
}

// NewEmailService creates a new EmailService
func NewEmailService() *EmailService {
	return &EmailService{}
}

// SendEmail sends an email (placeholder)
func (s *EmailService) SendEmail(to, subject, body string) error {
	// TODO: Implement email sending using Gomail
	log.Printf("📧 Would send email to %s: %s", to, subject)
	return nil
}
