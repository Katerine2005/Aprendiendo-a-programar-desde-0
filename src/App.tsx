import React, { useState, useEffect } from 'react';
import { CourseId, Course, UserProgress, UserProfile } from './types';
import { COURSES, getCourseById } from './data/coursesData';
import { Header } from './components/Header';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseWorkspace } from './components/CourseWorkspace';
import { CertificateModal } from './components/CertificateModal';
import { LandingIndex } from './components/LandingIndex';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentProfileView, ProfileTab } from './components/StudentProfileView';
import { getActiveUserSession, setActiveUserSession, isCoursePurchased, unlockCourseForStudent } from './services/authService';

const LOCAL_STORAGE_KEY = 'codex_app_user_progress';

const initialProgress: UserProgress = {
  studentName: 'Estudiante CODEX',
  completedLessons: {},
  lessonScores: {},
  savedCode: {},
  currentLessonId: {
    cpp: 'cpp-1',
    python: 'py-1',
    javascript: 'js-1',
    java: 'java-1',
    nodejs: 'node-1',
    rust: 'rust-1',
    sql: 'sql-1',
    'html-css': 'hc-1'
  }
};

export default function App() {
  // Active User session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getActiveUserSession());

  // App view navigation: 'landing' | 'catalog' | 'admin'
  const [viewMode, setViewMode] = useState<'landing' | 'catalog' | 'admin'>(() => {
    const session = getActiveUserSession();
    if (session?.role === 'administrador') return 'admin';
    if (session?.role === 'estudiante') return 'catalog';
    return 'landing';
  });

  // Auth modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Load progress from localStorage if available
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading progress:', e);
    }
    return initialProgress;
  });

  const [activeCourseId, setActiveCourseId] = useState<CourseId | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [certModalCourse, setCertModalCourse] = useState<Course | null>(null);
  const [isProfileView, setIsProfileView] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<ProfileTab>('perfil');
  const [profileHighlightCourseId, setProfileHighlightCourseId] = useState<CourseId | null>(null);

  // Sync progress student name with active user profile
  useEffect(() => {
    if (currentUser?.fullName) {
      setProgress(prev => ({
        ...prev,
        studentName: currentUser.fullName
      }));
    }
  }, [currentUser]);

  // Sync progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [progress]);

  // Handle dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'administrador') {
      setViewMode('admin');
    } else {
      setViewMode('catalog');
    }
  };

  const handleLogout = () => {
    setActiveUserSession(null);
    setCurrentUser(null);
    setActiveCourseId(null);
    setIsProfileView(false);
    setCertModalCourse(null);
    setIsAuthModalOpen(false);
    setViewMode('landing');
  };

  // Handler for marking lesson as completed
  const handleCompleteLesson = (lessonId: string) => {
    setProgress(prev => {
      const updatedCompleted = { ...prev.completedLessons, [lessonId]: true };
      
      if (activeCourseId) {
        const activeCourse = getCourseById(activeCourseId);
        if (activeCourse) {
          const allDone = activeCourse.lessons.every(l => updatedCompleted[l.id]);
          if (allDone && !activeCourse.lessons.every(l => prev.completedLessons[l.id])) {
            setCertModalCourse(activeCourse);
          }
        }
      }

      return {
        ...prev,
        completedLessons: updatedCompleted,
        lessonScores: { ...prev.lessonScores, [lessonId]: 100 }
      };
    });
  };

  // Handler for saving lesson code
  const handleSaveCode = (lessonId: string, code: string) => {
    setProgress(prev => ({
      ...prev,
      savedCode: { ...prev.savedCode, [lessonId]: code }
    }));
  };

  // Handler for updating student name
  const handleUpdateStudentName = (name: string) => {
    setProgress(prev => ({
      ...prev,
      studentName: name
    }));
  };

  const activeCourse = activeCourseId ? getCourseById(activeCourseId) : null;

  // Render Admin Dashboard if user is Admin and in admin view
  if (currentUser?.role === 'administrador' && viewMode === 'admin' && !activeCourse) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <AdminDashboard
          currentUser={currentUser}
          progress={progress}
          onLogout={handleLogout}
          onViewCourseAsPreview={(courseId) => {
            setActiveCourseId(courseId);
          }}
        />

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  // Render Landing Index if user is not logged in or in landing mode, and no course preview is active
  if ((!currentUser || viewMode === 'landing') && !activeCourse) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <LandingIndex
          onOpenAuthModal={handleOpenAuthModal}
          onPreviewCourse={(courseId) => {
            setActiveCourseId(courseId);
          }}
        />

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        progress={progress}
        onUpdateStudentName={handleUpdateStudentName}
        onGoHome={() => {
          setIsProfileView(false);
          setActiveCourseId(null);
          if (currentUser?.role === 'administrador') {
            setViewMode('admin');
          } else if (currentUser?.role === 'estudiante') {
            setViewMode('catalog');
          } else {
            setViewMode('landing');
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeCourseTitle={activeCourse?.title}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onOpenProfileModal={() => {
          setActiveCourseId(null);
          setIsProfileView(true);
        }}
      />

      {/* Mode Switch Bar for Admin to switch between Admin Panel & Student View */}
      {currentUser?.role === 'administrador' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-bold text-amber-400">
            Modo Administrador Activo
          </span>
          <button
            onClick={() => {
              setIsProfileView(false);
              setActiveCourseId(null);
              setViewMode(viewMode === 'admin' ? 'catalog' : 'admin');
            }}
            className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
          >
            {viewMode === 'admin' ? 'Ver Vista Estudiante' : 'Volver a Panel Administrador'}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pb-16">
        {isProfileView ? (
          <StudentProfileView
            currentUser={currentUser}
            progress={progress}
            courses={COURSES}
            initialTab={profileInitialTab}
            highlightCourseId={profileHighlightCourseId}
            onSelectCourse={(courseId) => {
              if (currentUser && !isCoursePurchased(courseId, currentUser)) {
                setProfileInitialTab('pagos');
                setProfileHighlightCourseId(courseId);
                return;
              }
              setIsProfileView(false);
              setActiveCourseId(courseId);
            }}
            onViewCertificate={(course) => setCertModalCourse(course)}
            onBackToCatalog={() => {
              setProfileInitialTab('perfil');
              setProfileHighlightCourseId(null);
              setIsProfileView(false);
            }}
            onLogout={() => {
              setIsProfileView(false);
              handleLogout();
            }}
            onUnlockCourse={(courseId) => {
              if (currentUser) {
                const updated = unlockCourseForStudent(currentUser.id, courseId);
                if (updated) {
                  setCurrentUser({ ...updated });
                }
              }
            }}
          />
        ) : activeCourse ? (
          <CourseWorkspace
            course={activeCourse}
            progress={progress}
            onCompleteLesson={handleCompleteLesson}
            onSaveCode={handleSaveCode}
            onBackToCatalog={() => setActiveCourseId(null)}
            onOpenCertificateModal={() => setCertModalCourse(activeCourse)}
          />
        ) : viewMode === 'landing' ? (
          <LandingIndex
            onOpenAuthModal={handleOpenAuthModal}
            onPreviewCourse={(courseId) => {
              if (currentUser) {
                if (!isCoursePurchased(courseId, currentUser)) {
                  setProfileInitialTab('pagos');
                  setProfileHighlightCourseId(courseId);
                  setIsProfileView(true);
                  return;
                }
                setActiveCourseId(courseId);
              } else {
                handleOpenAuthModal('login');
              }
            }}
          />
        ) : viewMode === 'admin' ? (
          <AdminDashboard
            currentUser={currentUser || undefined}
            progress={progress}
            onLogout={handleLogout}
            onViewCourseAsPreview={(courseId) => setActiveCourseId(courseId)}
          />
        ) : (
          <CourseCatalog
            courses={COURSES}
            progress={progress}
            currentUser={currentUser}
            onSelectCourse={(courseId) => {
              if (currentUser && !isCoursePurchased(courseId, currentUser)) {
                setProfileInitialTab('pagos');
                setProfileHighlightCourseId(courseId);
                setIsProfileView(true);
                return;
              }
              setActiveCourseId(courseId);
            }}
            onViewCertificate={(course) => setCertModalCourse(course)}
            onGoToPaymentArea={(courseId) => {
              setProfileInitialTab('pagos');
              setProfileHighlightCourseId(courseId || null);
              setIsProfileView(true);
            }}
          />
        )}
      </main>

      {/* Certificate & Grade Report Modal */}
      {certModalCourse && (
        <CertificateModal
          course={certModalCourse}
          progress={progress}
          onClose={() => setCertModalCourse(null)}
        />
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}

