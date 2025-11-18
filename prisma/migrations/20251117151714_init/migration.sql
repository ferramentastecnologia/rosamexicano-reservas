-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "externalRef" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "numeroPessoas" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "utilizado" BOOLEAN NOT NULL DEFAULT false,
    "dataUtilizacao" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_paymentId_key" ON "Reservation"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_externalRef_key" ON "Reservation"("externalRef");

-- CreateIndex
CREATE INDEX "Reservation_email_idx" ON "Reservation"("email");

-- CreateIndex
CREATE INDEX "Reservation_data_idx" ON "Reservation"("data");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_reservationId_key" ON "Voucher"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_codigo_key" ON "Voucher"("codigo");

-- CreateIndex
CREATE INDEX "Voucher_codigo_idx" ON "Voucher"("codigo");

-- CreateIndex
CREATE INDEX "Voucher_utilizado_idx" ON "Voucher"("utilizado");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
