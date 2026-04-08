'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Phone, Mail, MapPin, AlertCircle, Pill, Heart, Activity, Calendar, ClipboardList, Utensils, BarChart3, Plus, Pencil, Trash2, Copy, FileText, Beaker } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import TabNavigation from '@/components/ui/TabNavigation';
import Spinner from '@/components/ui/Spinner';
import NutritionalPlanForm from '@/components/patients/NutritionalPlanForm';
import PatientReport from '@/components/patients/PatientReport';
import MeasurementHistoryTable from '@/components/consultation/MeasurementHistoryTable';
import { usePatient } from '@/hooks/usePatients';
import { usePatientAppointments } from '@/hooks/useAppointments';
import { usePatientConsultations } from '@/hooks/useConsultations';
import { usePatientAnthropometry } from '@/hooks/useAnthropometry';
import { usePatientPlans, createStandalonePlan, updatePlan, deletePlan, duplicatePlan } from '@/hooks/useNutritionalPlans';
import { useToast } from '@/hooks/useToast';
import { NutritionalPlan } from '@/types/api';
import { calculateAge, formatDate, getInitials } from '@/lib/utils';
import { ACTIVITY_LEVELS, APPOINTMENT_TYPES, APPOINTMENT_STATUS } from '@/lib/constants';
import { getIMCClassification } from '@/lib/calculations';
import { classifyBodyFat, classifyVisceralFat, classifyWaterPercentage } from '@/lib/referenceRanges';

const tabs = ['General', 'Antropometria', 'Consultas', 'Citas', 'Planes Nutricionales', 'Metricas'];

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState('General');
  const [dateFrom, setDateFrom] = useState(() => `${new Date().getFullYear() - 1}-01-01`);
  const [dateTo, setDateTo] = useState(() => `${new Date().getFullYear() + 1}-12-31`);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<NutritionalPlan | undefined>(undefined);
  const { toast, show: showToast } = useToast();
  const [showReport, setShowReport] = useState(false);

  const { patient, isLoading: patientLoading } = usePatient(id);
  const { appointments: patientAppointments } = usePatientAppointments(id);
  const { consultations: patientConsultations } = usePatientConsultations(id);
  const { anthropometry: patientAnthropometry } = usePatientAnthropometry(id);
  const { plans, mutate: mutatePlans } = usePatientPlans(id);

  const sortedAnthro = useMemo(
    () => [...patientAnthropometry].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [patientAnthropometry]
  );
  const sortedConsultations = useMemo(
    () => [...patientConsultations].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [patientConsultations]
  );
  const sortedAppointments = useMemo(
    () => [...patientAppointments].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [patientAppointments]
  );
  const patientPlans = useMemo(
    () => [...plans].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [plans]
  );

  const chartData = useMemo(() => {
    const filtered = sortedAnthro.filter((a) => a.fecha >= dateFrom && a.fecha <= dateTo);
    return {
      weight: filtered.map((a) => ({ fecha: formatDate(a.fecha, 'dd/MM/yy'), peso: a.peso })),
      bmi: filtered.map((a) => ({ fecha: formatDate(a.fecha, 'dd/MM/yy'), imc: a.imc })),
      bodyComp: filtered.map((a) => ({ fecha: formatDate(a.fecha, 'dd/MM/yy'), grasa: a.porcentajeGrasa, agua: a.porcentajeAgua, musculo: a.masaMusculo })),
      visceral: filtered.map((a) => ({ fecha: formatDate(a.fecha, 'dd/MM/yy'), grasaVisceral: a.grasaVisceral })),
      water: filtered.map((a) => ({ fecha: formatDate(a.fecha, 'dd/MM/yy'), agua: a.porcentajeAgua })),
    };
  }, [sortedAnthro, dateFrom, dateTo]);

  const caloriesData = useMemo(() => {
    const filteredPlans = plans
      .filter((p) => p.fecha >= dateFrom && p.fecha <= dateTo)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    return filteredPlans.map((p) => ({
      fecha: formatDate(p.fecha, 'dd/MM/yy'),
      calorias: p.caloriasDiarias,
      proteinas: p.macros.proteinasGramos * 4,
      carbohidratos: p.macros.carbohidratosGramos * 4,
      grasas: p.macros.grasasGramos * 9,
    }));
  }, [plans, dateFrom, dateTo]);

  if (patientLoading) return <Spinner />;

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado.</p>
        <Link href="/pacientes" className="text-primary underline text-sm mt-2 inline-block">Volver a pacientes</Link>
      </div>
    );
  }

  const edad = calculateAge(patient.fechaNacimiento);
  const latestAnthro = sortedAnthro[sortedAnthro.length - 1];

  const handleSavePlan = async (plan: NutritionalPlan) => {
    try {
      if (editingPlan) {
        await updatePlan(plan.id, { ...plan });
        showToast('Plan nutricional actualizado exitosamente.');
      } else {
        await createStandalonePlan({ ...plan, pacienteId: id } as Record<string, unknown>);
        showToast('Plan nutricional creado exitosamente.');
      }
      mutatePlans();
      setShowPlanModal(false);
      setEditingPlan(undefined);
    } catch {
      showToast('Error al guardar plan.', 'error');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Esta seguro de eliminar este plan nutricional?')) return;
    try {
      await deletePlan(planId);
      mutatePlans();
      showToast('Plan nutricional eliminado.');
    } catch {
      showToast('Error al eliminar plan.', 'error');
    }
  };

  const handleDuplicatePlan = async (planId: string) => {
    try {
      await duplicatePlan(planId);
      mutatePlans();
      showToast('Plan nutricional duplicado exitosamente.');
    } catch {
      showToast('Error al duplicar plan.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pacientes" className="p-2 rounded-lg hover:bg-white transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
              {getInitials(patient.nombre, patient.apellido)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.nombre} {patient.apellido}</h1>
              <p className="text-sm text-gray-500">{edad} anios · {patient.genero === 'F' ? 'Femenino' : 'Masculino'} · {patient.ocupacion}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowReport(true)}><FileText size={16} /> Generar Reporte</Button>
          <Link href={`/pacientes/${id}/editar`}>
            <Button variant="secondary"><Edit size={16} /> Editar</Button>
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      {latestAnthro && (
        <div className="grid grid-cols-5 gap-4">
          <Card className="text-center">
            <p className="text-sm text-gray-500">Peso Actual</p>
            <p className="text-xl font-bold text-gray-900">{latestAnthro.peso} kg</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500">Talla</p>
            <p className="text-xl font-bold text-gray-900">{latestAnthro.talla} cm</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500">IMC</p>
            <p className="text-xl font-bold" style={{ color: getIMCClassification(latestAnthro.imc).color }}>{latestAnthro.imc}</p>
            <p className="text-xs text-gray-500">{getIMCClassification(latestAnthro.imc).label}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500">% Grasa</p>
            <p className="text-xl font-bold" style={{ color: classifyBodyFat(latestAnthro.porcentajeGrasa, edad, patient.genero).color }}>
              {latestAnthro.porcentajeGrasa}%
            </p>
            <p className="text-xs text-gray-500">{classifyBodyFat(latestAnthro.porcentajeGrasa, edad, patient.genero).label}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500">G. Visceral</p>
            <p className="text-xl font-bold" style={{ color: classifyVisceralFat(latestAnthro.grasaVisceral).color }}>
              {latestAnthro.grasaVisceral}
            </p>
            <p className="text-xs text-gray-500">{classifyVisceralFat(latestAnthro.grasaVisceral).label}</p>
          </Card>
        </div>
      )}

      {/* Tab navigation */}
      <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === 'General' && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Phone size={16} /> Contacto</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-600"><Phone size={14} /> {patient.telefono}</p>
              <p className="flex items-center gap-2 text-gray-600"><Mail size={14} /> {patient.email}</p>
              <p className="flex items-center gap-2 text-gray-600"><MapPin size={14} /> {patient.direccion}</p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 font-medium mb-1">Contacto de Emergencia</p>
              <p className="text-sm text-gray-700">{patient.contactoEmergencia.nombre} ({patient.contactoEmergencia.relacion})</p>
              <p className="text-sm text-gray-500">{patient.contactoEmergencia.telefono}</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Heart size={16} /> Antecedentes</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Medicos</p>
                <div className="flex flex-wrap gap-1">{patient.antecedentesMedicos.map((a) => <Badge key={a} variant="yellow">{a}</Badge>)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Familiares</p>
                <div className="flex flex-wrap gap-1">{patient.antecedentesFamiliares.map((a) => <Badge key={a} variant="gray">{a}</Badge>)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Alergias</p>
                <div className="flex flex-wrap gap-1">
                  {patient.alergias.length > 0
                    ? patient.alergias.map((a) => <Badge key={a} variant="red">{a}</Badge>)
                    : <span className="text-gray-400">Ninguna</span>}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Pill size={16} /> Medicamentos</h3>
            <div className="flex flex-wrap gap-1">
              {patient.medicamentos.length > 0
                ? patient.medicamentos.map((m) => <Badge key={m} variant="blue">{m}</Badge>)
                : <span className="text-sm text-gray-400">Ninguno</span>}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Activity size={16} /> Estilo de Vida</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Actividad:</span> {ACTIVITY_LEVELS[patient.estiloVida.nivelActividad].label}</p>
              <p><span className="text-gray-500">Suenio:</span> {patient.estiloVida.horasSueno} horas</p>
              <p><span className="text-gray-500">Ejercicio:</span> {patient.estiloVida.ejercicioSemanal}</p>
              <p><span className="text-gray-500">Alcohol:</span> {patient.estiloVida.consumoAlcohol ? 'Si' : 'No'}</p>
              <p><span className="text-gray-500">Fumador:</span> {patient.estiloVida.fumador ? 'Si' : 'No'}</p>
            </div>
          </Card>

          {/* Perfil Clinico Card */}
          <Card className="col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Beaker size={16} /> Perfil Clinico Nutricional</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Estatura</p>
                <p className="font-medium">{patient.perfilClinico.estatura} cm</p>
              </div>
              {patient.perfilClinico.patologias.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Patologias</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.perfilClinico.patologias.map((p) => <Badge key={p} variant="yellow">{p}</Badge>)}
                  </div>
                </div>
              )}
              {patient.perfilClinico.sintomas.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Sintomas</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.perfilClinico.sintomas.map((s) => <Badge key={s} variant="red">{s}</Badge>)}
                  </div>
                </div>
              )}
              {patient.perfilClinico.examenesLaboratorio.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Examenes de Laboratorio</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.perfilClinico.examenesLaboratorio.map((e) => <Badge key={e} variant="blue">{e}</Badge>)}
                  </div>
                </div>
              )}
              {patient.perfilClinico.vicios.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Vicios</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.perfilClinico.vicios.map((v) => <Badge key={v} variant="red">{v}</Badge>)}
                  </div>
                </div>
              )}
              {patient.perfilClinico.alimentosNoTolerables.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Alimentos No Tolerables</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.perfilClinico.alimentosNoTolerables.map((a) => <Badge key={a} variant="gray">{a}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {patient.notas && (
            <Card className="col-span-2">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><AlertCircle size={16} /> Notas</h3>
              <p className="text-sm text-gray-600">{patient.notas}</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'Antropometria' && (
        <MeasurementHistoryTable
          data={sortedAnthro}
          genero={patient.genero}
          edad={edad}
        />
      )}

      {activeTab === 'Consultas' && (
        <div className="space-y-4">
          {sortedConsultations.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-primary" />
                  <span className="font-medium text-gray-900">{formatDate(c.fecha)}</span>
                </div>
                <Link href={`/consultas/${c.id}`}>
                  <Button variant="ghost" size="sm">Ver detalle</Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mb-1"><strong>Motivo:</strong> {c.motivo}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Diagnostico:</strong> {c.diagnostico}</p>
              <p className="text-sm text-gray-500"><strong>Recomendaciones:</strong> {c.recomendaciones}</p>
            </Card>
          ))}
          {sortedConsultations.length === 0 && (
            <p className="text-center text-gray-500 py-8">Sin consultas registradas.</p>
          )}
        </div>
      )}

      {activeTab === 'Citas' && (
        <div className="space-y-3">
          {sortedAppointments.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(a.fecha)} - {a.hora}</p>
                  <p className="text-xs text-gray-500">{APPOINTMENT_TYPES[a.tipo]} · {a.motivo}</p>
                </div>
              </div>
              <Badge variant={APPOINTMENT_STATUS[a.estado].badge}>{APPOINTMENT_STATUS[a.estado].label}</Badge>
            </Card>
          ))}
          {sortedAppointments.length === 0 && (
            <p className="text-center text-gray-500 py-8">Sin citas registradas.</p>
          )}
        </div>
      )}

      {activeTab === 'Planes Nutricionales' && (
        <div className="space-y-4">
          {toast && (
            <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {toast.message}
            </div>
          )}
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditingPlan(undefined); setShowPlanModal(true); }}>
              <Plus size={14} /> Nuevo Plan
            </Button>
          </div>
          {patientPlans.map((plan) => (
            <Card key={plan.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Utensils size={16} className="text-primary" />
                  <span className="font-medium text-gray-900">{formatDate(plan.fecha)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="green">{plan.caloriasDiarias} kcal/dia</Badge>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingPlan(plan); setShowPlanModal(true); }}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicatePlan(plan.id)}><Copy size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}><Trash2 size={14} className="text-red-400" /></Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3"><strong>Objetivo:</strong> {plan.objetivo}</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-blue-600">Proteinas</p>
                  <p className="font-bold text-blue-700">{plan.macros.proteinasGramos}g</p>
                  <p className="text-xs text-blue-500">{plan.macros.proteinasPorcentaje}%</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-yellow-600">Carbohidratos</p>
                  <p className="font-bold text-yellow-700">{plan.macros.carbohidratosGramos}g</p>
                  <p className="text-xs text-yellow-500">{plan.macros.carbohidratosPorcentaje}%</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-red-600">Grasas</p>
                  <p className="font-bold text-red-700">{plan.macros.grasasGramos}g</p>
                  <p className="text-xs text-red-500">{plan.macros.grasasPorcentaje}%</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Comidas:</p>
                {plan.comidas.map((comida, i) => (
                  <p key={i} className="text-sm text-gray-600">
                    <span className="font-medium">{comida.nombre}</span> ({comida.hora}): {comida.descripcion}
                  </p>
                ))}
              </div>
            </Card>
          ))}
          {patientPlans.length === 0 && (
            <p className="text-center text-gray-500 py-8">Sin planes nutricionales.</p>
          )}
        </div>
      )}

      {activeTab === 'Metricas' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-end gap-4">
              <Input id="m-from" label="Desde" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input id="m-to" label="Hasta" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </Card>

          {chartData.weight.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-12">No hay datos para el rango de fechas seleccionado.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Evolucion de Peso (kg)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.weight}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="peso" stroke="#2D5A3D" strokeWidth={2} dot={{ r: 4, fill: '#2D5A3D' }} name="Peso (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Tendencia de IMC</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.bmi}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[15, 45]} />
                      <Tooltip />
                      <ReferenceLine y={18.5} stroke="#3B82F6" strokeDasharray="3 3" label={{ value: '18.5', position: 'left', fontSize: 10 }} />
                      <ReferenceLine y={25} stroke="#16A34A" strokeDasharray="3 3" label={{ value: '25', position: 'left', fontSize: 10 }} />
                      <ReferenceLine y={30} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '30', position: 'left', fontSize: 10 }} />
                      <ReferenceLine y={35} stroke="#DC2626" strokeDasharray="3 3" label={{ value: '35', position: 'left', fontSize: 10 }} />
                      <Area type="monotone" dataKey="imc" stroke="#2D5A3D" fill="#E8F5EC" strokeWidth={2} name="IMC" dot={{ r: 4, fill: '#2D5A3D' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Composicion Corporal</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.bodyComp}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="grasa" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="% Grasa" />
                      <Line type="monotone" dataKey="agua" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="% Agua" />
                      <Line type="monotone" dataKey="musculo" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} name="Musculo (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Grasa Visceral</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.visceral}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 30]} />
                      <Tooltip />
                      <ReferenceLine y={12} stroke="#16A34A" strokeDasharray="3 3" label={{ value: 'Limite saludable (12)', position: 'top', fontSize: 10 }} />
                      <Area type="monotone" dataKey="grasaVisceral" stroke="#DC2626" fill="#FEE2E2" strokeWidth={2} name="Grasa Visceral" dot={{ r: 4, fill: '#DC2626' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">% Agua Corporal</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.water}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[35, 70]} />
                      <Tooltip />
                      <ReferenceLine y={patient.genero === 'F' ? 45 : 50} stroke="#3B82F6" strokeDasharray="3 3" label={{ value: 'Min', position: 'left', fontSize: 10 }} />
                      <ReferenceLine y={patient.genero === 'F' ? 60 : 65} stroke="#3B82F6" strokeDasharray="3 3" label={{ value: 'Max', position: 'left', fontSize: 10 }} />
                      <Area type="monotone" dataKey="agua" stroke="#3B82F6" fill="#DBEAFE" strokeWidth={2} name="% Agua" dot={{ r: 4, fill: '#3B82F6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {caloriesData.length > 0 && (
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-4">Calorias por Plan (kcal)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={caloriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="proteinas" stackId="a" fill="#3B82F6" name="Proteinas (kcal)" />
                        <Bar dataKey="carbohidratos" stackId="a" fill="#F59E0B" name="Carbohidratos (kcal)" />
                        <Bar dataKey="grasas" stackId="a" fill="#EF4444" name="Grasas (kcal)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Plan CRUD Modal */}
      <Modal isOpen={showPlanModal} onClose={() => { setShowPlanModal(false); setEditingPlan(undefined); }} title={editingPlan ? 'Editar Plan Nutricional' : 'Nuevo Plan Nutricional'} size="xl">
        <NutritionalPlanForm
          pacienteId={id}
          initialData={editingPlan}
          onSave={handleSavePlan}
          onCancel={() => { setShowPlanModal(false); setEditingPlan(undefined); }}
        />
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={showReport} onClose={() => setShowReport(false)} title="Reporte del Paciente" size="xl">
        <PatientReport
          patient={patient}
          anthropometry={sortedAnthro}
          plans={patientPlans}
          consultations={sortedConsultations}
        />
      </Modal>
    </div>
  );
}
