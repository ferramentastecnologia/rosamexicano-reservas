package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"rosamexicano/api/internal/models"
	"rosamexicano/api/internal/repository"
	"rosamexicano/api/internal/service"
)

type AdminHandler struct {
	reservationRepo *repository.ReservationRepository
	adminRepo       *repository.AdminRepository
	voucherRepo     *repository.VoucherRepository
	reservationSvc  *service.ReservationService
	emailService    *EmailServiceImpl
	pdfService      *PDFServiceImpl
}

// NewAdminHandler creates a new AdminHandler instance
func NewAdminHandler(
	reservationRepo *repository.ReservationRepository,
	adminRepo *repository.AdminRepository,
	voucherRepo *repository.VoucherRepository,
	reservationSvc *service.ReservationService,
	emailService *EmailServiceImpl,
	pdfService *PDFServiceImpl,
) *AdminHandler {
	return &AdminHandler{
		reservationRepo: reservationRepo,
		adminRepo:       adminRepo,
		voucherRepo:     voucherRepo,
		reservationSvc:  reservationSvc,
		emailService:    emailService,
		pdfService:      pdfService,
	}
}

// ========== DASHBOARD STATS ==========

type StatsResponse struct {
	Success bool `json:"success"`
	Stats   struct {
		TotalReservations  int64   `json:"total_reservations"`
		ConfirmedCount     int64   `json:"confirmed_count"`
		PendingCount       int64   `json:"pending_count"`
		ApprovedCount      int64   `json:"approved_count"`
		TotalRevenue       float64 `json:"total_revenue"`
		TotalPeople        int     `json:"total_people"`
		TodaysReservations int     `json:"todays_reservations"`
	} `json:"stats"`
}

// GetStats returns dashboard statistics
func (h *AdminHandler) GetStats(c *gin.Context) {
	log.Println("📊 Fetching dashboard stats")

	total, _ := h.reservationRepo.Count()
	confirmed, _ := h.reservationRepo.CountByStatus(models.ReservationStatusConfirmed)
	pending, _ := h.reservationRepo.CountByStatus(models.ReservationStatusPending)
	approved, _ := h.reservationRepo.CountByStatus(models.ReservationStatusApproved)

	stats := StatsResponse{
		Success: true,
	}
	stats.Stats.TotalReservations = total
	stats.Stats.ConfirmedCount = confirmed
	stats.Stats.PendingCount = pending
	stats.Stats.ApprovedCount = approved
	stats.Stats.TotalRevenue = float64(confirmed) * 50.0 // R$ 50.00 per reservation
	stats.Stats.TotalPeople = int(confirmed) * 4         // Average 4 people (placeholder)

	c.JSON(http.StatusOK, stats)
}

// ========== RESERVATIONS MANAGEMENT ==========

type ListReservationsResponse struct {
	Success      bool                       `json:"success"`
	Reservations []models.Reservation       `json:"reservations"`
	Total        int64                      `json:"total"`
	Limit        int                        `json:"limit"`
	Offset       int                        `json:"offset"`
}

// ListReservations returns all reservations with filters
func (h *AdminHandler) ListReservations(c *gin.Context) {
	status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	log.Printf("📋 Listing reservations (status=%s, limit=%d, offset=%d)", status, limit, offset)

	reservations, err := h.reservationRepo.FindAll(status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch reservations",
		})
		return
	}

	total, _ := h.reservationRepo.Count()

	c.JSON(http.StatusOK, ListReservationsResponse{
		Success:      true,
		Reservations: reservations,
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	})
}

// GetReservation returns a single reservation
func (h *AdminHandler) GetReservation(c *gin.Context) {
	id := c.Param("id")

	reservation, err := h.reservationRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Reservation not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"reservation": reservation,
	})
}

// ApproveReservationRequest represents an approval request
type ApproveReservationRequest struct {
	Message string `json:"message"`
}

// ApproveReservation approves a reservation
func (h *AdminHandler) ApproveReservation(c *gin.Context) {
	id := c.Param("id")

	reservation, err := h.reservationRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Reservation not found",
		})
		return
	}

	log.Printf("✅ Approving reservation: %s", id)

	reservation.Status = models.ReservationStatusApproved
	if err := h.reservationRepo.Update(reservation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to approve reservation",
		})
		return
	}

	// Send approval email
	go h.emailService.SendApprovalEmail(reservation)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Reservation approved",
	})
}

// RejectReservationRequest represents a rejection request
type RejectReservationRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// RejectReservation rejects a reservation
func (h *AdminHandler) RejectReservation(c *gin.Context) {
	id := c.Param("id")

	var req RejectReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request",
		})
		return
	}

	reservation, err := h.reservationRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Reservation not found",
		})
		return
	}

	log.Printf("❌ Rejecting reservation: %s (%s)", id, req.Reason)

	reservation.Status = models.ReservationStatusRejected
	if err := h.reservationRepo.Update(reservation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to reject reservation",
		})
		return
	}

	// Send rejection email
	go h.emailService.SendRejectionEmail(reservation, req.Reason)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Reservation rejected",
	})
}

// ========== VOUCHER MANAGEMENT ==========

// ValidateVoucherRequest represents a voucher validation request
type ValidateVoucherRequest struct {
	Code string `json:"code" binding:"required"`
}

// ValidateVoucher validates a voucher
func (h *AdminHandler) ValidateVoucher(c *gin.Context) {
	codigo := c.Param("codigo")

	log.Printf("🎫 Validating voucher: %s", codigo)

	voucher, err := h.voucherRepo.FindByCodigo(codigo)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Voucher not found",
		})
		return
	}

	if !voucher.CanBeUsed() {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Voucher cannot be used (expired or already used)",
		})
		return
	}

	// Mark as used
	if err := h.voucherRepo.MarkAsUsed(voucher.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to validate voucher",
		})
		return
	}

	log.Printf("✅ Voucher validated: %s", codigo)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Voucher validated successfully",
		"voucher": voucher,
	})
}

// ========== ADMIN USERS MANAGEMENT ==========

// CreateAdminRequest represents a user creation request
type CreateAdminRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=12"`
	Name     string `json:"name" binding:"required,min=3"`
	Role     string `json:"role" binding:"required"`
}

// CreateAdmin creates a new admin user
func (h *AdminHandler) CreateAdmin(c *gin.Context) {
	var req CreateAdminRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request",
		})
		return
	}

	// Check if email already exists
	exists, _ := h.adminRepo.EmailExists(req.Email)
	if exists {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"error":   "Email already exists",
		})
		return
	}

	// Create new admin (TODO: use AuthService)
	admin := &models.Admin{
		Email:       req.Email,
		Name:        req.Name,
		Role:        req.Role,
		Permissions: models.GetDefaultPermissions(req.Role),
		Active:      true,
	}

	if err := h.adminRepo.Create(admin); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create admin user",
		})
		return
	}

	log.Printf("✅ Admin user created: %s", admin.Email)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Admin user created successfully",
		"user":    admin.ToResponse(),
	})
}

// ListAdmins returns all admin users
func (h *AdminHandler) ListAdmins(c *gin.Context) {
	admins, err := h.adminRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch admin users",
		})
		return
	}

	responses := make([]models.AdminResponse, len(admins))
	for i, admin := range admins {
		responses[i] = admin.ToResponse()
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"admins":  responses,
	})
}

// ========== REPORTS ==========

// GetReports generates reports
func (h *AdminHandler) GetReports(c *gin.Context) {
	reportType := c.DefaultQuery("type", "summary")

	log.Printf("📊 Generating report: %s", reportType)

	switch reportType {
	case "summary":
		stats, _ := h.reservationSvc.GetReservationStats()
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"report":  stats,
		})

	case "pdf":
		reservations, _ := h.reservationRepo.FindAll("", 1000, 0)
		pdfBytes, err := h.pdfService.ReportPDF("Relatório de Reservas", reservations)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to generate report",
			})
			return
		}

		c.Header("Content-Type", "application/pdf")
		c.Header("Content-Disposition", "attachment; filename=report.pdf")
		c.Data(http.StatusOK, "application/pdf", pdfBytes)

	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid report type",
		})
	}
}
