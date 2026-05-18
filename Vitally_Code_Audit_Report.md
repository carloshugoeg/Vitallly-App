# Auditoría de Código y Prevención de Errores (Fools Input) - Vitally App

Este reporte presenta una auditoría exhaustiva del código backend y de la lógica de negocio de la aplicación **Vitally**. El análisis se realizó bajo una estricta filosofía de **"Fools Input"** y **Defensa en Profundidad (Error Prevention)**, asumiendo que los usuarios cometerán errores al ingresar datos y que usuarios malintencionados (o despistados) podrían enviar payloads impredecibles a la API.

> [!IMPORTANT]  
> **Misión de este documento:** Identificar, reportar y documentar. No se ha modificado ninguna línea de código. Todas las observaciones aquí documentadas requieren atención para evitar bugs silenciosos, filtración de datos o caídas del sistema.

---

## 1. Vulnerabilidades Críticas de Aislamiento de Tenants (Data Leakage)

Dado que Vitally es una aplicación **Multi-Tenant** (múltiples clínicas usando la misma base de datos), el aislamiento de datos es la directiva número uno. Existen fallas severas en la forma en que los servicios manejan las relaciones:

### 1.1 Fuga en la validación de IDs Foráneos (Cross-Tenant Association)
- **Archivos implicados:** `appointment.service.ts`, `consultation.service.ts`, `calculator.service.ts`
- **El Problema:** Al crear una Cita, una Consulta o guardar resultados de la calculadora, el sistema recibe un `pacienteId` del body (client-side) y lo inyecta directamente en la base de datos usando el `tenantId` de la sesión. 
- **Fools Input / Exploit:** Un usuario de la "Clínica A" podría adivinar o encontrar el `id` de un paciente de la "Clínica B" y hacer un POST a `/api/appointments` con ese `pacienteId`. El sistema creará la cita vinculando un paciente ajeno al tenant actual, rompiendo la integridad referencial y potencialmente filtrando datos médicos.
- **Prevención requerida:** Antes de crear cualquier entidad dependiente de un paciente, el backend DEBE verificar obligatoriamente que el paciente pertenezca al tenant en curso: `await prisma.patient.findFirst({ where: { id: pacienteId, tenantId: session.tenantId } })`.

### 1.2 Peligro de "Over-posting" e Inyección de Tenant
- **Archivos implicados:** Varios archivos en `src/server/services/`
- **El Problema:** En funciones como `updateConsultation` o `updateAppointment`, el payload del usuario (`data: Record<string, unknown>`) se castea ciegamente a `Prisma.ConsultationUncheckedUpdateInput` y se envía al método `update` de Prisma.
- **Fools Input / Exploit:** Aunque Zod mitiga esto parcialmente si se usa correctamente en los endpoints, si algún endpoint no valida estrictamente o permite campos adicionales, un usuario podría enviar en el JSON de actualización el campo `"tenantId": "otro-tenant-id"`. Al pasarlo ciegamente al update, la entidad cambiaría de dueño mágicamente. 
- **Prevención requerida:** Nunca castear un input genérico directamente a Prisma. Siempre debe haber un paso de mapping explícito u omitir campos críticos (como `id`, `tenantId`, `createdAt`) del payload.

---

## 2. Errores Matemáticos y Lógicos (Fools Input)

La calculadora nutricional asume que la nutricionista siempre ingresará valores lógicos. Las matemáticas en JavaScript son implacables con las entradas ilógicas.

### 2.1 División por Cero en el Cálculo del IMC
- **Archivo implicado:** `src/lib/calculations.ts` (`calculateIMC`)
- **El Problema:** El cálculo es `peso / (tallaM * tallaM)`. Si la `tallaCm` es `0`, la talla en metros será `0`. Dividir cualquier número entre 0 en JavaScript no lanza un error, retorna `Infinity`.
- **Fools Input:** En `patientCreateSchema`, el campo `estatura` dentro del `perfilClinico` tiene un valor por defecto de `0` (`z.number().optional().default(0)`). Si estos datos se cruzan, el backend podría intentar guardar un IMC de `Infinity` en la base de datos (lo que lanzará un error 500 en Prisma porque un float de DB no soporta Infinity).

### 2.2 Desajuste del 100% en los Macronutrientes
- **Archivos implicados:** `src/lib/calculations.ts` y esquemas de Zod.
- **El Problema:** La distribución de macros requiere `proteinasPct`, `carbohidratosPct` y `grasasPct`. En `validation.ts` están validados independientemente (`min(0).max(100)`). 
- **Fools Input:** Un usuario por error de dedo podría poner: Proteínas 40%, Carbohidratos 50%, Grasas 30% (Suma = 120%). El sistema generará una cantidad de gramos que, al sumarlos en calorías, excederá las `caloriasDiarias` asignadas, rompiendo la dieta. 
- **Prevención requerida:** Validación a nivel de esquema (usando `.refine()` de Zod) para asegurar matemáticamente que la suma exacta de los 3 porcentajes sea siempre 100%.

### 2.3 Cálculo con Calorías o Pesos Cero/Negativos
- Las fórmulas de Harris-Benedict y Mifflin-St Jeor en `calculations.ts` no tienen guardias para pesos o edades negativas o en cero. Aunque Zod intenta atrapar esto en algunos endpoints, las funciones core de la librería quedan expuestas si son llamadas desde otro lado de la app.

---

## 3. Problemas de Zonas Horarias (Timezone Bugs)

- **Archivo implicado:** `patient.service.ts` (`createPatient`)
- **El Problema:** Si la fecha de registro no viene en el payload, el sistema la asigna por defecto usando:
  `flat.fechaRegistro = new Date().toISOString().split('T')[0];`
- **Fools Input / Efecto Dominó:** `new Date().toISOString()` devuelve la fecha actual en **UTC**. Guatemala tiene un huso horario UTC-6. Esto significa que a partir de las 6:00 PM (hora local), la fecha UTC ya es del **día siguiente**. 
  - Si una nutricionista registra un paciente a las 7:00 PM del lunes, el paciente quedará registrado como creado el **martes**. Esto destruirá las lógicas de auditoría, búsquedas por fecha y reportes.
- **Prevención requerida:** Obtener siempre la fecha usando la zona horaria configurada por el usuario en `UserSettings.timezone`.

---

## 4. Edge Cases de Infraestructura y UI

### 4.1 Solapamiento de Citas en el "Cambio de Día"
- **Archivo implicado:** `appointment.service.ts` (`checkOverlap`)
- **El Problema:** La función que previene solapamiento de horarios transforma las horas a minutos (`HH:mm` -> minutos desde las 00:00). 
- **Fools Input:** Si un usuario por error (o malicia) registra una cita a las `23:30` con duración de `60` minutos, la cita terminaría teóricamente en el minuto `1470` (30 minutos del día siguiente). La lógica actual asume que los cruces ocurren en el rango `0-1440` y no evaluará colisiones si otra cita empieza a las `00:15` del día siguiente.

### 4.2 Relaciones Imborrables (Updates de Consultas)
- **Archivo implicado:** `consultation.service.ts` (`updateConsultation`)
- **El Problema:** El esquema de Prisma permite que una Consulta tenga una Antropometría opcional. En el método de actualización, si el input incluye `anthropometry`, el sistema la actualiza o la crea. 
- **Fools Input:** Si un usuario agregó medidas antropométricas por error a una consulta y luego intenta quitarlas enviando `anthropometry: null` o eliminando los campos en la UI, el backend ignorará el cambio. Solo soporta "Upsert", pero no "Delete" de la relación secundaria. El dato erróneo se quedará pegado a la consulta para siempre a menos que se borre toda la consulta.

### 4.3 Flattening de Datos sin Type Safety
- **Archivo implicado:** `patient.service.ts` (`flattenPatientData`)
- **El Problema:** Confía ciegamente en `if (contactoEmergencia && typeof contactoEmergencia === 'object')`. Un usuario (o bug del cliente) podría enviar `contactoEmergencia: []` (un array es un objeto en JS) o un objeto con campos inesperados. Esto pasaría los chequeos base y podría causar comportamientos extraños si no se pasa antes por la validación estricta de Zod con `strip`.

---

## Conclusión y Recomendaciones

La aplicación tiene cimientos sólidos y el uso de **Zod** como barrera en los `route handlers` mitiga muchos de estos errores. Sin embargo, **la capa de servicios (Service Layer) no debe confiar en que la validación ya ocurrió "más arriba"**. 

**Próximos pasos sugeridos:**
1. **Añadir verificaciones de propiedad (Ownership checks):** Siempre corroborar que `entidad_relacionada.tenantId === session.tenantId`.
2. **Refinar esquemas Zod:** Agregar validadores `.refine()` para comprobaciones lógicas (macros = 100%, fechas lógicas).
3. **Evitar casteos ciegos a Input de Prisma:** Usar variables intermedias desestructuradas explícitamente en lugar de `data as Prisma.XUncheckedUpdateInput`.
4. **Fix de Date en UTC:** Centralizar todas las llamadas de tiempo usando una librería como `date-fns` adaptada a la zona horaria local (`America/Guatemala`).
