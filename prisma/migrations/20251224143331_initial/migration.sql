-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "amount" DECIMAL(19,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "expense_date" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_expense_date" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "idx_category" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "idx_created_at" ON "expenses"("created_at");
