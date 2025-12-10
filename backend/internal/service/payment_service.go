package service

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"rosamexicano/api/internal/config"
)

type PaymentService struct {
	cfg        *config.Config
	httpClient *http.Client
}

// AsaasCustomer represents a customer in Asaas
type AsaasCustomer struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	MobilePhone string `json:"mobilePhone"`
	CPFCnpj     string `json:"cpfCnpj"`
	Object      string `json:"object"`
	CreatedAt   string `json:"createdAt"`
}

// AsaasPayment represents a payment in Asaas
type AsaasPayment struct {
	ID                  string  `json:"id"`
	Customer            string  `json:"customer"`
	BillingType         string  `json:"billingType"`
	Value               float64 `json:"value"`
	NetValue            float64 `json:"netValue"`
	DueDate             string  `json:"dueDate"`
	Description         string  `json:"description"`
	ExternalReference   string  `json:"externalReference"`
	Status              string  `json:"status"`
	ConfirmDate         *string `json:"confirmDate"`
	OriginalValue       float64 `json:"originalValue"`
	InterestValue       float64 `json:"interestValue"`
	DiscountValue       float64 `json:"discountValue"`
	InvoiceURL          *string `json:"invoiceUrl"`
	BarcodeNumber       *string `json:"barcodeNumber"`
	PostalService       bool    `json:"postalService"`
	Object              string  `json:"object"`
	CreatedAt           string  `json:"createdAt"`
	DeletedAt           *string `json:"deletedAt"`
}

// AsaasPixData represents PIX QR code data
type AsaasPixData struct {
	Payload        string    `json:"payload"`
	EncodedImage   string    `json:"encodedImage"`
	ExpirationDate time.Time `json:"expirationDate"`
}

// NewPaymentService creates a new PaymentService instance
func NewPaymentService(cfg *config.Config) *PaymentService {
	return &PaymentService{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
				DisableKeepAlives:   false,
			},
		},
	}
}

// CreateCustomer creates a customer in Asaas
func (s *PaymentService) CreateCustomer(name, email, phone string) (*AsaasCustomer, error) {
	url := fmt.Sprintf("%s/customers", s.cfg.AsaasAPIURL)

	// Clean phone number (remove non-digits)
	cleanPhone := stripNonDigits(phone)
	if len(cleanPhone) < 10 {
		cleanPhone = "11999999999" // Default test number
	}

	payload := map[string]interface{}{
		"name":        name,
		"email":       email,
		"mobilePhone": cleanPhone,
		"cpfCnpj":     "00000000000191", // Default CPF when not provided
	}

	jsonData, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", s.cfg.AsaasAPIKey)
	req.Header.Set("User-Agent", "RosaMexicano/1.0")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		log.Printf("Asaas API error (status %d): %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("asaas API error: status %d", resp.StatusCode)
	}

	var customer AsaasCustomer
	if err := json.Unmarshal(body, &customer); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &customer, nil
}

// CreatePayment creates a payment in Asaas
func (s *PaymentService) CreatePayment(customerID string, value float64, description, externalRef string) (*AsaasPayment, error) {
	url := fmt.Sprintf("%s/payments", s.cfg.AsaasAPIURL)

	// Due date 3 days from now
	dueDate := time.Now().AddDate(0, 0, 3).Format("2006-01-02")

	payload := map[string]interface{}{
		"customer":          customerID,
		"billingType":       "PIX",
		"value":             value,
		"dueDate":           dueDate,
		"description":       description,
		"externalReference": externalRef,
		"postalService":     false,
	}

	jsonData, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", s.cfg.AsaasAPIKey)
	req.Header.Set("User-Agent", "RosaMexicano/1.0")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		log.Printf("Asaas API error (status %d): %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("asaas API error: status %d", resp.StatusCode)
	}

	var payment AsaasPayment
	if err := json.Unmarshal(body, &payment); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &payment, nil
}

// GetPixQRCode retrieves PIX QR code for a payment
func (s *PaymentService) GetPixQRCode(paymentID string) (*AsaasPixData, error) {
	url := fmt.Sprintf("%s/payments/%s/pixQrCode", s.cfg.AsaasAPIURL, paymentID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", s.cfg.AsaasAPIKey)
	req.Header.Set("User-Agent", "RosaMexicano/1.0")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		log.Printf("Asaas API error (status %d): %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("asaas API error: status %d", resp.StatusCode)
	}

	var pixData AsaasPixData
	if err := json.Unmarshal(body, &pixData); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &pixData, nil
}

// GetPaymentStatus retrieves the current status of a payment
func (s *PaymentService) GetPaymentStatus(paymentID string) (*AsaasPayment, error) {
	url := fmt.Sprintf("%s/payments/%s", s.cfg.AsaasAPIURL, paymentID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", s.cfg.AsaasAPIKey)
	req.Header.Set("User-Agent", "RosaMexicano/1.0")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("asaas API error: status %d", resp.StatusCode)
	}

	var payment AsaasPayment
	if err := json.Unmarshal(body, &payment); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &payment, nil
}

// VerifyWebhookSignature verifies the signature of a webhook from Asaas
func (s *PaymentService) VerifyWebhookSignature(signature string, payload []byte) bool {
	mac := hmac.New(sha256.New, []byte(s.cfg.AsaasWebhookSecret))
	mac.Write(payload)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	// Constant-time comparison to prevent timing attacks
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

// stripNonDigits removes non-digit characters from a string
func stripNonDigits(s string) string {
	result := ""
	for _, char := range s {
		if char >= '0' && char <= '9' {
			result += string(char)
		}
	}
	return result
}

// PaymentStatus constants
const (
	PaymentStatusPending     = "PENDING"
	PaymentStatusRecieved    = "RECEIVED"
	PaymentStatusConfirmed   = "CONFIRMED"
	PaymentStatusOverdue     = "OVERDUE"
	PaymentStatusCancelled   = "CANCELLED"
	PaymentStatusDunning     = "DUNNING"
	PaymentStatusExpired     = "EXPIRED"
	PaymentStatusRefunded    = "REFUNDED"
	PaymentStatusPartRefund  = "PARTIALLY_REFUNDED"
)

// IsPaymentConfirmed checks if a payment is confirmed
func IsPaymentConfirmed(status string) bool {
	confirmedStatuses := map[string]bool{
		PaymentStatusRecieved:  true,
		PaymentStatusConfirmed: true,
	}
	return confirmedStatuses[status]
}
