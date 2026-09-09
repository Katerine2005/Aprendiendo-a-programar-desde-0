import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Lesson, UserProgress } from '../types';
import { LanguageLogo } from './LanguageLogos';
import { executeCode, ExecutionResult } from '../lib/compiler';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Code2, 
  Lightbulb, 
  RotateCcw, 
  Terminal, 
  Award, 
  Sparkles,
  Check,
  AlertCircle,
  Eye
} from 'lucide-react';

interface CourseWorkspaceProps {
  course: Course;
  progress: UserProgress;
  onCompleteLesson: (lessonId: string) => void;
  onSaveCode: (lessonId: string, code: string) => void;
  onBackToCatalog: () => void;
  onOpenCertificateModal: () => void;
}

export const CourseWorkspace: React.FC<CourseWorkspaceProps> = ({
  course,
  progress,
  onCompleteLesson,
  onSaveCode,
  onBackToCatalog,
  onOpenCertificateModal,
}) => {
  // Determine current active lesson index (default to first uncompleted or last active)
  const initialLessonIndex = () => {
    const savedLast = progress.currentLessonId[course.id];
    if (savedLast) {
      const idx = course.lessons.findIndex(l => l.id === savedLast);
      if (idx !== -1) return idx;
    }
    const firstUncompleted = course.lessons.findIndex(l => !progress.completedLessons[l.id]);
    return firstUncompleted !== -1 ? firstUncompleted : 0;
  };

  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(initialLessonIndex());

  const currentLesson = course.lessons[activeLessonIndex];
  const isCurrentLessonCompleted = !!progress.completedLessons[currentLesson.id];

  // User code state
  const [userCode, setUserCode] = useState<string>(
    progress.savedCode[currentLesson.id] || currentLesson.initialCode
  );

  // Compiler execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'Todos' | 'Básico' | 'Intermedio' | 'Avanzado'>('Todos');

  // Sync user code when switching lessons
  useEffect(() => {
    setUserCode(progress.savedCode[currentLesson.id] || currentLesson.initialCode);
    setExecutionResult(null);
    setShowHint(false);
  }, [activeLessonIndex, currentLesson.id, course.id, progress.savedCode]);

  // Code editor change handler
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setUserCode(newCode);
    onSaveCode(currentLesson.id, newCode);
  };

  // Run compiler without marking completed
  const handleRunCode = async () => {
    setIsExecuting(true);
    const result = await executeCode(course.id, userCode, currentLesson);
    setExecutionResult(result);
    setIsExecuting(false);
  };

  // Run compiler and verify lesson completion
  const handleVerifyAndPass = async () => {
    setIsExecuting(true);
    const result = await executeCode(course.id, userCode, currentLesson);
    setExecutionResult(result);
    setIsExecuting(false);

    if (result.success) {
      onCompleteLesson(currentLesson.id);
    }
  };

  // Reset starter code
  const handleResetCode = () => {
    setUserCode(currentLesson.initialCode);
    onSaveCode(currentLesson.id, currentLesson.initialCode);
    setExecutionResult(null);
  };

  // Lesson locks logic: Lesson is unlocked if it's index 0 OR the previous lesson is completed
  const isLessonUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLessonId = course.lessons[index - 1].id;
    return !!progress.completedLessons[prevLessonId];
  };

  const completedLessonsCount = course.lessons.filter(l => progress.completedLessons[l.id]).length;
  const isCourseFullyCompleted = completedLessonsCount === course.lessons.length;

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      
      {/* Top Navigation Bar */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 gap-4 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3.5">
          <button
            onClick={onBackToCatalog}
            className="flex items-center space-x-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm group shrink-0 w-fit"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a Cursos</span>
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg shadow-sm">
                <LanguageLogo courseId={course.id} className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  {course.title}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono bg-slate-800/60 border border-slate-700/50 px-2.5 py-0.5 rounded-md">
                Lección {currentLesson.number} de {course.lessons.length}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug truncate max-w-xl">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        {/* Level & Nav Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0 justify-between sm:justify-end">
          <span className="text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1.5 bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Nivel: {currentLesson.level}</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={activeLessonIndex === 0}
              onClick={() => setActiveLessonIndex(prev => prev - 1)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-30 transition-all shadow-sm"
              title="Lección Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={activeLessonIndex === course.lessons.length - 1 || !isLessonUnlocked(activeLessonIndex + 1)}
              onClick={() => setActiveLessonIndex(prev => prev + 1)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md"
              title={!isLessonUnlocked(activeLessonIndex + 1) ? 'Completa la lección actual para desbloquear la siguiente' : 'Siguiente Lección'}
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {isCourseFullyCompleted && (
              <button
                onClick={onOpenCertificateModal}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Ver Certificado PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: LEFT (Temario Sidebar) | RIGHT (Workspace View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR: TEMARIO (4 cols on large screen) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm sticky top-24">
            
            {/* Sidebar Title & Course Progress */}
            <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Temario del Curso
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {completedLessonsCount} / {course.lessons.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-4">
                <div
                  className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${(completedLessonsCount / course.lessons.length) * 100}%` }}
                />
              </div>

              {/* Level Filter Tabs (Básico, Intermedio, Avanzado) */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                {(['Básico', 'Intermedio', 'Avanzado'] as const).map(lvl => {
                  const isActive = selectedLevelFilter === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevelFilter(selectedLevelFilter === lvl ? 'Todos' : lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
              {selectedLevelFilter !== 'Todos' && (
                <div className="mt-2 text-right">
                  <button 
                    onClick={() => setSelectedLevelFilter('Todos')}
                    className="text-[11px] text-indigo-500 hover:underline font-medium"
                  >
                    Ver todas las 30 lecciones
                  </button>
                </div>
              )}
            </div>

            {/* Lessons List in Left Sidebar */}
            <div className="space-y-2 max-h-[calc(100vh-230px)] overflow-y-auto pr-1 custom-scrollbar">
              {course.lessons
                .map((lesson, originalIndex) => ({ lesson, originalIndex }))
                .filter(({ lesson }) => selectedLevelFilter === 'Todos' || lesson.level === selectedLevelFilter)
                .map(({ lesson, originalIndex: index }) => {
                const isCompleted = !!progress.completedLessons[lesson.id];
                const isCurrent = index === activeLessonIndex;
                const unlocked = isLessonUnlocked(index);

                return (
                  <button
                    key={lesson.id}
                    disabled={!unlocked}
                    onClick={() => {
                      if (unlocked) {
                        setActiveLessonIndex(index);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between group ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-[1.01]'
                        : isCompleted
                        ? 'bg-emerald-500/10 text-slate-800 dark:text-slate-200 border-emerald-500/30 hover:border-emerald-500/60'
                        : unlocked
                        ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500/50'
                        : 'bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 border-slate-200/50 dark:border-slate-800/40 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-emerald-500'}`} />
                        ) : !unlocked ? (
                          <Lock className="w-4 h-4 text-slate-400" />
                        ) : (
                          <span className={`w-4 h-4 rounded-full border text-[10px] flex items-center justify-center font-bold ${
                            isCurrent ? 'border-white text-white' : 'border-slate-400 text-slate-500'
                          }`}>
                            {lesson.number}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className={`text-xs font-bold leading-snug line-clamp-1 ${isCurrent ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                          {lesson.number}. {lesson.title}
                        </p>
                        <span className={`text-[10px] font-medium ${
                          isCurrent 
                            ? 'text-indigo-200' 
                            : lesson.level === 'Básico' ? 'text-emerald-500 dark:text-emerald-400' 
                            : lesson.level === 'Intermedio' ? 'text-amber-500 dark:text-amber-400'
                            : 'text-indigo-500 dark:text-indigo-400'
                        }`}>
                          {lesson.level}
                        </span>
                      </div>
                    </div>

                    {!unlocked && (
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">Bloqueado</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT WORKSPACE AREA: UNIFIED SINGLE MODULE (THEORY + PRACTICE & COMPILER) (8 cols) */}
        <motion.div 
          key={currentLesson.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-8 flex flex-col space-y-6"
        >
          
          {/* Module Header Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Módulo Unificado de Aprendizaje</span>
                  {isCurrentLessonCompleted && (
                    <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Completado</span>
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Teoría, Ejercicios y Compilador en Tiempo Real
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 font-bold transition-all"
              >
                <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                <span>{showHint ? 'Ocultar Pista' : 'Pista del Ejercicio'}</span>
              </button>
            </div>
          </div>

          {/* UNIFIED 2-COLUMN GRID FOR THEORY & COMPILER */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* COLUMN 1: TEORÍA Y OBJETIVO DE LA LECCIÓN */}
            <div className="flex flex-col space-y-6">
              
              {/* Theory Content Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                
                {/* Lesson Header Banner */}
                <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md relative overflow-hidden">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      Nivel {currentLesson.level}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Lección #{currentLesson.number}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1.5 leading-tight">
                    {currentLesson.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium m-0">
                    {currentLesson.summary}
                  </p>
                </div>

                {/* Rendered Markdown Theory */}
                <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 space-y-4 text-xs sm:text-sm leading-relaxed max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentLesson.theoryMarkdown.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <div key={pIdx} className="flex items-center space-x-2 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                          <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white m-0">
                            {paragraph.replace('### ', '')}
                          </h4>
                        </div>
                      );
                    }
                    if (paragraph.startsWith('#### ')) {
                      return (
                        <h5 key={pIdx} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 pt-1 m-0">
                          {paragraph.replace('#### ', '')}
                        </h5>
                      );
                    }
                    if (paragraph.startsWith('```')) {
                      const lines = paragraph.split('\n');
                      const lang = lines[0].replace('```', '') || 'code';
                      const codeText = lines.slice(1, -1).join('\n') || paragraph.replace(/```[a-z]*/g, '').trim();
                      return (
                        <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-slate-800 shadow-md bg-slate-950">
                          <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                              Ejemplo ({lang})
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase font-bold">{course.id}</span>
                          </div>
                          <pre className="p-3 text-emerald-400 font-mono text-xs overflow-x-auto m-0 leading-relaxed">
                            <code>{codeText}</code>
                          </pre>
                        </div>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      const listItems = paragraph.split('\n').filter(l => l.trim().startsWith('- '));
                      return (
                        <ul key={pIdx} className="space-y-1.5 my-2 pl-0 list-none">
                          {listItems.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <span>{item.replace('- ', '')}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={pIdx} className="m-0 text-slate-700 dark:text-slate-300 font-normal">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Practical Exercise Objectives & Requirements */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Objetivo del Ejercicio Práctico:</h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium m-0">
                  {currentLesson.instructions}
                </p>

                {/* AI Hint Callout */}
                {showHint && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-300 animate-fadeIn">
                    <span className="font-bold block mb-1">💡 Pista de Ayuda:</span>
                    {currentLesson.hint}
                  </div>
                )}

                {/* Requerimientos que debe cumplir el ejercicio */}
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Requerimientos para aprobar:
                  </p>
                  <div className="space-y-1.5">
                    {currentLesson.testCases.map((tc, idx) => {
                      const isPassed = executionResult?.testResults?.find(tr => tr.testId === tc.id)?.passed;
                      return (
                        <div 
                          key={tc.id} 
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                            isPassed 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : 'bg-slate-950/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="font-medium">{tc.description}</span>
                          </div>

                          {isPassed ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Cumplido
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Pendiente</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 2: COMPILADOR PRÁCTICO & RESULTADOS DE EJECUCIÓN */}
            <div className="flex flex-col space-y-6">
              
              {/* Internal Code Compiler Editor */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                
                {/* Compiler Toolbar */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">Compilador {course.title}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleResetCode}
                      className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                      title="Restablecer código inicial"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reiniciar</span>
                    </button>

                    <button
                      onClick={handleRunCode}
                      disabled={isExecuting}
                      className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
                      <span>{isExecuting ? 'Ejecutando...' : 'Ejecutar Código'}</span>
                    </button>

                    <button
                      onClick={handleVerifyAndPass}
                      disabled={isExecuting}
                      className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verificar Ejercicio</span>
                    </button>
                  </div>
                </div>

                {/* Code Textarea Editor */}
                <div className="relative">
                  <textarea
                    value={userCode}
                    onChange={handleCodeChange}
                    spellCheck={false}
                    className="w-full h-80 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm p-4 focus:outline-none resize-none leading-relaxed custom-scrollbar"
                    placeholder="// Escribe tu código aquí para resolver el ejercicio..."
                  />
                </div>
              </div>

              {/* Compiler Terminal Console & Evaluation Details */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col">
                <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">Consola de Salida & Evaluación</span>
                  </div>

                  {executionResult && (
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      executionResult.success 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {executionResult.success ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Prueba Superada (100%)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Revisión Requerida</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Console Log Output */}
                <div className="p-4 font-mono text-xs sm:text-sm min-h-[120px] max-h-56 overflow-y-auto bg-slate-950 text-slate-200 custom-scrollbar">
                  {executionResult ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Salida estándar del sistema:</span>
                        <pre className="whitespace-pre-wrap text-emerald-300 font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                          {executionResult.output}
                        </pre>
                      </div>

                      {/* HTML Render Preview if HTML course */}
                      {executionResult.htmlPreview && (
                        <div className="pt-2 border-t border-slate-800">
                          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-sans">
                            <Eye className="w-3.5 h-3.5 text-indigo-400" /> Vista Previa Renderizada HTML/CSS:
                          </p>
                          <iframe
                            srcDoc={executionResult.htmlPreview}
                            title="HTML Preview"
                            className="w-full h-36 bg-white rounded-lg border border-slate-700 shadow-inner"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic py-4 text-center font-sans text-xs">
                      Presiona <span className="text-indigo-400 font-bold">&quot;Ejecutar Código&quot;</span> para compilar o <span className="text-emerald-400 font-bold">&quot;Verificar Ejercicio&quot;</span> para validar si cumple con lo requerido.
                    </div>
                  )}
                </div>

                {/* Detailed Test Results Breakdown */}
                {executionResult && (
                  <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
                    <h4 className="font-bold text-xs text-slate-300 flex items-center justify-between">
                      <span>Resultado de Verificación de Requerimientos:</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {executionResult.testResults.filter(t => t.passed).length} de {executionResult.testResults.length} pruebas aprobadas
                      </span>
                    </h4>

                    <div className="space-y-2">
                      {executionResult.testResults.map((tr) => (
                        <div
                          key={tr.testId}
                          className={`p-3 rounded-xl border text-xs ${
                            tr.passed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            {tr.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-100">{tr.description}</p>
                              <div className="mt-1 space-y-0.5 text-[11px] font-mono">
                                <p className="text-slate-400">Salida Esperada: <span className="text-amber-300">{tr.expected}</span></p>
                                <p className="text-slate-400">Tu Salida: <span className={tr.passed ? 'text-emerald-300' : 'text-rose-300'}>{tr.actual}</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Celebration Banner when Exercise Meets 100% requirements */}
                    {executionResult.success && (
                      <div className="p-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/40 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-500/20 rounded-full border border-emerald-500/40 text-emerald-400">
                            <Award className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-emerald-300 text-sm">¡Felicitaciones! Ejercicio Cumplido Exitosamente</p>
                            <p className="text-xs text-slate-300">Has superado todas las validaciones de la lección.</p>
                          </div>
                        </div>

                        {activeLessonIndex < course.lessons.length - 1 && (
                          <button
                            onClick={() => setActiveLessonIndex(prev => prev + 1)}
                            className="w-full sm:w-auto shrink-0 flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all hover:scale-[1.02]"
                          >
                            <span>Ir a Siguiente Lección</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </div>
  );
};
