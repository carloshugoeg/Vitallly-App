/**
 * Esquemas de validación Zod para todas las entradas de la API.
 * Se usan tanto en withValidation (parseBody/parseSearchParams)
 * como directamente en los route handlers.
 *
 * Convención: los mensajes de error están en español porque se
 * muestran directamente al usuario en el frontend.
 */
import { z } from 'zod';

// ─── Autenticación ─────────────────────────────────────

/** Validación de login: mínimo 8 chars para contraseña (legacy). */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

/**
 * Registro vía invitación: contraseña con requisitos estrictos
 * (10+ chars, mayúscula, número y carácter especial).
 * El token vincula al nuevo usuario con el tenant de la invitación.
 */
export const registerSchema = z.object({
  token: z.string().min(1),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(10, 'La contraseña debe tener al menos 10 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'La contraseña debe tener al menos un carácter especial'),
  titulo: z.string().optional(),
});

/** Solo NUTRITIONIST o ASSISTANT pueden ser invitados; ADMIN se crea por seed. */
export const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['NUTRITIONIST', 'ASSISTANT']),
});

// ─── Pacientes ─────────────────────────────────────────

/**
 * Creación de paciente: DPI es obligatorio como identificador único
 * nacional (Guatemala). Los campos anidados (contactoEmergencia,
 * estiloVida, perfilClinico) se aplanan al guardar en la BD.
 */
export const patientCreateSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  dpi: z.string().min(1, 'DPI requerido'),
  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento requerida'),
  genero: z.enum(['M', 'F']),
  telefono: z.string().min(1, 'Teléfono requerido'),
  email: z.string().optional().default(''),
  direccion: z.string().optional().default(''),
  ocupacion: z.string().optional().default(''),
  contactoEmergencia: z.object({
    nombre: z.string().optional().default(''),
    telefono: z.string().optional().default(''),
    relacion: z.string().optional().default(''),
  }).optional(),
  antecedentesMedicos: z.array(z.string()).optional().default([]),
  antecedentesFamiliares: z.array(z.string()).optional().default([]),
  alergias: z.array(z.string()).optional().default([]),
  medicamentos: z.array(z.string()).optional().default([]),
  estiloVida: z.object({
    nivelActividad: z.enum(['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo']).optional().default('sedentario'),
    horasSueno: z.number().optional().default(7),
    consumoAlcohol: z.boolean().optional().default(false),
    fumador: z.boolean().optional().default(false),
    ejercicioSemanal: z.string().optional().default(''),
  }).optional(),
  perfilClinico: z.object({
    estatura: z.number().optional().default(0),
    patologias: z.array(z.string()).optional().default([]),
    examenesLaboratorio: z.array(z.string()).optional().default([]),
    sintomas: z.array(z.string()).optional().default([]),
    vicios: z.array(z.string()).optional().default([]),
    alimentosNoTolerables: z.array(z.string()).optional().default([]),
  }).optional(),
  fechaRegistro: z.string().optional(),
  notas: z.string().optional().default(''),
});

/** Actualización parcial: todos los campos son opcionales. */
export const patientUpdateSchema = patientCreateSchema.partial();

// ─── Citas ─────────────────────────────────────────────

/** Cita: fecha y hora son strings (YYYY-MM-DD y HH:mm) para simplificar timezone handling. */
export const appointmentCreateSchema = z.object({
  pacienteId: z.string().min(1),
  fecha: z.string().min(1, 'Fecha requerida'),
  hora: z.string().min(1, 'Hora requerida'),
  duracion: z.number().optional().default(60),
  tipo: z.enum(['primera_vez', 'seguimiento', 'control', 'emergencia']),
  motivo: z.string().optional().default(''),
  estado: z.enum(['programada', 'completada', 'cancelada']).optional().default('programada'),
  notas: z.string().optional().default(''),
});

export const appointmentUpdateSchema = appointmentCreateSchema.partial();

/** Verificación de solapamiento: excluye opcionalmente la cita que se está editando. */
export const checkOverlapSchema = z.object({
  fecha: z.string().min(1),
  hora: z.string().min(1),
  duracion: z.number().optional().default(60),
  excludeId: z.string().optional(),
});

// ─── Consultas ─────────────────────────────────────────

/**
 * Consulta: agrupa notas clínicas + antropometría + plan nutricional.
 * Los sub-objetos anthropometry y nutritionalPlan son opcionales;
 * se crean como registros separados vinculados a la consulta.
 */
export const consultationCreateSchema = z.object({
  pacienteId: z.string().min(1),
  fecha: z.string().min(1, 'Fecha requerida'),
  motivo: z.string().optional().default(''),
  notasClinicas: z.string().optional().default(''),
  diagnostico: z.string().optional().default(''),
  recomendaciones: z.string().optional().default(''),
  proximaCita: z.string().nullable().optional(),
  /** Medidas corporales; los máximos previenen errores de digitación. */
  anthropometry: z.object({
    peso: z.number().positive('Peso debe ser positivo').max(500, 'Peso no puede exceder 500 kg'),
    talla: z.number().positive('Talla debe ser positiva').max(300, 'Talla no puede exceder 300 cm'),
    imc: z.number().min(0).max(200),
    circunferenciaCintura: z.number().min(0).max(300).optional().default(0),
    circunferenciaCadera: z.number().min(0).max(300).optional().default(0),
    porcentajeGrasa: z.number().min(0).max(100).optional().default(0),
    pesoIdeal: z.number().min(0).max(500).optional().default(0),
    porcentajeAgua: z.number().min(0).max(100).optional().default(0),
    masaMusculo: z.number().min(0).max(500).optional().default(0),
    valoracionFisica: z.number().min(0).max(100).optional().default(0),
    masaOsea: z.number().min(0).max(100).optional().default(0),
    dci: z.number().min(0).max(10000).optional().default(0),
    edadMetabolica: z.number().min(0).max(150).optional().default(0),
    grasaVisceral: z.number().min(0).max(100).optional().default(0),
    notas: z.string().optional().default(''),
  }).optional(),
  nutritionalPlan: z.object({
    objetivo: z.string().optional().default(''),
    caloriasDiarias: z.number().optional().default(0),
    proteinasPorcentaje: z.number().optional().default(0),
    carbohidratosPorcentaje: z.number().optional().default(0),
    grasasPorcentaje: z.number().optional().default(0),
    proteinasGramos: z.number().optional().default(0),
    carbohidratosGramos: z.number().optional().default(0),
    grasasGramos: z.number().optional().default(0),
    comidas: z.array(z.object({
      nombre: z.string(),
      hora: z.string(),
      descripcion: z.string(),
    })).optional().default([]),
    restricciones: z.array(z.string()).optional().default([]),
    suplementos: z.array(z.string()).optional().default([]),
    notas: z.string().optional().default(''),
  }).optional(),
});

export const consultationUpdateSchema = consultationCreateSchema.partial();

// ─── Planes Nutricionales ──────────────────────────────

export const nutritionalPlanCreateSchema = z.object({
  pacienteId: z.string().min(1),
  fecha: z.string().min(1),
  objetivo: z.string().optional().default(''),
  caloriasDiarias: z.number().optional().default(0),
  proteinasPorcentaje: z.number().optional().default(0),
  carbohidratosPorcentaje: z.number().optional().default(0),
  grasasPorcentaje: z.number().optional().default(0),
  proteinasGramos: z.number().optional().default(0),
  carbohidratosGramos: z.number().optional().default(0),
  grasasGramos: z.number().optional().default(0),
  comidas: z.array(z.object({
    nombre: z.string(),
    hora: z.string(),
    descripcion: z.string(),
  })).optional().default([]),
  restricciones: z.array(z.string()).optional().default([]),
  suplementos: z.array(z.string()).optional().default([]),
  notas: z.string().optional().default(''),
});

export const nutritionalPlanUpdateSchema = nutritionalPlanCreateSchema.partial();

// ─── Calculadora ───────────────────────────────────────

/**
 * Calculadora nutricional: calcula TMB, GET y distribución de macros.
 * Los porcentajes de macros deben sumar 100; el frontend lo valida,
 * pero aquí se aceptan individualmente por flexibilidad.
 */
export const calculatorSchema = z.object({
  peso: z.number().positive().max(500),
  tallaCm: z.number().positive().max(300),
  edad: z.number().positive().max(150),
  genero: z.enum(['M', 'F']),
  nivelActividad: z.enum(['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo']),
  formula: z.enum(['harris_benedict', 'mifflin_st_jeor']).optional().default('harris_benedict'),
  proteinasPct: z.number().min(0).max(100).optional().default(30),
  carbohidratosPct: z.number().min(0).max(100).optional().default(40),
  grasasPct: z.number().min(0).max(100).optional().default(30),
});

/** Guarda resultados de la calculadora como plan nutricional independiente del paciente. */
export const saveToPatientSchema = z.object({
  pacienteId: z.string().min(1),
  calculatorResults: z.object({
    caloriasDiarias: z.number(),
    proteinasPorcentaje: z.number(),
    carbohidratosPorcentaje: z.number(),
    grasasPorcentaje: z.number(),
    proteinasGramos: z.number(),
    carbohidratosGramos: z.number(),
    grasasGramos: z.number(),
  }),
  objetivo: z.string().optional().default(''),
  comidas: z.array(z.object({
    nombre: z.string(),
    hora: z.string(),
    descripcion: z.string(),
  })).optional().default([]),
  restricciones: z.array(z.string()).optional().default([]),
  suplementos: z.array(z.string()).optional().default([]),
  notas: z.string().optional().default(''),
});

// ─── Configuración ─────────────────────────────────────

/**
 * Preferencias del nutricionista: qué campos mostrar en consultas,
 * duración por defecto de citas, macros preferidos y horario laboral.
 */
export const settingsUpdateSchema = z.object({
  /** Configura visibilidad/obligatoriedad de cada campo de consulta por clave. */
  consultationFieldConfig: z.record(z.string(), z.object({
    visible: z.boolean(),
    required: z.boolean().optional(),
    label: z.string().optional(),
    order: z.number().optional(),
  })).optional(),
  defaultAppointmentDuration: z.number().min(15).max(240).optional(),
  defaultProteinPct: z.number().min(0).max(100).optional(),
  defaultCarbPct: z.number().min(0).max(100).optional(),
  defaultFatPct: z.number().min(0).max(100).optional(),
  preferredFormula: z.enum(['harris_benedict', 'mifflin_st_jeor']).optional(),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  timezone: z.string().optional(),
});

// ─── Parámetros de listado ─────────────────────────────

/**
 * Parámetros comunes de paginación, búsqueda y ordenamiento
 * reutilizados por todos los endpoints de listado.
 * Se usa z.coerce para convertir query strings a números.
 */
const baseListParams = {
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(1000).optional().default(20),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
};

export const patientListParamsSchema = z.object({
  ...baseListParams,
  sortBy: z.enum(['createdAt', 'nombre', 'apellido', 'fechaNacimiento', 'fechaRegistro']).optional(),
});

export const appointmentListParamsSchema = z.object({
  ...baseListParams,
  sortBy: z.enum(['fecha', 'hora', 'createdAt', 'tipo', 'estado']).optional(),
  estado: z.enum(['programada', 'completada', 'cancelada']).optional(),
  pacienteId: z.string().optional(),
});

export const consultationListParamsSchema = z.object({
  ...baseListParams,
  sortBy: z.enum(['fecha', 'createdAt', 'motivo']).optional(),
  pacienteId: z.string().optional(),
});

export const nutritionalPlanListParamsSchema = z.object({
  ...baseListParams,
  sortBy: z.enum(['fecha', 'createdAt', 'objetivo']).optional(),
  pacienteId: z.string().optional(),
});

export const anthropometryListParamsSchema = z.object({
  ...baseListParams,
  sortBy: z.enum(['fecha', 'createdAt', 'peso', 'talla', 'imc']).optional(),
});
