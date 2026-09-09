import React, { useState } from 'react';
import { Terminal, Award, BookOpen, User, Sun, Moon, CheckCircle2, Shield, LogOut, Lock, LogIn, Sparkles } from 'lucide-react';
import { UserProgress, UserProfile } from '../types';

interface HeaderProps {
  currentUser: UserProfile | null;
  progress: UserProgress;
  onUpdateStudentName: (name: string) => void;
  onGoHome: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeCourseTitle?: string;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  progress,
  onUpdateStudentName,
  onGoHome,
  isDarkMode,
  onToggleDarkMode,
  activeCourseTitle,
  onOpenAuthModal,
  onLogout,
  onOpenProfileModal,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentUser?.fullName || progress.studentName);

  const totalCompletedLessons = Object.values(progress.completedLessons).filter(Boolean).length;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateStudentName(tempName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 text-white shadow-xl shadow-slate-950/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={onGoHome}
          className="flex items-center space-x-3 cursor-pointer group py-1"
        >
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/30 group-hover:bg-indigo-500 transition-all duration-300">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-slate-200 transition-colors">
                CODEX
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20 uppercase tracking-widest">
                Edu
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:flex items-center space-x-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Aprende Programación Interactivamente</span>
            </p>
          </div>
        </div>

        {/* Active Breadcrumb / Status Pill */}
        {activeCourseTitle && (
          <div className="hidden md:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full shadow-inner transition-all">
            <div className="p-1 rounded-full bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-400">Curso:</span>
            <span className="text-xs font-bold text-white tracking-wide">{activeCourseTitle}</span>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-3">

          {/* User Status / Login Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2.5">
              
              {/* User Role Badge & Profile Pill (Clickable to open Student Profile Modal) */}
              <button
                onClick={onOpenProfileModal}
                className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl shadow-md transition-all group cursor-pointer"
                title="Ver Perfil Completo de Estudiante"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700 shadow-sm group-hover:scale-105 transition-transform"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white max-w-[120px] truncate leading-tight group-hover:text-indigo-300 transition-colors">
                    {currentUser?.fullName || 'Usuario'}
                  </p>
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    currentUser?.role === 'administrador' 
                      ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {currentUser?.role || 'estudiante'}
                  </span>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800 hover:border-slate-700 transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                onClick={() => onOpenAuthModal('register')}
                className="hidden sm:flex px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Registrarse</span>
              </button>
            </div>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all shadow-sm"
            title="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};

