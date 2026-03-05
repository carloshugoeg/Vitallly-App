**Introducción**

El presente documento describe el proceso de acercamiento y análisis realizado con la empresa de nutrición Vitally, con el propósito de comprender su funcionamiento y detectar oportunidades de mejora mediante el desarrollo de un sistema de software. Esta colaboración surge como una iniciativa académica orientada a resolver una problemática real dentro de un entorno profesional.

La elección de trabajar con esta empresa representa una oportunidad significativa para aplicar los conocimientos adquiridos durante la formación en ingeniería de software, permitiendo enfrentar un contexto práctico en el que la comunicación con el cliente y la comprensión de sus necesidades resultan fundamentales para proponer soluciones efectivas.

Vitally se enfoca en la orientación y atención nutricional médica, brindando acompañamiento a personas que requieren mejorar su estado de salud a través de la alimentación. Su enfoque se basa en una atención integral, personalizada y sustentada en principios científicos de la nutrición y la dietética.

Dentro de sus actividades principales se encuentra la evaluación nutricional integral, la cual incluye el análisis antropométrico, la valoración de hábitos alimentarios y la interpretación de indicadores clínicos y bioquímicos. Este proceso permite identificar con precisión las necesidades y condiciones de cada paciente.

A partir de estos diagnósticos, la empresa diseña e implementa planes de intervención terapéutica personalizados, ajustados a requerimientos energéticos, condiciones médicas, etapa de vida y nivel de actividad física, con el objetivo de promover cambios sostenibles en la salud del paciente.

Asimismo, se aplican enfoques de terapia nutricional médica para el manejo de diversas condiciones específicas, complementados con educación nutricional basada en evidencia, orientada a fortalecer la comprensión y adherencia de los pacientes a sus planes alimenticios.

La empresa también ofrece servicios especializados como nutrición deportiva, atención clínica avanzada y acompañamiento en casos complejos, lo que evidencia un enfoque profesional que integra múltiples áreas del cuidado nutricional.

Otro componente importante de su trabajo es el monitoreo y seguimiento continuo, mediante consultas periódicas que permiten evaluar resultados, realizar ajustes en los planes y brindar apoyo en la modificación de hábitos, asegurando un proceso de mejora constante.

Para comprender con mayor precisión sus procesos internos, se realizó una encuesta dirigida a la profesional encargada del uso del sistema, lo que permitió recopilar información clave sobre sus necesidades operativas y flujos de trabajo actuales.

A partir de este análisis se determinó que el objetivo del sistema no será modificar la lógica del negocio, sino optimizar y digitalizar los procesos existentes, abarcando desde la gestión de citas hasta el registro, seguimiento e historial de los pacientes, contribuyendo así a una gestión más eficiente y organizada.

**Antecedentes de la Empresa**

Ubicada en la **6ta Calle de la Zona 7 de Quetzaltenango**, la clínica de nutrición **Vitally** se ha consolidado como un referente de salud integral en la región. Durante su etapa fundacional, la clínica adoptó un modelo de gestión basado en herramientas ofimáticas genéricas que permitieron una operación inicial flexible. Sin embargo, el crecimiento sostenido de su base de pacientes ha transformado esa flexibilidad en una barrera crítica.

Actualmente, la infraestructura administrativa y clínica de Vitally enfrenta un fenómeno de **entropía de datos**. El núcleo de su almacenamiento reside en hojas de cálculo de Microsoft Excel que, aunque útiles en el pasado, han derivado en una arquitectura no relacional e insostenible. Este sistema heredado no solo demanda un ingreso manual exhaustivo (*manual data entry*), sino que ha generado flujos de trabajo fragmentados. El personal clínico se ve obligado a realizar constantes "cambios de contexto", alternando entre aplicaciones de agendamiento y expedientes aislados que no interactúan entre sí, creando **silos de información** que impiden una visión holística del paciente en tiempo real.

Ante este escenario de ineficiencia operativa y riesgo de error humano, se hace evidente que la clínica ha alcanzado un estado de **lock-in técnico**: el capital de información histórica es tan vasto y está tan desordenado que la migración se percibe como un desafío crítico, a pesar de que el sistema actual es descrito por el personal como "más molesto que útil".

**Diagnóstico de Deficiencias Técnicas Críticas**

A partir del análisis de la situación actual, se han identificado los siguientes problemas estructurales:

1. **Complejidad Estructural y Desorden Orgánico:** La evolución del archivo Excel (Anexo 1\) sin una planificación relacional resultó en una matriz de datos excesivamente compleja. La recuperación de historial clínico requiere una navegación manual extensa, lo que ralentiza la consulta y reduce la eficiencia en la atención.  
2. **Compromiso de la Integridad de los Datos:** La ausencia de validaciones estrictas y una interfaz propensa al error humano han provocado incidentes de pérdida de información y la aparición de "registros fantasma" (datos sobrescritos o difícilmente localizables entre la inmensidad de columnas).  
3. **Dependencia Forzada (Data Lock-in):** Existe una barrera técnica y psicológica para la modernización, ya que la totalidad del patrimonio informativo de la clínica reside en un formato monolítico, dificultando la transición hacia sistemas más robustos.  
4. **Fragmentación del Ecosistema Tecnológico:** El uso de herramientas dispares y no interoperables para el agendamiento y el seguimiento clínico obliga a la redundancia de datos y aumenta la carga operativa del personal.  
5. **Fricción en el Servicio y Cuellos de Botella:** Los procesos diseñados originalmente para un volumen bajo de pacientes han colapsado ante la demanda actual, afectando directamente la agilidad de la atención y la precisión del seguimiento nutricional a largo plazo.

**Oportunidades Identificadas:**

A partir de las deficiencias del sistema actual, se han detectado las siguientes áreas de oportunidad para potenciar la operación de la clínica:

1\. Transformación de Datos en Activos Estratégicos: La migración de Excel a una base de datos relacional no es solo un cambio de formato, sino una oportunidad para aplicar Business Intelligence (BI). Al tener datos estructurados, la clínica podrá generar reportes automáticos sobre la evolución de los pacientes, tasas de deserción y efectividad de tratamientos, permitiendo decisiones basadas en evidencia y no en intuiciones.

2\. Escalabilidad Operativa sin Incremento de Costos: Al eliminar el manual data entry y la navegación tediosa entre celdas, el personal clínico reduce su carga administrativa. Esto permite que la clínica aumente su capacidad de atención (más pacientes por día) sin necesidad de contratar más personal administrativo, optimizando el margen de beneficio por consulta.

3\. Mejora de la Fidelización y Experiencia del Paciente: La unificación del agendamiento y el historial clínico permite una atención personalizada y fluida. Al eliminar la fricción técnica, la nutricionista puede enfocarse totalmente en el paciente durante la consulta, lo que eleva la percepción de profesionalismo y tecnología de punta, diferenciando a Vitally de la competencia en Quetzaltenango.

4\. Mitigación de Riesgos y Cumplimiento Normativo: La implementación de un sistema con roles de usuario y registros de auditoría permite establecer protocolos de seguridad de la información. Esta es una oportunidad para que la clínica se alinee con estándares internacionales de protección de datos de salud, protegiendo la privacidad del paciente y evitando la pérdida accidental de expedientes históricos.

5\. Interoperabilidad y Ecosistema Digital Única: La eliminación de los "silos de datos" abre la puerta a futuras integraciones, como el envío automático de planes nutricionales por correo o la conexión con aplicaciones móviles de seguimiento para el paciente. Esto posiciona a Vitally no solo como una clínica, sino como una plataforma de salud integral.

### **Objetivo General**

Desarrollar e implementar un **Sistema Unificador de Gestión Nutricional** para la clínica **Vitally**, mediante una arquitectura web relacional que centralice la lógica de negocio y la información clínica-administrativa, con el fin de eliminar la fricción operativa, garantizar la integridad de los datos y optimizar el ciclo de atención al paciente.

**Objetivos Específicos**

1. **Auditoría y Reingeniería de Procesos:** Analizar los flujos de trabajo actuales basados en herramientas ofimáticas para documentar y mitigar puntos críticos de ineficiencia, redundancia de datos y riesgos de error humano derivados del ingreso manual.  
2. **Migración y Estructuración de Datos:** Diseñar e implementar una arquitectura de base de datos relacional robusta que permita la transición del capital de información histórica desde formatos monolíticos (Excel) hacia un esquema normalizado, asegurando la integridad y disponibilidad de los expedientes.  
3. **Centralización de la Gestión Clínica (Módulo CRUD):** Desarrollar una interfaz única y controlada para el registro, consulta y actualización de la información nutricional, eliminando la navegación manual extensa y la pérdida de datos por falta de validaciones.  
4. **Interoperabilidad del Ecosistema Tecnológico:** Integrar de forma nativa las funciones de agendamiento de citas con el historial clínico, suprimiendo los silos de información y permitiendo al personal una visión holística del paciente en tiempo real.  
5. **Optimización de la Experiencia del Usuario (UX):** Reducir la carga cognitiva y los "cambios de contexto" del personal clínico mediante una plataforma intuitiva que unifique la formulación nutricional y el seguimiento histórico en un solo entorno de trabajo.

**Alcances del Proyecto**

Como hemos desglosado en los incisos anteriores, el desarrollo de la aplicación estará ligado a las necesidades de la empresa, como un software diseñado a la medida, que se ajusta al cliente y sus requerimientos, tomando en cuenta los procesos actuales y buscando optimizarlos sin alterar su lógica de negocio.

El corazón del software y su módulo principal, sin el cual el sistema carecería de razón de ser, será el almacenamiento y gestión de los pacientes, incluyendo los atributos característicos proporcionados por la nutricionista. Estos datos serán la base sobre la cual se apoyarán los demás módulos para su correcto funcionamiento, ya que sin una gestión adecuada de la información de los pacientes no se cumpliría con el objetivo principal del sistema.

Pensando en el CRUD principal del software, se plantea que la interfaz y el ingreso de datos de los pacientes sea una tarea sencilla y sin complicaciones adicionales. Para ello, se diseñará una interfaz simple e intuitiva, con campos claros y algunos valores predeterminados, permitiendo que el registro sea más rápido y eficiente que el proceso actual.

Añadido al registro de pacientes y para mantener un control adecuado de la información, el sistema contempla el manejo de evaluaciones nutricionales integrales y diagnósticos individuales, así como el diseño de planes de intervención terapéutica, elaboración de regímenes nutricionales personalizados y el monitoreo bio-conductual con seguimiento evolutivo.

Dentro del alcance funcional del sistema también se contempla la implementación de los siguientes componentes:

- Una pantalla de inicio que incluya el logo institucional de Vitally, permitiendo una identificación visual clara del sistema.  
- Un calendario mensual interactivo donde se visualizarán las citas programadas.  
- Un recordatorio diario que muestre las citas del día junto con su respectiva hora.  
- Una pestaña destinada a la creación de nuevas citas, facilitando la programación y organización de la agenda.  
- Una calculadora nutricional, basada en el documento de Excel proporcionado por la nutricionista, que automatizará los cálculos y reducirá el tiempo requerido para obtener resultados.

El sistema será desarrollado como una aplicación web, lo que permitirá su accesibilidad y facilitará futuras ampliaciones. Esto se considera estratégico, ya que en caso de que el cliente quede satisfecho con el producto, se podrá continuar con el desarrollo de nuevos módulos.

Entre las posibles ampliaciones futuras se contemplan:

Soporte para múltiples profesionales de nutrición.

Un módulo financiero que permita gestionar tarifas, costos, ingresos y utilidades de la empresa.

De esta manera, el alcance del proyecto se centra en cubrir las necesidades operativas actuales de la empresa, dejando abierta la posibilidad de evolución del sistema conforme el negocio crezca o requiera nuevas funcionalidades.

**Limitaciones del Proyecto**

El sistema estará enfocado en cubrir las necesidades actuales de la empresa Vitally, por lo que su funcionalidad se limitará a los procesos operativos definidos durante la etapa de levantamiento de requerimientos.

Entre las principales limitaciones se consideran:

- El sistema será diseñado para un usuario único, por lo que no incluirá gestión de múltiples roles en esta etapa.  
- No se integrará inicialmente con sistemas externos o plataformas de terceros.  
- El módulo financiero no formará parte del desarrollo actual, quedando como posible mejora futura.  
- La aplicación dependerá de la información proporcionada por la nutricionista, por lo que cambios en los procesos podrían requerir ajustes posteriores.  
- El alcance se limita a la gestión y optimización de procesos administrativos y de seguimiento, sin sustituir herramientas clínicas especializadas.

Estas limitaciones permiten mantener un alcance realista y acorde al tiempo y recursos disponibles, asegurando la correcta implementación del sistema en su primera versión.  
**Viabilidad**

**Viabilidad Técnica**

La viabilidad técnica evalúa si el equipo de desarrollo cuenta con los recursos tecnológicos y conocimientos necesarios para implementar el sistema.

En este caso, el desarrollo del software a medida para la nutricionista es viable, ya que:

El sistema a desarrollar corresponde a una aplicación de gestión, no a un sistema de alta complejidad científica o de hardware especializado.

Las funcionalidades principales (agenda, registro de pacientes, historiales y seguimiento) pueden implementarse con herramientas ampliamente conocidas dentro del ámbito del desarrollo de software, de las cuales hay opciones de software libre para el desarrollo

Además, tras las encuestas realizadas, se determinó que la nutricionista cuenta con el equipo tecnológico adecuado para utilizar el sistema sin inconvenientes.

Asimismo, el alcance es reducido debido a que el sistema está diseñado para un usuario único, lo que simplifica:

- La arquitectura del sistema  
- El número de usuarios concurrentes  
- Los requisitos de escalabilidad

Por lo tanto, el proyecto puede desarrollarse con herramientas accesibles y conocimientos adquiridos durante la formación académica.

**Viabilidad Económica**

La viabilidad económica analiza si el costo del proyecto es justificable frente a los beneficios obtenidos, en este caso, el desarrollo presenta alta viabilidad económica debido a:

- El desarrollo será realizado por estudiantes, reduciendo costos de mano de obra.  
- Se pueden utilizar tecnologías gratuitas o de código abierto.  
- La infraestructura puede ser de bajo costo (hosting básico o nube económica).

Beneficios económicos para la empresa:

- Reducción del tiempo administrativo  
- Disminución de errores en registros manuales  
- Mejor organización de pacientes y citas  
- Mayor capacidad de atención

Esto implica un retorno indirecto de inversión, ya que el nutricionista podrá dedicar más tiempo a consultas y menos a tareas operativas.

**Viabilidad Operativa**

La viabilidad operativa determina si el sistema será útil y aceptado por el usuario final. el sistema es operativamente viable porque:

- No busca cambiar la lógica del negocio, sino digitalizarla.  
- El usuario principal es la nutricionista, quien participó en la recolección de requisitos.  
- El flujo del sistema coincide con el proceso actual el cual es el registro de pacientes, una evaluación nutricional, un diseño de plan y un Seguimiento de los pacientes

Esto facilita la adopción del software, ya que el aprendizaje será rápido y el impacto en la rutina diaria será positivo.

**Viabilidad Legal**

El proyecto es viable legalmente, siempre que se consideren aspectos básicos de protección de datos:

- Confidencialidad de información médica  
- Acceso restringido a historiales  
- Copias de seguridad

para lo cual planificamos implementar Autenticación de usuarios y credenciales correspondientes para el usuario principal establecer políticas de privacidad y un manejo seguro de la base de datos.

**Viabilidad de Tiempo**

El sistema presenta viabilidad en cronograma, ya que el alcance es moderado y bien definido.

Un proyecto de este tipo puede desarrollarse en fases:

- Análisis y diseño  
- Desarrollo del sistema base  
- Pruebas  
- Implementación

Esto lo hace adecuado para un proyecto académico o de prácticas profesionales.  
**Recursos**

#### **1\. Arquitectura y Recursos de Infraestructura (Cloud-First)**

El sistema operará bajo un modelo **Cliente-Servidor basado en la Web**, eliminando la dependencia de instalaciones locales y permitiendo un acceso ubicuo desde la 6ta Calle de la Zona 7 o cualquier punto con conexión.

* **Proveedor de Hosting y Persistencia:** Se proyecta el uso de **Hostinger International** para el alojamiento web y la gestión de la base de datos relacional (MySQL/MariaDB).  
* **Seguridad de Datos:** La infraestructura contará con certificados **SSL/TLS** para garantizar que los historiales clínicos viajen encriptados mediante protocolos HTTPS.  
* **Conectividad:** Para una experiencia de usuario (UX) óptima, el sistema requerirá una conexión de banda ancha estable (Fibra Óptica o 4G/5G) con una latencia menor a 100ms, asegurando la sincronización en tiempo real entre el agendamiento y el historial clínico.

#### **2\. Recursos de Hardware y Compatibilidad**

Al ser una solución **Multi-Plataforma y Responsive**, el sistema no dependerá de un hardware específico, sino de la capacidad de renderizado de los navegadores modernos:

* **Dispositivos Terminales:** Compatibilidad total con el ecosistema heterogéneo de la clínica (Laptops Windows, MacBooks, tablets y smartphones).  
* **Motores de Renderizado:** Soporte optimizado para **Blink/Chromium** (Chrome, Edge) y **WebKit** (Safari), aprovechando estándares de HTML5, CSS3 y JavaScript (ES6+).

#### **3\. Recursos Humanos**

El diseño, desarrollo e implementación del sistema estará a cargo de un equipo técnico especializado, responsable de la migración del capital de datos desde Excel hacia la nueva arquitectura relacional:

* **Justo Geovanny Alcón Mendoza** (Carné: 1578324\)  
* **Carlos Hugo Escobar Gómez** (Carné: 1563824\)  
* **Henry Daniel Díaz Corado** (Carné: 2455724\)

**Documentar la información que necesitan**

Para que el **Sistema Unificador de Gestión Nutricional** elimine la fragmentación actual, se ha identificado la necesidad de capturar y centralizar los siguientes conjuntos de datos:

### **1\. Información del Perfil del Paciente (Entidad Núcleo)**

Es el núcleo del sistema. Sustituye las filas de Excel por un registro único y persistente.

* **Datos Personales:** Nombre completo, DPI/ID, fecha de nacimiento (para cálculo automático de edad), género y ocupación.  
* **Datos de contacto:** Teléfono, correo electrónico (para notificaciones de citas) y dirección de residencia.  
* **Información de Emergencia:** Contacto de referencia y parentesco.

### **2\. Información de Gestión de Citas (Agendamiento)**

Este conjunto de datos permitirá eliminar los silos entre la agenda y la ficha clínica.

* **Registro de Cita:** Fecha, hora, tipo de consulta (Primera vez / Seguimiento) y estado de la cita (Programada, Completada, Cancelada).  
* **Motivo de Consulta:** Breve descripción subjetiva del paciente al momento de agendar.

### **3\. Información Clínica y Antecedentes**

Sustituye la navegación manual por campos estructurados con validación.

* **Antecedentes Médicos:** Diagnósticos previos, cirugías, alergias alimentarias y consumo de medicamentos actuales.  
* **Antecedentes Familiares:** Enfermedades crónicas hereditarias (Diabetes, Hipertensión).  
* **Estilo de Vida:** Nivel de actividad física, horas de sueño, consumo de tabaco o alcohol.

### **4\. Evaluación Antropométrica y Seguimiento Histórico**

Aquí es donde se resuelve la "entropía de datos", permitiendo generar gráficos de progreso.

* **Mediciones Físicas:** Peso actual ($kg$), estatura ($cm$), circunferencias (cintura, cadera, brazo) y pliegues cutáneos.  
* **Índices Calculados:** El sistema debe procesar automáticamente el **IMC** (Índice de Masa Corporal) y el **Porcentaje de Grasa Corporal** a partir de las mediciones ingresadas.  
* **Evolución Temporal:** Fecha de cada toma de medidas para permitir la comparación histórica.

### **5\. Planificación y Formulación Nutricional**

* **Requerimientos Energéticos:** Gasto Calórico Total ($GET$) calculado mediante fórmulas integradas (Harris-Benedict o Mifflin-St Jeor).  
* **Distribución de Macronutrientes:** Porcentajes y gramos de Proteínas, Carbohidratos y Lípidos.  
* **Prescripción Dietética:** Observaciones específicas, recomendaciones de hidratación y suplementación.

Para la futura base de datos en **Hostinger**, deberemos considerar las siguientes tablas relacionales:

| Entidad | Propósito |
| :---- | :---- |
| **Pacientes** | Almacena el perfil maestro del usuario. |
| **Citas** | Gestiona el calendario y la disponibilidad de la clínica. |
| **Consultas** | Almacena los datos clínicos de cada visita específica. |
| **Antropometría** | Registra las medidas físicas ligadas a una consulta. |
| **Planes\_Alimenticios** | Guarda las dietas y macros asignados. |

**Funcionalidades del sistema Actual**

El quién:  
El sistema será utilizado principalmente por la profesional encargada de la atención nutricional, quien gestionará la información y los procesos operativos a través de la plataforma. No obstante, el diseño contempla la posibilidad de ampliación a más usuarios en el futuro, en caso de que la empresa Vitally requiera extender el uso del sistema a más personal.

El qué:  
El sistema cubrirá únicamente las actividades operativas típicas dentro de la gestión de una consulta nutricional, tales como el registro de pacientes, control de citas, seguimiento y apoyo en cálculos nutricionales. Cabe destacar que las funcionalidades específicas que formarán parte del software se describen y detallan en las secciones posteriores del documento, limitando el alcance a aquellas previamente definidas.

El dónde:  
El proyecto se desarrolla considerando el contexto de Quetzaltenango, Guatemala, una zona en la que, si bien los índices de desnutrición no son tan elevados como en otras regiones del país, la labor del profesional en nutrición sigue siendo fundamental. Debido a la carga administrativa y al tiempo requerido para la gestión manual de la información, surge la necesidad de un sistema que optimice estos procesos y permita una atención más eficiente.

El cuándo:  
El sistema resulta oportuno en un contexto donde las necesidades de atención nutricional pueden variar con el tiempo, especialmente ante cambios en los indicadores de salud y nutrición de la población. Contar con una herramienta digital permitirá responder de manera más ágil y organizada ante estos cambios, facilitando el seguimiento continuo de los pacientes.

El cómo:  
El funcionamiento del sistema se apoyará en la digitalización y optimización de los procesos actuales de la nutricionista. Si bien en una sección posterior se abordará con mayor detalle la reingeniería de procesos, el software contempla la integración de estas mejoras para estructurar de forma más clara el flujo de trabajo, automatizando tareas y centralizando la información relevante.

**Módulos y Funcionalidades del Sistema a Desarrollar**

para el desarrollo de la aplicación se consideraron algunas funcionalidades descritas a continuación, al ser un diseño basado en mockups básicos, carecen de diseño estético y su objetivo es mostrar de forma visual un resultado preliminar de la vista general de la aplicación y de la idea principal que tenemos.   
![][image1]  
Se pensó en un login de inicio de sesión para mantener segura la información de los pacientes, ya que es información delicada y muy confidencial y debemos mantener mantener esa información confidencial.  
![][image2]  
Una vez que se inicie sesión correctamente, con las credenciales de la nutricionista, la aplicación se dirige a la ventana principal, donde están ubicados los botones para agregar un nuevo paciente, la búsqueda de un paciente existente, el logo de la empresa, un calendario con un resumen de las citas del mes y un resumen de las citas agendadas para el día actual, para que tenga a mano información relevante.  
![][image3]  
cuando el usuario pulsa el botón de buscar, se despliega una interfaz para buscar a una persona de varias formas, por nombre, DPI, código único, etc para facilitar la búsqueda de cada paciente, al encontrarlo, el sistema carga ese paciente, y a cada apartado que el usuario se dirija, carga a ese individuo de forma predefinida 

![][image4]

Si el usuario pulsa en el signo de \+ la aplicación se dirige al usuario para ingresar un nuevo paciente, con algunos datos predeterminados, para reducir el tiempo de ingreso de un nuevo paciente, lo cual ayudará a la eficiencia.  
![][image5]  
cuando se accede a la información de paciente con un paciente ya cargado, se muestra la información relevante de cada paciente, de todas las citas que el paciente ha tenido, facilitando la búsqueda y el control de cada paciente en particular con su condición e información relevante asi como la fecha de la siguiente cita.  
![][image6]  
por último una interfaz simple que muestra los datos del paciente cargados a la aplicación por la búsqueda anterior, las notas que tiene, mostrando los últimos datos, su progreso y la actualización por la consulta actual que se llevó a cabo   
**Requerimientos Funcionales y No Funcionales**

## 1\. Objetivo del sistema

Centralizar en una sola aplicación el **registro**, **consulta**, **seguimiento** y **análisis histórico** de pacientes, incluyendo:

* Entrevista nutricional (alta y actualización).  
* Registro de consultas sucesivas.  
* Manejo de citas con calendario integrado.  
* Métricas y gráficas históricas.  
* Registro de movimientos monetarios (pagos y compras).  
* Reportes individuales por paciente.  
* Protección de datos sensibles (médicos).

2\. Alcance y actores

### 2.1 Actor principal

* **Nutricionista (Ronald Traditional Cleaning / consultorio)**: único usuario del sistema con control total de la información.

### 2.2 Entidades principales (detectadas)

* Paciente/Cliente  
* Entrevista nutricional  
* Consulta (cada visita)  
* Historial clínico y nutricional  
* Citas/Agenda  
* Movimientos monetarios (ingresos/egresos)  
* Reportes  
* Métricas/Gráficas

---

### 3\. Requisitos funcionales (RF)

A continuación, requisitos enumerados para trazabilidad.

### 3.1 Gestión de pacientes (CRM clínico)

* **RF-01** Crear (registrar) un nuevo paciente con entrevista nutricional inicial.  
* **RF-02** Consultar listado/buscador de pacientes (por nombre u otro identificador).  
* **RF-03** Visualizar “ficha del paciente” (tarjeta) con todos sus datos consolidados.  
* **RF-04** Actualizar datos del paciente (demográficos y clínicos/nutricionales).  
* **RF-05** Mantener un repositorio de **pacientes antiguos** con su historial completo.

### 3.2 Ficha del paciente (tarjeta / vista 360°)

* **RF-06** Mostrar en la ficha del paciente:  
  * Datos personales básicos.  
  * Datos antropométricos históricos (ej. peso, talla, medidas).  
  * Ingesta calórica / nutricional registrada.  
  * Notas clínicas/nutricionales por paciente.  
  * Historial de consultas (cronológico).  
  * Historial médico (antecedentes, condiciones, medicación si aplica).  
  * Historial de pagos (si se asocia a paciente).  
  * Historial de citas (pasadas y futuras).

### 3.3 Entrevista nutricional y registro clínico

* **RF-07** Capturar entrevista nutricional con campos suficientes para una consulta completa   
* **RF-08** Guardar y versionar/registrar cambios relevantes de datos clínicos a lo largo del tiempo  
* **RF-09** Registrar datos médicos y antecedentes del paciente como parte del expediente.

### 3.4 Gestión de consultas (visitas sucesivas)

* **RF-10** Registrar una nueva consulta vinculada a un paciente.  
* **RF-11** Editar/actualizar la información de una consulta (según reglas de auditoría definidas).  
* **RF-12** Almacenar métricas por consulta (ej. medidas, ingesta, observaciones, plan).  
* **RF-13** Permitir notas libres por consulta y/o por paciente)

### 3.5 Cálculos nutricionales (reemplazo de fórmulas de Excel)

* **RF-14** Ejecutar cálculos nutricionales necesarios para la consulta (calculadora integrada).  
* **RF-15** Asociar resultados de cálculos a la consulta y mantenerlos en histórico para comparación.  
* **RF-16** Permitir recalcular cuando cambien entradas (ej. peso/actividad), preservando trazabilidad del resultado por fecha.

### 3.6 Métricas y gráficas (histórico)

* **RF-17** Generar métricas históricas por paciente (tendencias).  
* **RF-18** Visualizar gráficas de evolución (por ejemplo: peso vs tiempo, calorías vs tiempo, etc.).  
* **RF-19** Permite seleccionar rangos de fechas y variables a graficar.

### 3.7 Reportes individuales

* **RF-20** Generar reportes individuales por paciente (resumen de datos, evolución, consultas, notas relevantes).  
* **RF-21** Permitir exportación/impresión del reporte (formato a definir: PDF u otro).

### 3.8 Agenda y citas (calendario integrado)

* **RF-22** Crear, editar y cancelar citas.  
* **RF-23** Vincular cada cita a un paciente.  
* **RF-24** Mostrar la agenda del día   
* **RF-25** Mostrar calendario en vista mensual.  
* **RF-26** Visualizar tarjetas/entradas en el calendario con detalles clave de la cita (cliente, hora, estado, notas breves).

### 3.9 Módulo financiero (movimientos monetarios)

* **RF-27** Registrar ingresos: pagos por consulta u otros conceptos.  
* **RF-28** Registrar egresos: compras (ej. “compra de medicina”).  
* **RF-29** Consultar historial de movimientos con filtros por fecha/tipo/paciente (si aplica).  
* **RF-30** Asociar movimientos a pacientes cuando corresponda (pagos), y permitir movimientos generales (egresos del consultorio).  
* **RF-31** Generar resumen mensual (corte mensual) de movimientos.

4\. Requisitos no funcionales (RNF)

### 4.1 Seguridad y privacidad (datos sensibles)

* **RNF-01** Confidencialidad: proteger datos médicos y personales mediante control de acceso.  
* **RNF-02** Autenticación obligatoria para el usuario (nutricionista).  
* **RNF-03** Cifrado de datos en tránsito (HTTPS/TLS).  
* **RNF-04** Cifrado de datos en reposo (base de datos / respaldos).

### 4.2 Disponibilidad y continuidad

* **RNF-05** Alta disponibilidad acorde a uso de consultorio (objetivo: no perder citas ni historial).

### 4.3 Integridad y calidad de datos

* **RNF-06** Validación de campos obligatorios en entrevista y consultas (consistencia).  
* **RNF-07** Integridad referencial (citas, consultas y pagos deben estar vinculados correctamente al paciente).  
* **RNF-08** Trazabilidad histórica: mantener registros por fecha para evolución y auditoría.

### 4.4 Usabilidad

* **RNF-09** Interfaz orientada a flujo del consultorio: “desde la cita → entrevista → consultas sucesivas → registro médico”.  
* **RNF-10** Acceso rápido a “citas de hoy” y a la ficha del paciente en pocos pasos.  
* **RNF-11** Formularios eficientes (reemplazo de Google Forms \+ papel) con guardado seguro.

### 4.5 Rendimiento

* **RNF-12** Búsqueda de pacientes y carga de ficha en tiempos razonables con historial (objetivo: fluido en consulta).  
* **RNF-13** Generación de gráficas y reportes sin demoras perceptibles para volúmenes típicos de consultorio.

### 4.6 Mantenibilidad y evolución

* **RNF-14** Arquitectura modular (pacientes, consultas, agenda, finanzas, reportes, métricas) para permitir cambios sin afectar todo el sistema.  
* **RNF-15** Parametrización de fórmulas/cálculos nutricionales (si cambian métodos) sin reescritura masiva.

### 4.7 Compatibilidad e integración

* **RNF-16** Evitar dependencia operativa de múltiples herramientas externas (objetivo del sistema: unificación).

### 4.8 Cumplimiento y buenas prácticas (general)

* **RNF-17** Manejo responsable de datos sensibles acorde a normativas aplicables

5\. Reglas de negocio inferidas (RB)

* **RB-01** Toda consulta debe estar asociada a un paciente.  
* **RB-02** Toda cita debe asociarse a un paciente y a una fecha/hora.  
* **RB-03** Los cálculos nutricionales se basan en los datos capturados (antropometría/ingesta/otros).  
* **RB-04** Los datos médicos son sensibles y requieren protección reforzada.  
* **RB-05** Debe existir historial (no solo “dato actual”) para análisis de evolución.

**Procedimientos con para Reingeniería** 

Reingeniería del proceso de atención (BPR)

* Rediseñar el flujo “cita → entrevista → consulta → seguimiento → pago → reporte” para que sea único, guiado y sin re-trabajo.  
* Eliminar captura duplicada (Forms \+ papel) y estandarizar qué se registra y cuándo.  
* Resultado: menos tiempo en administración y más consistencia clínica.

Reingeniería de datos (normalización \+ historial)

* Pasar de Excel/papel a un modelo de datos clínico con:  
  * Entidades claras (Paciente, Consulta, Medición, Ingesta, Nota, Diagnóstico/Antecedente, Cita, Movimiento).  
  * Histórico real (por fecha) y no “el último valor”.  
  * Catálogos (tipos de medidas, campos obligatorios, etc.).  
* Resultado: trazabilidad, métricas confiables y reportes automáticos.

Reingeniería de cálculos (de fórmulas “sueltas” a motor de cálculo)

* En Excel las fórmulas se vuelven frágiles. Conviene convertirlas en:  
  * Un módulo de cálculo versionado (qué fórmula se usó y cuándo).  
  * Reglas/validaciones consistentes (evitar errores por celdas mal editadas).  
* Resultado: resultados reproducibles y menos fallos.

Reingeniería de agenda y sincronización

* Definir la agenda como fuente de verdad (la app) e integrar con Calendar.  
* Resolver conflictos (doble reserva, reprogramaciones, cancelaciones) con reglas claras.  
* Resultado: operación ordenada y “citas de hoy” confiables.

Reingeniería de seguridad y continuidad

* Hoy hay riesgo alto: papel perdido \+ Excel sin controles.  
* Aplicar controles: autenticación, cifrado, backups, auditoría.  
* Resultado: protección de datos sensibles y continuidad del consultorio.