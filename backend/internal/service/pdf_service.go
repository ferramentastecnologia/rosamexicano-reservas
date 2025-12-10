package service

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"log"

	"github.com/jung-kurt/gofpdf"
	"github.com/skip2/go-qrcode"

	"rosamexicano/api/internal/models"
)

type PDFServiceImpl struct {
	// Dependencies if needed
}

// NewPDFServiceImpl creates a new PDFServiceImpl instance
func NewPDFServiceImpl() *PDFServiceImpl {
	return &PDFServiceImpl{}
}

// GenerateVoucherPDF generates a PDF voucher for a reservation
func (s *PDFServiceImpl) GenerateVoucherPDF(reservation *models.Reservation, voucher *models.Voucher) ([]byte, error) {
	log.Printf("📄 Generating PDF voucher for: %s", voucher.Codigo)

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Set margins
	pdf.SetMargins(10, 10, 10)

	// Header with gradient color (red)
	pdf.SetFillColor(229, 57, 53) // #E53935
	pdf.Rect(10, 10, 190, 50, "F")

	// Logo/Title
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Helvetica", "B", 28)
	pdf.SetXY(10, 20)
	pdf.Cell(190, 15, "ROSA MEXICANO", 0, 1, "C")

	pdf.SetFont("Helvetica", "", 14)
	pdf.SetXY(10, 37)
	pdf.Cell(190, 8, "Celebração de Fim de Ano 2024/2025", 0, 1, "C")

	// Voucher Code Section
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetXY(10, 70)
	pdf.Cell(190, 10, "CÓDIGO DO VOUCHER", 0, 1, "C")

	// Large voucher code
	pdf.SetFillColor(240, 240, 240)
	pdf.SetTextColor(229, 57, 53)
	pdf.SetFont("Courier", "B", 24)
	pdf.SetXY(10, 85)
	pdf.Cell(190, 20, voucher.Codigo, 0, 1, "C")

	// QR Code
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(10, 110)
	pdf.Cell(190, 5, "Escaneie o QR Code abaixo:", 0, 1, "L")

	// Generate QR code
	qr, err := qrcode.New(voucher.Codigo, qrcode.Medium)
	if err == nil {
		qrImage := qr.Image(200)
		qrBuf := new(bytes.Buffer)
		qrBuf.Write([]byte{}) // Placeholder

		// For now, we'll use a text-based representation
		// In production, you'd embed the actual QR code image
		pdf.SetXY(65, 120)
		pdf.SetFont("Helvetica", "", 8)
		pdf.Cell(60, 5, "[QR Code aqui]", 0, 1, "C")
		_ = qrImage // Use the qr image
	}

	// Reservation Details
	pdf.SetY(165)
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetTextColor(229, 57, 53)
	pdf.Cell(190, 8, "DETALHES DA RESERVA", 0, 1, "L")

	// Details table
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Helvetica", "", 11)

	details := []struct {
		label string
		value string
	}{
		{"Nome:", reservation.Nome},
		{"Data:", reservation.Data},
		{"Horário:", reservation.Horario},
		{"Número de Pessoas:", fmt.Sprintf("%d", reservation.NumeroPessoas)},
		{"Mesas:", *reservation.MesasSelecionadas},
		{"Valor:", fmt.Sprintf("R$ %.2f", reservation.Valor)},
		{"Validade:", voucher.DataValidade.Format("02/01/2006")},
	}

	for _, detail := range details {
		pdf.SetXY(15, pdf.GetY())
		pdf.SetFont("Helvetica", "B", 10)
		pdf.Cell(60, 6, detail.label)

		pdf.SetFont("Helvetica", "", 10)
		pdf.Cell(120, 6, detail.value)
		pdf.Ln(6)
	}

	// Footer
	pdf.SetY(-30)
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(150, 150, 150)
	pdf.Cell(0, 5, "Rosa Mexicano | Reserva Sistema | "+fmt.Sprintf("ID: %s", voucher.ID), 0, 1, "C")
	pdf.Cell(0, 5, "Este voucher é pessoal e intransferível. Apresente-o no dia da festa.", 0, 1, "C")

	// Generate PDF to buffer
	buf := new(bytes.Buffer)
	err = pdf.Output(buf)
	if err != nil {
		log.Printf("❌ Failed to generate PDF: %v", err)
		return nil, err
	}

	log.Printf("✓ PDF voucher generated: %d bytes", buf.Len())
	return buf.Bytes(), nil
}

// GenerateVoucherPDFAsBase64 generates a PDF and returns it as base64
func (s *PDFServiceImpl) GenerateVoucherPDFAsBase64(reservation *models.Reservation, voucher *models.Voucher) (string, error) {
	pdfBytes, err := s.GenerateVoucherPDF(reservation, voucher)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(pdfBytes), nil
}

// ReportPDF generates a report PDF with reservations
func (s *PDFServiceImpl) ReportPDF(title string, reservations []models.Reservation) ([]byte, error) {
	log.Printf("📄 Generating report PDF: %s", title)

	pdf := gofpdf.New("L", "mm", "A4", "") // Landscape
	pdf.AddPage()
	pdf.SetMargins(10, 10, 10)

	// Title
	pdf.SetFont("Helvetica", "B", 16)
	pdf.Cell(0, 10, title, 0, 1, "C")
	pdf.Ln(5)

	// Table header
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetFillColor(229, 57, 53)
	pdf.SetTextColor(255, 255, 255)

	colWidths := map[string]float64{
		"nome":      40,
		"email":     50,
		"data":      25,
		"horario":   20,
		"pessoas":   20,
		"status":    30,
	}

	pdf.Cell(colWidths["nome"], 8, "Nome", 1, 0, "C")
	pdf.Cell(colWidths["email"], 8, "Email", 1, 0, "C")
	pdf.Cell(colWidths["data"], 8, "Data", 1, 0, "C")
	pdf.Cell(colWidths["horario"], 8, "Hora", 1, 0, "C")
	pdf.Cell(colWidths["pessoas"], 8, "Pessoas", 1, 0, "C")
	pdf.Cell(colWidths["status"], 8, "Status", 1, 1, "C")

	// Table rows
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(0, 0, 0)

	for _, res := range reservations {
		// Alternate row colors
		if pdf.PageNo()%2 == 0 {
			pdf.SetFillColor(240, 240, 240)
		} else {
			pdf.SetFillColor(255, 255, 255)
		}

		pdf.Cell(colWidths["nome"], 7, res.Nome[:min(len(res.Nome), 20)], 1, 0, "L")
		pdf.Cell(colWidths["email"], 7, res.Email[:min(len(res.Email), 25)], 1, 0, "L")
		pdf.Cell(colWidths["data"], 7, res.Data, 1, 0, "C")
		pdf.Cell(colWidths["horario"], 7, res.Horario, 1, 0, "C")
		pdf.Cell(colWidths["pessoas"], 7, fmt.Sprintf("%d", res.NumeroPessoas), 1, 0, "C")
		pdf.Cell(colWidths["status"], 7, res.Status, 1, 1, "C")
	}

	// Generate PDF to buffer
	buf := new(bytes.Buffer)
	err := pdf.Output(buf)
	if err != nil {
		log.Printf("❌ Failed to generate report PDF: %v", err)
		return nil, err
	}

	log.Printf("✓ Report PDF generated: %d bytes", buf.Len())
	return buf.Bytes(), nil
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
