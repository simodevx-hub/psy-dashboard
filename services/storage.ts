import { User, Patient, Session, FinancialRecord, UserRole, SessionStatus } from '../types';

// Keys for LocalStorage
const KEYS = {
  USER: 'psychodash_user',
  PATIENTS: 'psychodash_patients',
  SESSIONS: 'psychodash_sessions',
  FINANCIALS: 'psychodash_financials'
};

// Seed Data (Simulating the initial DB setup)
const seedData = () => {
  if (!localStorage.getItem(KEYS.PATIENTS)) {
    const patients: Patient[] = [
      { id: '1', firstName: 'Alice', lastName: 'Doe', age: 32, contact: '555-0101', pathology: 'Anxiety', notes: 'Patient reports high stress at work.', createdAt: new Date().toISOString() },
      { id: '2', firstName: 'Bob', lastName: 'Smith', age: 45, contact: '555-0102', pathology: 'Depression', notes: 'Improving sleep patterns.', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
  }

  if (!localStorage.getItem(KEYS.SESSIONS)) {
    const sessions: Session[] = [
      { id: '1', patientId: '1', date: new Date(Date.now() + 86400000).toISOString(), type: 'Consultation', status: SessionStatus.SCHEDULED, summary: '' },
      { id: '2', patientId: '2', date: new Date(Date.now() - 86400000).toISOString(), type: 'Therapy', status: SessionStatus.COMPLETED, summary: 'Discussed childhood events.' },
    ];
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  }

  if (!localStorage.getItem(KEYS.FINANCIALS)) {
    const financials: FinancialRecord[] = [
      { id: '1', date: new Date().toISOString(), description: 'Session Payment - Alice', amount: 150, type: 'income' },
      { id: '2', date: new Date().toISOString(), description: 'Office Rent', amount: 500, type: 'expense' },
    ];
    localStorage.setItem(KEYS.FINANCIALS, JSON.stringify(financials));
  }
};

seedData();

export const StorageService = {
  // Auth (Mock)
  login: (username: string, password: string): User | null => {
    // Hardcoded logic as per requirements: admin/password
    if (username === 'admin' && password === 'password') {
      const user: User = { id: 1, username: 'admin', role: UserRole.ADMIN };
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
      return user;
    }
    // Secondary user for testing non-admin view
    if (username === 'user' && password === 'password') {
      const user: User = { id: 2, username: 'user', role: UserRole.USER };
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(KEYS.USER);
  },

  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },

  // Patients
  getPatients: (): Patient[] => {
    return JSON.parse(localStorage.getItem(KEYS.PATIENTS) || '[]');
  },

  savePatient: (patient: Patient) => {
    const patients = StorageService.getPatients();
    const index = patients.findIndex(p => p.id === patient.id);
    if (index >= 0) {
      patients[index] = patient;
    } else {
      patients.push(patient);
    }
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
  },

  deletePatient: (id: string) => {
    const patients = StorageService.getPatients().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
  },

  // Sessions
  getSessions: (): Session[] => {
    return JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]');
  },

  saveSession: (session: Session) => {
    const sessions = StorageService.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },

  deleteSession: (id: string) => {
    const sessions = StorageService.getSessions().filter(s => s.id !== id);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },

  // Financials
  getFinancials: (): FinancialRecord[] => {
    return JSON.parse(localStorage.getItem(KEYS.FINANCIALS) || '[]');
  },
  
  saveFinancial: (record: FinancialRecord) => {
    const records = StorageService.getFinancials();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
        records[index] = record;
    } else {
        records.push(record);
    }
    localStorage.setItem(KEYS.FINANCIALS, JSON.stringify(records));
  },
  
  deleteFinancial: (id: string) => {
    const records = StorageService.getFinancials().filter(r => r.id !== id);
    localStorage.setItem(KEYS.FINANCIALS, JSON.stringify(records));
  }
};