-- AlterTable: add monthlyBudget column to User with default 10000
ALTER TABLE "User" ADD COLUMN "monthlyBudget" DOUBLE PRECISION NOT NULL DEFAULT 10000;
