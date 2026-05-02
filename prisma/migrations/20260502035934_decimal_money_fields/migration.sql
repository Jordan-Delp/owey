/*
  Warnings:

  - You are about to alter the column `price` on the `LineItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `tax` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `tip` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "LineItem" ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "tax" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "tip" SET DATA TYPE DECIMAL(10,2);
