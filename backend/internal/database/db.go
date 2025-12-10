package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"rosamexicano/api/internal/config"
	"rosamexicano/api/internal/models"
)

var DB *gorm.DB

// Connect initializes database connection and runs migrations
func Connect(cfg *config.Config) error {
	dsn := cfg.DatabaseURL

	// Determine log level
	logLevel := logger.Silent
	if cfg.IsDevelopment() {
		logLevel = logger.Info
	}

	// Configure GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	// Connect to database
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✓ Database connected successfully")

	// Get underlying SQL database
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("✓ Connection pool configured")

	// Run auto-migrations if enabled
	if cfg.AutoMigrate {
		err = AutoMigrate()
		if err != nil {
			return fmt.Errorf("failed to run migrations: %w", err)
		}
	}

	return nil
}

// AutoMigrate runs all GORM auto-migrations
func AutoMigrate() error {
	err := DB.AutoMigrate(
		&models.Reservation{},
		&models.Voucher{},
		&models.Admin{},
	)
	if err != nil {
		return err
	}

	log.Println("✓ Database migrations completed")

	// Create indexes
	if !DB.Migrator().HasIndex("reservations", "idx_reservations_email_data") {
		DB.Migrator().CreateIndex("reservations", "email, data")
	}
	if !DB.Migrator().HasIndex("reservations", "idx_reservations_data_horario_status") {
		DB.Migrator().CreateIndex("reservations", "data, horario, status")
	}
	if !DB.Migrator().HasIndex("vouchers", "idx_vouchers_codigo_utilizado") {
		DB.Migrator().CreateIndex("vouchers", "codigo, utilizado")
	}
	if !DB.Migrator().HasIndex("admins", "idx_admins_email") {
		DB.Migrator().CreateIndex("admins", "email")
	}

	log.Println("✓ Indexes created/verified")
	return nil
}

// Close closes the database connection
func Close() error {
	if DB == nil {
		return nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	return sqlDB.Close()
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// SetDB sets the database instance (useful for testing)
func SetDB(db *gorm.DB) {
	DB = db
}

// HealthCheck performs a simple health check on the database
func HealthCheck() bool {
	if DB == nil {
		return false
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return false
	}

	return sqlDB.Ping() == nil
}
