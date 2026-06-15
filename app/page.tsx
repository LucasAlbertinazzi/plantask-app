'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

interface Patient {
  id: string;
  name: string;
  age: number;
  bed: string;
  status: 'pending' | 'in_progress' | 'discharged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  diagnoses: string[];
  badges: { label: string; color: string; icon?: string }[];
  lastUpdate: string;
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: "1",
    name: "João Silva Moreira",
    age: 64,
    bed: "Leito 01",
    status: 'pending',
    priority: 'high',
    diagnoses: ["PAC Grave", "HAS", "DM2"],
    badges: [
      { label: "VM D2", color: "bg-blue-100 text-blue-800 border-blue-200", icon: "air" },
      { label: "ATB D3/D7", color: "bg-amber-100 text-amber-800 border-amber-200", icon: "medication" },
      { label: "Sedação leve", color: "bg-purple-100 text-purple-800 border-purple-200", icon: "neurology" }
    ],
    lastUpdate: 'Há 15 min'
  },
  {
    id: "2",
    name: "Maria de Lourdes Ferreira",
    age: 42,
    bed: "Leito 02",
    status: 'in_progress',
    priority: 'medium',
    diagnoses: ["Pós-op RTU", "DRC"],
    badges: [
      { label: "Dreno", color: "bg-sky-100 text-sky-800 border-sky-200", icon: "water_drop" },
      { label: "Prec. Contato", color: "bg-orange-100 text-orange-800 border-orange-200", icon: "warning" }
    ],
    lastUpdate: 'Há 1 hora'
  },
  {
    id: "3",
    name: "Antonio Costa Ribeiro",
    age: 55,
    bed: "Leito 03",
    status: 'discharged',
    priority: 'low',
    diagnoses: ["IAMcsST recuperado"],
    badges: [
      { label: "Alta Hoje", color: "bg-green-100 text-green-800 border-green-200", icon: "check_circle" },
      { label: "Extubado", color: "bg-teal-100 text-teal-800 border-teal-200", icon: "sentiment_satisfied" }
    ],
    lastUpdate: 'Há 2 horas'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const { state, addPatient } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isPatientModalOpen, setPatientModalOpen] = useState(false);
  const [newPatientBed, setNewPatientBed] = useState('');
  const [newPatientName, setNewPatientName] = useState('');

  const filteredPatients = useMemo(() => {
    return state.patients.filter(p => {
      const matchFilter = filter === 'all' ? true : 
                          filter === 'pending' ? p.status === 'pending' : 
                          filter === 'in_progress' ? p.status === 'in_progress' : true;
      const q = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || 
                          p.bed.toLowerCase().includes(q) || 
                          p.diagnoses.some(d => d.toLowerCase().includes(q));
      return matchFilter && matchSearch;
    });
  }, [state.patients, filter, searchQuery]);

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !newPatientBed) return;
    const newId = Date.now().toString();
    const newPatient: any = {
      id: newId,
      name: newPatientName,
      age: Math.floor(Math.random() * 50) + 30, // Random age
      bed: newPatientBed,
      status: 'pending',
      priority: 'medium',
      diagnoses: ["Em avaliação"],
      badges: [{ label: "Admissão", color: "bg-gray-100 text-gray-800 border-gray-200", icon: "person_add" }],
      lastUpdate: 'Agora'
    };
    addPatient(newPatient);
    setPatientModalOpen(false);
    setNewPatientName('');
    setNewPatientBed('');
    router.push(`/patients/${newId}`);
  };

  const stats = {
    total: state.patients.length,
    pending: state.patients.filter(p => p.status === 'pending').length,
    alta: state.patients.filter(p => p.status === 'discharged').length,
    critical: state.patients.filter(p => p.priority === 'critical' || p.priority === 'high').length
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-8 flex flex-col gap-6 relative">
      
      {/* Turn Summary at the top - Hidden per user request */}
      <div className="hidden mb-2">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm">
          <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider mb-1">Total Leitos</span>
          <div className="text-2xl font-bold text-gray-900 flex items-end gap-2">{stats.total}</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col shadow-sm">
          <span className="text-amber-800 font-semibold text-xs uppercase tracking-wider mb-1">Pendências</span>
          <div className="text-2xl font-bold text-amber-600 flex items-end gap-2">{stats.pending}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col shadow-sm">
          <span className="text-red-800 font-semibold text-xs uppercase tracking-wider mb-1">Alta Prioridade</span>
          <div className="text-2xl font-bold text-red-600 flex items-end gap-2">{stats.critical}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col shadow-sm">
          <span className="text-green-800 font-semibold text-xs uppercase tracking-wider mb-1">Altas Previstas</span>
          <div className="text-2xl font-bold text-green-600 flex items-end gap-2">{stats.alta}</div>
        </div>
      </div>

      {/* Dashboard Header */}
      <section className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/50">
        <div className="flex-1 min-w-[280px]">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">UTI Adulto - Setor Sul</h1>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1.5 font-medium">
            <span className="material-symbols-outlined text-[16px]">schedule</span> Plantão Diurno (07h - 19h)
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full sm:w-auto">

          {/* Search Bar */}
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar paciente, leito..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 md:w-64 pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 w-full sm:w-auto sm:border-l sm:pl-3 border-gray-200">
            <button 
              type="button"
              onClick={() => setFilter('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-semibold transition-all ${filter === 'all' ? 'bg-gray-800 text-white border-gray-900 shadow-sm' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
              Todos
            </button>
            <button 
              type="button"
              onClick={() => setFilter('pending')}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-semibold transition-all ${filter === 'pending' ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100/50'}`}>
              Pendentes
            </button>
            <button 
              type="button"
              onClick={() => setFilter('in_progress')}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-semibold transition-all ${filter === 'in_progress' ? 'bg-blue-600 text-white border-blue-700 shadow-sm' : 'border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100/50'}`}>
              Em Observação
            </button>
          </div>
          <button type="button" onClick={() => setPatientModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all w-full sm:w-auto justify-center sm:ml-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo Paciente
          </button>
        </div>
      </section>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-gray-300 rounded-2xl w-full min-h-[300px]">
          <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">search_off</span>
          <h2 className="text-lg font-bold text-gray-700">Nenhum paciente encontrado</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-md">Tente ajustar seus filtros para achar o leito desejado.</p>
        </div>
      )}

      {/* Bed Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
        
        {filteredPatients.map(patient => {
          const colorClass = patient.status === 'pending' ? 'bg-amber-500' :
                             patient.status === 'in_progress' ? 'bg-blue-600' : 'bg-green-500';
          const iconStatus = patient.status === 'pending' ? 'notifications_active' :
                             patient.status === 'in_progress' ? 'visibility' : 'check_circle';                             
          const colorIconBg = patient.status === 'pending' ? 'bg-amber-50 text-amber-500' :
                              patient.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-500';

          return (
            <Link key={patient.id} href={`/patients/${patient.id}`} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorClass}`}></div>
              
              <div className="flex justify-between items-start pl-2">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{patient.bed}</h2>
                  <p className="text-sm font-semibold text-gray-500 mt-1">{patient.name} • {patient.age} anos</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`material-symbols-outlined p-1.5 rounded-full ${colorIconBg}`} style={{ fontVariationSettings: "'FILL' 1" }}>{iconStatus}</span>
                  {patient.priority === 'high' || patient.priority === 'critical' ? (
                     <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-red-200">Alta Prio</span>
                  ) : null}
                </div>
              </div>
              
              {/* Diagnoses / Clinical Resumo */}
              <div className="pl-2 line-clamp-1 text-sm text-gray-600 font-medium">
                {patient.diagnoses.join(', ')}
              </div>

              {/* Badges Rápidas */}
              <div className="flex flex-wrap gap-2 pl-2 mt-1">
                {patient.badges.map((badge, idx) => (
                  <div key={idx} className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded border ${badge.color}`}>
                    {badge.icon && <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>}
                    {badge.label}
                  </div>
                ))}
              </div>

              {/* Footer info */}
              <div className="mt-auto pt-3 border-t border-gray-100 pl-2 flex justify-between items-center relative z-10 w-full">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">update</span>
                  {patient.lastUpdate}
                </span>
                <span className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ver detalhes <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </Link>
          )
        })}

        {/* Add new shortcut */}
        {filter === 'all' && (
          <div onClick={() => setPatientModalOpen(true)} className="bg-gray-50/50 border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col gap-4 relative justify-center items-center h-full min-h-[220px] group hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
             <div className="rounded-full bg-white border border-gray-200 p-4 group-hover:bg-blue-600 group-hover:text-white transition-colors text-gray-400 mb-2 shadow-sm">
                <span className="material-symbols-outlined text-3xl block">add</span>
             </div>
             <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-800">Adicionar Leito</p>
          </div>
        )}

      </section>

      {/* Modal Overlay - Novo Paciente */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Novo Paciente / Leito</h3>
              <button onClick={() => setPatientModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 border shadow-sm">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Leito</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newPatientBed}
                  onChange={e => setNewPatientBed(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="Ex: Leito 10" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nome completo do Paciente</label>
                <input 
                  type="text" 
                  required
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="Ex: Ana Maria Freitas" 
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setPatientModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors border border-transparent">Cancelar</button>
                <button type="submit" disabled={!newPatientName.trim() || !newPatientBed.trim()} className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cadastrar Leito</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


