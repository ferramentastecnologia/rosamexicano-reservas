package service

import (
	"crypto/tls"
	"fmt"
	"log"
	"time"

	"gopkg.in/gomail.v2"

	"rosamexicano/api/internal/config"
	"rosamexicano/api/internal/models"
)

type EmailServiceImpl struct {
	cfg    *config.Config
	dialer *gomail.Dialer
}

// NewEmailServiceImpl creates a new EmailServiceImpl instance
func NewEmailServiceImpl(cfg *config.Config) *EmailServiceImpl {
	dialer := gomail.NewDialer(
		cfg.EmailHost,
		cfg.EmailPort,
		cfg.EmailUser,
		cfg.EmailPass,
	)

	// Force TLS
	dialer.TLSConfig = &tls.Config{
		MinVersion: tls.VersionTLS12,
	}

	return &EmailServiceImpl{
		cfg:    cfg,
		dialer: dialer,
	}
}

// SendConfirmationEmail sends a reservation confirmation email
func (s *EmailServiceImpl) SendConfirmationEmail(reservation *models.Reservation, pixQrCode string) error {
	log.Printf("📧 Sending confirmation email to: %s", reservation.Email)

	subject := "Reserva Confirmada - Rosa Mexicano"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
		.container { max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
		.header { background: linear-gradient(135deg, #E53935 0%, #B71C1C 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
		.header h1 { margin: 0; font-size: 28px; }
		.content { padding: 30px; }
		.details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
		.detail-row { margin: 10px 0; }
		.detail-label { font-weight: bold; color: #E53935; }
		.footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
		.btn { display: inline-block; background: #E53935; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Reserva Confirmada! 🎉</h1>
			<p>Rosa Mexicano - Celebração de Fim de Ano</p>
		</div>
		<div class="content">
			<p>Olá <strong>%s</strong>,</p>
			<p>Sua reserva foi criada com sucesso! Agora você precisa realizar o pagamento para confirmar sua presença.</p>

			<div class="details">
				<h3>Detalhes da Reserva:</h3>
				<div class="detail-row">
					<span class="detail-label">Data:</span> %s às %s
				</div>
				<div class="detail-row">
					<span class="detail-label">Pessoas:</span> %d
				</div>
				<div class="detail-row">
					<span class="detail-label">Valor:</span> R$ 50,00 por pessoa
				</div>
				<div class="detail-row">
					<span class="detail-label">Mesas:</span> %s
				</div>
			</div>

			<p><strong>Próximo passo:</strong> Escaneie o QR code abaixo ou use o código PIX para completar o pagamento.</p>

			<p style="text-align: center; background: #fff9e6; padding: 20px; border-radius: 8px;">
				<img src="cid:qrcode" alt="PIX QR Code" style="max-width: 300px;">
			</p>

			<p style="text-align: center; word-break: break-all; font-family: monospace; background: #f0f0f0; padding: 15px; border-radius: 5px;">
				Código PIX: (será enviado em email separado)
			</p>

			<p>Após confirmar o pagamento, você receberá um email com o voucher que deverá apresentar no dia da festa.</p>

			<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
				<strong>Dúvidas?</strong> Entre em contato conosco.<br>
				Rosa Mexicano | Tel: (11) 3000-0000
			</p>
		</div>
		<div class="footer">
			<p>Este é um email automático, não responda.</p>
			<p>&copy; 2024 Rosa Mexicano. Todos os direitos reservados.</p>
		</div>
	</div>
</body>
</html>
	`, reservation.Nome, reservation.Data, reservation.Horario, reservation.NumeroPessoas, *reservation.MesasSelecionadas)

	return s.sendEmail(reservation.Email, subject, body, map[string][]byte{
		"qrcode": []byte(pixQrCode),
	})
}

// SendVoucherEmail sends a voucher email with PDF attachment
func (s *EmailServiceImpl) SendVoucherEmail(reservation *models.Reservation, voucher *models.Voucher, pdfData []byte) error {
	log.Printf("📧 Sending voucher email to: %s", reservation.Email)

	subject := fmt.Sprintf("Seu Voucher - Reserva Rosa Mexicano (%s)", voucher.Codigo)
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
		.container { max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; }
		.header { background: linear-gradient(135deg, #E53935 0%, #B71C1C 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
		.voucher-code { background: #fff; padding: 20px; border-left: 4px solid #E53935; margin: 20px 0; font-size: 24px; font-weight: bold; text-align: center; color: #E53935; font-family: 'Courier New', monospace; letter-spacing: 2px; }
		.content { padding: 30px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Pagamento Confirmado! ✅</h1>
		</div>
		<div class="content">
			<p>Olá <strong>%s</strong>,</p>
			<p>Seu pagamento foi confirmado e sua reserva está garantida!</p>

			<p><strong>Seu Código de Voucher:</strong></p>
			<div class="voucher-code">%s</div>

			<p>Salve este código ou o PDF anexo. Você deverá apresentá-lo no dia da festa.</p>

			<p><strong>Detalhes da Reserva:</strong></p>
			<ul>
				<li>Data: %s às %s</li>
				<li>Pessoas: %d</li>
				<li>Mesas: %s</li>
				<li>Validade do Voucher: %s</li>
			</ul>

			<p>Estamos ansiosos por sua presença na Rosa Mexicano!</p>
		</div>
	</div>
</body>
</html>
	`, reservation.Nome, voucher.Codigo, reservation.Data, reservation.Horario,
		reservation.NumeroPessoas, *reservation.MesasSelecionadas, voucher.DataValidade.Format("02/01/2006"))

	return s.sendEmailWithAttachment(reservation.Email, subject, body, "voucher.pdf", pdfData)
}

// SendApprovalEmail sends a reservation approval email
func (s *EmailServiceImpl) SendApprovalEmail(reservation *models.Reservation) error {
	log.Printf("📧 Sending approval email to: %s", reservation.Email)

	subject := "Sua Reserva Foi Aprovada! 🎉"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; }
		.header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Reserva Aprovada! ✅</h1>
		</div>
		<div style="padding: 30px;">
			<p>Olá <strong>%s</strong>,</p>
			<p>Sua reserva para <strong>%s às %s</strong> foi aprovada!</p>
			<p>Você receberá em breve um email com seu voucher.</p>
		</div>
	</div>
</body>
</html>
	`, reservation.Nome, reservation.Data, reservation.Horario)

	return s.sendEmail(reservation.Email, subject, body, nil)
}

// SendRejectionEmail sends a reservation rejection email
func (s *EmailServiceImpl) SendRejectionEmail(reservation *models.Reservation, reason string) error {
	log.Printf("📧 Sending rejection email to: %s", reservation.Email)

	subject := "Atualização sobre sua Reserva"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; }
		.header { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Atualização sobre sua Reserva</h1>
		</div>
		<div style="padding: 30px;">
			<p>Olá <strong>%s</strong>,</p>
			<p>Infelizmente, sua reserva para <strong>%s às %s</strong> não pode ser confirmada.</p>
			<p><strong>Motivo:</strong> %s</p>
			<p>Entre em contato conosco para discutir outras opções.</p>
		</div>
	</div>
</body>
</html>
	`, reservation.Nome, reservation.Data, reservation.Horario, reason)

	return s.sendEmail(reservation.Email, subject, body, nil)
}

// sendEmail sends a simple email
func (s *EmailServiceImpl) sendEmail(to, subject, body string, attachments map[string][]byte) error {
	m := gomail.NewMessage()
	m.SetHeader("From", s.cfg.EmailUser)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	// Add attachments if provided
	for filename, data := range attachments {
		m.Attach(filename, gomail.SetCopyFunc(func(w gomail.WriterTo) error {
			_, err := w.Write(data)
			return err
		}))
	}

	if err := s.dialer.DialAndSend(m); err != nil {
		log.Printf("❌ Failed to send email: %v", err)
		return err
	}

	log.Printf("✓ Email sent to: %s", to)
	return nil
}

// sendEmailWithAttachment sends an email with attachment
func (s *EmailServiceImpl) sendEmailWithAttachment(to, subject, body, filename string, attachmentData []byte) error {
	m := gomail.NewMessage()
	m.SetHeader("From", s.cfg.EmailUser)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)
	m.Attach(filename, gomail.SetCopyFunc(func(w gomail.WriterTo) error {
		_, err := w.Write(attachmentData)
		return err
	}))

	if err := s.dialer.DialAndSend(m); err != nil {
		log.Printf("❌ Failed to send email with attachment: %v", err)
		return err
	}

	log.Printf("✓ Email with attachment sent to: %s", to)
	return nil
}
