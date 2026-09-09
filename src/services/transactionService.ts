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

// Clave versión 3 - fuerza limpieza del localStorage con datos demo anteriores
const TRANSACTIONS_STORAGE_KEY = 'codex_transactions_v3';

// Sin datos demo: el historial inicia vacío y solo crece con compras reales
export const INITIAL_TRANSACTIONS: TransactionRecord[] = [];

export const getStoredTransactions = (): TransactionRecord[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading transactions from localStorage:', e);
  }
  return [];
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
