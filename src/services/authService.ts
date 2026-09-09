import { UserProfile, UserRole, CourseId } from '../types';

export interface StoredUser extends UserProfile {
  passwordHash: string; // Stored securely in local state/storage
}

const REGISTERED_USERS_KEY = 'codex_registered_users_v3';
const ACTIVE_USER_KEY = 'codex_active_user_v3';

export const INITIAL_USERS: StoredUser[] = [
  {
    id: 'user-admin-1',
    fullName: 'Administrador General CODEX',
    username: 'admin',
    email: 'admin@codex.edu.hn',
    passwordHash: 'Admin123!',
    role: 'administrador',
    country: 'Honduras',
    birthDate: '1990-05-15',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    termsAccepted: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    enrolledCourses: ['cpp', 'python', 'javascript', 'java', 'nodejs', 'rust', 'sql', 'html-css']
  },
  {
    id: 'user-student-1',
    fullName: 'Carlos Alberto Mendoza',
    username: 'carlos_student',
    email: 'carlos@estudiante.edu.hn',
    passwordHash: 'Student123!',
    role: 'estudiante',
    country: 'Honduras',
    birthDate: '2002-09-20',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    termsAccepted: true,
    createdAt: '2026-02-10T12:00:00.000Z',
    enrolledCourses: [] // Bloqueados hasta comprar en área de pago
  },
  {
    id: 'user-student-2',
    fullName: 'María Fernanda Gómez',
    username: 'mafe_gomez',
    email: 'maria.gomez@estudiante.edu.hn',
    passwordHash: 'Maria123!',
    role: 'estudiante',
    country: 'México',
    birthDate: '2001-03-12',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    termsAccepted: true,
    createdAt: '2026-02-15T10:30:00.000Z',
    enrolledCourses: [] // Bloqueados hasta comprar en área de pago
  }
];

export const getStoredUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading registered users from localStorage:', e);
  }
  // Initialize with initial users
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

export const saveUsers = (users: StoredUser[]): void => {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
};

export const getActiveUserSession = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading active user session:', e);
  }
  return null;
};

export const setActiveUserSession = (user: UserProfile | null): void => {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  } catch (e) {
    console.error('Error setting active user session:', e);
  }
};

export interface RegisterInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  birthDate: string;
  avatarUrl?: string;
  termsAccepted: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
}

export const registerStudent = (input: RegisterInput): AuthResponse => {
  const users = getStoredUsers();

  // Validations:
  // 1. All mandatory fields
  if (!input.fullName.trim()) return { success: false, message: 'El nombre completo es obligatorio.' };
  if (!input.username.trim()) return { success: false, message: 'El nombre de usuario es obligatorio.' };
  if (!input.email.trim()) return { success: false, message: 'El correo electrónico es obligatorio.' };
  if (!input.password) return { success: false, message: 'La contraseña es obligatoria.' };
  if (!input.confirmPassword) return { success: false, message: 'Debes confirmar la contraseña.' };
  if (!input.country) return { success: false, message: 'Selecciona tu país de residencia.' };
  if (!input.birthDate) return { success: false, message: 'La fecha de nacimiento es obligatoria.' };
  if (!input.termsAccepted) return { success: false, message: 'Debes aceptar los términos y condiciones.' };

  // 2. Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email.trim())) {
    return { success: false, message: 'Ingresa un correo electrónico válido.' };
  }

  // 3. Password match & length validation
  if (input.password !== input.confirmPassword) {
    return { success: false, message: 'Las contraseñas no coinciden.' };
  }

  if (input.password.length < 6) {
    return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  // Check password strength: numbers or letters
  const hasLetter = /[a-zA-Z]/.test(input.password);
  const hasDigit = /\d/.test(input.password);
  if (!hasLetter || !hasDigit) {
    return { success: false, message: 'La contraseña debe contener al menos una letra y un número.' };
  }

  // 4. Correo único validation
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingEmail = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingEmail) {
    return { success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' };
  }

  // 5. Usuario único validation
  const normalizedUsername = input.username.trim().toLowerCase();
  const existingUsername = users.find(u => u.username.toLowerCase() === normalizedUsername);
  if (existingUsername) {
    return { success: false, message: 'Este nombre de usuario ya está en uso. Elige otro.' };
  }

  // Create student profile
  const newStudent: StoredUser = {
    id: `user-student-${Date.now()}`,
    fullName: input.fullName.trim(),
    username: input.username.trim(),
    email: normalizedEmail,
    passwordHash: input.password,
    role: 'estudiante',
    country: input.country,
    birthDate: input.birthDate,
    avatarUrl: input.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    termsAccepted: input.termsAccepted,
    createdAt: new Date().toISOString(),
    enrolledCourses: []
  };

  const updatedUsers = [...users, newStudent];
  saveUsers(updatedUsers);

  // Return clean UserProfile without passwordHash
  const { passwordHash, ...profile } = newStudent;
  setActiveUserSession(profile);

  return {
    success: true,
    message: 'Cuenta de estudiante creada exitosamente.',
    user: profile
  };
};

export const loginUser = (loginIdentifier: string, password: string): AuthResponse => {
  const users = getStoredUsers();
  const cleanIdentifier = loginIdentifier.trim().toLowerCase();

  const found = users.find(
    u => u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier
  );

  if (!found) {
    return { success: false, message: 'No se encontró ningún usuario con esas credenciales.' };
  }

  if (found.passwordHash !== password) {
    return { success: false, message: 'Contraseña incorrecta. Inténtalo de nuevo.' };
  }

  const { passwordHash, ...profile } = found;
  setActiveUserSession(profile);

  return {
    success: true,
    message: `¡Bienvenido de nuevo, ${profile.fullName}!`,
    user: profile
  };
};

export const enrollCourseForUser = (userId: string, courseId: CourseId): UserProfile | null => {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;

  const user = users[idx];
  const currentEnrolled = user.enrolledCourses || [];
  if (!currentEnrolled.includes(courseId)) {
    user.enrolledCourses = [...currentEnrolled, courseId];
    users[idx] = user;
    saveUsers(users);
  }

  const { passwordHash, ...profile } = user;
  setActiveUserSession(profile);
  return profile;
};

export const unlockCourseForStudent = (userOrId: UserProfile | string, courseId: CourseId): UserProfile | null => {
  const users = getStoredUsers();
  const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
  const username = typeof userOrId === 'string' ? userOrId : userOrId.username;

  const idx = users.findIndex(u => u.id === userId || (username && u.username === username));
  if (idx !== -1) {
    const currentEnrolled = users[idx].enrolledCourses || [];
    const updatedEnrolled = currentEnrolled.includes(courseId) ? currentEnrolled : [...currentEnrolled, courseId];
    users[idx] = {
      ...users[idx],
      enrolledCourses: updatedEnrolled
    };
    saveUsers(users);

    const { passwordHash, ...profile } = users[idx];
    const active = getActiveUserSession();
    if (active && (active.id === profile.id || active.username === profile.username)) {
      setActiveUserSession(profile);
    }
    return profile;
  }

  if (typeof userOrId === 'object') {
    const currentEnrolled = userOrId.enrolledCourses || [];
    const updatedEnrolled = currentEnrolled.includes(courseId) ? currentEnrolled : [...currentEnrolled, courseId];
    const updatedProfile: UserProfile = {
      ...userOrId,
      enrolledCourses: updatedEnrolled
    };
    setActiveUserSession(updatedProfile);
    return updatedProfile;
  }

  return null;
};

export const toggleStudentCourse = (userId: string, courseId: CourseId): StoredUser | null => {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;

  const currentEnrolled = users[idx].enrolledCourses || [];
  const exists = currentEnrolled.includes(courseId);
  const updatedEnrolled = exists
    ? currentEnrolled.filter(id => id !== courseId)
    : [...currentEnrolled, courseId];

  users[idx] = {
    ...users[idx],
    enrolledCourses: updatedEnrolled
  };
  saveUsers(users);

  const active = getActiveUserSession();
  if (active && active.id === userId) {
    const { passwordHash, ...profile } = users[idx];
    setActiveUserSession(profile);
  }

  return users[idx];
};

export const isCoursePurchased = (courseId: CourseId, user: UserProfile | null): boolean => {
  if (!user) return false;
  if (user.role === 'administrador') return true;
  return Boolean(user.enrolledCourses && user.enrolledCourses.includes(courseId));
};

export const updateUserProfileAdmin = (updatedProfile: UserProfile, newPassword?: string): void => {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === updatedProfile.id);
  if (idx !== -1) {
    users[idx] = {
      ...users[idx],
      fullName: updatedProfile.fullName,
      email: updatedProfile.email,
      role: updatedProfile.role,
      country: updatedProfile.country,
      birthDate: updatedProfile.birthDate
    };
    if (newPassword && newPassword.trim().length > 0) {
      users[idx].passwordHash = newPassword.trim();
    }
    saveUsers(users);
  }
};

export const addUserAdmin = (newUser: StoredUser): void => {
  const users = getStoredUsers();
  saveUsers([...users, newUser]);
};

export const deleteUserAdmin = (userId: string): void => {
  const users = getStoredUsers().filter(u => u.id !== userId);
  saveUsers(users);
};
