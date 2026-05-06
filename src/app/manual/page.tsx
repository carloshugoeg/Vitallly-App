'use client';

import { useState, type ElementType, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Calculator,
  ChevronRight,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  content: ReactNode;
}

interface ManualImageProps {
  src: string;
  title: string;
  note: string;
}

function ManualImage({ src, title, note }: ManualImageProps) {
  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary-50/40 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-white p-2 text-primary shadow-sm">
          <ImageIcon size={18} />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-600">{note}</p>
          <p className="mt-2 rounded-md bg-white px-3 py-2 font-mono text-xs text-primary">{src}</p>
        </div>
      </div>
    </div>
  );
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span className="text-gray-700">{item}</span>
        </li>
      ))}
    </ol>
  );
}

const sections: ManualSection[] = [
  {
    id: 'introduccion',
    title: 'Introduccion',
    description: 'Acceso al sistema y objetivo general del manual.',
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Objetivo del manual</h3>
          <p>
            Este manual explica el uso principal de Vitally, una aplicacion orientada a la gestion de pacientes,
            citas, consultas nutricionales, planes alimenticios, metricas clinicas y calculos nutricionales. Su
            proposito es guiar al usuario desde el ingreso al sistema hasta el registro de informacion clinica y
            seguimiento del paciente.
          </p>
          <p>
            La informacion base proviene del borrador del equipo y fue ajustada para que coincida con la
            funcionalidad actual del proyecto.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Ingresar a la aplicacion</h3>
          <StepList
            items={[
              'Abrir el enlace de la aplicacion en el navegador.',
              'Ingresar las credenciales del usuario autorizado.',
              'Confirmar el inicio de sesion para acceder al dashboard principal.',
            ]}
          />
          <ManualImage
            src="/manual/01-login.png"
            title="Imagen requerida: pantalla de inicio de sesion"
            note="Captura la vista donde el usuario escribe sus credenciales antes de entrar a Vitally."
          />
        </section>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Resumen operativo, citas de hoy, calendario y accesos rapidos.',
    icon: LayoutDashboard,
    content: (
      <div className="space-y-6">
        <p>
          Despues de autenticarse correctamente, el usuario llega al dashboard. Esta pantalla concentra la
          informacion mas importante para iniciar el dia de trabajo: total de pacientes, citas del dia, consultas
          registradas y citas pendientes.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h4 className="font-semibold text-gray-900">Indicadores principales</h4>
            <p className="mt-2 text-sm text-gray-600">
              Muestran contadores actualizados para revisar rapidamente la actividad de la clinica.
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h4 className="font-semibold text-gray-900">Citas y calendario</h4>
            <p className="mt-2 text-sm text-gray-600">
              Permiten ver las citas del dia y un calendario mensual con puntos de color segun el estado.
            </p>
          </div>
        </div>
        <ManualImage
          src="/manual/02-dashboard.png"
          title="Imagen requerida: dashboard principal"
          note="Captura el dashboard completo con tarjetas de estadisticas, citas de hoy, calendario y botones de acceso."
        />
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Notificaciones de citas</h3>
          <p>
            La campana superior muestra avisos cuando una cita programada llega a su hora. El navegador puede pedir
            permiso para mostrar notificaciones del sistema; ademas, el sonido se activa despues de una interaccion
            del usuario con la pagina.
          </p>
        </section>
      </div>
    ),
  },
  {
    id: 'pacientes',
    title: 'Pacientes',
    description: 'Registro, consulta, edicion y eliminacion de pacientes.',
    icon: Users,
    content: (
      <div className="space-y-6">
        <p>
          En el modulo de pacientes se visualiza la lista de personas registradas en el sistema. Cada fila incluye
          informacion basica y acciones para ver detalle, editar o eliminar.
        </p>
        <ManualImage
          src="/manual/03-pacientes-lista.png"
          title="Imagen requerida: lista de pacientes"
          note="Captura la tabla de pacientes con los botones de ver, editar y eliminar."
        />

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Crear nuevo paciente</h3>
          <StepList
            items={[
              'Presionar el boton Nuevo Paciente.',
              'Completar los datos personales, contacto, antecedentes y perfil clinico.',
              'Revisar que los campos obligatorios esten llenos.',
              'Presionar Registrar Paciente para guardar la informacion.',
            ]}
          />
          <ManualImage
            src="/manual/04-paciente-nuevo.png"
            title="Imagen requerida: formulario de nuevo paciente"
            note="Captura el formulario completo o la parte superior con campos obligatorios visibles."
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Detalle del paciente</h3>
          <p>
            El boton con icono de ojo abre la ficha del paciente. Esta vista contiene pestañas para informacion
            general, antropometria, consultas, citas, planes nutricionales y metricas.
          </p>
          <ManualImage
            src="/manual/05-paciente-detalle-general.png"
            title="Imagen requerida: detalle general del paciente"
            note="Captura la vista de detalle con las pestañas principales visibles."
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Antropometria, planes y metricas</h3>
          <p>
            La pestaña de antropometria permite revisar mediciones fisicas del paciente. Los planes nutricionales
            pueden editarse, duplicarse o eliminarse. En metricas se muestran graficas de evolucion como peso, IMC,
            composicion corporal y grasa visceral, filtradas por rango de fechas.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <ManualImage src="/manual/06-paciente-antropometria.png" title="Imagen requerida: antropometria" note="Captura la tabla o historial antropometrico." />
            <ManualImage src="/manual/07-paciente-planes.png" title="Imagen requerida: planes nutricionales" note="Captura la lista de planes y sus acciones." />
            <ManualImage src="/manual/08-paciente-metricas.png" title="Imagen requerida: metricas" note="Captura las graficas de evolucion del paciente." />
            <ManualImage src="/manual/09-eliminar-paciente.png" title="Imagen requerida: confirmacion de eliminar paciente" note="Captura el modal de confirmacion antes de eliminar." />
          </div>
        </section>
      </div>
    ),
  },
  {
    id: 'citas',
    title: 'Citas',
    description: 'Agenda mensual, citas diarias, estados y acciones.',
    icon: CalendarDays,
    content: (
      <div className="space-y-6">
        <p>
          El modulo de citas muestra un calendario mensual y, a la derecha, la agenda del dia seleccionado. Los
          colores ayudan a identificar el estado: programada, completada o cancelada.
        </p>
        <ManualImage
          src="/manual/10-citas-calendario.png"
          title="Imagen requerida: calendario y agenda diaria"
          note="Captura el modulo de citas con el calendario a la izquierda y las citas del dia a la derecha."
        />

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Crear, editar y eliminar citas</h3>
          <StepList
            items={[
              'Presionar Nueva Cita para abrir el formulario.',
              'Seleccionar paciente, fecha, hora, tipo, estado, motivo y notas.',
              'Guardar la cita para que aparezca en el calendario.',
              'Usar el lapiz para editar o reprogramar una cita.',
              'Usar el basurero para abrir el modal de confirmacion y eliminarla.',
            ]}
          />
          <ManualImage
            src="/manual/11-cita-nueva-editar.png"
            title="Imagen requerida: modal de nueva/editar cita"
            note="Captura el modal de cita con los campos prellenados o listos para registrar."
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Acceso a consulta desde una cita</h3>
          <p>
            Al presionar una cita programada, el sistema abre el formulario de nueva consulta con datos del paciente
            precargados. Las citas completadas o canceladas no permiten acceso directo a consulta; muestran una
            vibracion ligera para indicar que no se puede continuar desde ese estado.
          </p>
        </section>
      </div>
    ),
  },
  {
    id: 'consultas',
    title: 'Consultas',
    description: 'Mediciones, notas clinicas y plan nutricional.',
    icon: ClipboardList,
    content: (
      <div className="space-y-6">
        <p>
          En consultas se registra la atencion nutricional del paciente. El flujo incluye seleccionar el paciente,
          ingresar mediciones, documentar notas clinicas y, si corresponde, crear un plan nutricional.
        </p>
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Mediciones</h3>
          <p>
            En esta etapa se ingresan datos antropometricos como peso, talla, IMC, composicion corporal y otros
            valores del chequeo fisico. Estos datos alimentan el historial y las metricas del paciente.
          </p>
          <ManualImage
            src="/manual/12-consulta-mediciones.png"
            title="Imagen requerida: mediciones de consulta"
            note="Captura la pestaña o formulario de mediciones dentro de nueva consulta."
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Notas clinicas</h3>
          <p>
            Las notas clinicas permiten registrar observaciones, diagnostico y recomendaciones derivadas de la
            consulta realizada.
          </p>
          <ManualImage
            src="/manual/13-consulta-notas-clinicas.png"
            title="Imagen requerida: notas clinicas"
            note="Captura el apartado donde se escriben notas, diagnostico y recomendaciones."
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Plan nutricional</h3>
          <p>
            El plan nutricional permite definir objetivo, calorias, distribucion de macronutrientes, comidas,
            restricciones, suplementos y notas. Las comidas pueden agregarse o eliminarse segun la receta indicada.
          </p>
          <ManualImage
            src="/manual/14-consulta-plan-nutricional.png"
            title="Imagen requerida: plan nutricional en consulta"
            note="Captura el formulario donde se configura el plan y sus comidas."
          />
        </section>
      </div>
    ),
  },
  {
    id: 'calculadora',
    title: 'Calculadora',
    description: 'Calculos nutricionales y guardado de resultados.',
    icon: Calculator,
    content: (
      <div className="space-y-6">
        <p>
          La calculadora nutricional ayuda a estimar valores de referencia para apoyar la toma de decisiones
          durante la evaluacion. Se utiliza como herramienta complementaria al criterio profesional del usuario.
        </p>
        <StepList
          items={[
            'Abrir el modulo Calculadora desde el menu lateral.',
            'Ingresar los datos solicitados para realizar el calculo.',
            'Revisar el resultado generado por el sistema.',
            'Guardar el resultado en el paciente cuando aplique.',
          ]}
        />
        <ManualImage
          src="/manual/15-calculadora.png"
          title="Imagen requerida: calculadora nutricional"
          note="Captura la calculadora con campos y resultados visibles."
        />
      </div>
    ),
  },
];

export default function ManualPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];
  const ActiveIcon = activeSection.icon;

  return (
    <div className="min-h-screen bg-cream px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al Dashboard
          </button>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Vitally</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900">Manual de Usuario</h1>
              <p className="mt-1 text-sm text-gray-500">Guia practica para el uso de los modulos principales.</p>
            </div>
            <p className="max-w-md text-sm text-gray-500">
              Agrega las capturas en <span className="font-mono text-primary">public/manual/</span> usando los nombres indicados en cada recuadro.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <nav className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="bg-primary px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white">Secciones</p>
              </div>
              <ul className="divide-y divide-gray-50">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = section.id === activeId;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveId(section.id)}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          isActive ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={17} className="shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">{section.title}</span>
                            <span className="mt-0.5 block truncate text-xs opacity-75">{section.description}</span>
                          </span>
                          {isActive && <ChevronRight size={15} className="shrink-0" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <main className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary-50 p-3 text-primary">
                  <ActiveIcon size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{activeSection.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{activeSection.description}</p>
                </div>
              </div>
            </div>
            <article className="manual-content max-w-5xl px-6 py-6 text-sm leading-7 text-gray-700">
              {activeSection.content}
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
