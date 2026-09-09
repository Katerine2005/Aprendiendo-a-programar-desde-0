import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Course, UserProgress } from '../types';
import { generateCertificatePDF, generateLearningReportPDF } from '../lib/pdfGenerator';
import { 
  Award, 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Check, 
  QrCode,
  Printer
} from 'lucide-react';

interface CertificateModalProps {
  course: Course;
  progress: UserProgress;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  course,
  progress,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'preview' | 'documents'>('preview');
  const [isGenerating, setIsGenerating] = useState(false);

  // Trigger celebratory confetti on load
  useEffect(() => {
    try {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const studentName = (progress.studentName || 'Estudiante').trim();
  const certCode = `CODEX-${course.id.toUpperCase()}-749201`;
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleDownloadCert = () => {
    setIsGenerating(true);
    try {
      generateCertificatePDF(course, studentName, 100);
    } finally {
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  const handleDownloadReport = () => {
    generateLearningReportPDF(course, studentName, progress);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl my-6 z-10 text-white max-h-[92vh] flex flex-col"
        >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3.5 text-left">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CURSO APROBADO 100%</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Calificación: 100/100</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Certificado Oficial: {course.title}
              </h2>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeView === 'preview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Previa Diploma</span>
            </button>
            <button
              onClick={() => setActiveView('documents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeView === 'documents'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Descargas PDF</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          {activeView === 'preview' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Diploma oficial con marco formal, código de verificación y sello digital</span>
                </span>
                <span className="hidden sm:inline font-mono">Formato Académico Landscape A4</span>
              </div>

              {/* LIVE DIPLOMA VISUAL PREVIEW CONTAINER */}
              <div className="relative rounded-2xl bg-[#FDFBF7] text-slate-900 p-4 sm:p-8 shadow-2xl border-4 border-slate-900 select-none overflow-hidden">
                
                {/* 1. Subtle Background Security Watermark Pattern */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-5" 
                  style={{
                    backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                />

                {/* 2. Formal Multi-Layer Frame (Marco Formal) */}
                <div className="relative border-4 border-slate-950 p-1.5 sm:p-2 rounded-lg">
                  <div className="border-2 border-amber-600 p-2 sm:p-4 rounded">
                    <div className="border border-slate-900/60 p-4 sm:p-8 text-center space-y-4 sm:space-y-6 relative">
                      
                      {/* Four Ornate Corner Flourishes */}
                      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-amber-600" />
                      <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-amber-600" />
                      <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-amber-600" />
                      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-amber-600" />

                      {/* Header Crest Emblem */}
                      <div className="inline-flex flex-col items-center">
                        <div className="px-5 py-1 rounded bg-slate-950 text-amber-300 border border-amber-500/60 text-[9px] sm:text-xs font-black tracking-widest uppercase shadow">
                          CODEX ACADEMY OF SOFTWARE ENGINEERING
                        </div>
                        <div className="w-6 h-6 -mt-1 bg-amber-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-slate-950 font-black text-[10px] shadow">
                          ★
                        </div>
                      </div>

                      {/* Main Title */}
                      <div className="space-y-1">
                        <h1 className="text-xl sm:text-3xl font-black font-serif text-slate-950 tracking-wider">
                          DIPLOMA OFICIAL DE FINALIZACIÓN
                        </h1>
                        <p className="text-[10px] sm:text-xs font-sans text-slate-600 tracking-wide">
                          Acreditación Académica y Profesional con Validez Digital
                        </p>
                      </div>

                      {/* Recipient Statement */}
                      <p className="text-[11px] sm:text-xs italic font-serif text-slate-600">
                        El Consejo de Evaluación Técnica y Certificación hace constar que:
                      </p>

                      {/* Student Name */}
                      <div className="space-y-1">
                        <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-amber-700 tracking-wide uppercase drop-shadow-sm">
                          {studentName}
                        </h2>
                        <div className="flex items-center justify-center space-x-2 text-amber-600">
                          <span className="h-[1.5px] w-12 sm:w-28 bg-amber-600" />
                          <span className="text-xs">✦</span>
                          <span className="h-[1.5px] w-12 sm:w-28 bg-amber-600" />
                        </div>
                      </div>

                      {/* Course Attribution */}
                      <div className="space-y-2 max-w-xl mx-auto">
                        <p className="text-[11px] sm:text-xs text-slate-700">
                          Ha completado de forma satisfactoria las evaluaciones prácticas y proyectos del programa:
                        </p>
                        
                        <div className="bg-slate-950 text-white py-2 px-4 rounded-xl border border-amber-500/50 shadow-md">
                          <h3 className="text-sm sm:text-lg font-black uppercase tracking-wider text-white">
                            {course.title}: {course.subtitle}
                          </h3>
                        </div>

                        <p className="text-[10px] sm:text-xs text-emerald-800 font-bold bg-emerald-100/80 border border-emerald-300 py-1 px-3 rounded-full inline-block">
                          CALIFICACIÓN FINAL: 100 / 100 • NOTA SOBRESALIENTE CON HONORES
                        </p>
                      </div>

                      {/* FOOTER: SELLO DIGITAL, CÓDIGO DE VERIFICACIÓN Y FIRMAS */}
                      <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        
                        {/* 1. Sello Digital de Excelencia (Left) */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-500 p-1 shadow-lg flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-slate-950 border-2 border-amber-300 p-2 flex flex-col items-center justify-center text-center">
                              <span className="text-[7px] font-black uppercase text-amber-400 tracking-tighter">
                                SELLO DIGITAL
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-black text-white leading-tight">
                                VERIFICADO
                              </span>
                              <span className="text-[6px] font-mono text-amber-300 mt-0.5">
                                ★ CODEX ★
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 mt-1 uppercase tracking-wider">
                            Firma Criptográfica
                          </span>
                        </div>

                        {/* 2. Código de Verificación y Código de Barras (Center) */}
                        <div className="bg-slate-100/90 border border-slate-300 p-2.5 rounded-xl space-y-1 text-center shadow-inner">
                          <p className="text-[8px] sm:text-[9px] font-bold text-slate-900 uppercase">
                            Código Oficial de Verificación
                          </p>
                          <p className="text-xs sm:text-sm font-mono font-black text-amber-700">
                            {certCode}
                          </p>
                          
                          {/* Simulated Barcode */}
                          <div className="flex items-center justify-center space-x-[2px] h-5 py-0.5 overflow-hidden">
                            {[12, 18, 14, 20, 10, 16, 22, 14, 18, 12, 20, 15, 10, 18, 14, 20, 12, 16, 22, 14, 18].map((h, i) => (
                              <div 
                                key={i} 
                                className="bg-slate-900 w-[2px]" 
                                style={{ height: `${h}px` }} 
                              />
                            ))}
                          </div>

                          <p className="text-[8px] font-mono text-slate-600">
                            Emisión: {currentDate}
                          </p>
                        </div>

                        {/* 3. Firmas Académicas Autorizadas (Right) */}
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="text-center w-full">
                            <p className="font-serif italic text-sm text-slate-950 leading-none">
                              Carlos A. Mendoza
                            </p>
                            <div className="w-32 mx-auto border-b border-slate-700 my-1" />
                            <p className="text-[9px] font-bold text-slate-900">Ing. Carlos A. Mendoza</p>
                            <p className="text-[8px] text-slate-600">Director Académico CODEX</p>
                          </div>

                          <div className="text-center w-full">
                            <p className="font-serif italic text-sm text-slate-950 leading-none">
                              María F. Gómez
                            </p>
                            <div className="w-32 mx-auto border-b border-slate-700 my-1" />
                            <p className="text-[9px] font-bold text-slate-900">Dra. María F. Gómez</p>
                            <p className="text-[8px] text-slate-600">Decana de Certificaciones</p>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>

              </div>

              {/* Action Bar for Preview */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Diploma generado en alta resolución vectorial con metadatos de validación institucional.</span>
                </div>

                <button
                  onClick={handleDownloadCert}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGenerating ? 'Generando PDF...' : 'Descargar Diploma Oficial (PDF)'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* DOCUMENTS AND DOWNLOAD OPTIONS VIEW */
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Documentos Académicos Oficiales Listos para Descarga</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Descarga tus acreditaciones con sellos de autenticidad para tu portafolio, currículum vitae o LinkedIn.
                </p>
              </div>

              {/* Option 1: Certificate PDF */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl gap-4 shadow-xl">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Certificado Oficial de Finalización (PDF)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Diploma con marco formal, código de verificación y sello digital. Ideal para imprimir o adjuntar profesionalmente.
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-300 font-semibold">
                      <span>✓ Marco formal dorado</span>
                      <span>•</span>
                      <span>✓ Sello digital</span>
                      <span>•</span>
                      <span>✓ Código único</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadCert}
                  disabled={isGenerating}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGenerating ? 'Generando...' : 'Descargar Diploma PDF'}</span>
                </button>
              </div>

              {/* Option 2: Learning & Grade Report PDF */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl gap-4 shadow-xl">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shrink-0">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Reporte de Notas y Aprendizaje (PDF)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Desglose técnico y analítico de todas las {course.lessons.length} lecciones prácticas, ejercicios ejecutados y competencias obtenidas.
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-indigo-300 font-semibold">
                      <span>✓ Calificación 100/100</span>
                      <span>•</span>
                      <span>✓ Desglose por módulos</span>
                      <span>•</span>
                      <span>✓ Rúbrica técnica</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadReport}
                  className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Reporte PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            Estudiante acreditado: <span className="text-white font-bold">{studentName}</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-colors cursor-pointer ml-auto"
          >
            Cerrar Ventana
          </button>
        </div>
      </motion.div>
    </div>
    </AnimatePresence>
  );
};
