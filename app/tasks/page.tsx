'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAppStore, TaskStatus, TaskPriority, Task } from '@/lib/store';

const COLUMNS: { id: TaskStatus; title: string; colorClass: string; bgClass: string }[] = [
  { id: 'neutral', title: 'Neutro', colorClass: 'text-gray-700', bgClass: 'bg-gray-100' },
  { id: 'pending', title: 'Pendente', colorClass: 'text-amber-800', bgClass: 'bg-amber-100' },
  { id: 'in_progress', title: 'Em Observação', colorClass: 'text-blue-800', bgClass: 'bg-blue-100' },
  { id: 'completed', title: 'Realizado', colorClass: 'text-green-800', bgClass: 'bg-green-100' }
];

export default function TasksPage() {
  const { state: { tasks }, updateTask, removeTask, addTask } = useAppStore();
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const updateStatus = (id: string, newStatus: TaskStatus) => {
    updateTask(id, { status: newStatus });
  };

  const updateTaskDetails = (id: string, title: string, description: string, time: string, users: string[], priority: TaskPriority) => {
    updateTask(id, { title, description, time, users, priority });
  };

  const handleDeleteTask = (id: string) => {
    removeTask(id);
    setDeleteConfirmId(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // Small timeout to allow the UI to reflect the dragged state while leaving the original item
    setTimeout(() => {
      // you can add a generic dragging class here if you need to hide the original
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="flex-grow p-4 md:p-8 w-full min-h-full flex flex-col">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Painel de Tarefas</h1>
          <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-1">
             <span className="material-symbols-outlined text-[16px]">assignment</span> Gerenciamento Atribuído
          </p>
        </div>
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full border text-sm font-bold transition-colors ${filter === 'all' ? 'bg-blue-600 text-white border-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
            Todos
          </button>
          <button 
            onClick={() => setFilter('neutral')}
            className={`px-4 py-1.5 rounded-full border text-sm font-bold transition-colors ${filter === 'neutral' ? 'bg-gray-700 text-white border-gray-800' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
            Neutro
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 rounded-full border text-sm font-bold transition-colors ${filter === 'pending' ? 'bg-amber-500 text-white border-amber-600' : 'border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100/50'}`}>
            Pendente
          </button>
          <button 
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-1.5 rounded-full border text-sm font-bold transition-colors ${filter === 'in_progress' ? 'bg-blue-500 text-white border-blue-600' : 'border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100/50'}`}>
            Observação
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-full border text-sm font-bold transition-colors ${filter === 'completed' ? 'bg-green-500 text-white border-green-600' : 'border-green-200 bg-green-50/50 text-green-700 hover:bg-green-100/50'}`}>
            Realizado
          </button>
        </div>
      </div>

      {tasks.length === 0 && (
         <div className="flex flex-col items-center justify-center flex-1 bg-white border border-dashed border-gray-300 rounded-2xl">
           <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">task</span>
           <h2 className="text-lg font-bold text-gray-700">O quadro de tarefas está vazio</h2>
           <p className="text-gray-500 text-sm mt-1 mb-4">Inicie o turno criando novas tarefas para a equipe.</p>
           <Link href="/new-task" className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
             <span className="material-symbols-outlined text-[18px]">add</span> Adicionar Tarefa
           </Link>
         </div>
      )}

      {/* Kanban Board */}
      {tasks.length > 0 && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex gap-6 h-full min-w-max items-start">
            {COLUMNS.map(column => {
              if (filter !== 'all' && filter !== column.id) return null;
              const columnTasks = tasks.filter(t => t.status === column.id);

              return (
                <div 
                  key={column.id} 
                  className="w-[320px] flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-200 shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className={`px-4 py-3 border-b border-gray-200 rounded-t-xl flex justify-between items-center ${column.bgClass}`}>
                    <h2 className={`font-bold text-sm tracking-wide ${column.colorClass} uppercase`}>{column.title}</h2>
                    <span className={`bg-white/80 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm`}>
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <div className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors`}>
                      {columnTasks.map((task) => (
                        <div 
                          key={task.id}
                          draggable
                          onDragStart={(e: React.DragEvent | any) => handleDragStart(e, task.id)}
                          onDragEnd={() => setDraggedTaskId(null)}
                          className={`mb-3 cursor-grab active:cursor-grabbing transition-shadow ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                        >
                          <TaskCard 
                            task={task} 
                            updateStatus={updateStatus} 
                            updateTaskDetails={updateTaskDetails} 
                            onDelete={() => setDeleteConfirmId(task.id)}
                          />
                        </div>
                      ))}

                    {column.id === 'neutral' && (
                      <Link href="/new-task" className="bg-white border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all text-gray-500 mt-2 shadow-sm font-semibold">
                        <div className="flex items-center justify-center mb-1">
                          <span className="material-symbols-outlined text-[20px]">add</span>
                        </div>
                        <span className="text-xs">Nova Tarefa Rápida</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmação de Deleção Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 flex flex-col items-center text-center">
                 <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                   <span className="material-symbols-outlined text-[24px]">delete_forever</span>
                 </div>
                 <h3 className="font-bold text-lg text-gray-900 mb-1">Apagar Tarefa?</h3>
                 <p className="text-sm text-gray-600 mb-6">Esta ação não pode ser desfeita e a tarefa será removida do painel de todos.</p>
                 <div className="flex gap-3 w-full">
                    <button type="button" onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border border-transparent">Cancelar</button>
                    <button type="button" onClick={() => {
                        const t = tasks.find(t => t.id === deleteConfirmId);
                        if (t) handleDeleteTask(t.id);
                    }} className="flex-1 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors border border-transparent">Deletar</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, updateStatus, updateTaskDetails, onDelete }: { task: Task, updateStatus: (id: string, status: TaskStatus) => void, updateTaskDetails: (id: string, title: string, desc: string, time: string, users: string[], priority: TaskPriority) => void, onDelete: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editTime, setEditTime] = useState(task.time);
  const [editUsers, setEditUsers] = useState(task.users.join(', '));
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority || 'medium');

  const handleSave = () => {
    updateTaskDetails(task.id, editTitle, editDesc, editTime, editUsers.split(',').map(s=>s.trim()).filter(Boolean), editPriority);
    setIsEditing(false);
  };

  const isCompleted = task.status === 'completed';

  const priorityColor = {
    low: 'text-gray-500 bg-gray-100 border-gray-200',
    medium: 'text-blue-700 bg-blue-50 border-blue-200',
    high: 'text-orange-700 bg-orange-50 border-orange-200',
    critical: 'text-red-700 bg-red-50 border-red-200'
  }[task.priority || 'medium'];

  return (
    <div className={`bg-white rounded-xl p-3.5 flex flex-col relative overflow-hidden group border shadow-sm hover:shadow-md transition-shadow ${
      isCompleted ? 'border-green-200 bg-green-50/30' : 
      task.status === 'pending' ? 'border-amber-200' :
      task.status === 'in_progress' ? 'border-blue-200' :
      'border-gray-200'
    }`}>
      
      {/* Decorative vertical bar for column indication */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        isCompleted ? 'bg-green-500' : 
        task.status === 'pending' ? 'bg-amber-500' :
        task.status === 'in_progress' ? 'bg-blue-500' :
        'bg-gray-300'
      }`}></div>

      <div className="flex justify-between items-start mb-2 pl-2 relative w-full">
        <div className={`flex items-center gap-1 text-xs font-bold ${
          task.status === 'pending' && task.time.includes('Atrasado') ? 'text-red-600' :
          task.status === 'pending' ? 'text-amber-700' :
          task.status === 'in_progress' ? 'text-blue-700' :
          isCompleted ? 'text-green-700' : 'text-gray-500'
        }`}>
          <span className="material-symbols-outlined text-[14px]">
            {isCompleted ? 'check_circle' : task.time.includes('Atrasado') ? 'error' : task.status === 'in_progress' ? 'visibility' : 'schedule'}
          </span>
          {isEditing ? (
            <input type="text" value={editTime} onChange={e => setEditTime(e.target.value)} className="bg-transparent border-b border-gray-300 outline-none w-16 px-1 font-semibold text-gray-900" />
          ) : (
            <span className={isCompleted && !task.time.includes('Atrasado') ? 'line-through opacity-70' : ''}>{task.time}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {(!isEditing && task.priority) && (
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${priorityColor}`}>
              {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Normal' : task.priority === 'high' ? 'Alta' : 'CRÍTICA'}
            </span>
          )}
          {isEditing ? (
            <button type="button" onClick={handleSave} className="p-1 text-white bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </button>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
               <button type="button" onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[16px]">edit</span>
               </button>
               <button type="button" onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[16px]">delete</span>
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="pl-2 mb-3">
        {isEditing ? (
          <>
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="font-bold text-gray-900 mb-1 bg-transparent border-b border-gray-300 outline-none w-full text-sm" placeholder="Título" />
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="text-sm text-gray-800 bg-white border border-gray-300 rounded p-1.5 outline-none w-full mt-1 resize-none h-16 shadow-inner focus:ring-2 focus:ring-blue-500/50" placeholder="Descrição" />
            <div className="mt-2 text-xs font-semibold text-gray-700">Responsáveis (separados por vírgula):</div>
            <input type="text" value={editUsers} onChange={e => setEditUsers(e.target.value)} className="font-semibold text-gray-900 bg-transparent border-b border-gray-300 outline-none w-full text-xs mt-0.5" placeholder="Ex: Enf. Mário, Dr. João" />
            <div className="mt-2 text-xs font-semibold text-gray-700 flex gap-2 items-center">
              Prio: 
              <select value={editPriority} onChange={e => setEditPriority(e.target.value as TaskPriority)} className="text-xs bg-gray-50 border border-gray-300 rounded outline-none p-1 font-bold">
                 <option value="low">Baixa</option>
                 <option value="medium">Normal</option>
                 <option value="high">Alta</option>
                 <option value="critical">Crítica!</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <h3 className={`font-bold mb-0.5 leading-tight text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{task.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">{task.description}</p>
          </>
        )}
      </div>

      <div className="mt-auto pl-2 flex justify-between items-center bg-gray-50/50 -mx-3.5 -mb-3.5 px-3.5 py-2.5 border-t border-gray-100">
        <div className="flex flex-wrap gap-1">
          {task.users.length === 0 && <span className="text-[10px] text-gray-400 font-bold italic">Sem Atribuição</span>}
          {task.users.map((user, i) => {
            const isDoctor = user.includes('Dr');
            return (
              <div key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center justify-center border shadow-sm ${
                isDoctor ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-white text-gray-700 border-gray-300'
              }`}>
                {user}
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center gap-1">
          <div className="relative">
            <select
              value={task.status}
              onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
              className={`text-[10px] uppercase font-bold pl-2 pr-6 py-1 rounded border transition-colors shadow-sm cursor-pointer outline-none appearance-none ${
                isCompleted ? 'bg-green-100 text-green-800 border-green-200' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                task.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              <option value="neutral">Neutro</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Observação</option>
              <option value="completed">Realizado</option>
            </select>
            <span className={`material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none ${
                isCompleted ? 'text-green-800' :
                task.status === 'in_progress' ? 'text-blue-800' :
                task.status === 'pending' ? 'text-amber-800' :
                'text-gray-800'
            }`}>arrow_drop_down</span>
          </div>

          {isCompleted && (
            <button type="button" onClick={() => updateStatus(task.id, task.originalStatus)} title="Desfazer" className="text-xs text-gray-500 hover:text-gray-800 font-bold px-1 flex items-center justify-center transition-colors ml-1">
              <span className="material-symbols-outlined text-[16px]">undo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
