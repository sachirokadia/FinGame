CREATE TABLE "CategoryBudget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CategoryBudget_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CategoryBudget_userId_category_month_year_key"
  ON "CategoryBudget"("userId", "category", "month", "year");

ALTER TABLE "CategoryBudget"
  ADD CONSTRAINT "CategoryBudget_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
