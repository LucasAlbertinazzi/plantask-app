'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const { state, toggleDarkMode } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle escape key and body scroll
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { label: 'Painel', icon: 'grid_view', href: '/' },
    { label: 'Paciente', icon: 'medical_information', href: '/patients/1' },
    { label: 'Tarefas', icon: 'checklist', href: '/tasks' },
    { label: 'Equipe', icon: 'person', href: '/profile' },
  ];

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background print:block print:h-auto print:overflow-visible">
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`fixed md:static h-[100dvh] w-64 border-r border-surface-variant bg-surface-container-lowest flex-col py-4 gap-2 z-50 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full hidden md:flex'}`}>
        <div className="px-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">local_hospital</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-primary leading-tight">Plantask</h1>
              <p className="font-label-sm text-outline">Unidade de Cuidados</p>
            </div>
          </div>
          <button className="md:hidden text-on-surface-variant" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 font-label-md text-sm ${isActive ? 'bg-primary-container text-on-primary border-l-4 border-primary rounded-l-none' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
        <div className="px-4 mt-auto">
          <Link href="/new-task" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-primary text-on-primary font-label-md py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Tarefa
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden print:block print:h-auto print:overflow-visible">
        {/* TopAppBar (Mobile & Desktop) */}
        <header className="flex justify-between items-center h-16 w-full px-4 md:px-6 bg-surface-container-lowest border-b border-surface-variant shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface-variant p-2 rounded-full hover:bg-surface-container-low flex items-center justify-center" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center md:hidden">
              <span className="material-symbols-outlined text-primary text-[20px]">local_hospital</span>
            </div>
            <span className="font-headline-md text-primary tracking-tight md:hidden">Plantask</span>
          </div>
          <div className="flex items-center justify-end flex-1 gap-2">
             <Link href="/new-task" className="md:hidden bg-primary text-on-primary rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </Link>
            
            <button onClick={toggleDarkMode} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center" aria-label="Toggle Dark Mode">
              <span className="material-symbols-outlined">
                {state.darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            
            <Link href="/profile" className="w-8 h-8 rounded-full bg-tertiary-container border-2 border-surface flex items-center justify-center cursor-pointer ml-2 hover:opacity-90">
              <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">person</span>
            </Link>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto w-full pb-0 bg-surface scroll-smooth relative print:block print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
