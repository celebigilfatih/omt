-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('POS', 'IBAN', 'CASH', 'HAND_DELIVERY', 'MAIL_ORDER', 'HOTEL_PAYMENT');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
