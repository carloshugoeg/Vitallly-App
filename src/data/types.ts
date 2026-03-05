export interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  dpi: string;
  fechaNacimiento: string; // ISO date
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
    estatura: number; // cm
    patologias: string[];
    examenesLaboratorio: string[];
    sintomas: string[];
    vicios: string[];
    alimentosNoTolerables: string[];
  };
  fechaRegistro: string;
  notas: string;
}

export interface Appointment {
  id: string;
  pacienteId: string;
  fecha: string; // ISO date
  hora: string; // HH:mm
  tipo: 'primera_vez' | 'seguimiento' | 'control' | 'emergencia';
  motivo: string;
  estado: 'programada' | 'completada' | 'cancelada';
  notas: string;
}

export interface Anthropometry {
  id: string;
  pacienteId: string;
  consultaId: string;
  fecha: string;
  peso: number; // kg
  talla: number; // cm
  imc: number;
  circunferenciaCintura: number; // cm
  circunferenciaCadera: number; // cm
  porcentajeGrasa: number;
  pesoIdeal: number; // kg
  porcentajeAgua: number; // %
  masaMusculo: number; // kg
  valoracionFisica: number; // 1-9
  masaOsea: number; // kg
  dci: number; // kcal (daily calorie intake)
  edadMetabolica: number; // years
  grasaVisceral: number; // 1-59
  notas: string;
}

export interface Consultation {
  id: string;
  pacienteId: string;
  fecha: string;
  motivo: string;
  notasClinicas: string;
  diagnostico: string;
  recomendaciones: string;
  antropometriaId: string;
  planNutricionalId?: string;
  proximaCita?: string;
}

export interface NutritionalPlan {
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
  comidas: {
    nombre: string;
    hora: string;
    descripcion: string;
  }[];
  restricciones: string[];
  suplementos: string[];
  notas: string;
}
