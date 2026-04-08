-- DropIndex
DROP INDEX IF EXISTS "Patient_tenantId_dpi_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Patient_tenantId_dpi_key" ON "Patient"("tenantId", "dpi");
