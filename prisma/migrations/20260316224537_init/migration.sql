-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('primera_vez', 'seguimiento', 'control', 'emergencia');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('programada', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OWNER', 'NUTRITIONIST', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT '',
    "role" "UserRole" NOT NULL DEFAULT 'NUTRITIONIST',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'NUTRITIONIST',
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consultationFieldConfig" JSONB NOT NULL DEFAULT '{}',
    "defaultAppointmentDuration" INTEGER NOT NULL DEFAULT 60,
    "defaultProteinPct" INTEGER NOT NULL DEFAULT 30,
    "defaultCarbPct" INTEGER NOT NULL DEFAULT 40,
    "defaultFatPct" INTEGER NOT NULL DEFAULT 30,
    "preferredFormula" TEXT NOT NULL DEFAULT 'harris_benedict',
    "workingHours" JSONB NOT NULL DEFAULT '{"start": "08:00", "end": "17:00"}',
    "timezone" TEXT NOT NULL DEFAULT 'America/Guatemala',

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dpi" TEXT NOT NULL,
    "fechaNacimiento" TEXT NOT NULL,
    "genero" "Gender" NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "direccion" TEXT NOT NULL DEFAULT '',
    "ocupacion" TEXT NOT NULL DEFAULT '',
    "contactoEmergenciaNombre" TEXT NOT NULL DEFAULT '',
    "contactoEmergenciaTelefono" TEXT NOT NULL DEFAULT '',
    "contactoEmergenciaRelacion" TEXT NOT NULL DEFAULT '',
    "antecedentesMedicos" TEXT[],
    "antecedentesFamiliares" TEXT[],
    "alergias" TEXT[],
    "medicamentos" TEXT[],
    "nivelActividad" "ActivityLevel" NOT NULL DEFAULT 'sedentario',
    "horasSueno" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "consumoAlcohol" BOOLEAN NOT NULL DEFAULT false,
    "fumador" BOOLEAN NOT NULL DEFAULT false,
    "ejercicioSemanal" TEXT NOT NULL DEFAULT '',
    "estatura" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "patologias" TEXT[],
    "examenesLaboratorio" TEXT[],
    "sintomas" TEXT[],
    "vicios" TEXT[],
    "alimentosNoTolerables" TEXT[],
    "fechaRegistro" TEXT NOT NULL,
    "notas" TEXT NOT NULL DEFAULT '',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL DEFAULT 60,
    "tipo" "AppointmentType" NOT NULL,
    "motivo" TEXT NOT NULL DEFAULT '',
    "estado" "AppointmentStatus" NOT NULL DEFAULT 'programada',
    "notas" TEXT NOT NULL DEFAULT '',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "motivo" TEXT NOT NULL DEFAULT '',
    "notasClinicas" TEXT NOT NULL DEFAULT '',
    "diagnostico" TEXT NOT NULL DEFAULT '',
    "recomendaciones" TEXT NOT NULL DEFAULT '',
    "proximaCita" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anthropometry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "talla" DOUBLE PRECISION NOT NULL,
    "imc" DOUBLE PRECISION NOT NULL,
    "circunferenciaCintura" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "circunferenciaCadera" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentajeGrasa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pesoIdeal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentajeAgua" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "masaMusculo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valoracionFisica" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "masaOsea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dci" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "edadMetabolica" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grasaVisceral" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notas" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anthropometry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionalPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "consultaId" TEXT,
    "fecha" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL DEFAULT '',
    "caloriasDiarias" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proteinasPorcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbohidratosPorcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grasasPorcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proteinasGramos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbohidratosGramos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grasasGramos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comidas" JSONB NOT NULL DEFAULT '[]',
    "restricciones" TEXT[],
    "suplementos" TEXT[],
    "notas" TEXT NOT NULL DEFAULT '',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionalPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_tenantId_idx" ON "Invitation"("tenantId");

-- CreateIndex
CREATE INDEX "Invitation_token_idx" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "Patient_tenantId_apellido_nombre_idx" ON "Patient"("tenantId", "apellido", "nombre");

-- CreateIndex
CREATE INDEX "Patient_tenantId_dpi_idx" ON "Patient"("tenantId", "dpi");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_fecha_idx" ON "Appointment"("tenantId", "fecha");

-- CreateIndex
CREATE INDEX "Appointment_pacienteId_idx" ON "Appointment"("pacienteId");

-- CreateIndex
CREATE INDEX "Consultation_tenantId_fecha_idx" ON "Consultation"("tenantId", "fecha");

-- CreateIndex
CREATE INDEX "Consultation_pacienteId_idx" ON "Consultation"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Anthropometry_consultaId_key" ON "Anthropometry"("consultaId");

-- CreateIndex
CREATE INDEX "Anthropometry_tenantId_pacienteId_fecha_idx" ON "Anthropometry"("tenantId", "pacienteId", "fecha");

-- CreateIndex
CREATE INDEX "Anthropometry_pacienteId_idx" ON "Anthropometry"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionalPlan_consultaId_key" ON "NutritionalPlan"("consultaId");

-- CreateIndex
CREATE INDEX "NutritionalPlan_tenantId_pacienteId_idx" ON "NutritionalPlan"("tenantId", "pacienteId");

-- CreateIndex
CREATE INDEX "NutritionalPlan_pacienteId_idx" ON "NutritionalPlan"("pacienteId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anthropometry" ADD CONSTRAINT "Anthropometry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anthropometry" ADD CONSTRAINT "Anthropometry_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anthropometry" ADD CONSTRAINT "Anthropometry_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalPlan" ADD CONSTRAINT "NutritionalPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalPlan" ADD CONSTRAINT "NutritionalPlan_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalPlan" ADD CONSTRAINT "NutritionalPlan_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
