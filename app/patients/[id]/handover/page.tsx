'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function HandoverPage() {
  const params = useParams();
  const currentId = params?.id as string || '1';
  const { state } = useAppStore();
  
  const patientSummary = state.patients.find(p => p.id === currentId) || state.patients[0];
  const patientDetails = state.details[currentId] || state.details["1"];

  // Se não encontrou nada mesmo assim, fallback previne quebra
  if (!patientSummary || !patientDetails) {
    return <div className="p-8">Paciente não encontrado.</div>;
  }

  return (
    <div className="flex-1 w-full bg-surface-container-low p-4 md:p-8 flex justify-center pb-24 md:pb-8">
      <div className="bg-surface-container-lowest w-full max-w-[1120px] rounded-xl border border-outline-variant shadow-sm p-4 md:p-8 flex flex-col gap-6" id="printable-report">
        
        {/* Report Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-surface-variant pb-4 gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mb-1">{patientSummary.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-outline font-body-md">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">cake</span> {patientSummary.age} anos</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">scale</span> {patientDetails.weight}</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="flex items-center gap-1 font-label-md text-primary"><span className="material-symbols-outlined text-[18px]">bed</span> {patientSummary.bed}</span>
            </div>
            <div className="flex gap-2 mt-2 break-words max-w-full overflow-hidden">
               {patientSummary.badges.map((b, i) => (
                 <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded font-label-sm border border-outline-variant text-[11px] font-bold ${b.color}`}>
                   {b.label}
                 </span>
               ))}
            </div>
          </div>
          <div className="text-left md:text-right flex flex-col gap-2 w-full md:w-auto">
            <div className="flex items-center justify-end gap-3 w-full">
              <Link href={`/patients/${currentId}`} className="text-sm font-semibold text-gray-500 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors hidden md:flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Ver Ficha
              </Link>
              <button 
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 md:w-auto" 
                onClick={() => { try { window.print(); } catch(e) { console.error(e); } }}
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Imprimir
              </button>
            </div>
            <span className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider block">Atualizado {patientDetails.handoffMeta.lastUpdated}</span>
          </div>
        </header>

        {/* 4-Column Grid for Desktop / 1-Column for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
          
          {/* COLUMN 1 */}
          <div className="flex flex-col gap-6">
            <section className="border border-outline-variant rounded-lg p-4 bg-surface-bright">
              <h2 className="font-headline-sm text-primary font-semibold flex items-center gap-2 pb-2 mb-3 border-b border-surface-variant">
                <span className="material-symbols-outlined text-[20px]">medical_information</span>
                Perfil Clínico
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="font-label-sm text-outline block mb-1">Diagnóstico Principal</span>
                  <div className="font-body-md text-on-surface font-medium">{patientSummary.diagnoses[0] || "N/A"}</div>
                </div>
                <div>
                  <span className="font-label-sm text-outline block mb-1">Diagnósticos Secundários</span>
                  <div className="flex flex-wrap gap-2">
                    {patientDetails.clinicalProfile.map((p, i) => (
                       <span key={i} className="bg-surface-container text-on-surface px-2 py-0.5 rounded border border-outline-variant font-label-sm">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-outline-variant rounded-lg p-4 bg-surface-bright relative overflow-hidden flex-1">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary-fixed-dim"></div>
              <h2 className="font-headline-sm text-tertiary-container font-semibold flex items-center gap-2 pb-2 mb-2 border-b border-surface-variant">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                Resumo da História
              </h2>
              <p className="font-body-sm text-on-surface leading-relaxed mt-2 bg-surface-container-low p-2 rounded">
                {patientDetails.aiSummary}
              </p>
            </section>
          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col gap-6">
            <section className="border border-outline-variant rounded-lg p-4 bg-surface-bright">
              <h2 className="font-headline-sm text-primary font-semibold flex items-center gap-2 pb-2 mb-3 border-b border-surface-variant">
                <span className="material-symbols-outlined text-[20px]">science</span>
                Evolução Lab
              </h2>
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-surface-variant">
                       <th className="py-2 pr-2 font-label-sm text-outline font-semibold">Exame</th>
                       <th className="py-2 px-1 font-label-sm text-outline font-semibold">Atual</th>
                       <th className="py-2 pl-1 font-label-sm text-primary font-semibold">Ontem</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-on-surface">
                    {patientDetails.labs?.map((l, i) => (
                      <tr key={i} className="border-b border-surface-variant/50">
                        <td className="py-2.5 pr-2 font-medium">{l.name}</td>
                        <td className={`py-2.5 px-1 ${l.trend === 'up' && l.name !== 'Leucócitos' ? 'text-error' : ''}`}>{l.d1}</td>
                        <td className="py-2.5 pl-1">{l.d2 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex-1">
              <h2 className="font-headline-sm text-primary font-semibold flex items-center gap-2 pb-2 mb-2 border-b border-surface-variant">
                <span className="material-symbols-outlined text-[20px]">pulmonology</span>
                Imagem
              </h2>
              <div className="font-body-sm text-on-surface flex items-start gap-3 mt-3">
                <span className="material-symbols-outlined text-outline mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
                <div>
                  <p className="font-medium mb-1">Último Exame</p>
                  <p className="text-on-surface-variant leading-relaxed">{patientDetails.imaging}</p>
                </div>
              </div>
            </section>
          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col gap-6">
            <section className="border border-outline-variant rounded-lg p-4 bg-surface-bright h-full">
              <h2 className="font-headline-sm text-primary font-semibold flex items-center gap-2 pb-2 mb-3 border-b border-surface-variant">
                <span className="material-symbols-outlined text-[20px]">medication</span>
                Terapêutica Atual
              </h2>
              <div className="space-y-4">
                <div className="bg-surface-container-low p-2.5 rounded border border-surface-variant">
                  <h3 className="font-label-sm text-outline uppercase tracking-wide mb-1 border-b border-outline-variant pb-1">Antibióticos</h3>
                  <div className="font-body-sm text-on-surface font-medium flex flex-col gap-2 mt-2">
                    {patientDetails.therapeutics?.antibiotics.map((a, i) => (
                       <span key={i} className="bg-primary-fixed/50 text-primary px-2 py-0.5 rounded font-label-sm border border-primary-fixed-dim">{a}</span>
                    ))}
                    {(!patientDetails.therapeutics?.antibiotics?.length) && <span className="text-gray-400">Nenhum em uso.</span>}
                  </div>
                </div>
                
                <div className="bg-surface-container-low p-2.5 rounded border border-surface-variant">
                  <h3 className="font-label-sm text-outline uppercase tracking-wide mb-1 border-b border-outline-variant pb-1">Profilaxias</h3>
                  <ul className="space-y-1.5 mt-2">
                    {patientDetails.therapeutics?.prophylaxis.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 font-body-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-surface-container-low p-2.5 rounded border border-surface-variant">
                  <h3 className="font-label-sm text-outline uppercase tracking-wide mb-1 border-b border-outline-variant pb-1">BIC (Bombas)</h3>
                  <ul className="mt-1 pb-1 flex flex-col gap-2">
                    {patientDetails.infusions?.map((inf, i) => (
                       <li key={i} className="text-sm font-semibold flex justify-between bg-white px-2 py-1 border rounded">
                          <span>{inf.name}</span>
                          <span className={`${inf.status === 'suspended' ? 'line-through text-gray-400' : 'text-blue-600'}`}>{inf.rate}</span>
                       </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* COLUMN 4 */}
          <div className="flex flex-col gap-6">
            <section className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex-1">
              <h2 className="font-headline-sm text-primary font-semibold flex items-center gap-2 pb-2 mb-3 border-b border-surface-variant">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
                Condutas / Pendências
              </h2>
              <ul className="space-y-2 font-body-sm text-on-surface">
                 {patientDetails.pendingActions?.map(act => (
                   <li key={act.id} className={`flex items-center justify-between p-2 rounded bg-surface-container-low border border-surface-variant ${act.status === 'completed' ? 'opacity-75' : ''}`}>
                     <span className={`${act.status === 'completed' ? 'line-through text-outline' : 'text-gray-900 font-medium'}`}>{act.text}</span>
                     <span className={`material-symbols-outlined ${act.status === 'completed' ? 'text-secondary' : act.priority === 'high' ? 'text-red-500' : 'text-blue-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                       {act.status === 'completed' ? 'check_circle' : 'pending'}
                     </span>
                   </li>
                 ))}
              </ul>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
