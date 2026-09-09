import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Award, 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Globe, 
  ChevronRight,
  Zap,
  Download,
  Clock,
  ShieldCheck,
  Mail,
  Shield,
  Lock,
  Unlock,
  Play,
  AlertCircle,
  Check
} from 'lucide-react';
import { UserProfile, UserProgress, Course, CourseId } from '../types';
import { LanguageLogo } from './LanguageLogos';
import { CheckoutModal, PlanDetails } from './CheckoutModal';
import { isCoursePurchased } from '../services/authService';
import { getStoredTransactions, TransactionRecord } from '../services/transactionService';

interface StudentProfileViewProps {
  currentUser: UserProfile | null;
  progress: UserProgress;
  courses: Course[];
  initialTab?: ProfileTab;
  highlightCourseId?: CourseId | null;
  onSelectCourse: (courseId: CourseId) => void;
  onViewCertificate: (course: Course) => void;
  onBackToCatalog: () => void;
  onLogout: () => void;
  onUnlockCourse: (courseId: CourseId) => void;
}

export type ProfileTab = 'perfil' | 'cursos' | 'certificados' | 'pagos';

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  currentUser,
  progress,
  courses,
  initialTab = 'perfil',
  highlightCourseId = null,
  onSelectCourse,
  onViewCertificate,
  onBackToCatalog,
  onLogout,
  onUnlockCourse
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<PlanDetails | null>(null);
  const [selectedCheckoutCourse, setSelectedCheckoutCourse] = useState<Course | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [unlockedSuccessMsg, setUnlockedSuccessMsg] = useState<string | null>(null);
  const [studentTransactions, setStudentTransactions] = useState<TransactionRecord[]>([]);

  const refreshTransactions = () => {
    const allTx = getStoredTransactions();
    const email = currentUser?.email?.toLowerCase();
    const name = currentUser?.fullName?.toLowerCase();
    // Solo mostrar transacciones que pertenezcan a este usuario
    const filtered = allTx.filter(t =>
      (email && t.studentEmail.toLowerCase() === email) ||
      (name && t.studentName.toLowerCase() === name)
    );
    setStudentTransactions(filtered);
  };

  useEffect(() => {
    refreshTransactions();
  }, [currentUser, isCheckoutOpen]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleOpenCourseCheckout = (course: Course) => {
    setSelectedCheckoutCourse(course);
    setSelectedCheckoutPlan({
      id: `course-${course.id}`,
      name: `Licencia Completa: ${course.title}`,
      price: '$5.00 USD',
      period: '/ pago único',
      description: `Desbloquea el acceso vitalicio ilimitado a todas las lecciones prácticas, retos interactivos y al compilador en vivo de ${course.title} por sólo $5.00 USD.`,
      badge: 'Tarifa Fija $5.00 USD',
      features: [
        `Desbloqueo inmediato de las ${course.lessons.length} lecciones del curso`,
        'Compilador interactivo en tiempo real con pruebas unitarias',
        'Evaluaciones automatizadas y pruebas en sandbox',
        'Certificado Oficial de Finalización en PDF con código QR y sello'
      ]
    });
    setIsCheckoutOpen(true);
  };

  const handleOpenPackCheckout = () => {
    setSelectedCheckoutCourse(null);
    setSelectedCheckoutPlan({
      id: 'pack-all-courses',
      name: 'Pack Maestro CODEX - Todos los 8 Cursos',
      price: '$49.99 USD',
      period: '/ pago único',
      description: 'Acceso total y vitalicio a los 8 lenguajes de programación de la plataforma CODEX.',
      badge: 'Ahorro del 70%',
      features: [
        'Desbloqueo simultáneo de los 8 cursos (C++, Python, JS, Java, Node, Rust, SQL, HTML/CSS)',
        'Más de 120 lecciones prácticas con compiladores dedicados',
        '8 Certificados Oficiales con validez académica y códigos QR verificables',
        'Acceso de por vida a futuras actualizaciones de contenido'
      ]
    });
    setIsCheckoutOpen(true);
  };

  const handleCourseUnlocked = (courseId: CourseId) => {
    onUnlockCourse(courseId);
    const crs = courses.find(c => c.id === courseId);
    setUnlockedSuccessMsg(`¡Felicitaciones! Has adquirido y desbloqueado exitosamente el curso "${crs?.title || courseId}". Ahora tienes acceso total al compilador y a todas sus lecciones.`);
  };

  const handlePlanSuccess = (planName: string) => {
    if (selectedCheckoutPlan?.id === 'pack-all-courses') {
      courses.forEach(c => onUnlockCourse(c.id));
      setUnlockedSuccessMsg('¡Sensacional! Has adquirido el Pack Maestro y desbloqueado los 8 cursos de la plataforma.');
    }
  };

  const totalCompletedLessons = Object.values(progress.completedLessons).filter(Boolean).length;
  
  // Calculate completed courses
  const completedCourses = courses.filter(course => {
    return course.lessons.every(lesson => progress.completedLessons[lesson.id]);
  });

  const unlockedCoursesCount = courses.filter(c => isCoursePurchased(c.id, currentUser)).length;
  const lockedCoursesCount = courses.length - unlockedCoursesCount;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-slate-950 text-slate-100 pb-20"
    >
      {/* TOP NAVIGATION / HEADER BAR */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBackToCatalog}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700/60 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Volver al Catálogo de Cursos</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO STUDENT BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt="Avatar Estudiante"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-500/40 shadow-2xl"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 ring-4 ring-slate-900 rounded-full" title="Usuario en línea" />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {currentUser?.fullName || progress.studentName}
                  </h1>
                  <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    {currentUser?.role || 'Estudiante'}
                  </span>
                </div>

                <p className="text-sm text-slate-300 font-mono flex items-center justify-center sm:justify-start space-x-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>{currentUser?.email || 'estudiante@codex.edu'}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-300 font-medium">
                  <span className="flex items-center space-x-1.5 text-slate-300">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Honduras / América Latina</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-slate-300">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Miembro de CODEX Edu</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex flex-row md:flex-col gap-3 shrink-0">
              <div className="bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl text-center md:text-right shadow-lg">
                <p className="text-2xl font-black text-emerald-400">{totalCompletedLessons}</p>
                <p className="text-xs text-slate-400 font-semibold">Lecciones Aprobadas</p>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl text-center md:text-right shadow-lg">
                <p className="text-2xl font-black text-amber-400">{completedCourses.length}</p>
                <p className="text-xs text-slate-400 font-semibold">Cursos Certificados</p>
              </div>
            </div>

          </div>
        </div>

        {/* TABS NAVIGATION BAR */}
        <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'perfil', label: 'Mi Perfil Completo', icon: User },
              { id: 'cursos', label: 'Mis Cursos Enrolados', icon: BookOpen },
              { id: 'certificados', label: 'Mis Certificados', icon: Award },
              { id: 'pagos', label: 'Área de Pagos', icon: CreditCard },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: MI PERFIL */}
        {activeTab === 'perfil' && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Catálogo Activo
                  </span>
                </div>
                <p className="text-3xl font-black text-white">{courses.length}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">Cursos Disponibles para Aprendizaje</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Avance Total
                  </span>
                </div>
                <p className="text-3xl font-black text-emerald-400">{totalCompletedLessons}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">Lecciones y Ejercicios Completados</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Diplomas
                  </span>
                </div>
                <p className="text-3xl font-black text-amber-400">{completedCourses.length}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">Certificados Obtenidos con PDF</p>
              </div>
            </div>

            {/* Detailed Account Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Detalles y Configuración de la Cuenta</h3>
                  <p className="text-xs text-slate-400">Información del perfil del estudiante registrado</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Nombre de Estudiante</p>
                  <p className="text-sm font-bold text-white">{currentUser?.fullName || progress.studentName}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Correo Electrónico Institucional</p>
                  <p className="text-sm font-bold text-white">{currentUser?.email || 'estudiante@codex.edu'}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Rol en la Plataforma</p>
                  <p className="text-sm font-bold text-indigo-300 capitalize">{currentUser?.role || 'Estudiante CODEX'}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Estado de Verificación</p>
                  <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verificado y Activo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cursos Comprados y Registro en el Progreso */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Cursos Comprados y Registro en el Progreso</h3>
                    <p className="text-xs text-slate-400">Rutas de aprendizaje activas registradas en tu perfil y visibles en el panel del Administrador</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                  {unlockedCoursesCount} de {courses.length} Cursos Adquiridos ($5 USD c/u)
                </span>
              </div>

              {unlockedCoursesCount === 0 ? (
                <div className="p-8 bg-slate-950 rounded-2xl border border-dashed border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h4 className="font-bold text-sm text-white">Aún no tienes cursos comprados</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Cada curso individual tiene un precio de tan sólo <strong className="text-amber-400 font-bold">$5.00 USD</strong> con acceso vitalicio al compilador, retos prácticos y certificación oficial.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('pagos')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Ver Planes y Comprar por $5 USD
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses
                    .filter(c => isCoursePurchased(c.id, currentUser))
                    .map(course => {
                      const completedCount = course.lessons.filter(l => progress.completedLessons[l.id]).length;
                      const totalLessons = course.lessons.length;
                      const percent = Math.round((completedCount / totalLessons) * 100);
                      const isComplete = percent === 100;

                      return (
                        <div key={course.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                                  <LanguageLogo courseId={course.id} className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-white">{course.title}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                ✓ Comprado ($5 USD)
                              </span>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Progreso de Lecciones:</span>
                                <span className={`font-mono font-bold ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {percent}% ({completedCount}/{totalLessons} lecciones)
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                            <span className="text-[11px] text-slate-400 font-medium">
                              {isComplete ? '✓ Curso Finalizado con éxito' : 'Sincronizado con Admin en tiempo real'}
                            </span>
                            <button
                              onClick={() => onSelectCourse(course.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>{isComplete ? 'Repasar' : 'Continuar'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MIS CURSOS */}
        {activeTab === 'cursos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Mis Cursos</h3>
                <p className="text-xs text-slate-400">Visualiza tus cursos desbloqueados y adquiere nuevas rutas de aprendizaje</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {unlockedCoursesCount} Desbloqueados
                </span>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {lockedCoursesCount} Bloqueados
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(course => {
                const isUnlocked = isCoursePurchased(course.id, currentUser);
                const completedCount = course.lessons.filter(l => progress.completedLessons[l.id]).length;
                const totalLessons = course.lessons.length;
                const percent = Math.round((completedCount / totalLessons) * 100);

                return (
                  <div 
                    key={course.id}
                    className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-lg transition-all ${
                      isUnlocked 
                        ? 'border-slate-800 hover:border-slate-700' 
                        : 'border-slate-800/80 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl shrink-0">
                            <LanguageLogo courseId={course.id} className="w-8 h-8" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                              Nivel {course.level}
                            </span>
                            <h4 className="text-base font-bold text-white">{course.title}</h4>
                          </div>
                        </div>

                        {isUnlocked ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Desbloqueado</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Bloqueado</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Progress bar or Locked info */}
                      {isUnlocked ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400">Progreso del Curso</span>
                            <span className="text-indigo-300">{percent}% ({completedCount}/{totalLessons} Lecciones)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between">
                          <span className="text-slate-400">Estado de Acceso:</span>
                          <span className="text-amber-400 font-bold flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-rose-400" />
                            <span>Requiere compra ($5.00 USD)</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => onSelectCourse(course.id)}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{percent === 100 ? 'Repasar Curso' : 'Continuar Aprendiendo'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('pagos')}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Desbloquear en Área de Pago</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MIS CERTIFICADOS */}
        {activeTab === 'certificados' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Certificados de Finalización</h3>
                <p className="text-xs text-slate-400">Tus diplomas académicos aprobados listos para descargar e imprimir</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {completedCourses.length} Obtenidos
              </span>
            </div>

            {completedCourses.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
                <div className="inline-flex p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <Award className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-white">Aún no tienes certificados generados</h4>
                <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Completa el 100% de las lecciones prácticas y ejercicios de cualquiera de tus cursos para emitir tu diploma oficial con marco formal dorado, código de verificación único y sello digital institucional.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onBackToCatalog}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all inline-flex items-center space-x-2 cursor-pointer shadow-md"
                  >
                    <span>Ir a los Cursos</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedCourses.map(course => (
                  <div 
                    key={course.id}
                    className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl shrink-0">
                            <Award className="w-8 h-8" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Curso Aprobado 100%
                            </span>
                            <h4 className="text-base font-bold text-white mt-1">{course.title}</h4>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">
                        Certificado Oficial de Finalización con marco formal, código de verificación y sello digital avalado por CODEX Academy.
                      </p>

                      <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-2">
                        <span>✓ Sello Digital</span>
                        <span>•</span>
                        <span>✓ Marco Formal Dorado</span>
                        <span>•</span>
                        <span>✓ Validación SHA-256</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onViewCertificate(course)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>Ver y Descargar Diploma Oficial (PDF)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ÁREA DE PAGOS Y DESBLOQUEO DE CURSOS */}
        {activeTab === 'pagos' && (
          <div className="space-y-8">
            {/* SUCCESS BANNER */}
            {unlockedSuccessMsg && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-3xl p-5 flex items-center justify-between text-xs text-emerald-200 shadow-xl">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">¡Transacción Exitosa y Curso Desbloqueado!</p>
                    <p className="text-xs text-emerald-300 mt-0.5">{unlockedSuccessMsg}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setUnlockedSuccessMsg(null)}
                  className="text-emerald-400 hover:text-white font-black text-sm px-3 py-1.5 rounded-lg hover:bg-emerald-900/50 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* HEADER AREA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center space-x-2.5">
                  <CreditCard className="w-7 h-7 text-indigo-400" />
                  <span>Área de Pagos y Adquisición de Cursos</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Todos los cursos inician bloqueados. Compra la licencia vitalicia individual o el Pack Maestro para desbloquear el compilador interactivo y las lecciones.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-right">
                  <p className="text-xs text-slate-400">Estado de Cuenta</p>
                  <p className="text-xs font-extrabold text-emerald-400">
                    {unlockedCoursesCount} de {courses.length} Cursos Desbloqueados
                  </p>
                </div>
              </div>
            </div>

            {/* MASTER BUNDLE OFFER (PACK 8 CURSOS) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-indigo-900/40 to-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>OFERTA RECOMENDADA • AHORRA 70%</span>
                  </div>
                  
                  <h4 className="text-2xl sm:text-3xl font-black text-white">
                    Pack Maestro CODEX: <span className="text-amber-400">Todos los 8 Cursos</span>
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Desbloquea de forma inmediata y vitalicia los 8 lenguajes: C++, Python, JavaScript, Java, Node.js, Rust, SQL y HTML/CSS. Acceso total al compilador en vivo, retos interactivos y las 8 certificaciones oficiales.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-semibold pt-1">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span>8 Cursos Desbloqueados</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span>Acceso Vitalicio de por Vida</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span>8 Certificados Oficiales en PDF</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/90 border border-slate-800 p-6 rounded-2xl text-center space-y-4 shrink-0 sm:min-w-[260px]">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-2">$159.99 USD</span>
                    <span className="text-3xl font-black text-amber-400">$49.99 USD</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pago único • Acceso ilimitado</p>
                  </div>

                  <button
                    onClick={handleOpenPackCheckout}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/30 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Comprar Pack Maestro ($49.99)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* INDIVIDUAL COURSE LICENSES GRID */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Licencias Individuales por Curso</span>
                  </h4>
                  <p className="text-xs text-slate-400">Elige el curso que deseas adquirir para desbloquearlo al instante</p>
                </div>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {courses.length} Cursos Disponibles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const isUnlocked = isCoursePurchased(course.id, currentUser);
                  const isHighlighted = highlightCourseId === course.id;

                  return (
                    <div 
                      key={course.id}
                      className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xl transition-all relative ${
                        isHighlighted 
                          ? 'border-amber-400 ring-2 ring-amber-400/40'
                          : isUnlocked
                            ? 'border-slate-800 hover:border-slate-700'
                            : 'border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                            <LanguageLogo courseId={course.id} className="w-8 h-8" />
                          </div>
                          
                          {isUnlocked ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>DESBLOQUEADO</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1">
                              <Lock className="w-3 h-3" />
                              <span>BLOQUEADO</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                            NIVEL {course.level}
                          </span>
                          <h5 className="text-base font-bold text-white mt-0.5">{course.title}</h5>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{course.description}</p>
                        </div>

                        <div className="border-t border-slate-800/80 pt-3 space-y-2 text-xs">
                          {isUnlocked ? (
                            <>
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400">Licencia:</span>
                                <span className="font-bold text-emerald-400">Vitalicia Activa</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400">Compilador:</span>
                                <span className="text-indigo-300 font-bold">Habilitado en Vivo</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400">Certificado PDF:</span>
                                <span className="text-amber-400 font-bold">Disponible al 100%</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400">Valor Regular:</span>
                                <span className="font-bold text-slate-500 line-through">$25.00 USD</span>
                              </div>
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-slate-300">Precio de Pago:</span>
                                <span className="text-amber-400 text-sm font-black">$5.00 USD</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                <span>Estado:</span>
                                <span className="text-rose-400 font-semibold">Requiere Pago para Iniciar</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        {isUnlocked ? (
                          <button
                            onClick={() => onSelectCourse(course.id)}
                            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Entrar al Workspace del Curso</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenCourseCheckout(course)}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Comprar y Desbloquear ($5.00 USD)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PREPARED PAYMENT GATEWAYS SECTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Pasarelas de Pago e Integración Multiplataforma</h4>
                    <p className="text-xs text-slate-400">Módulos listos para procesar pagos seguros locales e internacionales</p>
                  </div>
                </div>

                <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pasarela Segura SSL 256-bit</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* 1. PAYPAL */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-[#0070BA]/50 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-[#003087]/20 border border-[#0070BA]/30 flex items-center justify-center text-[#0070BA] font-black text-xs">
                        P
                      </div>
                      <span>PayPal</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      Listo para API
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Integración con PayPal JS SDK y órdenes REST. Soporte para saldo PayPal, cuentas bancarias y tarjetas internacionales con protección al comprador.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-sky-400/90 flex items-center space-x-1">
                    <span>• SDK:</span>
                    <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">PAYPAL_CONFIG.clientId</code>
                  </div>
                </div>

                {/* 2. STRIPE */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-[#635BFF]/50 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-[#635BFF]/20 border border-[#635BFF]/30 flex items-center justify-center text-[#635BFF] font-black text-xs">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <span>Stripe</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Listo para API
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Stripe Elements y Checkout Sessions para tarjetas Visa, Mastercard, American Express, Apple Pay y Google Pay con certificación PCI DSS Nivel 1.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-indigo-400/90 flex items-center space-x-1">
                    <span>• API:</span>
                    <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">STRIPE_CONFIG.publishableKey</code>
                  </div>
                </div>
              </div>

              {/* HISTORIAL DE COMPRAS REGISTRADAS */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Historial de Compras y Facturas Registradas</h4>
                      <p className="text-xs text-slate-400">Tus pagos por curso ($5.00 USD) registrados y sincronizados con el panel de administración</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                    {studentTransactions.length} Transacciones Verificadas
                  </span>
                </div>

                {studentTransactions.length === 0 ? (
                  <div className="p-6 bg-slate-950 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    No hay transacciones registradas aún. Al adquirir un curso por $5.00 USD con PayPal o Stripe, aparecerá aquí tu comprobante de pago inmediato.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 font-semibold">ID Transacción</th>
                          <th className="pb-3 font-semibold">Curso / Concepto</th>
                          <th className="pb-3 font-semibold">Monto</th>
                          <th className="pb-3 font-semibold">Pasarela</th>
                          <th className="pb-3 font-semibold">Fecha</th>
                          <th className="pb-3 font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {studentTransactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3.5 font-mono text-slate-300">{tx.id}</td>
                            <td className="py-3.5 font-bold text-white">{tx.planName}</td>
                            <td className="py-3.5 font-black text-amber-400">{tx.amount}</td>
                            <td className="py-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300">
                                {tx.method}
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-400">{tx.date}</td>
                            <td className="py-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CHECKOUT MODAL FOR PLAN CONFIGURATION */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedCheckoutPlan}
        courseId={selectedCheckoutCourse?.id}
        courseTitle={selectedCheckoutCourse?.title}
        onSuccessPay={handlePlanSuccess}
        onCourseUnlocked={handleCourseUnlocked}
      />
    </motion.div>
  );
};
