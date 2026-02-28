export const COLORS = {
  primary: '#2D5A3D',
  primaryLight: '#3A7350',
  primaryDark: '#1E3D29',
  primary50: '#E8F5EC',
  primary100: '#C8E6C9',
  cream: '#FAF8F5',
  surface: '#FFFFFF',
  danger: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#16A34A',
};

export const IMC_CLASSIFICATIONS = [
  { min: 0, max: 18.5, label: 'Bajo peso', color: '#3B82F6' },
  { min: 18.5, max: 24.9, label: 'Normal', color: '#16A34A' },
  { min: 25, max: 29.9, label: 'Sobrepeso', color: '#F59E0B' },
  { min: 30, max: 34.9, label: 'Obesidad grado I', color: '#F97316' },
  { min: 35, max: 39.9, label: 'Obesidad grado II', color: '#DC2626' },
  { min: 40, max: Infinity, label: 'Obesidad grado III', color: '#991B1B' },
];

export const ACTIVITY_LEVELS = {
  sedentario: { label: 'Sedentario', factor: 1.2, description: 'Poco o ningún ejercicio' },
  ligero: { label: 'Ligeramente activo', factor: 1.375, description: 'Ejercicio ligero 1-3 días/semana' },
  moderado: { label: 'Moderadamente activo', factor: 1.55, description: 'Ejercicio moderado 3-5 días/semana' },
  activo: { label: 'Activo', factor: 1.725, description: 'Ejercicio intenso 6-7 días/semana' },
  muy_activo: { label: 'Muy activo', factor: 1.9, description: 'Ejercicio muy intenso, trabajo físico' },
};

export const APPOINTMENT_TYPES = {
  primera_vez: 'Primera vez',
  seguimiento: 'Seguimiento',
  control: 'Control',
  emergencia: 'Emergencia',
};

export const APPOINTMENT_STATUS = {
  programada: { label: 'Programada', color: 'bg-blue-100 text-blue-700' },
  completada: { label: 'Completada', color: 'bg-green-100 text-green-700' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};
