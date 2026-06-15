'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppStore, TaskStatus, TaskPriority } from '@/lib/store';

export default function NewTaskPage() {
  const router = useRouter();
  const { addTask } = useAppStore();

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<TaskStatus>('neutral');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    if (!title) return;
    addTask({
      id: Date.now().toString(),
      title,
      description: '',
      time: time || 'Agora',
      status,
      originalStatus: status,
      users: [],
      priority
    });
    router.push('/tasks');
  };

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-8 w-full max-w-3xl mx-auto h-full">
      <div className="w-full flex justify-between items-center mb-6 border-b border-surface-variant pb-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.push('/tasks')} className="text-on-surface-variant hover:bg-surface-container-low active:opacity-80 transition-all duration-200 p-2 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
          <span className="font-headline-sm text-on-surface">Nova Tarefa</span>
        </div>
        <button type="button" onClick={handleSave} className="bg-primary-container text-on-primary-container px-4 py-2 rounded font-label-md hover:opacity-90 transition-opacity disabled:opacity-50" disabled={!title}>
          Salvar
        </button>
      </div>

      <form className="w-full space-y-6" onSubmit={handleSave}>
        {/* Task Name */}
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-on-surface" htmlFor="taskName">Nome da tarefa</label>
          <input 
            className="font-body-md p-4 border border-outline rounded bg-surface-container-lowest text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors w-full h-14" 
            id="taskName" 
            placeholder="Ex: Avaliação de Sinais Vitais" 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Mode Selection (Bento-style Grid) */}
        <div className="flex flex-col gap-2">
          <span className="font-label-md text-on-surface">Status</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            
            {/* Neutro */}
            <label className="cursor-pointer relative">
              <input className="peer sr-only" name="taskMode" type="radio" value="neutral" checked={status === 'neutral'} onChange={() => setStatus('neutral')} />
              <div className="flex flex-col items-center justify-center p-4 border border-outline rounded bg-surface-container-lowest peer-checked:border-outline peer-checked:bg-white peer-checked:ring-1 peer-checked:ring-outline transition-all h-24">
                <span className="material-symbols-outlined text-outline peer-checked:text-on-surface mb-2">circle</span>
                <span className="font-label-sm text-on-surface-variant peer-checked:text-on-surface">Neutro</span>
              </div>
            </label>

            {/* Pendente */}
            <label className="cursor-pointer relative">
              <input className="peer sr-only" name="taskMode" type="radio" value="pending" checked={status === 'pending'} onChange={() => setStatus('pending')} />
              <div className="flex flex-col items-center justify-center p-4 border border-outline rounded bg-tertiary-fixed peer-checked:border-tertiary-container peer-checked:bg-tertiary-fixed peer-checked:ring-1 peer-checked:ring-tertiary-container transition-all h-24">
                <span className="material-symbols-outlined text-outline peer-checked:text-tertiary-container mb-2">schedule</span>
                <span className="font-label-sm text-on-surface-variant peer-checked:text-on-tertiary-fixed-variant">Pendente</span>
              </div>
            </label>

            {/* Realizado */}
            <label className="cursor-pointer relative">
              <input className="peer sr-only" name="taskMode" type="radio" value="completed" checked={status === 'completed'} onChange={() => setStatus('completed')} />
              <div className="flex flex-col items-center justify-center p-4 border border-outline rounded bg-secondary-container peer-checked:border-secondary peer-checked:bg-secondary-container peer-checked:ring-1 peer-checked:ring-secondary transition-all h-24">
                <span className="material-symbols-outlined text-outline peer-checked:text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-label-sm text-on-surface-variant peer-checked:text-on-secondary-fixed-variant">Realizado</span>
              </div>
            </label>

            {/* Observação */}
            <label className="cursor-pointer relative">
              <input className="peer sr-only" name="taskMode" type="radio" value="in_progress" checked={status === 'in_progress'} onChange={() => setStatus('in_progress')} />
              <div className="flex flex-col items-center justify-center p-4 border border-outline rounded bg-primary-fixed peer-checked:border-primary peer-checked:bg-primary-fixed peer-checked:ring-1 peer-checked:ring-primary transition-all h-24">
                <span className="material-symbols-outlined text-outline peer-checked:text-primary mb-2">visibility</span>
                <span className="font-label-sm text-on-surface-variant peer-checked:text-on-primary-fixed-variant">Observação</span>
              </div>
            </label>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Picker */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface" htmlFor="taskTime">Horário</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span className="material-symbols-outlined text-outline">schedule</span>
              </div>
              <input 
                className="font-body-md pl-12 pr-4 py-4 border border-outline rounded bg-surface-container-lowest text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors w-full h-14" 
                id="taskTime" 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Reminder Toggle */}
          <div className="flex flex-col gap-2 justify-center">
            <span className="font-label-md text-on-surface hidden md:block">&nbsp;</span>
            <label className="flex items-center justify-between p-4 border border-outline rounded bg-surface-container-lowest h-14 cursor-pointer mt-1 md:mt-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">notifications_active</span>
                <span className="font-body-md text-on-surface">Ativar alerta sonoro</span>
              </div>
              <div className="relative inline-flex items-center">
                <input className="sr-only peer" type="checkbox" defaultChecked />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

