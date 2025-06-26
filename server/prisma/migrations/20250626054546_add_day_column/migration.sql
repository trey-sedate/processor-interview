/*
  Warnings:

  - Added the required column `day` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cardNumber" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "day" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL
);
INSERT INTO "new_Transaction" ("amount", "cardNumber", "cardType", "id", "timestamp") SELECT "amount", "cardNumber", "cardType", "id", "timestamp" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_cardType_idx" ON "Transaction"("cardType");
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp");
CREATE INDEX "Transaction_day_idx" ON "Transaction"("day");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
