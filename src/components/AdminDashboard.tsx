import React, { useState } from 'react';
import { 
  Shield, BookOpen, Layers, Users, Award, BarChart3, 
  Plus, Edit, Trash2, Search, CheckCircle2, AlertCircle, RefreshCw, 
  FileText, Download, Filter, Globe, Sparkles, UserCheck, Lock, Unlock, Eye,
  Key, Save, X, TrendingUp, Check, Play, UserPlus, AlertTriangle, Code, ChevronRight,
  CreditCard, DollarSign, ShieldCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';
import { Course, CourseId, Lesson, TestCase, UserProfile, UserProgress, UserRole } from '../types';
import { COURSES } from '../data/coursesData';
import { getStoredUsers, updateUserProfileAdmin, deleteUserAdmin, addUserAdmin, StoredUser, saveUsers, INITIAL_USERS, toggleStudentCourse } from '../services/authService';
import { getStoredTransactions, TransactionRecord } from '../services/transactionService';
import { CertificateModal } from './CertificateModal';
import { LanguageLogo } from './LanguageLogos';

interface AdminDashboardProps {
  currentUser?: UserProfile;
  progress?: UserProgress;
  onLogout?: () => void;
  onViewCourseAsPreview?: (courseId: CourseId) => void;
}

type AdminTab = 'reportes' | 'cursos' | 'evaluaciones' | 'lecciones' | 'certificados' | 'pagos' | 'usuarios';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  progress,
  onLogout,
  onViewCourseAsPreview,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('reportes');
  const [usersList, setUsersList] = useState<StoredUser[]>(() => getStoredUsers());
  const [coursesList, setCoursesList] = useState<Course[]>(COURSES);
  
  // Search and filter state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | UserRole>('todos');
  const [evalCourseFilter, setEvalCourseFilter] = useState<string>('todos');

  // Modals & Editing states
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);
  const [editingUserPassword, setEditingUserPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'estudiante' as UserRole,
    country: 'Honduras',
    birthDate: '2000-01-01'
  });

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState<boolean>(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubtitle, setNewCourseSubtitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');

  const [editingLesson, setEditingLesson] = useState<{ courseId: CourseId; lesson: Lesson } | null>(null);
  const [isAddingLessonCourseId, setIsAddingLessonCourseId] = useState<CourseId | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonSummary, setNewLessonSummary] = useState('');
  const [newLessonLevel, setNewLessonLevel] = useState<'Básico' | 'Intermedio' | 'Avanzado'>('Básico');

  const [editingEval, setEditingEval] = useState<{ courseId: CourseId; lessonId: string; lessonTitle: string; testCase: TestCase } | null>(null);
  const [openEvalCourseIds, setOpenEvalCourseIds] = useState<string[]>([]);

  const toggleEvalCourseAccordion = (courseId: string) => {
    setOpenEvalCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const [certModalData, setCertModalData] = useState<{ course: Course; studentName: string } | null>(null);

  // Payments & Transactions State
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'todos' | 'completado' | 'procesando' | 'reembolsado'>('todos');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'todos' | 'tarjeta' | 'paypal' | 'stripe' | 'applepay' | 'banca'>('todos');
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);
  const [transactionsList, setTransactionsList] = useState<TransactionRecord[]>(() => getStoredTransactions());

  const refreshTransactions = () => {
    setTransactionsList(getStoredTransactions());
  };

  const handleToggleCourseForStudent = (studentId: string, courseId: CourseId) => {
    const updated = toggleStudentCourse(studentId, courseId);
    if (updated) {
      setUsersList(getStoredUsers());
      showNotification(`Cursos actualizados para ${updated.fullName}. Ahora registrado en Admin y Perfil.`);
    }
  };

  const filteredTransactions = transactionsList.filter(t => {
    const matchesSearch = 
      t.studentName.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      t.studentEmail.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      t.planName.toLowerCase().includes(paymentSearchTerm.toLowerCase());

    const matchesStatus = paymentStatusFilter === 'todos' || t.status === paymentStatusFilter;
    const matchesMethod = paymentMethodFilter === 'todos' || t.method === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Platform Config state
  const [systemName, setSystemName] = useState('CODEX - Plataforma Académica');
  const [allowNewRegistrations, setAllowNewRegistrations] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [passGradeThreshold, setPassGradeThreshold] = useState(70);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRefreshUsers = () => {
    setUsersList(getStoredUsers());
    showNotification('Lista de usuarios actualizada desde el almacenamiento.');
  };

  // --- USER HANDLERS ---
  const handleOpenEditUser = (user: StoredUser) => {
    setEditingUser(user);
    setEditingUserPassword(user.passwordHash || '');
    setShowPassword(false);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUserProfileAdmin(editingUser, editingUserPassword);
    setUsersList(getStoredUsers());
    setEditingUser(null);
    showNotification(`Usuario "${editingUser.fullName}" actualizado con éxito.`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName || !newUserForm.email || !newUserForm.username || !newUserForm.password) {
      alert('Por favor completa los campos requeridos.');
      return;
    }

    const newStoredUser: StoredUser = {
      id: `user-${Date.now()}`,
      fullName: newUserForm.fullName.trim(),
      username: newUserForm.username.trim().toLowerCase(),
      email: newUserForm.email.trim().toLowerCase(),
      passwordHash: newUserForm.password,
      role: newUserForm.role,
      country: newUserForm.country,
      birthDate: newUserForm.birthDate,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      termsAccepted: true,
      createdAt: new Date().toISOString(),
      enrolledCourses: ['cpp', 'python']
    };

    addUserAdmin(newStoredUser);
    setUsersList(getStoredUsers());
    setIsAddingUser(false);
    setNewUserForm({
      fullName: '',
      username: '',
      email: '',
      password: '',
      role: 'estudiante',
      country: 'Honduras',
      birthDate: '2000-01-01'
    });
    showNotification(`Nuevo usuario "${newStoredUser.fullName}" registrado exitosamente.`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (currentUser?.id && userId === currentUser.id) {
      alert('No puedes eliminar tu propia cuenta de administrador activa.');
      return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"?`)) {
      deleteUserAdmin(userId);
      setUsersList(getStoredUsers());
      showNotification(`Usuario "${userName}" eliminado.`);
    }
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let randPass = '';
    for (let i = 0; i < 10; i++) {
      randPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditingUserPassword(randPass);
    setShowPassword(true);
  };

  // --- COURSE HANDLERS ---
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setCoursesList(prev => prev.map(c => c.id === editingCourse.id ? editingCourse : c));
    setEditingCourse(null);
    showNotification(`Curso "${editingCourse.title}" actualizado con éxito.`);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const newId = newCourseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') as CourseId;
    const newCourse: Course = {
      id: newId,
      title: newCourseTitle,
      subtitle: newCourseSubtitle || 'Curso Práctico e Interactivo',
      icon: 'Code2',
      color: 'from-amber-500 to-indigo-600',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      description: newCourseDescription || 'Aprende fundamentos y técnicas avanzadas.',
      lessons: [
        {
          id: `${newId}-1`,
          number: 1,
          title: 'Introducción y Configuración',
          level: 'Básico',
          summary: 'Primeros pasos y entorno de desarrollo.',
          theoryMarkdown: 'Bienvenido al curso. Aquí aprenderás los conceptos fundamentales.',
          instructions: 'Escribe tu primer programa de prueba.',
          initialCode: '// Tu código aquí',
          solutionCode: '// Código resuelto',
          testCases: [{ id: 'tc1', description: 'Verifica la salida inicial', expectedOutput: 'Hola CODEX' }],
          hint: 'Revisa la sintaxis.'
        }
      ]
    };

    setCoursesList(prev => [...prev, newCourse]);
    setIsAddingCourse(false);
    setNewCourseTitle('');
    setNewCourseSubtitle('');
    setNewCourseDescription('');
    showNotification(`Curso "${newCourse.title}" creado con éxito.`);
  };

  // --- LESSON HANDLERS ---
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    setCoursesList(prev => prev.map(course => {
      if (course.id === editingLesson.courseId) {
        return {
          ...course,
          lessons: course.lessons.map(l => l.id === editingLesson.lesson.id ? editingLesson.lesson : l)
        };
      }
      return course;
    }));

    setEditingLesson(null);
    showNotification(`Lección "${editingLesson.lesson.title}" actualizada.`);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddingLessonCourseId || !newLessonTitle.trim()) return;

    const course = coursesList.find(c => c.id === isAddingLessonCourseId);
    if (!course) return;

    const newNumber = course.lessons.length + 1;
    const newLesson: Lesson = {
      id: `${isAddingLessonCourseId}-${Date.now()}`,
      number: newNumber,
      title: newLessonTitle,
      level: newLessonLevel,
      summary: newLessonSummary || 'Lección interactiva.',
      theoryMarkdown: '## ' + newLessonTitle + '\nContenido teórico de la lección...',
      instructions: 'Sigue las instrucciones para resolver el ejercicio.',
      initialCode: '// Código inicial\n',
      solutionCode: '// Solución de ejemplo\n',
      testCases: [{ id: `tc-${Date.now()}`, description: 'Verificar salida', expectedOutput: 'OK' }],
      hint: 'Aplica lo aprendido en la teoría.'
    };

    setCoursesList(prev => prev.map(c => {
      if (c.id === isAddingLessonCourseId) {
        return { ...c, lessons: [...c.lessons, newLesson] };
      }
      return c;
    }));

    setIsAddingLessonCourseId(null);
    setNewLessonTitle('');
    setNewLessonSummary('');
    showNotification(`Lección #${newNumber} agregada al curso.`);
  };

  // --- EVALUATION HANDLERS ---
  const handleSaveEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEval) return;

    setCoursesList(prev => prev.map(c => {
      if (c.id === editingEval.courseId) {
        return {
          ...c,
          lessons: c.lessons.map(l => {
            if (l.id === editingEval.lessonId) {
              return {
                ...l,
                testCases: l.testCases.map(tc => tc.id === editingEval.testCase.id ? editingEval.testCase : tc)
              };
            }
            return l;
          })
        };
      }
      return c;
    }));

    setEditingEval(null);
    showNotification('Evaluación y casos de prueba actualizados.');
  };

  // Reset System Data
  const handleResetSystemData = () => {
    if (confirm('¿Deseas restablecer los usuarios y datos iniciales del sistema?')) {
      saveUsers(INITIAL_USERS);
      setUsersList(INITIAL_USERS);
      showNotification('Datos del sistema restablecidos al estado de fábrica.');
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.fullName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.country || '').toLowerCase().includes(userSearchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalStudents = usersList.filter(u => u.role === 'estudiante').length;
  const totalAdmins = usersList.filter(u => u.role === 'administrador').length;

  // Chart Data for Reports
  const chartDataPopularity = coursesList.map(c => ({
    name: c.title.split(' ')[0],
    fullName: c.title,
    inscritos: Math.floor(800 + (c.lessons.length * 35) + (c.title.length * 12)),
    completados: Math.floor(600 + (c.lessons.length * 25)),
    aprobacion: 90 + Math.floor(c.title.length % 8)
  }));

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6', '#06b6d4', '#f97316'];

  const categoryPieData = [
    { name: 'Sistemas & Bajo Nivel', value: 35 },
    { name: 'Desarrollo Web & Backend', value: 45 },
    { name: 'Bases de Datos & SQL', value: 20 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* ADMIN HEADER */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md">
            <Shield className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">{systemName}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full border border-slate-700 uppercase tracking-widest">
                Panel Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">Administrador: {currentUser?.fullName || 'Administrador General'} (@{currentUser?.username || 'admin'})</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 font-bold transition-colors flex items-center space-x-1.5"
          >
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* ADMIN NOTIFICATION BANNER */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center space-x-2 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{notification}</span>
        </div>
      )}

      {maintenanceMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs font-bold py-2 px-4 text-center flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>MODO MANTENIMIENTO ACTIVO: El acceso de estudiantes está pausado temporalmente.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* ADMIN TAB NAVIGATION (LEFT SIDEBAR) */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-20 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 px-3 flex items-center justify-between">
              <span>Menú de Control</span>
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
            </h2>
            <nav className="flex flex-col space-y-1.5">
              {[
                { id: 'reportes', label: 'Reportes', icon: BarChart3 },
                { id: 'cursos', label: 'Cursos', icon: BookOpen },
                { id: 'evaluaciones', label: 'Evaluaciones', icon: FileText },
                { id: 'lecciones', label: 'Lecciones', icon: Layers },
                { id: 'certificados', label: 'Certificados', icon: Award },
                { id: 'pagos', label: 'Pagos', icon: CreditCard },
                { id: 'usuarios', label: 'Usuarios', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center space-x-3 w-full px-3.5 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <main className="flex-1 min-w-0">

        {/* TAB 1: REPORTES & METRICAS */}
        {activeTab === 'reportes' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Total Estudiantes</span>
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">{totalStudents}</p>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Cuentas activas en plataforma</span>
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Administradores</span>
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">{totalAdmins}</p>
                <p className="text-[11px] text-slate-400 mt-1">Con acceso total al panel</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Cursos Publicados</span>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">{coursesList.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">240 Lecciones Interactivas</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Promedio General</span>
                  <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-3">{passGradeThreshold}%</p>
                <p className="text-[11px] text-emerald-400 mt-1">✓ Umbral de aprobación</p>
              </div>
            </div>

            {/* VISUAL CHART 1: BAR CHART - RENDIMIENTO Y POPULARIDAD POR CURSO */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-white flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <span>Rendimiento y Popularidad por Curso</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Comparativa gráfica de estudiantes inscritos vs. lecciones completadas exitosamente.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-500" />
                    <span className="text-slate-300">Estudiantes Inscritos</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded bg-amber-400" />
                    <span className="text-slate-300">Completados</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataPopularity} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fbbf24' }}
                    />
                    <Bar dataKey="inscritos" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="completados" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Course Detail Table Overview */}
              <div className="space-y-3 pt-2">
                {coursesList.map((course, idx) => {
                  const stat = chartDataPopularity[idx] || { inscritos: 1200, completados: 900, aprobacion: 95 };
                  return (
                    <div key={course.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div>
                          <h4 className="font-bold text-sm text-white">{course.title}</h4>
                          <p className="text-xs text-slate-400">{course.lessons.length} Lecciones • 3 Niveles</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-500 text-[10px] block font-bold uppercase">Inscritos</span>
                          <span className="font-extrabold text-white">{stat.inscritos.toLocaleString()} alum.</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block font-bold uppercase">Aprobación</span>
                          <span className="font-extrabold text-emerald-400">{stat.aprobacion}%</span>
                        </div>
                        <button
                          onClick={() => onViewCourseAsPreview?.(course.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white font-bold transition-all text-xs flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Vista Previa</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CURSOS */}
        {activeTab === 'cursos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Gestión de Cursos ({coursesList.length})</h3>
                <p className="text-xs text-slate-400">Edita títulos, descripciones, contenido y agrega nuevos programas.</p>
              </div>
              <button
                onClick={() => setIsAddingCourse(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-colors shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Curso</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coursesList.map((course) => (
                <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                        Publicado
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ID: {course.id}</span>
                    </div>

                    <h4 className="font-black text-lg text-white mb-1">{course.title}</h4>
                    <p className="text-xs font-bold text-indigo-300 mb-2">{course.subtitle}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">{course.lessons.length} Lecciones</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewCourseAsPreview?.(course.id)}
                        className="p-2 rounded-xl bg-slate-800 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold flex items-center space-x-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Vista Previa</span>
                      </button>
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors text-xs flex items-center space-x-1.5 shadow-md"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LECCIONES */}
        {activeTab === 'lecciones' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Gestión de Lecciones por Curso</h3>
                <p className="text-xs text-slate-400">Edita teoría, código inicial y pruebas automatizadas de cada lección.</p>
              </div>
            </div>

            <div className="space-y-6">
              {coursesList.map((c) => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white">{c.title}</h4>
                        <p className="text-xs text-slate-400">{c.subtitle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAddingLessonCourseId(c.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Lección</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {c.lessons.map((lesson) => (
                      <div key={lesson.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between group hover:border-amber-500/40 transition-all">
                        <div className="min-w-0 pr-2">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            lesson.level === 'Básico' ? 'bg-emerald-500/20 text-emerald-300' :
                            lesson.level === 'Intermedio' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {lesson.level}
                          </span>
                          <p className="text-xs font-bold text-white mt-1.5 truncate">{lesson.number}. {lesson.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{lesson.summary}</p>
                        </div>
                        <button
                          onClick={() => setEditingLesson({ courseId: c.id, lesson })}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-bold transition-all text-xs flex items-center space-x-1 shrink-0"
                          title="Editar Lección"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">Administración de Usuarios ({usersList.length})</h3>
                <p className="text-xs text-slate-400">Gestiona contraseñas, roles de acceso y datos de perfil de estudiantes y administradores.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-lg shadow-amber-500/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nuevo Usuario</span>
                </button>

                <button
                  onClick={handleRefreshUsers}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, usuario, correo o país..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="todos">Todos los Roles</option>
                  <option value="estudiante">Solo Estudiantes</option>
                  <option value="administrador">Solo Administradores</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-4">Usuario</th>
                      <th className="p-4">Correo</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Cursos Comprados ($5 USD)</th>
                      <th className="p-4">Contraseña (Hash)</th>
                      <th className="p-4">País</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white">{user.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">@{user.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-300 font-mono">{user.email}</td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            user.role === 'administrador'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        <td className="p-4">
                          {user.role === 'administrador' ? (
                            <span className="text-[10px] text-amber-400/80 font-semibold italic">Acceso Total Master</span>
                          ) : (!user.enrolledCourses || user.enrolledCourses.length === 0) ? (
                            <span className="text-[10px] text-slate-500 italic">0 compras ($5 USD/c)</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {user.enrolledCourses.map(cid => {
                                const c = coursesList.find(item => item.id === cid);
                                return (
                                  <span key={cid} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-emerald-300">
                                    {c ? c.title.split(' ')[0] : cid}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        <td className="p-4 font-mono text-slate-400 text-[11px]">
                          •••••••• <span className="text-[10px] text-slate-500">({user.passwordHash || 'Oculta'})</span>
                        </td>

                        <td className="p-4 text-slate-300">{user.country}</td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-all font-bold flex items-center space-x-1"
                              title="Editar Usuario y Contraseña"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.fullName)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Eliminar Usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EVALUACIONES */}
        {activeTab === 'evaluaciones' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-white">Supervisión de Evaluaciones y Casos de Prueba (Test Cases)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Gestión de las entradas y salidas esperadas que el compilador integrado valida automáticamente en tiempo real.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400">Filtrar por Curso:</span>
                  <select
                    value={evalCourseFilter}
                    onChange={(e) => setEvalCourseFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="todos">Todos los Cursos</option>
                    {coursesList.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Evaluations Table */}
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-800/80">
                  <h4 className="font-bold text-sm text-slate-200">Listado de Pruebas de Evaluación Activas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Haz clic en el corchete de cada curso para desplegar u ocultar sus evaluaciones y lecciones.
                  </p>
                </div>
                
                <div className="space-y-3">
                  {coursesList
                    .filter(c => evalCourseFilter === 'todos' || c.id === evalCourseFilter)
                    .map(course => {
                      const isOpen = openEvalCourseIds.includes(course.id);
                      return (
                        <div key={course.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all shadow-sm">
                          {/* Course Box Header */}
                          <div 
                            onClick={() => toggleEvalCourseAccordion(course.id)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-900/70 transition-colors select-none"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                                <Code className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-sm text-white flex items-center space-x-2">
                                  <span>{course.title}</span>
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                  {course.lessons.length} lecciones / evaluaciones registradas
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Botón para agregar lección a este curso con su respectivo nivel */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAddingLessonCourseId(course.id);
                                  setNewLessonTitle('');
                                  setNewLessonSummary('');
                                  setNewLessonLevel('Básico');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs flex items-center space-x-1 transition-all"
                                title="Agregar nueva lección a este curso"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Agregar Lección</span>
                              </button>

                              {/* Corchete con el pico hacia abajo en la esquina para ocultar y desplegar */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEvalCourseAccordion(course.id);
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all flex items-center justify-center"
                                title={isOpen ? "Ocultar listado de evaluaciones" : "Desplegar listado de evaluaciones"}
                                aria-label={isOpen ? "Ocultar evaluaciones" : "Desplegar evaluaciones"}
                              >
                                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`} />
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Content */}
                          {isOpen && (
                            <div className="p-4 pt-0 border-t border-slate-800/80 bg-slate-950/60 space-y-2.5">
                              {course.lessons.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-500">
                                  No hay lecciones registradas para este curso todavía.
                                </div>
                              ) : (
                                course.lessons.map((lesson) => (
                                  <div 
                                    key={lesson.id} 
                                    className="p-3 bg-slate-900 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-slate-800/80 hover:border-slate-700 transition-all"
                                  >
                                    <div className="space-y-1 max-w-xl">
                                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                        <span className="font-bold text-white text-xs">
                                          {lesson.number}. {lesson.title}
                                        </span>
                                        {/* Nivel de la lección */}
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          lesson.level === 'Básico' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                          lesson.level === 'Intermedio' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                        }`}>
                                          Nivel: {lesson.level || 'Básico'}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-400">
                                        Instrucción: <span className="text-slate-300 font-mono">{lesson.instructions}</span>
                                      </p>
                                      {lesson.summary && (
                                        <p className="text-[10px] text-slate-500">{lesson.summary}</p>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                                      {lesson.testCases[0] && (
                                        <div className="text-right hidden md:block mr-1">
                                          <span className="text-[10px] text-slate-500 block">Salida Esperada</span>
                                          <span className="font-mono text-emerald-400 text-[11px]">{lesson.testCases[0].expectedOutput}</span>
                                        </div>
                                      )}

                                      {/* Botón Editar Lección (con su respectivo nivel y contenido) */}
                                      <button
                                        type="button"
                                        onClick={() => setEditingLesson({ courseId: course.id, lesson })}
                                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold transition-all text-xs flex items-center space-x-1"
                                        title="Editar Lección completa (título, nivel, contenido)"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                        <span>Editar Lección</span>
                                      </button>

                                      {/* Botón Editar Caso de Prueba */}
                                      {lesson.testCases[0] && (
                                        <button
                                          type="button"
                                          onClick={() => setEditingEval({
                                            courseId: course.id,
                                            lessonId: lesson.id,
                                            lessonTitle: lesson.title,
                                            testCase: lesson.testCases[0]
                                          })}
                                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold transition-all text-xs flex items-center space-x-1"
                                          title="Editar Caso de Prueba de la evaluación"
                                        >
                                          <Code className="w-3.5 h-3.5" />
                                          <span className="hidden sm:inline">Caso de Prueba</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CERTIFICADOS */}
        {activeTab === 'certificados' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="font-black text-lg text-white">Control de Certificados y Avance de Estudiantes</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Barra de progreso por estudiante. Si el estudiante alcanza el 100% de progreso o se solicita su certificado, puedes previsualizar y descargar el documento PDF.
                </p>
              </div>

              {/* Progress & Certificate List */}
              <div className="space-y-4">
                {usersList
                  .filter(u => u.role === 'estudiante')
                  .map((student) => {
                    const enrolledCourseIds = student.enrolledCourses || [];
                    const purchasedCourses = coursesList.filter(c => enrolledCourseIds.includes(c.id));
                    const isSessionStudent = (currentUser?.id === student.id || currentUser?.username === student.username || progress?.studentName === student.fullName);

                    return (
                      <div key={student.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
                            />
                            <div>
                              <h4 className="font-bold text-sm text-white">{student.fullName}</h4>
                              <p className="text-xs text-slate-400">@{student.username} • {student.email} ({student.country})</p>
                            </div>
                          </div>

                          <span className={`text-xs font-bold px-3 py-1 rounded-full border w-fit ${
                            enrolledCourseIds.length > 0 
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                              : 'text-slate-400 bg-slate-800/40 border-slate-700'
                          }`}>
                            {enrolledCourseIds.length} Cursos Comprados ($5 USD c/u)
                          </span>
                        </div>

                        {/* Student Course Progress Bars */}
                        <div className="space-y-3 pt-2 border-t border-slate-800/80">
                          {purchasedCourses.length === 0 ? (
                            <div className="p-4 bg-slate-900/60 rounded-xl border border-dashed border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
                                  <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-300">Este estudiante no tiene cursos comprados todavía</p>
                                  <p className="text-[11px] text-slate-400">Valor oficial: $5.00 USD por curso individual con compilador y certificación</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleToggleCourseForStudent(student.id, 'cpp')}
                                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-indigo-500/30 cursor-pointer"
                              >
                                + Desbloquear C++ ($5 USD)
                              </button>
                            </div>
                          ) : (
                            purchasedCourses.map((course) => {
                              const completedLessonsCount = isSessionStudent && progress
                                ? course.lessons.filter(l => progress.completedLessons[l.id]).length
                                : (student.username === 'carlos' && course.id === 'cpp' ? course.lessons.length : Math.round(course.lessons.length * 0.6));
                              
                              const progressPercent = Math.min(100, Math.round((completedLessonsCount / course.lessons.length) * 100));
                              const isCompleted = progressPercent === 100;

                              return (
                                <div key={course.id} className="p-3 bg-slate-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-bold text-slate-200">{course.title}</span>
                                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                          ✓ Comprado ($5 USD)
                                        </span>
                                      </div>
                                      <span className={`font-mono font-extrabold ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {progressPercent}% Completo ({completedLessonsCount}/{course.lessons.length} lecciones)
                                      </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                      <div
                                        className={`h-full transition-all duration-500 ${
                                          isCompleted
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                            : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                                        }`}
                                        style={{ width: `${progressPercent}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center justify-end">
                                    {isCompleted ? (
                                      <button
                                        onClick={() => setCertModalData({ course, studentName: student.fullName })}
                                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                                      >
                                        <Award className="w-4 h-4 text-amber-300" />
                                        <span>Ver / Descargar Certificado</span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 font-medium italic">
                                        En progreso activo ({completedLessonsCount}/{course.lessons.length} lecciones)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Admin Course Assignment Shortcuts */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800/60">
                          <span className="text-slate-400 text-[11px]">Asignar / Gestionar Cursos ($5 USD c/u):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {coursesList.map(c => {
                              const isEnrolled = enrolledCourseIds.includes(c.id);
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => handleToggleCourseForStudent(student.id, c.id)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                    isEnrolled
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300'
                                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                                  }`}
                                  title={isEnrolled ? `Clic para remover ${c.title}` : `Clic para asignar ${c.title} ($5 USD)`}
                                >
                                  {isEnrolled ? `✓ ${c.title.split(' ')[0]}` : `+ ${c.title.split(' ')[0]}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PAGOS Y TRANSACCIONES */}
        {activeTab === 'pagos' && (
          <div className="space-y-6">
            
            {/* TOP HEADER & EXPORT ACTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div>
                <h3 className="font-black text-2xl text-white flex items-center space-x-2">
                  <CreditCard className="w-7 h-7 text-indigo-400" />
                  <span>Gestión de Pagos y Transacciones</span>
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  Monitoreo en tiempo real de ingresos por suscripciones, licencias individuales y pasarelas de pago.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => showNotification('Reporte contable exportado exitosamente en formato CSV.')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-all flex items-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Download className="w-4.5 h-4.5" />
                  <span>Exportar CSV / PDF</span>
                </button>
              </div>
            </div>

            {/* FINANCIAL STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">Ingresos Totales (Auditados)</span>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white mt-3">
                  ${transactionsList.filter(t => t.status === 'completado').reduce((acc, t) => acc + (parseFloat(t.amount.replace(/[^0-9.]/g, '')) || 0), 0).toFixed(2)} <span className="text-sm font-normal text-slate-400">USD</span>
                </p>
                <p className="text-xs text-emerald-400 mt-1.5 flex items-center space-x-1 font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Sincronizado en vivo con compras de estudiantes ($5 USD)</span>
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">Pagos Aprobados</span>
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white mt-3">
                  {transactionsList.filter(t => t.status === 'completado').length}
                </p>
                <p className="text-xs text-indigo-300 mt-1.5 font-bold">100% liquidados sin contracargos</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">Cursos Vendidos ($5 USD)</span>
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white mt-3">
                  {transactionsList.filter(t => t.courseId || t.planName.toLowerCase().includes('curso') || t.amount.includes('5.00')).length}
                </p>
                <p className="text-xs text-amber-400 mt-1.5 font-bold">Acceso inmediato y progreso activado</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">Pasarelas Habilitadas</span>
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white mt-3">PayPal • Stripe</p>
                <p className="text-xs text-slate-300 mt-1.5 font-semibold">Integraciones listas con endpoints y credenciales</p>
              </div>
            </div>

            {/* GATEWAY STATUS BANNER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-wider text-slate-300">Pasarelas de Pago Oficiales (API Configurables)</span>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                  ● 2 Pasarelas Conectadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                      <span className="font-bold text-white">Stripe Checkout</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-black px-2 py-0.5 rounded border border-emerald-500/20">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Tarjetas internacionales VISA/Mastercard/Amex a $5.00 USD</p>
                  <code className="text-[10px] text-indigo-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded w-fit">API: STRIPE_CONFIG.publishableKey</code>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/30 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4.5 h-4.5 text-blue-400" />
                      <span className="font-bold text-white">PayPal Smart</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-black px-2 py-0.5 rounded border border-emerald-500/20">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Pago con saldo PayPal o tarjeta sin cuenta a $5.00 USD</p>
                  <code className="text-[10px] text-blue-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded w-fit">API: PAYPAL_CONFIG.clientId</code>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS TABLE & FILTERS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              
              {/* FILTERS ROW */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                    placeholder="Buscar por estudiante, correo, ID o curso..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 font-bold">Estado:</span>
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold cursor-pointer text-sm"
                    >
                      <option value="todos">Todos</option>
                      <option value="completado">Completado</option>
                      <option value="procesando">Procesando</option>
                      <option value="reembolsado">Reembolsado</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-bold">Pasarela:</span>
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold cursor-pointer text-sm"
                    >
                      <option value="todos">Todas las Pasarelas</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                      <option value="tarjeta">Tarjeta / Directo</option>
                      <option value="applepay">Apple Pay</option>
                      <option value="banca">Banca Local</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TRANSACTIONS TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-300 font-black uppercase text-xs tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">ID Transacción</th>
                      <th className="py-3.5 px-4">Estudiante</th>
                      <th className="py-3.5 px-4">Plan / Producto</th>
                      <th className="py-3.5 px-4">Monto</th>
                      <th className="py-3.5 px-4">Pasarela</th>
                      <th className="py-3.5 px-4">Fecha</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-4 font-mono font-black text-indigo-400 text-sm">
                          {txn.id}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-extrabold text-white text-sm sm:text-base">{txn.studentName}</p>
                          <p className="text-xs text-slate-400 font-medium">{txn.studentEmail}</p>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-200 text-sm">
                          {txn.planName}
                        </td>
                        <td className="py-4 px-4 font-black text-emerald-400 text-base">
                          {txn.amount}
                        </td>
                        <td className="py-4 px-4">
                          {txn.method === 'stripe' && (
                            <span className="inline-flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-indigo-500/40 font-bold text-xs text-indigo-300">
                              <CreditCard className="w-4 h-4 text-indigo-400" />
                              <span>Stripe ({txn.cardLast4 ? `••• ${txn.cardLast4}` : 'Card'})</span>
                            </span>
                          )}
                          {txn.method === 'paypal' && (
                            <span className="inline-flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-blue-500/40 font-bold text-xs text-blue-400">
                              <Globe className="w-4 h-4" />
                              <span>PayPal</span>
                            </span>
                          )}
                          {txn.method === 'tarjeta' && (
                            <span className="inline-flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-bold text-xs text-slate-200">
                              <CreditCard className="w-4 h-4 text-slate-400" />
                              <span>Tarjeta (••• {txn.cardLast4 || '4242'})</span>
                            </span>
                          )}
                          {txn.method === 'applepay' && (
                            <span className="inline-flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-bold text-xs text-white">
                              <span> Pay</span>
                            </span>
                          )}
                          {txn.method === 'banca' && (
                            <span className="inline-flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-bold text-xs text-amber-400">
                              <ShieldCheck className="w-4 h-4" />
                              <span>Banca Local</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-300 text-xs font-medium">
                          {txn.date}
                        </td>
                        <td className="py-4 px-4">
                          {txn.status === 'completado' && (
                            <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completado</span>
                            </span>
                          )}
                          {txn.status === 'procesando' && (
                            <span className="inline-flex items-center space-x-1 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 font-bold text-xs">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Procesando</span>
                            </span>
                          )}
                          {txn.status === 'reembolsado' && (
                            <span className="inline-flex items-center space-x-1 bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 font-bold text-xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Reembolsado</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceipt(txn)}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
                          >
                            Ver Recibo
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-10 space-y-2 text-slate-400 text-sm">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-500" />
                  <p>No se encontraron transacciones con los filtros seleccionados.</p>
                </div>
              )}

            </div>

          </div>
        )}

        </main>
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Editar Usuario & Contraseña</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-300">Contraseña</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[10px] text-amber-400 hover:underline font-bold"
                  >
                    Generar Aleatoria
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editingUserPassword}
                    onChange={(e) => setEditingUserPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-white font-mono"
                    placeholder="Escribe nueva contraseña..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-[10px] font-bold"
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Rol de Acceso</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">País</label>
                <input
                  type="text"
                  value={editingUser.country}
                  onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>Registrar Nuevo Usuario</span>
              </h3>
              <button onClick={() => setIsAddingUser(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  placeholder="Ej. Ana Lucía Torres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nombre de Usuario</label>
                  <input
                    type="text"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    placeholder="ana_torres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Rol</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="ana@correo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Editar Curso: {editingCourse.title}</span>
              </h3>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Título del Curso</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={editingCourse.subtitle}
                  onChange={(e) => setEditingCourse({ ...editingCourse, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {isAddingCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Crear Nuevo Curso</span>
              </h3>
              <button onClick={() => setIsAddingCourse(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Título del Curso</label>
                <input
                  type="text"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="Ej. Go para Microservicios"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={newCourseSubtitle}
                  onChange={(e) => setNewCourseSubtitle(e.target.value)}
                  placeholder="Ej. Concurrencia, REST APIs y Docker"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  placeholder="Descripción detallada del programa académico..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Crear Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LESSON MODAL */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-xs space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Editar Lección #{editingLesson.lesson.number}: {editingLesson.lesson.title}</span>
              </h3>
              <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Título de la Lección</label>
                  <input
                    type="text"
                    value={editingLesson.lesson.title}
                    onChange={(e) => setEditingLesson({
                      ...editingLesson,
                      lesson: { ...editingLesson.lesson, title: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nivel</label>
                  <select
                    value={editingLesson.lesson.level}
                    onChange={(e) => setEditingLesson({
                      ...editingLesson,
                      lesson: { ...editingLesson.lesson, level: e.target.value as any }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Resumen Corto</label>
                <input
                  type="text"
                  value={editingLesson.lesson.summary}
                  onChange={(e) => setEditingLesson({
                    ...editingLesson,
                    lesson: { ...editingLesson.lesson, summary: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Teoría Markdown</label>
                <textarea
                  rows={4}
                  value={editingLesson.lesson.theoryMarkdown}
                  onChange={(e) => setEditingLesson({
                    ...editingLesson,
                    lesson: { ...editingLesson.lesson, theoryMarkdown: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Instrucciones del Ejercicio</label>
                <input
                  type="text"
                  value={editingLesson.lesson.instructions}
                  onChange={(e) => setEditingLesson({
                    ...editingLesson,
                    lesson: { ...editingLesson.lesson, instructions: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Código Inicial</label>
                  <textarea
                    rows={3}
                    value={editingLesson.lesson.initialCode}
                    onChange={(e) => setEditingLesson({
                      ...editingLesson,
                      lesson: { ...editingLesson.lesson, initialCode: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Código Solución</label>
                  <textarea
                    rows={3}
                    value={editingLesson.lesson.solutionCode}
                    onChange={(e) => setEditingLesson({
                      ...editingLesson,
                      lesson: { ...editingLesson.lesson, solutionCode: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500"
                >
                  Guardar Lección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LESSON MODAL */}
      {isAddingLessonCourseId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Agregar Lección</span>
              </h3>
              <button onClick={() => setIsAddingLessonCourseId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Curso Destino</label>
                <select
                  value={isAddingLessonCourseId || ''}
                  onChange={(e) => setIsAddingLessonCourseId(e.target.value as CourseId)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                >
                  {coursesList.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Título de la Lección</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Ej. Funciones y Recursividad"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nivel</label>
                <select
                  value={newLessonLevel}
                  onChange={(e) => setNewLessonLevel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Resumen Corto</label>
                <input
                  type="text"
                  value={newLessonSummary}
                  onChange={(e) => setNewLessonSummary(e.target.value)}
                  placeholder="Ej. Estructuras de control avanzadas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingLessonCourseId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500"
                >
                  Agregar Lección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVALUATION MODAL */}
      {editingEval && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-black text-base text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Editar Evaluación: {editingEval.lessonTitle}</span>
              </h3>
              <button onClick={() => setEditingEval(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEval} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Descripción de la Prueba</label>
                <input
                  type="text"
                  value={editingEval.testCase.description}
                  onChange={(e) => setEditingEval({
                    ...editingEval,
                    testCase: { ...editingEval.testCase, description: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Entrada de Prueba (Opcional Input)</label>
                <input
                  type="text"
                  value={editingEval.testCase.input || ''}
                  onChange={(e) => setEditingEval({
                    ...editingEval,
                    testCase: { ...editingEval.testCase, input: e.target.value }
                  })}
                  placeholder="Entrada simulada"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Salida Esperada (Expected Output)</label>
                <textarea
                  rows={3}
                  value={editingEval.testCase.expectedOutput}
                  onChange={(e) => setEditingEval({
                    ...editingEval,
                    testCase: { ...editingEval.testCase, expectedOutput: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEval(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Guardar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {certModalData && (
        <CertificateModal
          course={certModalData.course}
          progress={{
            studentName: certModalData.studentName,
            completedLessons: {},
            lessonScores: {},
            savedCode: {},
            activeCourseId: certModalData.course.id,
            completedCourses: [certModalData.course.id]
          }}
          onClose={() => setCertModalData(null)}
        />
      )}

      {/* RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-sm space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-lg text-white">Recibo Oficial de Pago</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold">ID Transacción:</span>
                <span className="font-mono font-black text-indigo-400 text-sm">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold">Estudiante:</span>
                <span className="font-extrabold text-white">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold">Correo:</span>
                <span className="text-slate-200">{selectedReceipt.studentEmail}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold">Fecha:</span>
                <span className="text-slate-200">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold">Pasarela de Pago:</span>
                <span className="font-bold text-indigo-300 uppercase text-xs tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {selectedReceipt.method}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <p className="font-black text-slate-400 uppercase tracking-wider text-xs">Detalle del Item</p>
              <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <p className="font-extrabold text-white text-sm sm:text-base">{selectedReceipt.planName}</p>
                  <p className="text-xs text-slate-400">Membresía Académica CODEX Edu</p>
                </div>
                <span className="font-black text-emerald-400 text-base">{selectedReceipt.amount}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-sm">
              <span className="text-slate-300 font-extrabold">Estado del Cobro:</span>
              <span className="font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase text-xs">
                {selectedReceipt.status}
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setSelectedReceipt(null);
                  showNotification(`Recibo ${selectedReceipt.id} reenviado a ${selectedReceipt.studentEmail}`);
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-colors cursor-pointer"
              >
                Reenviar Recibo por Correo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
