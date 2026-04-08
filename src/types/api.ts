/**
 * @module api
 * Tipos compartidos entre frontend y API.
 * Definen la forma exacta de los datos que viajan entre cliente y servidor.
 * Los nombres de campos están en español para coincidir con el dominio clínico.
 */

/** Envoltorio estándar de respuesta exitosa con paginación opcional. */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

/** Estructura de error estandarizada con código y mensaje legible. */
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Datos del paciente en formato anidado para el frontend.
 * El backend transforma el modelo plano de Prisma a esta estructura
 * para facilitar el manejo de secciones (contacto de emergencia, estilo de vida, perfil clínico).
 */
export interface PatientResponse {
  id: string;
  nombre: string;
  apellido: string;
  dpi: string;
  fechaNacimiento: string;
  genero: 'M' | 'F';
  telefono: string;
  email: string;
  direccion: string;
  ocupacion: string;
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  antecedentesMedicos: string[];
  antecedentesFamiliares: string[];
  alergias: string[];
  medicamentos: string[];
  estiloVida: {
    nivelActividad: 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
    horasSueno: number;
    consumoAlcohol: boolean;
    fumador: boolean;
    ejercicioSemanal: string;
  };
  perfilClinico: {
    estatura: number;
    patologias: string[];
    examenesLaboratorio: string[];
    sintomas: string[];
    vicios: string[];
    alimentosNoTolerables: string[];
  };
  fechaRegistro: string;
  notas: string;
}

/** Cita programada con un paciente. Incluye datos del paciente cuando se obtiene desde la lista general. */
export interface Appointment {
  id: string;
  pacienteId: string;
  fecha: string;
  hora: string;
  duracion?: number;
  tipo: 'primera_vez' | 'seguimiento' | 'control' | 'emergencia';
  motivo: string;
  estado: 'programada' | 'completada' | 'cancelada';
  notas: string;
  patient?: { id: string; nombre: string; apellido: string };
}

/**
 * Mediciones antropométricas tomadas durante una consulta.
 * Incluye composición corporal (grasa, músculo, agua) y métricas derivadas (IMC, DCI).
 */
export interface Anthropometry {
  id: string;
  pacienteId: string;
  consultaId: string;
  fecha: string;
  peso: number;
  talla: number;
  imc: number;
  circunferenciaCintura: number;
  circunferenciaCadera: number;
  porcentajeGrasa: number;
  pesoIdeal: number;
  porcentajeAgua: number;
  masaMusculo: number;
  valoracionFisica: number;
  masaOsea: number;
  dci: number;
  edadMetabolica: number;
  grasaVisceral: number;
  notas: string;
}

/** Consulta nutricional con sus relaciones opcionales de antropometría y plan. */
export interface ConsultationResponse {
  id: string;
  pacienteId: string;
  fecha: string;
  motivo: string;
  notasClinicas: string;
  diagnostico: string;
  recomendaciones: string;
  antropometriaId: string | null;
  planNutricionalId?: string | null;
  proximaCita?: string | null;
  anthropometry?: Anthropometry | null;
  nutritionalPlan?: NutritionalPlanResponse | null;
  patient?: { id: string; nombre: string; apellido: string };
}

/** Plan nutricional con macros calculados (en porcentaje y gramos) y detalle de comidas. */
export interface NutritionalPlanResponse {
  id: string;
  pacienteId: string;
  consultaId: string;
  fecha: string;
  objetivo: string;
  caloriasDiarias: number;
  macros: {
    proteinasPorcentaje: number;
    carbohidratosPorcentaje: number;
    grasasPorcentaje: number;
    proteinasGramos: number;
    carbohidratosGramos: number;
    grasasGramos: number;
  };
  comidas: { nombre: string; hora: string; descripcion: string }[];
  restricciones: string[];
  suplementos: string[];
  notas: string;
}

/** Resultado de verificación de traslape de horarios al crear/editar citas. */
export interface OverlapCheckResponse {
  hasOverlap: boolean;
  overlappingAppointments: {
    id: string;
    pacienteId: string;
    fecha: string;
    hora: string;
    duracion: number;
  }[];
}

/** Métricas agregadas para el panel principal. */
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  upcomingAppointments: number;
  totalConsultations: number;
  recentPatients: number;
}

// Alias de compatibilidad: permiten que imports antiguos de @/data/types sigan funcionando
export type Patient = PatientResponse;
export type Consultation = ConsultationResponse;
export type NutritionalPlan = NutritionalPlanResponse;
