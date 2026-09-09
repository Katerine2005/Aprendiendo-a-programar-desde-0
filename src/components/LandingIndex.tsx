import React from 'react';
import { motion } from 'motion/react';
import { Terminal, ArrowRight, Zap, Sparkles, Lock } from 'lucide-react';
import { CourseId } from '../types';

interface LandingIndexProps {
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onPreviewCourse: (courseId: CourseId) => void;
}

export const LandingIndex: React.FC<LandingIndexProps> = ({
  onOpenAuthModal,
  onPreviewCourse,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* LANDING INDEX TOP NAVBAR */}
      <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-tight text-white">
                  CODEX
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-widest">
                  Plataforma Edu
                </span>
              </div>
              <p className="text-xs text-slate-400">Aprende Programación Interactivamente</p>
            </div>
          </div>

          {/* RIGHT CORNER LOGIN & REGISTER BUTTONS */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={() => onOpenAuthModal('register')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Crear Cuenta</span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold mb-6">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Plataforma con Compilador Multilingüe Integrado</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none mb-6">
            Aprende a Programar de <br />
            <span className="text-indigo-400">
              Cero a Experto con CODEX
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Domina los lenguajes de programación más demandados del mercado: C++, Python, JavaScript, Java, Node.js, Rust, SQL y HTML/CSS. Resuelve ejercicios prácticos, ejecuta código en tiempo real y obtén certificados con validez académica.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAuthModal('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-3 cursor-pointer"
            >
              <span>Registrarse como Estudiante</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenAuthModal('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Ya tengo una cuenta</span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-slate-900 border-y border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <p className="text-3xl font-extrabold text-white">8</p>
            <p className="text-xs text-slate-400 font-medium">Cursos de Lenguajes</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-extrabold text-indigo-400">240+</p>
            <p className="text-xs text-slate-400 font-medium">Lecciones e Interactivas</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-extrabold text-emerald-400">10,000+</p>
            <p className="text-xs text-slate-400 font-medium">Estudiantes Activos</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-extrabold text-slate-200">100%</p>
            <p className="text-xs text-slate-400 font-medium">Certificación Académica</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-300">CODEX - Plataforma Académica de Programación</span>
          </div>
          <p>© 2026 CODEX. Todos los derechos reservados. Control de Acceso Estudiante / Administrador.</p>
        </div>
      </footer>
    </div>
  );
};
