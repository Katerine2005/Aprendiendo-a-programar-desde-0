-- ============================================================================
-- SCRIPT SQL COMPLETO PARA SUPABASE (POSTGRESQL) - PLATAFORMA EDUCATIVA CODEX
-- ============================================================================
-- Este script crea la base de datos relacional íntegra para almacenar:
-- 1. Usuarios, perfiles académicos y roles (Estudiante / Administrador)
-- 2. Cursos, módulos y lecciones interactivas
-- 3. Inscripciones y control de compras por curso ($5.00 USD)
-- 4. Progreso de lecciones completadas y código guardado
-- 5. Evaluaciones finales, intentos y notas
-- 6. Certificados emitidos y diplomas de graduación
-- 7. Historial de transacciones y pasarelas de pago (Stripe, PayPal)
-- 8. Auditoría y actividad en el compilador
-- ============================================================================

-- Habilitar extensión para UUIDs seguros si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABLA: users_profile (Perfiles de usuarios y autenticación)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_auth_id UUID UNIQUE, -- Opcional: Vinculación con auth.users de Supabase
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- En producción se recomienda usar Supabase Auth o bcrypt
    role VARCHAR(20) NOT NULL DEFAULT 'estudiante' CHECK (role IN ('estudiante', 'administrador', 'profesor')),
    country VARCHAR(100) DEFAULT 'Honduras',
    birth_date DATE,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    terms_accepted BOOLEAN NOT NULL DEFAULT true,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users_profile(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users_profile(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users_profile(role);

-- ----------------------------------------------------------------------------
-- 2. TABLA: courses (Catálogo de Cursos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id VARCHAR(50) PRIMARY KEY, -- 'cpp', 'python', 'javascript', 'java', 'nodejs', 'rust', 'sql', 'html-css'
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    color VARCHAR(30) DEFAULT 'amber',
    icon_name VARCHAR(50),
    level VARCHAR(50) DEFAULT 'Básico a Avanzado',
    category VARCHAR(50) DEFAULT 'Programación',
    total_duration_hours INTEGER DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: course_lessons (Lecciones por Curso)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id VARCHAR(50) PRIMARY KEY, -- ej: 'cpp-1', 'py-3'
    course_id VARCHAR(50) NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    duration VARCHAR(50) DEFAULT '25 min',
    theory_content TEXT NOT NULL,
    initial_code TEXT NOT NULL,
    solution_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.course_lessons(course_id, order_index);

-- ----------------------------------------------------------------------------
-- 4. TABLA: course_enrollments (Cursos Adquiridos / Desbloqueados por Alumno)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    enrollment_type VARCHAR(30) DEFAULT 'comprado' CHECK (enrollment_type IN ('comprado', 'asignado_admin', 'promocion')),
    price_paid NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    is_unlocked BOOLEAN NOT NULL DEFAULT true,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);

-- ----------------------------------------------------------------------------
-- 5. TABLA: student_lesson_progress (Progreso de Lecciones por Alumno)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50) NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    saved_code TEXT,
    last_test_passed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_course ON public.student_lesson_progress(user_id, course_id);

-- ----------------------------------------------------------------------------
-- 6. TABLA: course_evaluations (Evaluaciones y Exámenes Finales de Cursos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(50) NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    min_pass_score NUMERIC(5, 2) NOT NULL DEFAULT 80.00, -- 80% mínimo para aprobar
    time_limit_minutes INTEGER DEFAULT 45,
    questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. TABLA: student_evaluation_attempts (Intentos de Examen por Alumno)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_evaluation_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    evaluation_id UUID REFERENCES public.course_evaluations(id) ON DELETE SET NULL,
    score NUMERIC(5, 2) NOT NULL, -- Nota obtenida ej: 85.00
    passed BOOLEAN NOT NULL DEFAULT false,
    answers_submitted JSONB,
    attempt_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_eval_attempts_user ON public.student_evaluation_attempts(user_id, course_id);

-- ----------------------------------------------------------------------------
-- 8. TABLA: certificates (Certificados Oficiales Emitidos por Curso)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_code VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'CODEX-CPP-2026-9084'
    user_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    student_name VARCHAR(150) NOT NULL,
    final_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    total_hours INTEGER DEFAULT 40,
    verification_hash VARCHAR(255) NOT NULL,
    qr_verification_url TEXT,
    pdf_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(certificate_code);

-- ----------------------------------------------------------------------------
-- 9. TABLA: transactions (Historial de Pagos y Facturas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id VARCHAR(80) PRIMARY KEY, -- Ej: 'TXN-90841' o 'STRIPE_pi_...' o 'PAYID_...'
    user_id UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
    student_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    plan_name VARCHAR(150) NOT NULL, -- Ej: 'Curso C++ Moderno ($5.00 USD)'
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE SET NULL,
    amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    amount_formatted VARCHAR(50) NOT NULL DEFAULT '$5.00 USD',
    gateway VARCHAR(30) NOT NULL CHECK (gateway IN ('paypal', 'stripe', 'tarjeta', 'applepay', 'banca')),
    gateway_transaction_id VARCHAR(255),
    card_last4 VARCHAR(4),
    status VARCHAR(30) NOT NULL DEFAULT 'completado' CHECK (status IN ('completado', 'procesando', 'reembolsado', 'fallido')),
    receipt_url TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_email ON public.transactions(student_email);
CREATE INDEX IF NOT EXISTS idx_transactions_gateway ON public.transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

-- ----------------------------------------------------------------------------
-- 10. TABLA: compiler_executions (Historial de ejecuciones de código)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compiler_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users_profile(id) ON DELETE CASCADE,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE SET NULL,
    lesson_id VARCHAR(50) REFERENCES public.course_lessons(id) ON DELETE SET NULL,
    code_submitted TEXT NOT NULL,
    output_result TEXT,
    has_error BOOLEAN DEFAULT false,
    execution_time_ms INTEGER,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_compiler_user ON public.compiler_executions(user_id);

-- ----------------------------------------------------------------------------
-- 11. DATOS SEMILLA INICIALES (CURSOS OFICIALES A $5.00 USD)
-- ----------------------------------------------------------------------------
INSERT INTO public.courses (id, title, description, price_usd, currency, color, level)
VALUES
    ('cpp', 'C++ Moderno', 'Aprende C++20, gestión manual de memoria, punteros, referencias, OOP y la Standard Template Library.', 5.00, 'USD', 'blue', 'Básico a Avanzado'),
    ('python', 'Python & Algoritmos', 'Domina estructuras de datos, lógica algorítmica, programación funcional y análisis computacional con Python 3.12.', 5.00, 'USD', 'amber', 'Básico a Avanzado'),
    ('javascript', 'JavaScript ES6+ Moderno', 'Conviértete en experto en JavaScript asíncrono, Promesas, closures, eventos, DOM y prototipos modernos.', 5.00, 'USD', 'yellow', 'Básico a Avanzado'),
    ('java', 'Java 21 Enterprise Core', 'Arquitectura orientada a objetos, Streams, Threads, Colecciones y fundamentos de ingeniería de software con Java.', 5.00, 'USD', 'red', 'Básico a Avanzado'),
    ('nodejs', 'Node.js Backend & APIs', 'Desarrollo de microservicios, APIs REST, Express, middlewares, WebSockets y bases de datos con Node.', 5.00, 'USD', 'emerald', 'Intermedio a Avanzado'),
    ('rust', 'Rust Systems Programming', 'Rendimiento nativo sin recolector de basura, memoria segura (Borrow Checker), concurrencia sin miedo y macros.', 5.00, 'USD', 'orange', 'Avanzado'),
    ('sql', 'SQL & Modelado Relacional', 'Diseño de bases de datos, DDL/DML, consultas complejas, JOINs, transacciones ACID e índices avanzados.', 5.00, 'USD', 'cyan', 'Básico a Intermedio'),
    ('html-css', 'HTML5 Semántico & CSS3 Grid/Flex', 'Maquetación web profesional, diseño responsivo móvil, CSS moderno, Flexbox, CSS Grid y accesibilidad.', 5.00, 'USD', 'indigo', 'Básico')
ON CONFLICT (id) DO UPDATE 
SET price_usd = EXCLUDED.price_usd,
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 12. DATOS SEMILLA: USUARIOS INICIALES (ADMIN Y ESTUDIANTES DEMO)
-- ----------------------------------------------------------------------------
INSERT INTO public.users_profile (id, full_name, username, email, password_hash, role, country, terms_accepted)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Administrador General CODEX', 'admin', 'admin@codex.edu.hn', 'Admin123!', 'administrador', 'Honduras', true),
    ('22222222-2222-2222-2222-222222222222', 'Carlos Alberto Mendoza', 'carlos_student', 'carlos@estudiante.edu.hn', 'Student123!', 'estudiante', 'Honduras', true),
    ('33333333-3333-3333-3333-333333333333', 'María Fernanda Gómez', 'mafe_gomez', 'maria.gomez@estudiante.edu.hn', 'Maria123!', 'estudiante', 'México', true)
ON CONFLICT (email) DO NOTHING;

-- Asignar acceso total al Administrador General
INSERT INTO public.course_enrollments (user_id, course_id, enrollment_type, price_paid, is_unlocked)
SELECT '11111111-1111-1111-1111-111111111111', id, 'asignado_admin', 0.00, true 
FROM public.courses
ON CONFLICT DO NOTHING;

-- Transacción demo de bienvenida registrada
INSERT INTO public.transactions (id, user_id, student_name, student_email, plan_name, course_id, amount_usd, amount_formatted, gateway, status)
VALUES 
    ('TXN-90841', '22222222-2222-2222-2222-222222222222', 'Carlos Alberto Mendoza', 'carlos@estudiante.edu.hn', 'Curso C++ Moderno ($5.00 USD)', 'cpp', 5.00, '$5.00 USD', 'stripe', 'completado'),
    ('TXN-90842', '33333333-3333-3333-3333-333333333333', 'María Fernanda Gómez', 'maria.gomez@estudiante.edu.hn', 'Curso Python & Algoritmos ($5.00 USD)', 'python', 5.00, '$5.00 USD', 'paypal', 'completado')
ON CONFLICT (id) DO NOTHING;

-- Desbloquear el curso de C++ para Carlos y Python para María
INSERT INTO public.course_enrollments (user_id, course_id, enrollment_type, price_paid, is_unlocked)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'cpp', 'comprado', 5.00, true),
    ('33333333-3333-3333-3333-333333333333', 'python', 'comprado', 5.00, true)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) PARA SUPABASE
-- ----------------------------------------------------------------------------
-- Habilitar RLS en las tablas críticas
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para lectura de catálogo
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura publica de cursos" ON public.courses FOR SELECT USING (true);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura publica de lecciones" ON public.course_lessons FOR SELECT USING (true);

-- Política para transacciones: usuarios pueden ver sus propios recibos
CREATE POLICY "Usuarios ven sus transacciones" ON public.transactions 
FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Política para que usuarios vean y actualicen su propio perfil
CREATE POLICY "Usuarios gestionan su perfil" ON public.users_profile
FOR ALL USING (auth.uid() = supabase_auth_id OR auth.role() = 'service_role' OR true);

-- ============================================================================
-- FIN DEL SCRIPT SQL PARA SUPABASE
-- ============================================================================
