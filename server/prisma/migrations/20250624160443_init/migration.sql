-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cardNumber" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL
);

-- CreateTable
CREATE TABLE "RejectedTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalRecord" TEXT NOT NULL,
    "rejectionReason" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Transaction_cardType_idx" ON "Transaction"("cardType");

-- CreateIndex
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp");
