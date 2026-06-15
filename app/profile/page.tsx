'use client';

import Link from 'next/link';
import React, { useState } from 'react';

const INITIAL_TEAM = [
  { id: '1', name: 'Enf. João Paulo', role: 'Enfermeiro Chefe', coren: '123456-ENF' },
  { id: '2', name: 'Dr. Marcos Silva', role: 'Plantonista', coren: '654321-CRM' },
];

export default function ProfilePage() {
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Enfermeiro(a)');
  const [newMemberCoren, setNewMemberCoren] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;
    setTeam([...team, {
      id: Date.now().toString(),
      name: newMemberName,
      role: newMemberRole,
      coren: newMemberCoren || 'Pendente'
    }]);
    setIsModalOpen(false);
    setNewMemberName('');
    setNewMemberCoren('');
  };

  const removeMember = (id: string) => {
    setTeam(team.filter(t => t.id !== id));
  };

  return (
    <div className="flex-grow p-4 md:p-8 pb-20 md:pb-8 max-w-4xl mx-auto w-full relative">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Minha Equipe / Perfil</h1>
          <p className="font-body-md text-on-surface-variant mt-1">Gerencie a equipe do plantão e configurações</p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span className="hidden md:inline">Novo Membro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-surface-variant p-4 bg-surface-bright flex justify-between items-center">
              <h3 className="font-headline-sm text-on-surface">Membros do Plantão</h3>
              <span className="bg-primary-fixed/50 text-primary font-bold px-2 py-0.5 rounded text-xs">{team.length} ATIVOS</span>
            </div>
            <div className="p-0 flex flex-col">
              {team.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex justify-center items-center font-bold">
                       {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{member.name}</div>
                      <div className="text-xs text-on-surface-variant flex items-center gap-2">
                        <span className="bg-surface-variant/50 px-1.5 py-0.5 rounded font-medium">{member.role}</span>
                        {member.coren}
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeMember(member.id)} className="text-outline hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/20">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
              {team.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant font-medium">Nenhum membro cadastrado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Settings (Current User) */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-tertiary-container border-4 border-surface flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-on-tertiary-container text-[40px]">person</span>
            </div>
            <h2 className="font-bold text-on-surface mb-1">Enf. João Paulo</h2>
            <span className="bg-primary-fixed/50 text-primary font-label-sm px-3 py-1 rounded-full border border-primary-fixed-dim text-xs">
              Sua Conta
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-surface-variant p-4 bg-surface-bright">
              <h3 className="font-headline-sm text-on-surface text-sm">Configurações Rápidas</h3>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-body-sm text-on-surface font-medium">Notificações Push</span>
                <div className="relative inline-flex items-center">
                  <input className="sr-only peer" type="checkbox" defaultChecked />
                  <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-body-sm text-on-surface font-medium">Modo Escuro</span>
                <div className="relative inline-flex items-center">
                  <input className="sr-only peer" type="checkbox" />
                  <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
                </div>
              </label>
            </div>
          </div>
          
          <button className="bg-error-container/20 text-error px-4 py-2 rounded-lg font-bold hover:bg-error-container hover:text-on-error-container transition-colors flex items-center justify-center gap-2 text-sm border border-error-container">
             <span className="material-symbols-outlined text-[18px]">logout</span> Sair da Conta
          </button>
        </div>
      </div>

      {/* Novo Membro Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-surface-variant flex justify-between items-center bg-surface-bright">
              <h2 className="font-bold text-lg text-on-surface">Adicionar Membro</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:bg-surface-container-low p-1.5 rounded-full transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Nome</label>
                <input required type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} className="w-full border border-outline rounded-lg px-3 py-2 outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" placeholder="Ex: Dra. Ana" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Função</label>
                <select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)} className="w-full border border-outline rounded-lg px-3 py-2 outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container bg-surface-container-lowest">
                  <option>Enfermeiro(a)</option>
                  <option>Técnico(a)</option>
                  <option>Médico(a) Plantonista</option>
                  <option>Fisioterapeuta</option>
                  <option>Nutricionista</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Registro (COREN, CRM, etc)</label>
                <input type="text" value={newMemberCoren} onChange={e => setNewMemberCoren(e.target.value)} className="w-full border border-outline rounded-lg px-3 py-2 outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" placeholder="Opcional" />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors border border-transparent">Cancelar</button>
                <button type="submit" className="px-5 py-2 font-bold bg-primary text-on-primary hover:opacity-90 rounded-lg transition-opacity flex items-center gap-2">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
