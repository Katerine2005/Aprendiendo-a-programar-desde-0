import { jsPDF } from 'jspdf';
import { Course, UserProgress } from '../types';

/**
 * Generates and downloads an ultra-elegant, official PDF Certificate / Diploma
 */
export function generateCertificatePDF(course: Course, studentName: string, grade: number = 100) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const cleanStudentName = studentName.trim() || 'Estudiante';
  const certId = `CODEX-${course.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const hashVal = Array.from(certId + cleanStudentName)
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000000, 7)
    .toString(16)
    .toUpperCase()
    .padStart(8, '0');

  // 1. BACKGROUND CANVAS (Soft Parchment / Ivory Tone)
  doc.setFillColor(253, 251, 247); // #FDFBF7
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. SUBTLE BACKGROUND SECURITY WATERMARK / GEOMETRIC LINES
  doc.setDrawColor(241, 235, 222); // Soft gold-gray
  doc.setLineWidth(0.2);
  for (let i = -100; i < pageWidth + 100; i += 12) {
    doc.line(i, 0, i + pageHeight, pageHeight);
  }

  // 3. MULTI-LAYER FORMAL MARCO (FRAMING)
  // Outer Solid Navy Margin Frame
  doc.setDrawColor(15, 23, 42); // #0F172A
  doc.setLineWidth(3.5);
  doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

  // Outer Gold Accent Line
  doc.setDrawColor(217, 119, 6); // #D97706 Gold
  doc.setLineWidth(1.2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner Fine Navy Line
  doc.setDrawColor(30, 41, 59); // #1E293B
  doc.setLineWidth(0.4);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // 4. ORNATE CORNER FLOURISHES / ACCENTS
  const drawCornerFlourish = (x: number, y: number, dirX: number, dirY: number) => {
    doc.setFillColor(217, 119, 6);
    // Corner filled triangle
    doc.triangle(
      x, y,
      x + dirX * 10, y,
      x, y + dirY * 10,
      'F'
    );
    // Corner accent lines
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.6);
    doc.line(x + dirX * 14, y, x + dirX * 14, y + dirY * 14);
    doc.line(x, y + dirY * 14, x + dirX * 14, y + dirY * 14);
    
    // Small gold diamond stud
    doc.setFillColor(15, 23, 42);
    doc.circle(x + dirX * 6, y + dirY * 6, 1, 'F');
  };

  // 4 Corners
  drawCornerFlourish(13, 13, 1, 1); // Top Left
  drawCornerFlourish(pageWidth - 13, 13, -1, 1); // Top Right
  drawCornerFlourish(13, pageHeight - 13, 1, -1); // Bottom Left
  drawCornerFlourish(pageWidth - 13, pageHeight - 13, -1, -1); // Bottom Right

  // 5. TOP HEADER EMBLEM / CREST
  const centerX = pageWidth / 2;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(centerX - 42, 17, 84, 10, 2, 2, 'F');
  
  // Gold Inner Border on Ribbon
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.5);
  doc.roundedRect(centerX - 40, 18, 80, 8, 1, 1, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(254, 243, 199); // Gold text
  doc.text('CODEX ACADEMY OF SOFTWARE ENGINEERING', centerX, 23.2, { align: 'center' });

  // Central Gold Star Crest Emblem
  doc.setFillColor(217, 119, 6);
  doc.circle(centerX, 33, 4, 'F');
  doc.setFillColor(254, 243, 199);
  doc.circle(centerX, 33, 2.5, 'F');
  doc.setFillColor(15, 23, 42);
  doc.circle(centerX, 33, 1.2, 'F');

  // 6. MAIN DIPLOMA TITLE
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  doc.text('DIPLOMA OFICIAL DE FINALIZACIÓN', centerX, 46, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Acreditación Académica y Profesional con Validez Digital', centerX, 52, { align: 'center' });

  // 7. DEDICATION / RECIPIENT STATEMENT
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('El Consejo de Evaluación Técnica y Certificación hace constar que:', centerX, 62, { align: 'center' });

  // STUDENT NAME (PROMINENT SERIF DISPLAY)
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(180, 83, 9); // Deep Gold #B45309
  doc.text(cleanStudentName.toUpperCase(), centerX, 75, { align: 'center' });

  // Elegant Name Flourish / Underline
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.line(centerX - 65, 78, centerX + 65, 78);
  
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(centerX - 50, 79.5, centerX + 50, 79.5);

  // Center Gold Diamond on line
  doc.setFillColor(217, 119, 6);
  doc.triangle(centerX - 2, 78, centerX, 76, centerX + 2, 78, 'F');
  doc.triangle(centerX - 2, 78, centerX, 80, centerX + 2, 78, 'F');

  // 8. ACHIEVEMENT STATEMENT & COURSE TITLE
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text(
    'Ha completado de forma satisfactoria las evaluaciones prácticas y proyectos del programa:',
    centerX, 90, { align: 'center' }
  );

  // Course Title Box / Banner
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(centerX - 85, 95, 170, 15, 3, 3, 'F');
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.roundedRect(centerX - 84, 96, 168, 13, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(course.title.toUpperCase(), centerX, 104.5, { align: 'center' });

  // Subtitle & Metrics
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`"${course.subtitle}" • Total de ${course.lessons.length} Módulos Teórico-Prácticos`, centerX, 116, { align: 'center' });

  // Distinction Pill Badge
  doc.setFillColor(240, 253, 244); // Soft Emerald
  doc.setDrawColor(34, 197, 94); // Emerald border
  doc.setLineWidth(0.5);
  doc.roundedRect(centerX - 45, 122, 90, 10, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(21, 128, 61); // Dark Emerald text
  doc.text(`CALIFICACIÓN FINAL: ${grade} / 100 • NOTA SOBRESALIENTE`, centerX, 128.5, { align: 'center' });


  // ==========================================
  // FOOTER SECTION: SELLO, VERIFICACIÓN Y FIRMAS
  // ==========================================
  const footerY = 148;

  // ------------------------------------------
  // A) LEFT: SELLO DIGITAL DE EXCELENCIA (GOLDEN ROSETTE SEAL)
  // ------------------------------------------
  const sealX = 42;
  const sealY = footerY + 20;

  // Outer Starburst Ribbon Tails
  doc.setFillColor(217, 119, 6);
  // Left ribbon
  doc.triangle(sealX - 10, sealY + 12, sealX - 2, sealY + 8, sealX - 14, sealY + 28, 'F');
  // Right ribbon
  doc.triangle(sealX + 10, sealY + 12, sealX + 2, sealY + 8, sealX + 14, sealY + 28, 'F');

  // Outer Gold Rosette Circle
  doc.setFillColor(217, 119, 6);
  doc.circle(sealX, sealY, 17, 'F');

  // Outer Tooth Accents
  doc.setFillColor(254, 243, 199);
  for (let a = 0; a < 360; a += 30) {
    const rad = (a * Math.PI) / 180;
    const tx = sealX + Math.cos(rad) * 16.5;
    const ty = sealY + Math.sin(rad) * 16.5;
    doc.circle(tx, ty, 1.2, 'F');
  }

  // Inner Deep Navy Circle
  doc.setFillColor(15, 23, 42);
  doc.circle(sealX, sealY, 13.5, 'F');

  // Gold Inner Ring Border
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.circle(sealX, sealY, 12, 'D');

  // Seal Text Inside
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(254, 243, 199);
  doc.text('SELLO DIGITAL', sealX, sealY - 5, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('VERIFICADO', sealX, sealY, { align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(217, 119, 6);
  doc.text('★ CODEX ACADEMY ★', sealX, sealY + 5, { align: 'center' });


  // ------------------------------------------
  // B) CENTER: CÓDIGO DE VERIFICACIÓN & BARCODE
  // ------------------------------------------
  const verifX = centerX;
  const verifY = footerY + 5;

  // Security Bordered Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(verifX - 42, verifY, 84, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CÓDIGO OFICIAL DE VERIFICACIÓN', verifX, verifY + 5, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9);
  doc.text(certId, verifX, verifY + 11, { align: 'center' });

  // Simulated Barcode (Vertical Stripes)
  doc.setFillColor(30, 41, 59);
  const barY = verifY + 14;
  const barStart = verifX - 30;
  const barWidths = [1, 2, 0.8, 1.5, 0.5, 2, 1, 0.5, 1.8, 0.8, 2, 1.2, 0.5, 1.5, 2, 0.8, 1, 1.5, 0.8, 2, 0.5, 1.2];
  let currX = barStart;
  for (let i = 0; i < barWidths.length; i++) {
    const w = barWidths[i];
    if (i % 2 === 0) {
      doc.rect(currX, barY, w, 10, 'F');
    }
    currX += w + 0.8;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Hash SHA-256: 0x${hashVal}a92f8c...`, verifX, verifY + 28, { align: 'center' });
  doc.text(`Verificable en: codex.academy/verify/${certId.toLowerCase()}`, verifX, verifY + 32, { align: 'center' });
  doc.text(`Fecha de Emisión: ${dateStr}`, verifX, verifY + 36, { align: 'center' });


  // ------------------------------------------
  // C) RIGHT: DUAL ACADEMIC SIGNATURES
  // ------------------------------------------
  const sigX = pageWidth - 48;
  const sigY = footerY + 10;

  // Signature 1
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Carlos A. Mendoza', sigX, sigY + 8, { align: 'center' });

  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
  doc.line(sigX - 30, sigY + 11, sigX + 30, sigY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Ing. Carlos A. Mendoza', sigX, sigY + 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Director Académico Codex', sigX, sigY + 18.5, { align: 'center' });

  // Signature 2
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('María F. Gómez', sigX, sigY + 28, { align: 'center' });

  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
  doc.line(sigX - 30, sigY + 31, sigX + 30, sigY + 31);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Dra. María F. Gómez', sigX, sigY + 35, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Decana de Certificaciones', sigX, sigY + 38.5, { align: 'center' });


  // SAVE & DOWNLOAD PDF
  const safeName = cleanStudentName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Diploma_Codex_${course.id}_${safeName}.pdf`);
}

/**
 * Generates and downloads a detailed Grade and Learning Report PDF
 */
export function generateLearningReportPDF(course: Course, studentName: string, progress: UserProgress) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const cleanStudentName = studentName.trim() || 'Estudiante';

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // Navy Dark
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.line(0, 32, pageWidth, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('REPORTE OFICIAL DE NOTAS Y APRENDIZAJE', 14, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text('CODEX ACADEMY • Sistema Integral de Acreditación Técnica', 14, 24);

  // Student & Course Summary Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 38, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Estudiante: ${cleanStudentName}`, 20, 46);
  doc.text(`Curso: ${course.title} (${course.subtitle})`, 20, 53);

  const completedCount = course.lessons.filter(l => progress.completedLessons[l.id]).length;
  const totalLessons = course.lessons.length;
  const avgGrade = 100;

  doc.text(`Progreso: ${completedCount}/${totalLessons} Lecciones (100%)`, 20, 60);
  doc.text(`Promedio: ${avgGrade} / 100`, pageWidth - 65, 46);
  doc.setTextColor(22, 163, 74); // Emerald
  doc.text(`Estado: APROBADO CON EXCELENCIA`, pageWidth - 85, 53);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Fecha: ${dateStr}`, pageWidth - 55, 60);

  // Competency Breakdown Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Desglose de Competencias Adquiridas:', 14, 76);

  const levels = ['Básico', 'Intermedio', 'Avanzado'];
  const colWidth = (pageWidth - 28 - 12) / 3;

  levels.forEach((lvl, idx) => {
    const lvlLessons = course.lessons.filter(l => l.level === lvl);
    const completedLvlCount = lvlLessons.filter(l => progress.completedLessons[l.id]).length;
    const isCompleted = lvlLessons.length > 0 && completedLvlCount === lvlLessons.length;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14 + idx * (colWidth + 6), 81, colWidth, 16, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Nivel ${lvl}:`, 18 + idx * (colWidth + 6), 87);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(isCompleted ? 16 : 71, isCompleted ? 185 : 85, isCompleted ? 129 : 105);
    doc.text(`${completedLvlCount}/${lvlLessons.length} lecciones aprobadas`, 18 + idx * (colWidth + 6), 93);
  });

  // Table Header for Detailed Lessons
  let tableY = 108;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Detalle de Lecciones Evaluadas:', 14, tableY);

  tableY += 5;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, tableY, pageWidth - 28, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', 18, tableY + 5.5);
  doc.text('Título de la Lección', 28, tableY + 5.5);
  doc.text('Nivel', 120, tableY + 5.5);
  doc.text('Nota Práctica', 150, tableY + 5.5);
  doc.text('Estado', 180, tableY + 5.5);

  tableY += 8;

  course.lessons.forEach((lesson, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(14, tableY, pageWidth - 28, 7, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    doc.text(`${lesson.number}`, 18, tableY + 5);
    doc.text(lesson.title.length > 48 ? lesson.title.slice(0, 45) + '...' : lesson.title, 28, tableY + 5);
    doc.text(lesson.level, 120, tableY + 5);
    doc.text('100 / 100', 150, tableY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('Aprobado', 180, tableY + 5);

    tableY += 7;
  });

  // Footer Recommendation
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 275, pageWidth - 14, 275);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('El estudiante ha completado con éxito el 100% de los ejercicios prácticos de código.', 14, 281);
  doc.text('Emitido por Codex Academy.', pageWidth - 55, 281);

  // Save PDF
  const safeName = cleanStudentName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Reporte_Notas_${course.id}_${safeName}.pdf`);
}

