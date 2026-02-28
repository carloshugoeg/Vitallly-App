'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Phone, Mail, MapPin, AlertCircle, Pill, Heart, Activity, Calendar, ClipboardList, Utensils, BarChart3, Plus, Pencil, Trash2, Copy, FileText } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import NutritionalPlanForm from '@/components/patients/NutritionalPlanForm';
import PatientReport from '@/components/patients/PatientReport';
import { patients } from '@/data/patients';
import { appointments } from '@/data/appointments';
import { consultations } from '@/data/consultations';
import { anthropometryData } from '@/data/anthropometry';
import { nutritionalPlans } from '@/data/nutritionalPlans';
import { NutritionalPlan } from '@/data/types';
import { calculateAge, formatDate, getInitials } from '@/lib/utils';
import { ACTIVITY_LEVELS, APPOINTMENT_TYPES } from '@/lib/constants';
import { getIMCClassification } from '@/lib/calculations';

const tabs = ['General', 'Antropometría', 'Consultas', 'Citas', 'Planes Nutricionales', 'Métricas'];

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState('General');
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');
  const [plansList, setPlansList] = useState<NutritionalPlan[]>(nutritionalPlans);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<NutritionalPlan | undefined>(undefined);
  const [showPlanSuccess, setShowPlanSuccess] = useState('');
  const [showReport, setShowReport] = useState(false);

  const patient = patients.find((p) => p.id === id);
  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado.</p>
        <Link href="/pacientes" className="text-primary underline text-sm mt-2 inline-block">Volver a pacientes</Link>
      </div>
    );
  }

  const patientAnthropometry = anthropometryData.filter((a) => a.pacienteId === id).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const patientConsultations = consultations.filter((c) => c.pacienteId === id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const patientAppointments = appointments.filter((a) => a.pacienteId === id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const patientPlans = plansList.filter((p) => p.pacienteId === id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const latestAnthro = patientAnthropometry[patientAnthropometry.length - 1];

  const filteredAnthro = useMemo(() => {
    return patientAnthropometry.filter((a) => a.fecha >= dateFrom && a.fecha <= dateTo);
  }, [patientAnthropometry, dateFrom, dateTo]);

  const weightData = filteredAnthro.map((a) => ({
    fecha: formatDate(a.fecha, 'dd/MM/yy'),
    peso: a.peso,
  }));

  const bmiData = filteredAnthro.map((a) => ({
    fecha: formatDate(a.fecha, 'dd/MM/yy'),
    imc: a.imc,
  }));

  const filteredPlans = plansList
    .filter((p) => p.pacienteId === id && p.fecha >= dateFrom && p.fecha <= dateTo)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const caloriesData = filteredPlans.map((p) => ({
    fecha: formatDate(p.fecha, 'dd/MM/yy'),
    calorias: p.caloriasDiarias,
    proteinas: p.macros.proteinasGramos * 4,
    carbohidratos: p.macros.carbohidratosGramos * 4,
    grasas: p.macros.grasasGramos * 9,
  }));

  const handleSavePlan = (plan: NutritionalPlan) => {
    if (editingPlan) {
      setPlansList(prev => prev.map(p => p.id === plan.id ? plan : p));
      setShowPlanSuccess('Plan nutricional actualizado exitosamente.');
    } else {
      setPlansList(prev => [...prev, plan]);
      setShowPlanSuccess('Plan nutricional creado exitosamente.');
    }
    setShowPlanModal(false);
    setEditingPlan(undefined);
    setTimeout(() => setShowPlanSuccess(''), 3000);
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('¿Está seguro de eliminar este plan nutricional?')) {
      setPlansList(prev => prev.filter(p => p.id !== planId));
      setShowPlanSuccess('Plan nutricional eliminado.');
      setTimeout(() => setShowPlanSuccess(''), 3000);
    }
  };

  const handleDuplicatePlan = (plan: NutritionalPlan) => {
    const duplicated: NutritionalPlan = {
      ...plan,
      id: 'np' + Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      comidas: plan.comidas.map(c => ({ ...c })),
      restricciones: [...plan.restricciones],
      suplementos: [...plan.suplementos],
    };
    setPlansList(prev => [...prev, duplicated]);
    setShowPlanSuccess('Plan nutricional duplicado exitosamente.');
    setTimeout(() => setShowPlanSuccess(''), 3000);
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
              <p className="text-sm text-gray-500">{calculateAge(patient.fechaNacimiento)} años · {patient.genero === 'F' ? 'Femenino' : 'Masculino'} · {patient.ocupacion}</p>
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
        <div className="grid grid-cols-4 gap-4">
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
            <p className="text-xl font-bold text-gray-900">{latestAnthro.porcentajeGrasa}%</p>
          </Card>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
                <p className="text-xs text-gray-500 font-medium mb-1">Médicos</p>
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
              <p><span className="text-gray-500">Sueño:</span> {patient.estiloVida.horasSueno} horas</p>
              <p><span className="text-gray-500">Ejercicio:</span> {patient.estiloVida.ejercicioSemanal}</p>
              <p><span className="text-gray-500">Alcohol:</span> {patient.estiloVida.consumoAlcohol ? 'Sí' : 'No'}</p>
              <p><span className="text-gray-500">Fumador:</span> {patient.estiloVida.fumador ? 'Sí' : 'No'}</p>
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

      {activeTab === 'Antropometría' && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Historial Antropométrico</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Fecha</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Peso (kg)</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">IMC</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Cintura (cm)</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Cadera (cm)</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">% Grasa</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">% Músculo</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Notas</th>
                </tr>
              </thead>
              <tbody>
                {patientAnthropometry.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50">
                    <td className="py-2 px-3">{formatDate(a.fecha)}</td>
                    <td className="py-2 px-3 text-right font-medium">{a.peso}</td>
                    <td className="py-2 px-3 text-right">
                      <span style={{ color: getIMCClassification(a.imc).color }} className="font-medium">{a.imc}</span>
                    </td>
                    <td className="py-2 px-3 text-right">{a.circunferenciaCintura}</td>
                    <td className="py-2 px-3 text-right">{a.circunferenciaCadera}</td>
                    <td className="py-2 px-3 text-right">{a.porcentajeGrasa}%</td>
                    <td className="py-2 px-3 text-right">{a.porcentajeMusculo}%</td>
                    <td className="py-2 px-3 text-gray-500 text-xs">{a.notas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'Consultas' && (
        <div className="space-y-4">
          {patientConsultations.map((c) => (
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
              <p className="text-sm text-gray-600 mb-1"><strong>Diagnóstico:</strong> {c.diagnostico}</p>
              <p className="text-sm text-gray-500"><strong>Recomendaciones:</strong> {c.recomendaciones}</p>
            </Card>
          ))}
          {patientConsultations.length === 0 && (
            <p className="text-center text-gray-500 py-8">Sin consultas registradas.</p>
          )}
        </div>
      )}

      {activeTab === 'Citas' && (
        <div className="space-y-3">
          {patientAppointments.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(a.fecha)} - {a.hora}</p>
                  <p className="text-xs text-gray-500">{APPOINTMENT_TYPES[a.tipo]} · {a.motivo}</p>
                </div>
              </div>
              <Badge variant={a.estado === 'completada' ? 'green' : a.estado === 'cancelada' ? 'red' : 'blue'}>
                {a.estado === 'completada' ? 'Completada' : a.estado === 'cancelada' ? 'Cancelada' : 'Programada'}
              </Badge>
            </Card>
          ))}
          {patientAppointments.length === 0 && (
            <p className="text-center text-gray-500 py-8">Sin citas registradas.</p>
          )}
        </div>
      )}

      {activeTab === 'Planes Nutricionales' && (
        <div className="space-y-4">
          {showPlanSuccess && (
            <div className="bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
              {showPlanSuccess}
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
                  <Badge variant="green">{plan.caloriasDiarias} kcal/día</Badge>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingPlan(plan); setShowPlanModal(true); }}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicatePlan(plan)}><Copy size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}><Trash2 size={14} className="text-red-400" /></Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3"><strong>Objetivo:</strong> {plan.objetivo}</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-blue-600">Proteínas</p>
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

      {activeTab === 'Métricas' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-end gap-4">
              <Input id="m-from" label="Desde" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input id="m-to" label="Hasta" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </Card>

          {filteredAnthro.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-12">No hay datos para el rango de fechas seleccionado.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Evolución de Peso (kg)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
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
                    <AreaChart data={bmiData}>
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

              {caloriesData.length > 0 && (
                <Card className="col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-4">Calorías por Plan (kcal)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={caloriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="proteinas" stackId="a" fill="#3B82F6" name="Proteínas (kcal)" />
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
          anthropometry={patientAnthropometry}
          plans={patientPlans}
          consultations={patientConsultations}
        />
      </Modal>
    </div>
  );
}
