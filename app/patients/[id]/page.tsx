'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

// --- COMPONENTS ---
const SectionTitle = ({ icon, title, action }: { icon: string, title: string, action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-5 min-h-[32px] gap-4 border-b border-gray-100/50 pb-3">
    <div className="flex items-center gap-2.5 text-gray-800">
      <span className="material-symbols-outlined text-[20px] text-blue-600 bg-blue-50 p-1.5 rounded-lg">{icon}</span>
      <h3 className="font-semibold text-[15px] leading-tight">{title}</h3>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

const EditButton = ({ isEditing, onClick }: { isEditing: boolean, onClick: () => void }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded transition-colors ${
      isEditing ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'text-blue-600 hover:bg-blue-50'
    }`}
  >
    <span className="material-symbols-outlined text-[18px]">{isEditing ? 'done' : 'edit'}</span>
    {isEditing ? 'Salvar' : 'Editar'}
  </button>
);

export default function ClinicalHubPage() {
  const params = useParams();
  const router = useRouter();
  const { state, updatePatientDetails } = useAppStore();
  const currentId = (params?.id as string) || "1";

  const ALL_PATIENTS = state.patients;

  // Check if patient exists, if not fallback to first
  const currentIndex = ALL_PATIENTS.findIndex(p => p.id === currentId);
  const isValidPatient = currentIndex !== -1;
  const idx = isValidPatient ? currentIndex : 0;
  
  const prevPatient = idx > 0 ? ALL_PATIENTS[idx - 1] : null;
  const nextPatient = idx < ALL_PATIENTS.length - 1 ? ALL_PATIENTS[idx + 1] : null;

  // Local state for the patient data to allow editing
  const [p, setP] = useState(() => state.details[ALL_PATIENTS[idx].id] || state.details["1"]);

  // Update state when ID changes. Use an effect but only when data is missing, or initialize lazily.
  // We can just use the key trick on the wrapper or suppress. To avoid cascading renders, we can compare id.
  useEffect(() => {
    if (isValidPatient && p.id !== ALL_PATIENTS[idx].id) {
      setTimeout(() => {
        setP(state.details[ALL_PATIENTS[idx].id] || state.details["1"]);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, idx, isValidPatient, p.id, state.details, ALL_PATIENTS]);

  // Persist local edits to store when `p` changes
  useEffect(() => {
    if (p.id) {
      updatePatientDetails(p.id, p as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  // Edit states
  const [editingSummary, setEditingSummary] = useState(false);
  const [editingImaging, setEditingImaging] = useState(false);
  const [editingVitals, setEditingVitals] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingTherapeutics, setEditingTherapeutics] = useState(false);
  const [editingInfusions, setEditingInfusions] = useState(false);
  
  // New items state
  const [newActionText, setNewActionText] = useState("");
  const [newProfileText, setNewProfileText] = useState("");
  const [deleteActionId, setDeleteActionId] = useState<number | null>(null);

  // New medications
  const [newAntimicrobial, setNewAntimicrobial] = useState("");
  const [newProphylaxis, setNewProphylaxis] = useState("");
  const [newMainMedication, setNewMainMedication] = useState("");

  // New infusions
  const [newInfusionName, setNewInfusionName] = useState("");
  const [newInfusionRate, setNewInfusionRate] = useState("");
  const [newInfusionDose, setNewInfusionDose] = useState("");
  const [newInfusionStatus, setNewInfusionStatus] = useState<'running' | 'weaning' | 'suspended'>("running");

  const toggleActionStatus = (id: number) => {
    setP(prev => ({
      ...prev,
      pendingActions: prev.pendingActions.map(a => {
        if (a.id === id) {
          const nextStatus = a.status === 'completed' ? 'pending' : 'completed';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    }));
  };

  const removeAction = () => {
    if (deleteActionId !== null) {
      setP(prev => ({...prev, pendingActions: prev.pendingActions.filter(a => a.id !== deleteActionId)}));
      setDeleteActionId(null);
    }
  };

  const addAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    setP(prev => ({
      ...prev,
      pendingActions: [
        ...prev.pendingActions,
        { id: Date.now(), text: newActionText, status: "pending", priority: "medium" }
      ]
    }));
    setNewActionText("");
  };

  const addProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileText.trim()) return;
    setP(prev => ({
      ...prev,
      clinicalProfile: [...prev.clinicalProfile, newProfileText]
    }));
    setNewProfileText("");
  };

  const removeProfile = (index: number) => {
    setP(prev => {
      const newProf = [...prev.clinicalProfile];
      newProf.splice(index, 1);
      return { ...prev, clinicalProfile: newProf };
    });
  };

  const addMedication = (e: React.FormEvent, type: 'antibiotics' | 'prophylaxis' | 'mainMedications') => {
    e.preventDefault();
    const value = type === 'antibiotics' ? newAntimicrobial : type === 'prophylaxis' ? newProphylaxis : newMainMedication;
    if (!value.trim()) return;
    setP(prev => ({
      ...prev,
      therapeutics: {
        ...prev.therapeutics,
        [type]: [...prev.therapeutics[type], value]
      }
    }));
    if (type === 'antibiotics') setNewAntimicrobial("");
    if (type === 'prophylaxis') setNewProphylaxis("");
    if (type === 'mainMedications') setNewMainMedication("");
  };

  const removeMedication = (type: 'antibiotics' | 'prophylaxis' | 'mainMedications', index: number) => {
    setP(prev => {
      const newList = [...prev.therapeutics[type]];
      newList.splice(index, 1);
      return {
        ...prev,
        therapeutics: {
          ...prev.therapeutics,
          [type]: newList
        }
      };
    });
  };

  const toggleMedicationSuspend = (type: 'antibiotics' | 'prophylaxis' | 'mainMedications', index: number) => {
    setP(prev => {
      const newList = [...prev.therapeutics[type]];
      if (newList[index].includes('(suspensa)')) {
        newList[index] = newList[index].replace(' (suspensa)', '');
      } else {
        newList[index] = newList[index] + ' (suspensa)';
      }
      return {
        ...prev,
        therapeutics: {
          ...prev.therapeutics,
          [type]: newList
        }
      };
    });
  };

  const addInfusion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInfusionName.trim()) return;
    setP(prev => ({
      ...prev,
      infusions: [
        ...prev.infusions,
        {
          name: newInfusionName,
          rate: newInfusionRate || "0 ml/h",
          dose: newInfusionDose || "-",
          status: newInfusionStatus
        }
      ]
    }));
    setNewInfusionName("");
    setNewInfusionRate("");
    setNewInfusionDose("");
    setNewInfusionStatus("running");
  };

  const removeInfusion = (index: number) => {
    setP(prev => {
      const newInfusions = [...prev.infusions];
      newInfusions.splice(index, 1);
      return { ...prev, infusions: newInfusions };
    });
  };

  const updateInfusion = (index: number, changes: Partial<{name: string, rate: string, dose: string, status: 'running'|'weaning'|'suspended'}>) => {
    setP(prev => {
      const newInfusions = [...prev.infusions];
      newInfusions[index] = { ...newInfusions[index], ...changes };
      return { ...prev, infusions: newInfusions };
    });
  };

  // History Modal
  const [showHistory, setShowHistory] = useState(false);

  const MOCK_HISTORY = [
    { id: 1, time: "11:30", user: "Enf. Mário", action: "Administrou medicação Vancomicina 1g IV" },
    { id: 2, time: "10:15", user: "Dr. Ana", action: "Adicionou nova conduta: Solicitar TC de Tórax" },
    { id: 3, time: "09:00", user: "Enf. Carlos", action: "Atualizou Sinais Vitais (PA: 120/80)" },
    { id: 4, time: "07:30", user: "Dr. Carlos Eduardo", action: "Recebeu o plantão e atualizou Resumo Clínico" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col gap-6 bg-gray-50/50 min-h-screen relative">
      
      {/* NAVEGAÇÃO FLUIDA ENTRE LEITOS */}
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm sticky top-4 z-30 transition-all">
        {prevPatient ? (
          <Link 
            href={`/patients/${prevPatient.id}`}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="hidden sm:inline">Anterior</span>
          </Link>
        ) : (
          <button disabled className="flex items-center gap-2 text-sm font-semibold text-gray-500 opacity-30 cursor-not-allowed px-2 py-1.5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="hidden sm:inline">Anterior</span>
          </button>
        )}

        <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg px-3 py-1.5 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">bed</span>
          <select 
            value={currentId} 
            onChange={(e) => router.push(`/patients/${e.target.value}`)}
            className="text-sm md:text-base font-bold bg-transparent border-none focus:ring-0 cursor-pointer text-gray-800 outline-none hover:text-blue-700 transition-colors"
          >
            {ALL_PATIENTS.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.bed} — {patient.name}</option>
            ))}
          </select>
        </div>

        {nextPatient ? (
          <Link 
            href={`/patients/${nextPatient.id}`}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">Próximo</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        ) : (
          <button disabled className="flex items-center gap-2 text-sm font-semibold text-gray-500 opacity-30 cursor-not-allowed px-2 py-1.5 rounded-lg transition-colors">
            <span className="hidden sm:inline">Próximo</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        )}
      </div>

      <div key={p.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-6">
        {/* HEADER DO PACIENTE */}
        <section className="bg-white border border-blue-100 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 relative overflow-hidden mt-2">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>
        
        <div className="flex flex-col gap-2 pl-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">{p.name}</h1>
            {p.alerts.map((alert, i) => (
              <span key={i} className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-md font-semibold border border-red-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {alert}
              </span>
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 mt-1">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-gray-400">calendar_today</span>
              {p.age} anos
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-gray-400">weight</span>
              {p.weight}
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-gray-400">bed</span>
              <span className="text-blue-700 font-semibold">{p.bed}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
              {p.sector}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-3 min-w-[240px]">
          <div className="flex gap-2 w-full md:w-auto">
            <button type="button" onClick={() => setShowHistory(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Histórico
            </button>
            <Link href={`/patients/${p.id}/handover`} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Relatório
            </Link>
          </div>
          <div className="text-right mt-1 w-full md:w-auto bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
            <div className="text-xs text-gray-500 mb-0.5">Última atualização (Plantão)</div>
            <div className="text-sm font-medium text-gray-800">{p.handoffMeta.lastUpdated}</div>
            <div className="text-xs text-gray-500 mt-0.5">{p.handoffMeta.generatedBy}</div>
          </div>
        </div>
      </section>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA (Mais larga) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* RESUMO CLÍNICO IA - Destaque */}
          <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-blue-200">
            <SectionTitle icon="auto_awesome" title="Resumo Clínico (IA)" action={
              <EditButton isEditing={editingSummary} onClick={() => setEditingSummary(!editingSummary)} />
            } />
            {editingSummary ? (
              <textarea 
                className="w-full min-h-[120px] text-sm md:text-base text-gray-800 border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                value={p.aiSummary}
                onChange={(e) => setP({...p, aiSummary: e.target.value})}
              />
            ) : (
              <p className="text-gray-800 text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
                {p.aiSummary}
              </p>
            )}
          </Card>

          {/* CONDUTAS E PENDÊNCIAS */}
          <Card>
            <SectionTitle icon="fact_check" title="Condutas e Pendências do Plantão" action={
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{p.pendingActions.filter(a => a.status === 'pending' || a.status === 'attention').length} pendentes</span>
            } />
            <div className="flex flex-col gap-3">
              <form onSubmit={addAction} className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                <input 
                  type="text" 
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  placeholder="Adicionar nova conduta ou pendência..."
                  className="flex-1 bg-transparent border-none text-sm focus:ring-0 px-2 outline-none"
                />
                <button type="submit" disabled={!newActionText.trim()} className="bg-blue-600 text-white rounded p-1.5 disabled:opacity-50 hover:bg-blue-700 transition flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </form>

              <div className="flex flex-col gap-2.5 mt-2">
                {p.pendingActions.map((action) => (
                  <div key={action.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    action.status === 'completed' ? 'bg-gray-50 border-gray-200 opacity-60' :
                    action.status === 'attention' ? 'bg-amber-50 border-amber-200 shadow-sm' :
                    'bg-white border-gray-200 shadow-sm'
                  }`}>
                    <button 
                      type="button"
                      onClick={() => toggleActionStatus(action.id)}
                      className={`mt-0.5 transition-colors ${action.status === 'completed' ? 'text-green-500' : 'text-gray-400 hover:text-blue-600'}`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {action.status === 'completed' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                    <span className={`text-sm font-medium flex-1 pt-0.5 ${
                      action.status === 'completed' ? 'text-gray-500 line-through' : 
                      action.status === 'attention' ? 'text-amber-900' : 'text-gray-800'
                    }`}>
                      {action.text}
                    </span>
                    {action.status === 'attention' && (
                      <span className="ml-auto material-symbols-outlined text-[20px] text-amber-500">warning</span>
                    )}
                    <button 
                      type="button"
                      onClick={() => setDeleteActionId(action.id)}
                      className="text-gray-300 hover:text-red-500 transition ml-1"
                      title="Deletar conduta"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* TERAPÊUTICA */}
          <Card>
            <SectionTitle icon="medication" title="Terapêutica Atual" action={
              <EditButton isEditing={editingTherapeutics} onClick={() => setEditingTherapeutics(!editingTherapeutics)} />
            }/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span> Antimicrobianos
                </h4>
                <ul className="flex flex-col gap-2">
                  {p.therapeutics.antibiotics.map((med, i) => (
                    <li key={i} className="text-sm text-gray-800 bg-gray-50 border border-gray-100 rounded px-3 py-2 font-medium flex items-center justify-between group">
                      <span className="flex-1">{med}</span>
                      {editingTherapeutics && (
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button type="button" onClick={() => removeMedication('antibiotics', i)} className="text-gray-400 hover:text-red-500">
                             <span className="material-symbols-outlined text-[16px]">close</span>
                           </button>
                        </div>
                      )}
                    </li>
                  ))}
                  {editingTherapeutics && (
                    <li className="mt-1">
                      <form onSubmit={(e) => addMedication(e, 'antibiotics')} className="flex items-center gap-2">
                        <input type="text" value={newAntimicrobial} onChange={(e) => setNewAntimicrobial(e.target.value)} placeholder="Adicionar ATB..." className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500" />
                        <button type="submit" disabled={!newAntimicrobial.trim()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded transition disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">add</span></button>
                      </form>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> Profilaxias
                </h4>
                <ul className="flex flex-col gap-2">
                  {p.therapeutics.prophylaxis.map((med, i) => (
                    <li key={i} className="text-sm text-gray-800 bg-gray-50 border border-gray-100 rounded px-3 py-2 font-medium flex items-center justify-between group">
                      <span className="flex-1">{med}</span>
                      {editingTherapeutics && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button type="button" onClick={() => removeMedication('prophylaxis', i)} className="text-gray-400 hover:text-red-500">
                             <span className="material-symbols-outlined text-[16px]">close</span>
                           </button>
                        </div>
                      )}
                    </li>
                  ))}
                  {editingTherapeutics && (
                    <li className="mt-1">
                      <form onSubmit={(e) => addMedication(e, 'prophylaxis')} className="flex items-center gap-2">
                        <input type="text" value={newProphylaxis} onChange={(e) => setNewProphylaxis(e.target.value)} placeholder="Adicionar profilaxia..." className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500" />
                        <button type="submit" disabled={!newProphylaxis.trim()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded transition disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">add</span></button>
                      </form>
                    </li>
                  )}
                </ul>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span> Medicações Principais
                </h4>
                <div className="flex flex-wrap gap-2 items-center">
                  {p.therapeutics.mainMedications.map((med, i) => (
                    <span key={i} className={`text-sm px-3 py-1.5 rounded-full border flex items-center gap-2 group ${med.includes('suspensa') ? 'bg-gray-100 text-gray-500 border-gray-200 line-through' : 'bg-white text-gray-800 border-gray-300 shadow-sm'}`}>
                      {med}
                      {editingTherapeutics && (
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button type="button" onClick={() => toggleMedicationSuspend('mainMedications', i)} className="text-amber-500 hover:text-amber-600" title={med.includes('suspensa') ? "Retomar" : "Suspender"}>
                             <span className="material-symbols-outlined text-[14px]">{med.includes('suspensa') ? "play_arrow" : "pause"}</span>
                           </button>
                           <button type="button" onClick={() => removeMedication('mainMedications', i)} className="text-red-400 hover:text-red-600" title="Apagar">
                             <span className="material-symbols-outlined text-[14px]">close</span>
                           </button>
                         </div>
                      )}
                    </span>
                  ))}
                  {editingTherapeutics && (
                    <form onSubmit={(e) => addMedication(e, 'mainMedications')} className="flex items-center gap-2 max-w-[200px]">
                      <input type="text" value={newMainMedication} onChange={(e) => setNewMainMedication(e.target.value)} placeholder="Nova medicação..." className="text-sm border border-gray-300 rounded-full px-3 py-1 focus:outline-none focus:border-blue-500 w-full" />
                    </form>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* EXAMES DE IMAGEM */}
          <Card>
            <SectionTitle icon="local_hospital" title="Exames de Imagem" action={
              <EditButton isEditing={editingImaging} onClick={() => setEditingImaging(!editingImaging)} />
            }/>
            {editingImaging ? (
              <textarea 
                className="w-full min-h-[80px] text-sm text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={p.imaging}
                onChange={(e) => setP({...p, imaging: e.target.value})}
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {p.imaging}
              </div>
            )}
          </Card>

        </div>

        {/* COLUNA DIREITA (Mais estreita) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* PERFIL CLÍNICO */}
          <Card>
            <SectionTitle icon="assignment" title="Perfil Clínico" action={
              <EditButton isEditing={editingProfile} onClick={() => setEditingProfile(!editingProfile)} />
            } />
            
            <div className="flex flex-col gap-3">
              <ul className="flex flex-col gap-2">
                {p.clinicalProfile.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-800 group">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span className="font-medium leading-tight flex-1">{item}</span>
                    {editingProfile && (
                      <button type="button" onClick={() => removeProfile(i)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {editingProfile && (
                <form onSubmit={addProfile} className="flex items-center gap-2 mt-2">
                  <input 
                    type="text" 
                    value={newProfileText}
                    onChange={(e) => setNewProfileText(e.target.value)}
                    placeholder="Novo diagnóstico..."
                    className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                  <button type="submit" disabled={!newProfileText.trim()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded transition disabled:opacity-50">
                     <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </form>
              )}
            </div>
          </Card>

          {/* SINAIS VITAIS E BH */}
          <Card className="border-blue-100 shadow-blue-900/5">
            <SectionTitle icon="vital_signs" title="Sinais Vitais e Balanço" action={
               <EditButton isEditing={editingVitals} onClick={() => setEditingVitals(!editingVitals)} />
            }/>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Sinais Vitais</label>
                {editingVitals ? (
                  <input 
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                    value={p.quickVitalsNote}
                    onChange={(e) => setP({...p, quickVitalsNote: e.target.value})}
                    placeholder="Anotação rápida. Ex: Estável, s/ intercorrências"
                  />
                ) : (
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 break-words">
                    {p.quickVitalsNote || "-"}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Diurese</span>
                  {editingVitals ? (
                    <input 
                      type="text" 
                      value={p.diuresis} 
                      onChange={(e) => setP({...p, diuresis: e.target.value})} 
                      className="font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full text-sm transition-shadow" 
                      placeholder="Ex: 1200 ml/24h"
                    />
                  ) : (
                    <span className="font-semibold text-gray-900 text-sm">{p.diuresis || "-"}</span>
                  )}
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-blue-600/80 uppercase tracking-wider block">BH Total</span>
                  {editingVitals ? (
                    <input 
                      type="text" 
                      value={p.fluidBalanceTotal} 
                      onChange={(e) => setP({...p, fluidBalanceTotal: e.target.value})} 
                      className="font-semibold text-blue-900 bg-white border border-blue-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full text-sm transition-shadow" 
                      placeholder="Ex: +450 ml"
                    />
                  ) : (
                    <span className="font-semibold text-blue-900 text-sm">{p.fluidBalanceTotal || "-"}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* INFUSÕES / BIC */}
          <Card>
            <SectionTitle icon="vaccines" title="Infusões / BIC" action={
              <EditButton isEditing={editingInfusions} onClick={() => setEditingInfusions(!editingInfusions)} />
            }/>
            <div className="flex flex-col gap-3">
              {p.infusions.map((infusion, i) => (
                <div key={i} className={`group flex flex-col p-3 rounded-lg border transition-all relative ${infusion.status === 'suspended' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-blue-100 shadow-sm'}`}>
                  {editingInfusions && (
                    <button type="button" onClick={() => removeInfusion(i)} className="absolute -top-2 -right-2 bg-white border border-gray-200 text-red-500 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                  <div className="flex justify-between items-center mb-1 gap-2">
                    {editingInfusions ? (
                      <input 
                        type="text" 
                        value={infusion.name} 
                        onChange={(e) => updateInfusion(i, { name: e.target.value })}
                        className={`font-semibold text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none flex-1 w-full ${infusion.status === 'suspended' ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                      />
                    ) : (
                      <span className={`font-semibold text-sm ${infusion.status === 'suspended' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{infusion.name}</span>
                    )}
                    
                    {editingInfusions ? (
                      <select 
                        value={infusion.status}
                        onChange={(e) => updateInfusion(i, { status: e.target.value as 'running' | 'weaning' | 'suspended' })}
                        className="text-[10px] uppercase font-bold py-1 px-1 rounded border border-gray-300 bg-white"
                      >
                        <option value="running">Contínuo</option>
                        <option value="weaning">Desmame</option>
                        <option value="suspended">Suspenso</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        infusion.status === 'running' ? 'bg-green-100 text-green-800 border border-green-200' :
                        infusion.status === 'weaning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-gray-200 text-gray-600 border border-gray-300'
                      }`}>
                        {infusion.status === 'running' ? 'Contínuo' : infusion.status === 'weaning' ? 'Desmame' : 'Suspenso'}
                      </span>
                    )}
                  </div>
                  
                  {(infusion.status === 'running' || infusion.status === 'weaning') && (
                    <div className="flex justify-between items-center text-sm mt-1 bg-gray-50 px-2 py-1.5 rounded gap-2 w-full">
                      {editingInfusions ? (
                        <>
                          <input type="text" value={infusion.rate} onChange={(e) => updateInfusion(i, {rate: e.target.value})} className="text-gray-700 font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none flex-1 max-w-[50%]" />
                          <input type="text" value={infusion.dose} onChange={(e) => updateInfusion(i, {dose: e.target.value})} className="text-gray-500 text-xs bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none flex-1 text-right" />
                        </>
                      ) : (
                        <>
                          <span className="text-gray-700 font-semibold">{infusion.rate}</span>
                          <span className="text-gray-500 text-xs">{infusion.dose}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {editingInfusions && (
                <form onSubmit={addInfusion} className="flex flex-col gap-2 mt-2 bg-blue-50/50 p-3 rounded-lg border border-dashed border-blue-200">
                  <div className="text-xs font-bold text-blue-800 mb-1">Nova Infusão</div>
                  <input type="text" value={newInfusionName} onChange={e => setNewInfusionName(e.target.value)} placeholder="Nome da medicação" className="text-sm px-2 py-1.5 rounded border border-gray-300 w-full" />
                  <div className="flex gap-2">
                    <input type="text" value={newInfusionRate} onChange={e => setNewInfusionRate(e.target.value)} placeholder="Vazão (ex: 10ml/h)" className="text-sm px-2 py-1.5 rounded border border-gray-300 w-1/2" />
                    <input type="text" value={newInfusionDose} onChange={e => setNewInfusionDose(e.target.value)} placeholder="Dose (ex: 1mg/kg/h)" className="text-sm px-2 py-1.5 rounded border border-gray-300 w-1/2" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <select value={newInfusionStatus} onChange={e => setNewInfusionStatus(e.target.value as any)} className="text-sm px-2 py-1.5 rounded border border-gray-300 flex-1">
                      <option value="running">Contínuo</option>
                      <option value="weaning">Desmame</option>
                      <option value="suspended">Suspenso</option>
                    </select>
                    <button type="submit" disabled={!newInfusionName.trim()} className="bg-blue-600 text-white rounded px-3 py-1.5 font-bold text-sm disabled:opacity-50">Add</button>
                  </div>
                </form>
              )}
            </div>
          </Card>

        </div>
      </div>

      {deleteActionId !== null && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 flex flex-col items-center text-center">
                 <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                   <span className="material-symbols-outlined text-[24px]">delete_forever</span>
                 </div>
                 <h3 className="font-bold text-lg text-gray-900 mb-1">Apagar Conduta?</h3>
                 <p className="text-sm text-gray-600 mb-6">Esta conduta será permanentemente removida do prontuário.</p>
                 <div className="flex gap-3 w-full">
                    <button type="button" onClick={() => setDeleteActionId(null)} className="flex-1 py-2 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
                    <button type="button" onClick={removeAction} className="flex-1 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">Deletar</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* HISTÓRICO MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                   <span className="material-symbols-outlined text-[24px] text-blue-600">history</span>
                   Histórico do Plantão
                 </h2>
                 <button type="button" onClick={() => setShowHistory(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center justify-center">
                   <span className="material-symbols-outlined text-[20px]">close</span>
                 </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                 <div className="relative border-l-2 border-gray-100 ml-4 pl-6 flex flex-col gap-8">
                   {MOCK_HISTORY.map((log) => (
                     <div key={log.id} className="relative">
                        <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                        <div className="text-xs font-bold text-gray-500 mb-0.5">{log.time}</div>
                        <div className="font-semibold text-gray-900 text-sm mb-1">{log.user}</div>
                        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-100 p-3 rounded-lg leading-relaxed shadow-sm">
                          {log.action}
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                 <button type="button" onClick={() => setShowHistory(false)} className="px-5 py-2 font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">Fechar</button>
              </div>
           </div>
        </div>
      )}

      </div>
    </div>
  );
}
