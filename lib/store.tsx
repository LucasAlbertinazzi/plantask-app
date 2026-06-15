'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Common Patient Interfaces
export type TaskStatus = 'neutral' | 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  status: TaskStatus;
  originalStatus: TaskStatus;
  users: string[];
  priority: TaskPriority;
}

export interface PatientSummary {
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

export interface PatientDetailed {
  id: string;
  name: string;
  age: number;
  weight: string;
  bed: string;
  sector: string;
  handoffMeta: { lastUpdated: string; generatedBy: string; };
  clinicalProfile: string[];
  aiSummary: string;
  therapeutics: {
    antibiotics: string[];
    prophylaxis: string[];
    mainMedications: string[];
  };
  quickVitalsNote: string;
  diuresis: string;
  fluidBalanceTotal: string;
  labs: { name: string; d1: string; d2?: string; trend: string }[];
  infusions: { name: string; rate: string; dose: string; status: 'running' | 'weaning' | 'suspended' }[];
  imaging: string;
  pendingActions: { id: number; text: string; status: string; priority: string }[];
  alerts: string[];
}

// Initial Mock Data
const INITIAL_PATIENTS: PatientSummary[] = [
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

const INITIAL_DETAILS: Record<string, PatientDetailed> = {
  "1": {
    id: "1", name: "João Silva Moreira", age: 64, weight: "78 kg", bed: "Leito 01", sector: "UTI Adulto - Setor Sul",
    handoffMeta: { lastUpdated: "Hoje, 07:30", generatedBy: "Dr. Carlos Eduardo" },
    clinicalProfile: ["Pneumonia Adquirida na Comunidade (PAC)", "HAS", "DM2", "DRC Estágio 3"],
    aiSummary: "Paciente idoso, no 3º dia de internação na UTI por quadro de insuficiência respiratória aguda secundária à PAC grave. Encontra-se em ventilação mecânica invasiva no 2º dia, com parâmetros em queda (FIO2 40%, PEEP 8). Estável hemodinamicamente sem DVA no momento. Sedação leve com despertar diário positivo. Boa resposta ao esquema antimicrobiano em curso. Função renal estável.",
    therapeutics: {
      antibiotics: ["Ceftriaxona 1g IV 12/12h (D3/D7)", "Azitromicina 500mg IV 24/24h (D3/D5)"],
      prophylaxis: ["Enoxaparina 40mg SC 1x/dia", "Omeprazol 40mg IV 1x/dia"],
      mainMedications: ["Losartana 50mg VO 12/12h", "Metformina 850mg VO 12/12h (suspensa)"]
    },
    quickVitalsNote: "PA: 120/80, Sat 98%. Estável.",
    diuresis: "1200 ml/24h", fluidBalanceTotal: "+450 ml",
    labs: [
      { name: "Leucócitos", d1: "18.500", d2: "14.200", trend: "down" },
      { name: "Creatinina", d1: "1.6", d2: "1.5", trend: "down" },
    ],
    infusions: [
      { name: "Propofol 2%", rate: "10 ml/h", dose: "1.5 mg/kg/h", status: "running" },
      { name: "Fentanil", rate: "2 ml/h", dose: "0.5 mcg/kg/h", status: "weaning" },
    ],
    imaging: "Rx Tórax: Melhora do infiltrado alveolar.",
    pendingActions: [{ id: 1, text: "Avaliar desmame da ventilação mecânica", status: "pending", priority: "high" }],
    alerts: ["Alergia: Penicilina"]
  },
  "2": {
    id: "2", name: "Maria de Lourdes Ferreira", age: 42, weight: "65 kg", bed: "Leito 02", sector: "UTI Adulto - Setor Sul",
    handoffMeta: { lastUpdated: "Hoje, 06:15", generatedBy: "Dra. Ana Luiza" },
    clinicalProfile: ["Pós-op RTU", "Infecção do Trato Urinário", "DRC Estágio 2"],
    aiSummary: "Manejo de sepse de foco urinário pós-RTU, em uso de ATB guiado por cultura. Sem indicação de terapia de substituição renal no momento. Hemodinamicamente compensada. Retenção hídrica leve.",
    therapeutics: {
      antibiotics: ["Meropenem 1g IV 8/8h (D2/D10)"],
      prophylaxis: ["Heparina 5000UI SC 8/8h"],
      mainMedications: ["Dipirona 1g IV se dor"]
    },
    quickVitalsNote: "PA: 100/60, Sat 99% em AA.",
    diuresis: "500 ml/24h (Dreno)", fluidBalanceTotal: "+1200 ml",
    labs: [
      { name: "Leucócitos", d1: "21.000", d2: "18.500", trend: "down" },
      { name: "Creatinina", d1: "2.1", d2: "2.5", trend: "up" },
    ],
    infusions: [
      { name: "Soro Fisiológico 0.9%", rate: "50 ml/h", dose: "-", status: "running" },
      { name: "Noradrenalina", rate: "0 ml/h", dose: "0", status: "suspended" }
    ],
    imaging: "USG Rins e Vias Urinárias: dilatação pielocalicinal bilateral leve.",
    pendingActions: [{ id: 1, text: "Checar potássio e repor se necessário", status: "pending", priority: "medium" }],
    alerts: ["Precaução de Contato"]
  },
  "3": {
    id: "3", name: "Antonio Costa Ribeiro", age: 55, weight: "82 kg", bed: "Leito 03", sector: "UCO - Setor Norte",
    handoffMeta: { lastUpdated: "Ontem, 22:00", generatedBy: "Dr. Roberto" },
    clinicalProfile: ["IAMcsST parede inferior", "Angioplastia Primária CD com stent", "Dislipidemia"],
    aiSummary: "Paciente em pós-operatório de angioplastia primária. Extubado precocemente. Apresentou arritmias ventriculares isoladas ontem, hoje sem eventos. Enzimas cardíacas em queda. Programada alta para a enfermaria ainda hoje.",
    therapeutics: {
      antibiotics: [],
      prophylaxis: ["Omeprazol 40mg VO"],
      mainMedications: ["AAS 100mg VO 1x/dia", "Ticagrelor 90mg VO 12/12h", "Rosuvastatina 40mg VO"]
    },
    quickVitalsNote: "PA: 110/70, FC 65 bpm.",
    diuresis: "1800 ml/24h", fluidBalanceTotal: "-200 ml",
    labs: [
      { name: "Troponina", d1: "1500", d2: "850", trend: "down" },
    ],
    infusions: [
      { name: "Nitroglicerina", rate: "0", dose: "0", status: "suspended" }
    ],
    imaging: "Ecocardiograma: FEVE 52%, hipocinesia inferior.",
    pendingActions: [{ id: 1, text: "Agendar transferência para unidade de internação", status: "pending", priority: "high" }],
    alerts: ["Risco de Sangramento Alto"]
  }
};

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Verificar Sinais Vitais',
    description: 'Leito 03 - Sr. João Silva. Medir PA, FC, FR e Temp.',
    time: '10:00',
    status: 'neutral',
    originalStatus: 'neutral',
    users: ['Enf. Mário'],
    priority: 'low'
  },
  {
    id: '2',
    title: 'Administrar Antibiótico',
    description: 'Leito 07 - Vancomicina 1g IV. Conferir acesso antes da infusão.',
    time: '08:30 (Atrasado)',
    status: 'pending',
    originalStatus: 'pending',
    users: ['Dr. Ana', 'Enf. Mário'],
    priority: 'high'
  },
  {
    id: '3',
    title: 'Monitorar Glicemia',
    description: 'Leito 02 - D. Maria Santos. Risco de hipoglicemia após insulina.',
    time: 'Contínuo',
    status: 'in_progress',
    originalStatus: 'in_progress',
    users: ['Tec. Lúcia'],
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Troca de Curativo Central',
    description: 'Leito 05 - Acesso venoso central. Técnica asséptica rigorosa.',
    time: '07:15',
    status: 'completed',
    originalStatus: 'neutral',
    users: ['Enf. Carlos'],
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Avaliar Intubação',
    description: 'Leito 01 - Queda rápida de saturação (82%).',
    time: 'Agora',
    status: 'pending',
    originalStatus: 'pending',
    users: ['Dr. Pedro'],
    priority: 'critical'
  }
];

type GlobalState = {
  patients: PatientSummary[];
  details: Record<string, PatientDetailed>;
  tasks: Task[];
  darkMode: boolean;
};

interface AppContextType {
  state: GlobalState;
  addPatient: (summary: PatientSummary) => void;
  updatePatientDetails: (id: string, newDetails: PatientDetailed) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  toggleDarkMode: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GlobalState>({
    patients: INITIAL_PATIENTS,
    details: INITIAL_DETAILS,
    tasks: INITIAL_TASKS,
    darkMode: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('plantask_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState(prev => ({
            ...prev,
            ...parsed,
            patients: parsed.patients || prev.patients,
            details: parsed.details || prev.details,
            tasks: parsed.tasks || prev.tasks,
          }));
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('plantask_state_v2', JSON.stringify(state));
    if (state.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [state]);

  const addPatient = (summary: PatientSummary) => {
    setState(prev => {
      const newDetails = {
        id: summary.id,
        name: summary.name,
        age: summary.age,
        weight: "70 kg",
        bed: summary.bed,
        sector: "Novo Setor",
        handoffMeta: { lastUpdated: "Agora", generatedBy: "Dr(a). Atual" },
        clinicalProfile: summary.diagnoses,
        aiSummary: "Sem resumo gerado.",
        therapeutics: { antibiotics: [], prophylaxis: [], mainMedications: [] },
        quickVitalsNote: "-",
        diuresis: "-", fluidBalanceTotal: "-",
        labs: [], infusions: [], imaging: "-", pendingActions: [], alerts: []
      };
      return {
        ...prev,
        patients: [summary, ...prev.patients],
        details: { ...prev.details, [summary.id]: newDetails }
      };
    });
  };

  const updatePatientDetails = (id: string, newDetails: PatientDetailed) => {
    setState(prev => {
      const newPatients = prev.patients.map(p => {
        if (p.id === id) {
          return {
            ...p,
            name: newDetails.name,
            bed: newDetails.bed,
            diagnoses: [...newDetails.clinicalProfile],
            lastUpdate: newDetails.handoffMeta?.lastUpdated || "Agora"
          };
        }
        return p;
      });
      return {
        ...prev,
        patients: newPatients,
        details: { ...prev.details, [id]: newDetails }
      };
    });
  };

  const addTask = (task: Task) => setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
  
  const updateTask = (id: string, updates: Partial<Task>) => setState(prev => ({
    ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  }));

  const removeTask = (id: string) => setState(prev => ({
    ...prev, tasks: prev.tasks.filter(t => t.id !== id)
  }));

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <AppContext.Provider value={{ state, addPatient, updatePatientDetails, addTask, updateTask, removeTask, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}
