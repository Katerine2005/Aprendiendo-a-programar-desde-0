import { CourseId } from '../types';

export interface TransactionRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  planName: string;
  amount: string;
  method: 'tarjeta' | 'paypal' | 'paddle' | 'stripe' | 'applepay' | 'banca';
  cardLast4?: string;
  date: string;
  status: 'completado' | 'procesando' | 'reembolsado';
  courseId?: CourseId | null;
}

const TRANSACTIONS_STORAGE_KEY = 'codex_transactions_v2';

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TXN-90841',
    studentName: 'Ana Lucía Torres',
    studentEmail: 'ana.torres@estudiante.edu',
    planName: 'CODEX Plus ($20/mes)',
    amount: '$20.00 USD',
    method: 'stripe',
    cardLast4: '4242',
    date: '09/08/2026 - 14:22',
    status: 'completado'
  },
  {
    id: 'TXN-90840',
    studentName: 'Carlos Alberto Mendoza',
    studentEmail: 'carlos@estudiante.edu.hn',
    planName: 'Licencia Curso: C++ Moderno',
    amount: '$5.00 USD',
    method: 'paypal',
    date: '09/08/2026 - 11:05',
    status: 'completado',
    courseId: 'cpp'
  },
  {
    id: 'TXN-90839',
    studentName: 'Sofía Isabel Ramos',
    studentEmail: 'sofia.ramos@estudiante.edu',
    planName: 'Licencia Curso: HTML & CSS',
    amount: '$5.00 USD',
    method: 'paddle',
    date: '08/08/2026 - 19:40',
    status: 'completado',
    courseId: 'html-css'
  },
  {
    id: 'TXN-90838',
    studentName: 'Mateo Alejandro Ruiz',
    studentEmail: 'mateo.ruiz@estudiante.edu',
    planName: 'Licencia Curso: Python & Algoritmos',
    amount: '$5.00 USD',
    method: 'stripe',
    cardLast4: '8821',
    date: '08/08/2026 - 16:15',
    status: 'completado',
    courseId: 'python'
  },
  {
    id: 'TXN-90837',
    studentName: 'Elena María Gomez',
    studentEmail: 'elena.gomez@estudiante.edu',
    planName: 'Pack Maestro CODEX (8 Cursos)',
    amount: '$49.99 USD',
    method: 'banca',
    date: '08/08/2026 - 09:30',
    status: 'completado'
  },
  {
    id: 'TXN-90836',
    studentName: 'Gabriel José Hernández',
    studentEmail: 'gabriel.h@estudiante.edu',
    planName: 'Licencia Curso: JavaScript Moderno',
    amount: '$5.00 USD',
    method: 'paypal',
    date: '07/08/2026 - 22:10',
    status: 'completado',
    courseId: 'javascript'
  },
  {
    id: 'TXN-90835',
    studentName: 'Lucía Fernández',
    studentEmail: 'lucia.f@estudiante.edu',
    planName: 'Licencia Curso: Node.js Backend',
    amount: '$5.00 USD',
    method: 'stripe',
    cardLast4: '3310',
    date: '07/08/2026 - 15:02',
    status: 'completado',
    courseId: 'nodejs'
  }
];

export const getStoredTransactions = (): TransactionRecord[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading transactions from localStorage:', e);
  }
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  return INITIAL_TRANSACTIONS;
};

export const saveTransactions = (transactions: TransactionRecord[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
};

export const recordNewPurchase = (params: {
  studentName: string;
  studentEmail: string;
  planName: string;
  amount: string;
  method: 'tarjeta' | 'paypal' | 'paddle' | 'stripe' | 'applepay' | 'banca';
  courseId?: CourseId | null;
  cardLast4?: string;
}): TransactionRecord => {
  const current = getStoredTransactions();
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const formattedDate = `${day}/${month}/${year} - ${hours}:${mins}`;

  const newTxn: TransactionRecord = {
    id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
    studentName: params.studentName || 'Estudiante CODEX',
    studentEmail: params.studentEmail || 'estudiante@codex.edu.hn',
    planName: params.planName,
    amount: params.amount,
    method: params.method,
    cardLast4: params.cardLast4,
    date: formattedDate,
    status: 'completado',
    courseId: params.courseId
  };

  const updated = [newTxn, ...current];
  saveTransactions(updated);
  return newTxn;
};
