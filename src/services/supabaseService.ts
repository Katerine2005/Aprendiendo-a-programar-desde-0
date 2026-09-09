import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, CourseId } from '../types';
import { StoredUser } from './authService';
import { TransactionRecord } from './transactionService';

/**
 * SERVICIO INTEGRADO DE SUPABASE PARA CODEX
 * Gestiona la sincronización en tiempo real con PostgreSQL
 */

export const supabaseService = {
  // --------------------------------------------------------------------------
  // 1. USUARIOS Y PERFILES
  // --------------------------------------------------------------------------
  async syncUserToSupabase(user: StoredUser): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase.from('users_profile').upsert({
        full_name: user.fullName,
        username: user.username,
        email: user.email,
        password_hash: user.passwordHash,
        role: user.role,
        country: user.country || 'Honduras',
        birth_date: user.birthDate || null,
        avatar_url: user.avatarUrl,
        terms_accepted: user.termsAccepted
      }, { onConflict: 'email' });

      if (error) {
        console.warn('[Supabase] Error al sincronizar usuario:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Excepción en syncUserToSupabase:', e);
      return false;
    }
  },

  async loginWithSupabase(emailOrUsername: string, passwordPlain: string): Promise<StoredUser | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const isEmail = emailOrUsername.includes('@');
      const query = supabase
        .from('users_profile')
        .select('*')
        .eq(isEmail ? 'email' : 'username', emailOrUsername.trim().toLowerCase());

      const { data, error } = await query.single();
      if (error || !data) return null;

      if (data.password_hash === passwordPlain) {
        // Cargar cursos comprados
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('course_id')
          .eq('user_id', data.id)
          .eq('is_unlocked', true);

        const enrolledList = (enrollments || []).map((e: any) => e.course_id as CourseId);

        return {
          id: data.id,
          fullName: data.full_name,
          username: data.username,
          email: data.email,
          passwordHash: data.password_hash,
          role: data.role as any,
          country: data.country,
          birthDate: data.birth_date,
          avatarUrl: data.avatar_url,
          termsAccepted: data.terms_accepted,
          createdAt: data.created_at,
          enrolledCourses: enrolledList
        };
      }
    } catch (e) {
      console.warn('[Supabase] Error en loginWithSupabase:', e);
    }
    return null;
  },

  // --------------------------------------------------------------------------
  // 2. REGISTRO DE TRANSACCIONES Y DESBLOQUEO DE CURSOS
  // --------------------------------------------------------------------------
  async recordTransaction(txn: TransactionRecord, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const numericAmount = parseFloat(txn.amount.replace(/[^0-9.]/g, '')) || 5.00;

      // 1. Guardar la transacción
      const { error: txnError } = await supabase.from('transactions').insert({
        id: txn.id,
        user_id: userId && userId.length > 20 ? userId : null,
        student_name: txn.studentName,
        student_email: txn.studentEmail,
        plan_name: txn.planName,
        course_id: txn.courseId || null,
        amount_usd: numericAmount,
        amount_formatted: txn.amount,
        gateway: txn.method,
        status: txn.status
      });

      if (txnError) {
        console.warn('[Supabase] Error guardando transacción:', txnError.message);
      }

      // 2. Si es compra de curso, desbloquear en inscripciones
      if (txn.courseId && userId && userId.length > 20) {
        await supabase.from('course_enrollments').upsert({
          user_id: userId,
          course_id: txn.courseId,
          enrollment_type: 'comprado',
          price_paid: numericAmount,
          is_unlocked: true
        }, { onConflict: 'user_id,course_id' });
      }

      return true;
    } catch (e) {
      console.warn('[Supabase] Excepción en recordTransaction:', e);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // 3. PROGRESO Y LECCIONES
  // --------------------------------------------------------------------------
  async saveLessonProgress(userId: string, courseId: CourseId, lessonId: string, savedCode?: string): Promise<void> {
    if (!isSupabaseConfigured || !userId || userId.length < 20) return;

    try {
      await supabase.from('student_lesson_progress').upsert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        is_completed: true,
        saved_code: savedCode || null,
        last_accessed_at: new Date().toISOString()
      }, { onConflict: 'user_id,course_id,lesson_id' });
    } catch (e) {
      console.warn('[Supabase] Error guardando progreso:', e);
    }
  },

  // --------------------------------------------------------------------------
  // 4. CERTIFICADOS
  // --------------------------------------------------------------------------
  async issueCertificate(certificateCode: string, studentName: string, courseId: CourseId, courseTitle: string, finalGrade: number, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase.from('certificates').insert({
        certificate_code: certificateCode,
        user_id: userId && userId.length > 20 ? userId : null,
        student_name: studentName,
        course_id: courseId,
        course_title: courseTitle,
        final_grade: finalGrade,
        verification_url: `${window.location.origin}?cert=${certificateCode}`
      });

      return !error;
    } catch (e) {
      console.warn('[Supabase] Error emitiendo certificado:', e);
      return false;
    }
  }
};
