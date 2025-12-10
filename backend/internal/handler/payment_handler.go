package handler

import (
	"fmt"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gin-gonic/gin"

	"rosamexicano/api/internal/models"
	"rosamexicano/api/internal/repository"
	"rosamexicano/api/internal/service"
)

type PaymentHandler struct {
	paymentService      *service.PaymentService
	reservationService  *service.ReservationService
	reservationRepo     *repository.ReservationRepository
}

// NewPaymentHandler creates a new PaymentHandler instance
func NewPaymentHandler(
	paymentService *service.PaymentService,
	reservationService *service.ReservationService,
	reservationRepo *repository.ReservationRepository,
) *PaymentHandler {
	return &PaymentHandler{
		paymentService:      paymentService,
		reservationService:  reservationService,
		reservationRepo:     reservationRepo,
	}
}

// CreatePaymentRequest represents a payment creation request
type CreatePaymentRequest struct {
	Nome              string  `json:"nome" binding:"required,min=3,max=200"`
	Email             string  `json:"email" binding:"required,email"`
	Telefone          string  `json:"telefone" binding:"required,min=10,max=20"`
	Data              string  `json:"data" binding:"required"` // YYYY-MM-DD
	Horario           string  `json:"horario" binding:"required"` // HH:MM
	NumeroPessoas     int     `json:"numero_pessoas" binding:"required,min=2,max=208"`
	MesasSelecionadas string  `json:"mesas_selecionadas" binding:"required"`
	Observacoes       *string `json:"observacoes"`
}

// CreatePaymentResponse represents a payment creation response
type CreatePaymentResponse struct {
	Success         bool   `json:"success"`
	ReservationID   string `json:"reservation_id"`
	PaymentID       string `json:"payment_id"`
	ExternalRef     string `json:"external_ref"`
	PixQrCode       string `json:"pix_qr_code"`
	PixCopyPaste    string `json:"pix_copy_paste"`
	ExpirationDate  string `json:"expiration_date"`
	Amount          float64 `json:"amount"`
	Message         string `json:"message"`
}

// CreatePayment creates a new payment and returns PIX QR code
func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	var req CreatePaymentRequest

	// Validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ Invalid payment request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	log.Printf("📝 Processing payment request for: %s (%s)", req.Nome, req.Email)

	// Generate unique external reference for idempotency
	externalRef := fmt.Sprintf("RESERVA-%s-%d", uuid.New().String()[:8], 50)

	// Step 1: Create customer in Asaas
	customer, err := h.paymentService.CreateCustomer(req.Nome, req.Email, req.Telefone)
	if err != nil {
		log.Printf("❌ Failed to create customer in Asaas: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to process payment. Please try again.",
		})
		return
	}

	log.Printf("✓ Customer created in Asaas: %s", customer.ID)

	// Step 2: Create payment in Asaas (PIX)
	paymentValue := 50.00 // Fixed R$ 50.00
	payment, err := h.paymentService.CreatePayment(
		customer.ID,
		paymentValue,
		fmt.Sprintf("Reserva para %s em %s às %s", req.Nome, req.Data, req.Horario),
		externalRef,
	)
	if err != nil {
		log.Printf("❌ Failed to create payment in Asaas: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to process payment. Please try again.",
		})
		return
	}

	log.Printf("✓ Payment created in Asaas: %s (Status: %s)", payment.ID, payment.Status)

	// Step 3: Create reservation in database
	reservation := &models.Reservation{
		PaymentID:         &payment.ID,
		ExternalRef:       externalRef,
		Nome:              req.Nome,
		Email:             req.Email,
		Telefone:          req.Telefone,
		Data:              req.Data,
		Horario:           req.Horario,
		NumeroPessoas:     req.NumeroPessoas,
		Valor:             paymentValue,
		Status:            models.ReservationStatusPending,
		MesasSelecionadas: &req.MesasSelecionadas,
		Observacoes:       req.Observacoes,
	}

	if err := h.reservationRepo.Create(reservation); err != nil {
		log.Printf("❌ Failed to create reservation in database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to save reservation. Please try again.",
		})
		return
	}

	log.Printf("✓ Reservation created: %s", reservation.ID)

	// Step 4: Get PIX QR code
	pixData, err := h.paymentService.GetPixQRCode(payment.ID)
	if err != nil {
		log.Printf("❌ Failed to get PIX QR code: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to generate PIX code. Please try again.",
		})
		return
	}

	log.Printf("✓ PIX QR code generated for payment %s", payment.ID)

	// Return response
	c.JSON(http.StatusOK, CreatePaymentResponse{
		Success:        true,
		ReservationID:  reservation.ID,
		PaymentID:      payment.ID,
		ExternalRef:    externalRef,
		PixQrCode:      pixData.EncodedImage,
		PixCopyPaste:   pixData.Payload,
		ExpirationDate: pixData.ExpirationDate.Format("2006-01-02T15:04:05Z"),
		Amount:         paymentValue,
		Message:        "Escaneie o QR code ou use o código PIX para realizar o pagamento",
	})
}

// CheckPaymentStatusRequest represents a payment status check request
type CheckPaymentStatusRequest struct {
	PaymentID string `json:"payment_id" binding:"required"`
}

// CheckPaymentStatusResponse represents a payment status response
type CheckPaymentStatusResponse struct {
	Success       bool    `json:"success"`
	PaymentID     string  `json:"payment_id"`
	Status        string  `json:"status"`
	IsConfirmed   bool    `json:"is_confirmed"`
	Amount        float64 `json:"amount"`
	ConfirmedAt   *string `json:"confirmed_at,omitempty"`
	Message       string  `json:"message"`
}

// CheckPaymentStatus checks the status of a payment
func (h *PaymentHandler) CheckPaymentStatus(c *gin.Context) {
	var req CheckPaymentStatusRequest

	// Validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request payload",
		})
		return
	}

	log.Printf("🔍 Checking payment status: %s", req.PaymentID)

	// Get payment status from Asaas
	payment, err := h.paymentService.GetPaymentStatus(req.PaymentID)
	if err != nil {
		log.Printf("❌ Failed to check payment status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to check payment status",
		})
		return
	}

	isConfirmed := service.IsPaymentConfirmed(payment.Status)
	log.Printf("✓ Payment status: %s (Confirmed: %v)", payment.Status, isConfirmed)

	// Return response
	c.JSON(http.StatusOK, CheckPaymentStatusResponse{
		Success:      true,
		PaymentID:    payment.ID,
		Status:       payment.Status,
		IsConfirmed:  isConfirmed,
		Amount:       payment.Value,
		ConfirmedAt:  payment.ConfirmDate,
		Message:      fmt.Sprintf("Status: %s", payment.Status),
	})
}

// GetPaymentResponse represents a get payment response
type GetPaymentResponse struct {
	Success     bool   `json:"success"`
	PaymentID   string `json:"payment_id"`
	Status      string `json:"status"`
	Amount      float64 `json:"amount"`
	IsConfirmed bool   `json:"is_confirmed"`
}

// GetPayment retrieves payment details
func (h *PaymentHandler) GetPayment(c *gin.Context) {
	paymentID := c.Param("id")

	if paymentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Payment ID is required",
		})
		return
	}

	payment, err := h.paymentService.GetPaymentStatus(paymentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Payment not found",
		})
		return
	}

	c.JSON(http.StatusOK, GetPaymentResponse{
		Success:     true,
		PaymentID:   payment.ID,
		Status:      payment.Status,
		Amount:      payment.Value,
		IsConfirmed: service.IsPaymentConfirmed(payment.Status),
	})
}
