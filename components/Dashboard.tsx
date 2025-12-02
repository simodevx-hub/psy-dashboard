import React, { useEffect, useState } from 'react';
import { ViewState, Patient, Session, SessionStatus } from '../types';
import { StorageService } from '../services/storage';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  onViewChange: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setPatients(StorageService.getPatients());
    setSessions(StorageService.getSessions());
  }, []);

  // Stats
  const totalPatients = patients.length;
  const today = new Date().toISOString().split('T')[0];
  const sessionsToday = sessions.filter(s => s.date.startsWith(today)).length;
  const pendingSessions = sessions.filter(s => s.status === SessionStatus.SCHEDULED).length;
  
  // Data for Charts
  const sessionStatusData = [
    { name: 'Terminé', value: sessions.filter(s => s.status === SessionStatus.COMPLETED).length },
    { name: 'Planifié', value: sessions.filter(s => s.status === SessionStatus.SCHEDULED).length },
    { name: 'Annulé', value: sessions.filter(s => s.status === SessionStatus.CANCELLED).length },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

  // Mock Activity Data (Last 7 days)
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];
    const count = sessions.filter(s => s.date.startsWith(dateStr)).length;
    return { day: dayStr, sessions: count };
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tableau de bord</h2>
        <p className="text-slate-500">Bienvenue. Voici un aperçu de votre activité.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => onViewChange('patients')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Patients</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalPatients}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div onClick={() => onViewChange('sessions')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Séances Aujourd'hui</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{sessionsToday}</h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-full text-teal-600">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">En attente</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{pendingSessions}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full text-amber-600">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Actions Requises</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">2</h3>
            </div>
            <div className="bg-rose-100 p-3 rounded-full text-rose-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Activité Hebdomadaire</h3>
          <div className="h-64" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="sessions" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Statut des Séances</h3>
          <div className="h-64" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={sessionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sessionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-sm text-slate-600">
            {sessionStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};