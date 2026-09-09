export type CourseId = 
  | 'cpp' 
  | 'python' 
  | 'javascript' 
  | 'java' 
  | 'nodejs' 
  | 'rust' 
  | 'sql' 
  | 'html-css';

export type DifficultyLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export type UserRole = 'administrador' | 'estudiante';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  country: string;
  birthDate: string;
  avatarUrl?: string;
  termsAccepted: boolean;
  createdAt: string;
  enrolledCourses?: CourseId[];
}

export interface TestCase {
  id: string;
  description: string;
  input?: string;
  expectedOutput: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  level: DifficultyLevel;
  summary: string;
  theoryMarkdown: string;
  instructions: string;
  initialCode: string;
  solutionCode: string;
  testCases: TestCase[];
  hint: string;
}

export interface Course {
  id: CourseId;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badgeBg: string;
  description: string;
  lessons: Lesson[];
}

export interface CertificateData {
  courseId: CourseId;
  courseTitle: string;
  studentName: string;
  issuedDate: string;
  grade: number;
  certificateId: string;
  totalLessons: number;
}

export interface UserProgress {
  studentName: string;
  completedLessons: Record<string, boolean>; // lessonId -> boolean
  lessonScores: Record<string, number>; // lessonId -> score (0-100)
  savedCode: Record<string, string>; // lessonId -> code string
  currentLessonId: Record<CourseId, string>; // courseId -> last active lessonId
}

