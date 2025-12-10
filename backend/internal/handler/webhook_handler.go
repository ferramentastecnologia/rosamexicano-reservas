package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"rosamexicano/api/internal/database"
	"rosamexicano/api/internal/models"
	"rosamexicano/api/internal/repository"
	"rosamexicano/api/internal/service"
)

type WebhookHandler struct {
	reservationRepo *repository.ReservationRepository
	voucherRepo     *repository.VoucherRepository
	paymentService  *service.PaymentService
	voucherService  *service.VoucherService
	emailService    *service.EmailService
}

// NewWebhookHandler creates a new WebhookHandler instance
func NewWebhookHandler(
	reservationRepo *repository.ReservationRepository,
	voucherRepo *repository.VoucherRepository,
	paymentService *service.PaymentService,
	voucherService *service.VoucherService,
	emailService *service.EmailService,
) *WebhookHandler {
	return &WebhookHandler{
		reservationRepo: reservationRepo,
		voucherRepo:     voucherRepo,
		paymentService:  paymentService,
		voucherService:  voucherService,
		emailService:    emailService,
	}
}

// AsaasWebhookPayment represents payment data in a webhook
type AsaasWebhookPayment struct {
	ID                string  `json:"id"`
	Status            string  `json:"status"`
	Value             float64 `json:"value"`
	NetValue          float64 `json:"netValue"`
	OriginalValue     float64 `json:"originalValue"`
	InterestValue     float64 `json:"interestValue"`
	DiscountValue     float64 `json:"discountValue"`
	DueDate           string  `json:"dueDate"`
	ConfirmDate       *string `json:"confirmDate"`
	BillingType       string  `json:"billingType"`
	ExternalReference string  `json:"externalReference"`
	Description       string  `json:"description"`
	Customer          string  `json:"customer"`
	Object            string  `json:"object"`
}

// AsaasWebhookEvent represents a webhook event from Asaas
type AsaasWebhookEvent struct {
	ID      string                `json:"id"`
	Event   string                `json:"event"`
	Payment AsaasWebhookPayment   `json:"payment"`
	Timestamp string              `json:"timestamp"`
}

// HandleAsaasWebhook processes incoming Asaas webhooks
func (h *WebhookHandler) HandleAsaasWebhook(c *gin.Context) {
	// 1. Verify webhook signature
	signature := c.GetHeader("X-Asaas-Signature")
	if signature == "" {
		log.Println("⚠️  Webhook received without signature")
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Missing X-Asaas-Signature header",
		})
		return
	}

	// Read body for signature verification
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Failed to read request body",
		})
		return
	}

	// Verify signature
	if !h.paymentService.VerifyWebhookSignature(signature, bodyBytes) {
		log.Println("❌ Webhook signature verification failed")
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Invalid webhook signature",
		})
		return
	}

	// 2. Parse webhook event
	var event AsaasWebhookEvent
	if err := json.Unmarshal(bodyBytes, &event); err != nil {
		log.Printf("❌ Failed to parse webhook: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid webhook payload",
		})
		return
	}

	log.Printf("✓ Webhook received: %s (Payment: %s, Status: %s)", event.Event, event.Payment.ID, event.Payment.Status)

	// 3. Check for idempotency - has this webhook already been processed?
	webhookKey := fmt.Sprintf("webhook:processed:%s", event.ID)
	// TODO: Add Redis check here for production
	// if redis.Get(webhookKey).Val() != "" {
	//     log.Printf("⚠️  Webhook %s already processed", event.ID)
	//     c.JSON(http.StatusOK, gin.H{"status": "already_processed"})
	//     return
	// }

	// 4. Process only confirmed payment events
	confirmedEvents := []string{"PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"}
	isConfirmedEvent := false
	for _, evt := range confirmedEvents {
		if event.Event == evt {
			isConfirmedEvent = true
			break
		}
	}

	if !isConfirmedEvent {
		// Not a payment confirmation event, just acknowledge
		c.JSON(http.StatusOK, gin.H{"status": "received"})
		return
	}

	// 5. Find reservation by external reference
	reservation, err := h.findReservationByPaymentID(event.Payment.ID)
	if err != nil {
		log.Printf("❌ Reservation not found for payment %s: %v", event.Payment.ID, err)
		// Still return 200 to acknowledge receipt (don't retry)
		c.JSON(http.StatusOK, gin.H{"status": "processed"})
		return
	}

	// 6. Use database transaction with row locking to prevent race conditions
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("❌ Panic in webhook handler: %v", r)
		}
	}()

	// Lock the reservation row for update
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("id = ?", reservation.ID).
		First(reservation).Error; err != nil {
		tx.Rollback()
		log.Printf("❌ Failed to lock reservation: %v", err)
		c.JSON(http.StatusOK, gin.H{"status": "processed"})
		return
	}

	// Check if already confirmed
	if reservation.Status == models.ReservationStatusConfirmed {
		tx.Rollback()
		log.Printf("⚠️  Reservation %s already confirmed", reservation.ID)
		c.JSON(http.StatusOK, gin.H{"status": "already_confirmed"})
		return
	}

	// 7. Update reservation status
	reservation.Status = models.ReservationStatusConfirmed
	if err := tx.Save(reservation).Error; err != nil {
		tx.Rollback()
		log.Printf("❌ Failed to update reservation: %v", err)
		c.JSON(http.StatusOK, gin.H{"status": "processed"})
		return
	}

	tx.Commit()

	log.Printf("✓ Reservation %s updated to confirmed", reservation.ID)

	// 8. Mark webhook as processed (TODO: use Redis for production)
	// redis.Set(webhookKey, "1", 7*24*time.Hour)

	// 9. Trigger async tasks (non-blocking)
	go func() {
		// Generate and send voucher
		if err := h.generateAndSendVoucher(*reservation); err != nil {
			log.Printf("❌ Failed to generate voucher for reservation %s: %v", reservation.ID, err)
		}
	}()

	// Return success
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"status":  "processed",
		"reservation_id": reservation.ID,
	})
}

// findReservationByPaymentID finds a reservation by payment ID
func (h *WebhookHandler) findReservationByPaymentID(paymentID string) (*models.Reservation, error) {
	return h.reservationRepo.FindByPaymentID(paymentID)
}

// generateAndSendVoucher generates a voucher and sends it to the customer
func (h *WebhookHandler) generateAndSendVoucher(reservation models.Reservation) error {
	log.Printf("📝 Generating voucher for reservation %s", reservation.ID)

	// Create voucher
	voucher := &models.Voucher{
		ReservationID: reservation.ID,
		Valor:         reservation.Valor,
		DataValidade:  time.Now().AddDate(0, 0, 30), // Valid for 30 days
	}

	// Generate codes
	voucher.Codigo = models.GenerateVoucherCode()
	voucher.QrCodeData = voucher.Codigo // Could be enhanced with full reservation data

	// Save voucher to database
	if err := h.voucherRepo.Create(voucher); err != nil {
		return fmt.Errorf("failed to create voucher: %w", err)
	}

	log.Printf("✓ Voucher %s created for reservation %s", voucher.Codigo, reservation.ID)

	// TODO: Generate PDF and send email
	// This would require the email and pdf services

	return nil
}

// WebhookStatus returns the webhook processing status
func (h *WebhookHandler) WebhookStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"status":  "webhook handler is operational",
		"timestamp": time.Now().Unix(),
	})
}

// GenerateVoucherCode generates a voucher code in format: RM-XXXXXXXX-XXXXXXXX
func GenerateVoucherCode() string {
	// Simplified version - in real app use UUID
	return fmt.Sprintf("RM-%d-%d", time.Now().Unix(), time.Now().Nanosecond())
}
