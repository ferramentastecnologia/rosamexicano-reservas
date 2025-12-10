-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "mesasSelecionadas" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_horario_idx" ON "Reservation"("horario");

-- CreateIndex
CREATE INDEX "Reservation_data_horario_idx" ON "Reservation"("data", "horario");
