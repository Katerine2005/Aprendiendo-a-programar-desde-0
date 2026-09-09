import React from 'react';
import { motion } from 'motion/react';
import { Course, CourseId, UserProgress, UserProfile } from '../types';
import { LanguageLogo } from './LanguageLogos';
import { isCoursePurchased } from '../services/authService';
import { 
  BookOpen, 
  Sparkles,
  Play,
  Award,
  ArrowRight,
  Lock,
  CheckCircle2,
  CreditCard
} from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  progress: UserProgress;
  currentUser: UserProfile | null;
  onSelectCourse: (courseId: CourseId) => void;
  onViewCertificate: (course: Course) => void;
  onGoToPaymentArea: (courseId?: CourseId) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  progress,
  currentUser,
  onSelectCourse,
  onViewCertificate,
  onGoToPaymentArea
}) => {
  const isStudent = currentUser?.role === 'estudiante';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Hero Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-8 sm:p-12 mb-8 shadow-xl"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-slate-300 text-xs font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Formación Técnica Profesional 2026</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Aprende a Programar <br />
            <span className="text-indigo-400">
              De Cero a Experto
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
            Plataforma interactiva con 8 cursos completos, compilador en vivo integrado, 
            más de 120 ejercicios prácticos evaluados y certificación oficial descargable en PDF.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-xs text-slate-400">Cursos Especializados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">120+</p>
              <p className="text-xs text-slate-400">Lecciones Prácticas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-400">100%</p>
              <p className="text-xs text-slate-400">Compilador Interno</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-200">PDF</p>
              <p className="text-xs text-slate-400">Certificados Oficiales</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Student Course Locking Policy Notice */}
      {isStudent && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm flex items-center space-x-2">
                <span>Acceso por Licencia Individual a Cursos</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Estudiante
                </span>
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Todos los cursos inician bloqueados. Para desbloquear las lecciones, retos y el compilador de un curso, accede al <strong className="text-amber-300">Área de Pago en tu Perfil</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => onGoToPaymentArea()}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Ir a Área de Pago</span>
          </button>
        </div>
      )}

      {/* Courses Grid */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Catálogo de Cursos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona un curso para comenzar tu ruta de aprendizaje de 15 a 20 lecciones</p>
        </div>
      </div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.06 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {courses.map((course) => {
          const isUnlocked = isCoursePurchased(course.id, currentUser);
          const completedCount = course.lessons.filter(l => progress.completedLessons[l.id]).length;
          const totalLessons = course.lessons.length;
          const isCompleted = completedCount === totalLessons && totalLessons > 0;
          const percent = Math.round((completedCount / totalLessons) * 100);

          return (
            <motion.div
              key={course.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${
                isUnlocked 
                  ? 'border-slate-200 dark:border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/80 hover:border-amber-500/40'
              }`}
            >
              <div>
                {/* Course Top Ribbon / Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-md flex items-center justify-center group-hover:border-slate-700 transition-colors">
                    <LanguageLogo courseId={course.id} className="w-8 h-8 shrink-0" />
                  </div>
                  
                  {isUnlocked ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Desbloqueado</span>
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloqueado</span>
                    </span>
                  )}
                </div>

                {/* Titles */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mb-2">{course.subtitle}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                  {course.description}
                </p>

                {/* 3 Level Indicators */}
                <div className="flex items-center space-x-1.5 mb-5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Básico
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Intermedio
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Avanzado
                  </span>
                </div>
              </div>

              <div>
                {/* Progress Bar (Only when unlocked) */}
                {isUnlocked && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                      <span>Progreso del Curso</span>
                      <span className="font-bold text-slate-900 dark:text-white">{percent}% ({completedCount}/{totalLessons})</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {isUnlocked ? (
                    isCompleted ? (
                      <>
                        <button
                          onClick={() => onViewCertificate(course)}
                          className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          <Award className="w-4 h-4" />
                          <span>Ver Certificado PDF</span>
                        </button>
                        <button
                          onClick={() => onSelectCourse(course.id)}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Repasar lecciones"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onSelectCourse(course.id)}
                        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{completedCount > 0 ? 'Continuar Lección' : 'Iniciar Curso'}</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onGoToPaymentArea(course.id)}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Desbloquear en Área de Pago</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
