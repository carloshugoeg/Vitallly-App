/**
 * Seed de desarrollo: crea un tenant de demo, un usuario admin y datos realistas
 * de pacientes guatemaltecos con patologías comunes en nutrición clínica.
 *
 * NO usar en producción — contiene contraseñas hardcodeadas y datos ficticios.
 * Para producción usar seed-production.ts.
 */
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-vitally' },
    update: {},
    create: {
      name: 'Clínica Vitally',
      slug: 'clinica-vitally',
      isActive: true,
    },
  });

  // Contraseña de desarrollo — solo para seed local
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vitally.app' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@vitally.app',
      passwordHash,
      nombre: 'Admin',
      apellido: 'Vitally',
      titulo: 'Lic.',
      role: 'OWNER',
      isActive: true,
    },
  });

  // Settings con valores por defecto para que la UI funcione sin configuración manual
  await prisma.userSettings.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
    },
  });

  // 7 pacientes con perfiles clínicos variados (obesidad, hipertensión, anemia, diabetes,
  // SOP, gastritis, osteoporosis) para demostrar todos los flujos de la app
  const patientsData = [
    {
      nombre: 'Maria Jose', apellido: 'Lopez Hernandez', dpi: '2345678901234',
      fechaNacimiento: '1990-03-15', genero: 'F' as const, telefono: '5023 4567-8901',
      email: 'maria.lopez@email.com', direccion: 'Zona 1, Quetzaltenango', ocupacion: 'Maestra',
      contactoEmergenciaNombre: 'Carlos Lopez', contactoEmergenciaTelefono: '5023 5678-9012',
      contactoEmergenciaRelacion: 'Esposo',
      antecedentesMedicos: ['Hipotiroidismo', 'Resistencia a la insulina'],
      antecedentesFamiliares: ['Diabetes tipo 2 (madre)', 'Hipertension (padre)'],
      alergias: ['Mariscos'], medicamentos: ['Levotiroxina 50mcg'],
      nivelActividad: 'ligero' as const, horasSueno: 7, consumoAlcohol: false, fumador: false,
      ejercicioSemanal: 'Caminata 3 veces por semana, 30 min',
      estatura: 160,
      patologias: ['Hipotiroidismo', 'Resistencia a la insulina'],
      examenesLaboratorio: ['TSH: 3.2 mUI/L', 'Glucosa: 105 mg/dL', 'Insulina: 18 uU/mL'],
      sintomas: ['Fatiga', 'Retencion de liquidos', 'Dificultad para bajar de peso'],
      vicios: [] as string[], alimentosNoTolerables: ['Mariscos'],
      fechaRegistro: '2025-06-10',
      notas: 'Paciente motivada, busca bajar de peso para mejorar perfil metabolico.',
    },
    {
      nombre: 'Juan Carlos', apellido: 'Mendez Rios', dpi: '3456789012345',
      fechaNacimiento: '1985-08-22', genero: 'M' as const, telefono: '5023 6789-0123',
      email: 'jc.mendez@email.com', direccion: 'Zona 3, Quetzaltenango', ocupacion: 'Ingeniero Civil',
      contactoEmergenciaNombre: 'Ana de Mendez', contactoEmergenciaTelefono: '5023 7890-1234',
      contactoEmergenciaRelacion: 'Esposa',
      antecedentesMedicos: ['Hipertension controlada'],
      antecedentesFamiliares: ['Enfermedad cardiovascular (padre)'],
      alergias: [] as string[], medicamentos: ['Losartan 50mg'],
      nivelActividad: 'sedentario' as const, horasSueno: 6, consumoAlcohol: true, fumador: false,
      ejercicioSemanal: 'No realiza ejercicio regular',
      estatura: 175,
      patologias: ['Hipertension arterial'],
      examenesLaboratorio: ['PA: 140/90 mmHg', 'Colesterol total: 230 mg/dL', 'Trigliceridos: 180 mg/dL'],
      sintomas: ['Dolores de cabeza', 'Fatiga vespertina'],
      vicios: ['Alcohol social'], alimentosNoTolerables: [] as string[],
      fechaRegistro: '2025-07-01',
      notas: 'Referido por cardiologo. Necesita plan para reducir peso y mejorar presion arterial.',
    },
    {
      nombre: 'Ana Lucia', apellido: 'Garcia Morales', dpi: '4567890123456',
      fechaNacimiento: '1998-01-10', genero: 'F' as const, telefono: '5023 8901-2345',
      email: 'analucia.garcia@email.com', direccion: 'Zona 5, Quetzaltenango', ocupacion: 'Estudiante Universitaria',
      contactoEmergenciaNombre: 'Rosa Morales', contactoEmergenciaTelefono: '5023 9012-3456',
      contactoEmergenciaRelacion: 'Madre',
      antecedentesMedicos: ['Anemia ferropenica'],
      antecedentesFamiliares: ['Diabetes tipo 2 (abuelo paterno)'],
      alergias: ['Lactosa'], medicamentos: ['Sulfato ferroso'],
      nivelActividad: 'moderado' as const, horasSueno: 7, consumoAlcohol: false, fumador: false,
      ejercicioSemanal: 'Yoga 2 veces, caminata 4 veces por semana',
      estatura: 165,
      patologias: ['Anemia ferropenica'],
      examenesLaboratorio: ['Hemoglobina: 10.2 g/dL', 'Ferritina: 8 ng/mL', 'Hierro serico: 40 ug/dL'],
      sintomas: ['Cansancio', 'Palidez', 'Mareos ocasionales'],
      vicios: [] as string[], alimentosNoTolerables: ['Lactosa', 'Leche entera'],
      fechaRegistro: '2025-08-15',
      notas: 'Busca mejorar alimentacion y tratar anemia con dieta.',
    },
    {
      nombre: 'Roberto', apellido: 'Cifuentes Paz', dpi: '5678901234567',
      fechaNacimiento: '1975-11-30', genero: 'M' as const, telefono: '5023 0123-4567',
      email: 'roberto.cifuentes@email.com', direccion: 'Zona 2, Quetzaltenango', ocupacion: 'Comerciante',
      contactoEmergenciaNombre: 'Patricia de Cifuentes', contactoEmergenciaTelefono: '5023 1234-5678',
      contactoEmergenciaRelacion: 'Esposa',
      antecedentesMedicos: ['Diabetes tipo 2', 'Dislipidemia'],
      antecedentesFamiliares: ['Diabetes tipo 2 (ambos padres)', 'Obesidad (hermana)'],
      alergias: [] as string[], medicamentos: ['Metformina 850mg', 'Atorvastatina 20mg'],
      nivelActividad: 'sedentario' as const, horasSueno: 5, consumoAlcohol: true, fumador: true,
      ejercicioSemanal: 'Ninguno',
      estatura: 170,
      patologias: ['Diabetes tipo 2', 'Dislipidemia', 'Obesidad'],
      examenesLaboratorio: ['HbA1c: 8.2%', 'Glucosa: 180 mg/dL', 'Colesterol LDL: 160 mg/dL'],
      sintomas: ['Polidipsia', 'Poliuria', 'Vision borrosa'],
      vicios: ['Tabaco', 'Alcohol social'], alimentosNoTolerables: [] as string[],
      fechaRegistro: '2025-05-20',
      notas: 'Paciente con multiples factores de riesgo. Necesita seguimiento cercano.',
    },
    {
      nombre: 'Sofia', apellido: 'Ramirez Cux', dpi: '6789012345678',
      fechaNacimiento: '2000-06-18', genero: 'F' as const, telefono: '5023 2345-6789',
      email: 'sofia.ramirez@email.com', direccion: 'Zona 7, Quetzaltenango', ocupacion: 'Disenadora Grafica',
      contactoEmergenciaNombre: 'Luis Ramirez', contactoEmergenciaTelefono: '5023 3456-7890',
      contactoEmergenciaRelacion: 'Padre',
      antecedentesMedicos: ['Sindrome de ovario poliquistico'],
      antecedentesFamiliares: ['Hipotiroidismo (madre)'],
      alergias: ['Gluten'], medicamentos: ['Anticonceptivos orales'],
      nivelActividad: 'activo' as const, horasSueno: 8, consumoAlcohol: false, fumador: false,
      ejercicioSemanal: 'Gym 4 veces por semana, cardio y pesas',
      estatura: 168,
      patologias: ['SOP'],
      examenesLaboratorio: ['Testosterona: elevada', 'Insulina: 15 uU/mL'],
      sintomas: ['Acne', 'Irregularidad menstrual'],
      vicios: [] as string[], alimentosNoTolerables: ['Gluten'],
      fechaRegistro: '2025-09-01',
      notas: 'Deportista, busca optimizar rendimiento y manejar SOP con alimentacion.',
    },
    {
      nombre: 'Diego', apellido: 'Tzul Ixchop', dpi: '7890123456789',
      fechaNacimiento: '1992-04-05', genero: 'M' as const, telefono: '5023 4567-8901',
      email: 'diego.tzul@email.com', direccion: 'Zona 4, Quetzaltenango', ocupacion: 'Abogado',
      contactoEmergenciaNombre: 'Carmen Ixchop', contactoEmergenciaTelefono: '5023 5678-9012',
      contactoEmergenciaRelacion: 'Madre',
      antecedentesMedicos: ['Gastritis cronica', 'Reflujo gastroesofagico'],
      antecedentesFamiliares: ['Cancer gastrico (abuelo)'],
      alergias: [] as string[], medicamentos: ['Omeprazol 20mg'],
      nivelActividad: 'ligero' as const, horasSueno: 6, consumoAlcohol: false, fumador: false,
      ejercicioSemanal: 'Natacion 2 veces por semana',
      estatura: 172,
      patologias: ['Gastritis cronica', 'ERGE'],
      examenesLaboratorio: ['Endoscopia: gastritis erosiva leve'],
      sintomas: ['Acidez', 'Distension abdominal', 'Nauseas'],
      vicios: [] as string[], alimentosNoTolerables: ['Cafe', 'Alimentos picantes', 'Citricos'],
      fechaRegistro: '2025-07-20',
      notas: 'Necesita plan alimenticio que no agrave gastritis.',
    },
    {
      nombre: 'Carmen', apellido: 'Velasquez de Leon', dpi: '8901234567890',
      fechaNacimiento: '1968-12-01', genero: 'F' as const, telefono: '5023 6789-0123',
      email: 'carmen.velasquez@email.com', direccion: 'Zona 1, Quetzaltenango', ocupacion: 'Ama de casa',
      contactoEmergenciaNombre: 'Fernando de Leon', contactoEmergenciaTelefono: '5023 7890-1234',
      contactoEmergenciaRelacion: 'Esposo',
      antecedentesMedicos: ['Osteoporosis', 'Menopausia'],
      antecedentesFamiliares: ['Osteoporosis (madre)', 'Diabetes tipo 2 (padre)'],
      alergias: ['Mani'], medicamentos: ['Calcio + Vitamina D', 'Terapia hormonal'],
      nivelActividad: 'ligero' as const, horasSueno: 7, consumoAlcohol: false, fumador: false,
      ejercicioSemanal: 'Caminata diaria 20 min',
      estatura: 155,
      patologias: ['Osteoporosis', 'Menopausia'],
      examenesLaboratorio: ['Densitometria: T-score -2.8', 'Calcio serico: 8.5 mg/dL', 'Vitamina D: 18 ng/mL'],
      sintomas: ['Dolor articular', 'Bochornos', 'Insomnio'],
      vicios: [] as string[], alimentosNoTolerables: ['Mani', 'Nueces'],
      fechaRegistro: '2025-06-05',
      notas: 'Enfoque en salud osea y manejo de peso en menopausia.',
    },
  ];

  // Mapa DPI → ID para referenciar pacientes al crear consultas y citas
  const patients: Record<string, string> = {};
  for (const p of patientsData) {
    const patient = await prisma.patient.create({
      data: { tenantId: tenant.id, ...p },
    });
    patients[p.dpi] = patient.id;
  }

  const p1 = patients['2345678901234']; // Maria Jose - obesidad/hipotiroidismo
  const p2 = patients['3456789012345']; // Juan Carlos - hipertensión
  const p3 = patients['4567890123456']; // Ana Lucia - anemia
  const p4 = patients['5678901234567']; // Roberto - diabetes/dislipidemia
  const p5 = patients['6789012345678']; // Sofia - SOP
  const p6 = patients['7890123456789']; // Diego - gastritis
  const p7 = patients['8901234567890']; // Carmen - osteoporosis

  // Consultas con antropometría y planes nutricionales asociados.
  // Cada paciente tiene múltiples consultas para demostrar la gráfica de evolución.
  // P1 tiene 5 consultas para mostrar progreso a lo largo de 8 meses.
  const c1 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, fecha: '2025-06-10',
      motivo: 'Evaluación nutricional inicial',
      notasClinicas: 'Paciente refiere aumento de peso progresivo en últimos 2 años. Hipotiroidismo diagnosticado hace 3 años. Dieta rica en carbohidratos simples y baja en proteínas.',
      diagnostico: 'Obesidad grado I, hipotiroidismo en tratamiento, resistencia a la insulina.',
      recomendaciones: 'Iniciar plan de alimentación hipocalórico de 1500 kcal. Aumentar consumo de proteínas. Reducir carbohidratos simples. Incrementar actividad física gradualmente.',
      proximaCita: '2025-07-15',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, consultaId: c1.id, fecha: '2025-06-10',
      peso: 78.5, talla: 160, imc: 30.66, circunferenciaCintura: 92, circunferenciaCadera: 108,
      porcentajeGrasa: 38.2, pesoIdeal: 56.0, porcentajeAgua: 44.5, masaMusculo: 22.3,
      valoracionFisica: 4, masaOsea: 2.3, dci: 1480, edadMetabolica: 42, grasaVisceral: 8,
      notas: 'Medicion inicial',
    },
  });
  await prisma.nutritionalPlan.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, consultaId: c1.id, fecha: '2025-06-10',
      objetivo: 'Pérdida de peso gradual y mejora del perfil metabólico',
      caloriasDiarias: 1500,
      proteinasPorcentaje: 30, carbohidratosPorcentaje: 40, grasasPorcentaje: 30,
      proteinasGramos: 112, carbohidratosGramos: 150, grasasGramos: 50,
      comidas: [
        { nombre: 'Desayuno', hora: '07:00', descripcion: '2 huevos revueltos con espinaca, 1 tortilla de maíz, ½ aguacate, té sin azúcar' },
        { nombre: 'Snack AM', hora: '10:00', descripcion: '1 manzana con 1 cda de mantequilla de almendra' },
        { nombre: 'Almuerzo', hora: '13:00', descripcion: '120g pechuga de pollo a la plancha, 1 taza de arroz integral, ensalada mixta con limón' },
        { nombre: 'Snack PM', hora: '16:00', descripcion: 'Yogurt natural sin azúcar con semillas de chía' },
        { nombre: 'Cena', hora: '19:00', descripcion: '120g pescado al horno, verduras salteadas, 1 tortilla de maíz' },
      ],
      restricciones: ['Mariscos (alergia)', 'Azúcares refinados', 'Bebidas azucaradas'],
      suplementos: ['Omega-3 1000mg', 'Vitamina D 2000 UI'],
      notas: 'Adaptar según tolerancia. Hidratación mínima 2L de agua al día.',
    },
  });

  // P1 - Seguimiento: muestra pérdida de peso gradual para la gráfica de evolución
  const c2 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, fecha: '2025-07-15',
      motivo: 'Control mensual',
      notasClinicas: 'Paciente reporta buena adherencia al plan. Ha reducido consumo de azúcares. Energía mejorada.',
      diagnostico: 'Sobrepeso, buena evolución.',
      recomendaciones: 'Continuar con plan actual. Agregar colación de media mañana con fruta y proteína.',
      proximaCita: '2025-09-10',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, consultaId: c2.id, fecha: '2025-07-15',
      peso: 77.0, talla: 160, imc: 30.08, circunferenciaCintura: 90, circunferenciaCadera: 107,
      porcentajeGrasa: 37.5, pesoIdeal: 56.0, porcentajeAgua: 45.0, masaMusculo: 22.8,
      valoracionFisica: 4, masaOsea: 2.3, dci: 1470, edadMetabolica: 41, grasaVisceral: 8,
      notas: 'Bajo 1.5kg',
    },
  });

  // P1 - Trimestral: consulta sin plan nutricional nuevo (mantiene el anterior)
  const c3 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, fecha: '2025-09-10',
      motivo: 'Seguimiento trimestral',
      notasClinicas: 'Perdió 3.3kg desde inicio. Perfil lipídico mejorado. TSH estable.',
      diagnostico: 'Sobrepeso, perfil metabólico mejorando.',
      recomendaciones: 'Ajustar calorías a 1400 kcal. Continuar ejercicio. Repetir laboratorios en 3 meses.',
      proximaCita: '2025-12-05',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, consultaId: c3.id, fecha: '2025-09-10',
      peso: 75.2, talla: 160, imc: 29.38, circunferenciaCintura: 88, circunferenciaCadera: 105,
      porcentajeGrasa: 36.0, pesoIdeal: 56.0, porcentajeAgua: 46.0, masaMusculo: 23.5,
      valoracionFisica: 5, masaOsea: 2.4, dci: 1450, edadMetabolica: 39, grasaVisceral: 7,
      notas: 'Progreso constante',
    },
  });

  // P1 - Semestral: se ajusta el plan nutricional por inicio de ejercicio de resistencia
  const c4 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, fecha: '2025-12-05',
      motivo: 'Control semestral',
      notasClinicas: 'Excelente progreso. Bajó 4.7kg en 6 meses. Resistencia a insulina mejorando según laboratorios.',
      diagnostico: 'Sobrepeso, con mejoría significativa en perfil metabólico.',
      recomendaciones: 'Mantener plan. Comenzar ejercicio de resistencia. Próxima evaluación en febrero.',
      proximaCita: '2026-02-20',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, consultaId: c4.id, fecha: '2025-12-05',
      peso: 73.8, talla: 160, imc: 28.83, circunferenciaCintura: 86, circunferenciaCadera: 103,
      porcentajeGrasa: 34.8, pesoIdeal: 56.0, porcentajeAgua: 47.0, masaMusculo: 24.0,
      valoracionFisica: 5, masaOsea: 2.4, dci: 1430, edadMetabolica: 38, grasaVisceral: 7,
      notas: 'Excelente progreso en 6 meses',
    },
  });
  await prisma.nutritionalPlan.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, consultaId: c4.id, fecha: '2025-12-05',
      objetivo: 'Continuar pérdida de peso y tonificación muscular',
      caloriasDiarias: 1400,
      proteinasPorcentaje: 35, carbohidratosPorcentaje: 35, grasasPorcentaje: 30,
      proteinasGramos: 122, carbohidratosGramos: 122, grasasGramos: 47,
      comidas: [
        { nombre: 'Desayuno', hora: '07:00', descripcion: 'Avena con proteína en polvo, frutos rojos y nueces' },
        { nombre: 'Snack AM', hora: '10:00', descripcion: '1 porción de fruta con cottage cheese' },
        { nombre: 'Almuerzo', hora: '13:00', descripcion: '150g proteína (pollo/pescado/res), vegetales al vapor, ½ taza de quinoa' },
        { nombre: 'Snack PM', hora: '16:00', descripcion: 'Bastones de zanahoria y pepino con hummus' },
        { nombre: 'Cena', hora: '19:00', descripcion: 'Ensalada grande con 100g de atún, aguacate, semillas, aderezo de limón' },
      ],
      restricciones: ['Mariscos (alergia)', 'Azúcares refinados'],
      suplementos: ['Omega-3 1000mg', 'Vitamina D 2000 UI', 'Proteína whey aislada'],
      notas: 'Aumentar proteína por inicio de ejercicio de resistencia.',
    },
  });

  // P1 - Más reciente: sin proximaCita para demostrar ese caso en la UI
  const c10 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, fecha: '2026-02-20',
      motivo: 'Control mensual',
      notasClinicas: 'Total perdido: 6.4kg desde inicio. Se siente bien. Laboratorios mejorados significativamente.',
      diagnostico: 'Sobrepeso leve, excelente progreso metabólico.',
      recomendaciones: 'Transicionar a plan de mantenimiento. Mantener ejercicio. Próximo control en marzo.',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p1, consultaId: c10.id, fecha: '2026-02-20',
      peso: 72.1, talla: 160, imc: 28.16, circunferenciaCintura: 84, circunferenciaCadera: 101,
      porcentajeGrasa: 33.5, pesoIdeal: 56.0, porcentajeAgua: 48.0, masaMusculo: 24.5,
      valoracionFisica: 5, masaOsea: 2.5, dci: 1420, edadMetabolica: 37, grasaVisceral: 6,
      notas: 'Continua bajando de peso',
    },
  });

  // P2 - Hipertensión: plan DASH con restricción de sodio
  const c5 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p2, fecha: '2025-07-01',
      motivo: 'Evaluación inicial - referido por cardiólogo',
      notasClinicas: 'Hipertensión diagnosticada hace 2 años. Sedentario. Dieta alta en sodio y grasas. Consume alcohol socialmente.',
      diagnostico: 'Obesidad grado I, hipertensión arterial en tratamiento, hábitos alimenticios inadecuados.',
      recomendaciones: 'Plan DASH modificado. Reducir sodio a <2000mg/día. Aumentar potasio con frutas y verduras. Iniciar caminatas diarias.',
      proximaCita: '2025-10-15',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p2, consultaId: c5.id, fecha: '2025-07-01',
      peso: 98.3, talla: 175, imc: 32.11, circunferenciaCintura: 108, circunferenciaCadera: 110,
      porcentajeGrasa: 30.5, pesoIdeal: 68.8, porcentajeAgua: 49.0, masaMusculo: 35.0,
      valoracionFisica: 4, masaOsea: 3.1, dci: 1820, edadMetabolica: 48, grasaVisceral: 14,
      notas: 'Medicion inicial - obesidad grado I',
    },
  });
  await prisma.nutritionalPlan.create({
    data: {
      tenantId: tenant.id, pacienteId: p2, consultaId: c5.id, fecha: '2025-07-01',
      objetivo: 'Reducción de peso y control de hipertensión (Plan DASH)',
      caloriasDiarias: 2000,
      proteinasPorcentaje: 25, carbohidratosPorcentaje: 50, grasasPorcentaje: 25,
      proteinasGramos: 125, carbohidratosGramos: 250, grasasGramos: 56,
      comidas: [
        { nombre: 'Desayuno', hora: '07:30', descripcion: 'Avena con plátano y canela, 2 claras de huevo, jugo de naranja natural' },
        { nombre: 'Snack AM', hora: '10:30', descripcion: '1 puño de almendras sin sal y 1 fruta' },
        { nombre: 'Almuerzo', hora: '13:00', descripcion: '150g pechuga a la plancha, arroz integral, frijoles negros, ensalada con aceite de oliva' },
        { nombre: 'Snack PM', hora: '16:00', descripcion: 'Yogurt natural con granola sin azúcar' },
        { nombre: 'Cena', hora: '19:30', descripcion: '120g pescado al vapor, papa al horno, brócoli y zanahoria al vapor' },
      ],
      restricciones: ['Sodio <2000mg/día', 'Alimentos procesados', 'Embutidos', 'Alcohol (máximo 1 copa/semana)'],
      suplementos: ['Magnesio 400mg', 'Potasio (a través de alimentos)'],
      notas: 'Dieta DASH modificada. Enfatizar potasio, calcio y magnesio.',
    },
  });

  const c6 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p2, fecha: '2025-10-15',
      motivo: 'Seguimiento trimestral',
      notasClinicas: 'Perdió 3.3kg. Reporta que ha reducido consumo de sal. Camina 20 min/día.',
      diagnostico: 'Obesidad grado I, mejorando. PA: 135/85.',
      recomendaciones: 'Continuar plan DASH. Aumentar caminata a 30 min. Reducir alcohol.',
      proximaCita: '2026-02-18',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p2, consultaId: c6.id, fecha: '2025-10-15',
      peso: 95.0, talla: 175, imc: 31.02, circunferenciaCintura: 105, circunferenciaCadera: 108,
      porcentajeGrasa: 29.0, pesoIdeal: 68.8, porcentajeAgua: 50.5, masaMusculo: 35.8,
      valoracionFisica: 5, masaOsea: 3.1, dci: 1790, edadMetabolica: 46, grasaVisceral: 13,
      notas: 'Bajo 3.3kg en 3 meses',
    },
  });

  const c9 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p2, fecha: '2026-02-18',
      motivo: 'Control semestral',
      notasClinicas: 'Bajó 5.8kg total. PA mejorada: 130/80. Reporta más energía. Camina 30 min/día.',
      diagnostico: 'Obesidad grado I (limítrofe), hipertensión mejorando.',
      recomendaciones: 'Ajustar plan a 1800 kcal. Incorporar ejercicio de resistencia. Próximo control en mayo.',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p2, consultaId: c9.id, fecha: '2026-02-18',
      peso: 92.5, talla: 175, imc: 30.20, circunferenciaCintura: 102, circunferenciaCadera: 106,
      porcentajeGrasa: 27.8, pesoIdeal: 68.8, porcentajeAgua: 51.5, masaMusculo: 36.5,
      valoracionFisica: 5, masaOsea: 3.2, dci: 1770, edadMetabolica: 44, grasaVisceral: 12,
      notas: 'Mejorando, presion arterial estable',
    },
  });

  // Patient 3 - Consultations
  const c7 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p3, fecha: '2025-08-15',
      motivo: 'Evaluación inicial por anemia',
      notasClinicas: 'Hemoglobina: 10.2 g/dL. Ferritina baja. Dieta baja en hierro hem. Intolerancia a lactosa.',
      diagnostico: 'Anemia ferropénica leve, intolerancia a lactosa.',
      recomendaciones: 'Plan rico en hierro hem (carnes rojas 3x/sem, espinaca, legumbres). Vitamina C con comidas. Sustitutos lácteos fortificados.',
      proximaCita: '2025-11-20',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p3, consultaId: c7.id, fecha: '2025-08-15',
      peso: 55.0, talla: 165, imc: 20.20, circunferenciaCintura: 68, circunferenciaCadera: 92,
      porcentajeGrasa: 24.0, pesoIdeal: 59.0, porcentajeAgua: 52.0, masaMusculo: 20.5,
      valoracionFisica: 5, masaOsea: 2.2, dci: 1280, edadMetabolica: 26, grasaVisceral: 3,
      notas: 'Peso normal, enfoque en anemia',
    },
  });
  await prisma.nutritionalPlan.create({
    data: {
      tenantId: tenant.id, pacienteId: p3, consultaId: c7.id, fecha: '2025-08-15',
      objetivo: 'Tratar anemia ferropénica con alimentación rica en hierro',
      caloriasDiarias: 1800,
      proteinasPorcentaje: 25, carbohidratosPorcentaje: 50, grasasPorcentaje: 25,
      proteinasGramos: 112, carbohidratosGramos: 225, grasasGramos: 50,
      comidas: [
        { nombre: 'Desayuno', hora: '07:00', descripcion: 'Tortilla de huevo con espinaca, frijoles negros, tortilla de maíz, jugo de naranja' },
        { nombre: 'Snack AM', hora: '10:00', descripcion: 'Mix de frutos secos (sin maní) con orejones de damasco' },
        { nombre: 'Almuerzo', hora: '13:00', descripcion: '150g carne roja magra, lentejas, ensalada con pimiento rojo, limón' },
        { nombre: 'Snack PM', hora: '16:00', descripcion: 'Leche de almendra fortificada con galletas de avena' },
        { nombre: 'Cena', hora: '19:00', descripcion: '120g pollo, quinoa con brócoli, guisantes, tomate cherry con limón' },
      ],
      restricciones: ['Lácteos (intolerancia a lactosa)', 'No consumir té/café con comidas (inhibe absorción de hierro)'],
      suplementos: ['Sulfato ferroso 325mg (con jugo de naranja)', 'Vitamina C 500mg'],
      notas: 'Combinar hierro hem y no hem. Agregar vitamina C en cada comida para mejorar absorción.',
    },
  });

  const c8 = await prisma.consultation.create({
    data: {
      tenantId: tenant.id, pacienteId: p3, fecha: '2025-11-20',
      motivo: 'Control de anemia',
      notasClinicas: 'Hemoglobina subió a 11.5 g/dL. Mejor energía. Tolera bien sustitutos lácteos.',
      diagnostico: 'Anemia en resolución, peso adecuado.',
      recomendaciones: 'Mantener plan actual. Continuar suplementación. Repetir hemograma en 3 meses.',
      proximaCita: '2026-02-25',
    },
  });
  await prisma.anthropometry.create({
    data: {
      tenantId: tenant.id, pacienteId: p3, consultaId: c8.id, fecha: '2025-11-20',
      peso: 56.2, talla: 165, imc: 20.64, circunferenciaCintura: 69, circunferenciaCadera: 93,
      porcentajeGrasa: 24.5, pesoIdeal: 59.0, porcentajeAgua: 52.5, masaMusculo: 21.0,
      valoracionFisica: 5, masaOsea: 2.3, dci: 1300, edadMetabolica: 26, grasaVisceral: 3,
      notas: 'Hemoglobina mejoro a 11.5',
    },
  });

  // Appointments
  const appointmentsData = [
    { pacienteId: p1, fecha: '2026-02-25', hora: '09:00', tipo: 'seguimiento' as const, motivo: 'Control de peso mensual', estado: 'programada' as const, notas: 'Revisar resultados de laboratorio' },
    { pacienteId: p4, fecha: '2026-02-25', hora: '10:30', tipo: 'seguimiento' as const, motivo: 'Control glucosa y peso', estado: 'programada' as const, notas: 'Traer bitácora de glucosa' },
    { pacienteId: p3, fecha: '2026-02-25', hora: '14:00', tipo: 'control' as const, motivo: 'Revisión de hemoglobina', estado: 'completada' as const, notas: 'Paciente reporta mejoría en energía' },
    { pacienteId: p2, fecha: '2026-02-26', hora: '09:00', tipo: 'seguimiento' as const, motivo: 'Control de presión y peso', estado: 'programada' as const, notas: '' },
    { pacienteId: p5, fecha: '2026-02-26', hora: '11:00', tipo: 'seguimiento' as const, motivo: 'Ajuste de plan nutricional', estado: 'programada' as const, notas: 'Evaluar progreso en gimnasio' },
    { pacienteId: p6, fecha: '2026-02-27', hora: '08:30', tipo: 'control' as const, motivo: 'Revisión de síntomas gástricos', estado: 'programada' as const, notas: '' },
    { pacienteId: p7, fecha: '2026-02-27', hora: '15:00', tipo: 'seguimiento' as const, motivo: 'Evaluación de densidad ósea', estado: 'programada' as const, notas: 'Traer densitometría reciente' },
    { pacienteId: p1, fecha: '2026-02-20', hora: '09:00', tipo: 'seguimiento' as const, motivo: 'Control mensual', estado: 'completada' as const, notas: 'Perdió 1.2kg en el mes' },
    { pacienteId: p2, fecha: '2026-02-18', hora: '10:00', tipo: 'primera_vez' as const, motivo: 'Evaluación nutricional inicial', estado: 'completada' as const, notas: 'Se realizó evaluación completa' },
    { pacienteId: p3, fecha: '2026-02-15', hora: '14:00', tipo: 'seguimiento' as const, motivo: 'Control de anemia', estado: 'completada' as const, notas: 'Hemoglobina mejoró a 11.5' },
    { pacienteId: p4, fecha: '2026-02-12', hora: '09:30', tipo: 'seguimiento' as const, motivo: 'Control metabólico', estado: 'cancelada' as const, notas: 'Paciente canceló por trabajo' },
    { pacienteId: p5, fecha: '2026-03-02', hora: '10:00', tipo: 'seguimiento' as const, motivo: 'Seguimiento SOP', estado: 'programada' as const, notas: '' },
    { pacienteId: p6, fecha: '2026-03-05', hora: '08:30', tipo: 'control' as const, motivo: 'Control gástrico', estado: 'programada' as const, notas: '' },
    { pacienteId: p7, fecha: '2026-02-10', hora: '15:00', tipo: 'primera_vez' as const, motivo: 'Evaluación inicial', estado: 'completada' as const, notas: 'Se estableció plan inicial' },
    { pacienteId: p1, fecha: '2026-03-10', hora: '09:00', tipo: 'seguimiento' as const, motivo: 'Control mensual marzo', estado: 'programada' as const, notas: '' },
  ];

  for (const a of appointmentsData) {
    await prisma.appointment.create({
      data: { tenantId: tenant.id, ...a },
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`Admin user: admin@vitally.app / admin123`);
  console.log(`Patients: ${Object.keys(patients).length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
