export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  contact: string;
  pathology: string;
  notes: string;
  createdAt: string;
}

export enum SessionStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface Session {
  id: string;
  patientId: string;
  date: string; // ISO String
  type: string;
  status: SessionStatus;
  summary: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export type ViewState = 'dashboard' | 'patients' | 'sessions' | 'financials';