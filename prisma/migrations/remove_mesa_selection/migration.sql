-- Remove mesa selection feature and add staff table assignment
-- This migration removes the mesasSelecionadas column and adds mesaAtribuida for staff assignment

-- Drop the old column for mesa selection by customers
ALTER TABLE "Reservation" DROP COLUMN IF EXISTS "mesasSelecionadas";

-- Add new column for staff table assignment
ALTER TABLE "Reservation" ADD COLUMN "mesaAtribuida" TEXT;

-- Add index for faster queries by assigned table
CREATE INDEX IF NOT EXISTS "Reservation_mesaAtribuida_idx" ON "Reservation"("mesaAtribuida");
