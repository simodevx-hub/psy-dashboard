import React, { useState, useEffect } from 'react';
import { Session, SessionStatus, Patient } from '../types';
import { StorageService } from '../services/storage';
import { Plus, X, Calendar, FileText, Filter } from 'lucide-react';

export const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<Partial<Session>>({});

  // Filters
  const [filterStatus, setFilterStatus] = useState<SessionStatus | 'ALL'>('ALL');
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSessions(StorageService.getSessions().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setPatients(StorageService.getPatients());
  };

  const getPatientName = (id: string) => {
    const p = patients.find(pat => pat.id === id);
    return p ? `${p.lastName}, ${p.firstName}` : 'Patient Inconnu';
  };

  const handleOpenModal = (session?: Session) => {
    if (session) {
      setCurrentSession(session);
    } else {
      setCurrentSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 16),
        status: SessionStatus.SCHEDULED,
        type: 'Consultation',
        summary: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSession.id && currentSession.patientId && currentSession.date) {
        // Ensure date is ISO
        const isoDate = new Date(currentSession.date).toISOString();
        StorageService.saveSession({ ...currentSession, date: isoDate } as Session);
        loadData();
        setIsModalOpen(false);
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm('Voulez-vous supprimer cette séance ?')) {
          StorageService.deleteSession(id);
          loadData();
      }
  }

  const translateStatus = (status: SessionStatus) => {
    switch(status) {
        case SessionStatus.COMPLETED: return 'Terminé';
        case SessionStatus.CANCELLED: return 'Annulé';
        case SessionStatus.SCHEDULED: return 'Planifié';
        default: return status;
    }
  };

  const filteredSessions = sessions.filter(s => {
      const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
      const matchDate = filterDate ? s.date.startsWith(filterDate) : true;
      return matchStatus && matchDate;
  });

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Séances</h2>
          <p className="text-slate-500">Rendez-vous à venir et historique.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Planifier une séance
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center">
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <button 
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
                 Tout voir
             </button>
             <button 
                onClick={() => setFilterStatus(SessionStatus.SCHEDULED)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === SessionStatus.SCHEDULED ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
             >
                 Planifié
             </button>
             <button 
                onClick={() => setFilterStatus(SessionStatus.COMPLETED)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === SessionStatus.COMPLETED ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
             >
                 Terminé
             </button>
             <button 
                onClick={() => setFilterStatus(SessionStatus.CANCELLED)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === SessionStatus.CANCELLED ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
             >
                 Annulé
             </button>
          </div>
          <div className="flex-1"></div>
          <div className="relative w-full md:w-auto">
             <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
                type="date" 
                value={filterDate} 
                onChange={e => setFilterDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
             />
             {filterDate && (
                 <button onClick={() => setFilterDate('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                     <X size={14} />
                 </button>
             )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSessions.map(session => {
            const dateObj = new Date(session.date);
            
            return (
                <div 
                  key={session.id} 
                  onClick={() => handleOpenModal(session)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-teal-400 cursor-pointer transition-colors group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">{getPatientName(session.patientId)}</h4>
                            <div className="flex items-center text-slate-500 text-sm mt-1">
                                <Calendar size={14} className="mr-1" />
                                {dateObj.toLocaleDateString('fr-FR')} à {dateObj.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2 block">{session.type}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            session.status === SessionStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                            session.status === SessionStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {translateStatus(session.status)}
                        </div>
                    </div>
                    
                    {session.summary && (
                      <div className="mb-3 p-2 bg-slate-50 rounded text-sm text-slate-600 line-clamp-2">
                        <span className="font-semibold text-xs text-slate-400 block mb-1">NOTES</span>
                        {session.summary}
                      </div>
                    )}
                    
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                        <button onClick={(e) => deleteSession(e, session.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">Supprimer</button>
                        <span className="text-xs text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Cliquez pour modifier
                        </span>
                    </div>
                </div>
            )
        })}
        
        {filteredSessions.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                Aucune séance trouvée avec ces filtres.
            </div>
        )}
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-slate-800">
                {currentSession.id && sessions.find(s => s.id === currentSession.id) ? 'Détails de la séance' : 'Nouvelle Séance'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                  <select 
                    required
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    value={currentSession.patientId || ''}
                    onChange={e => setCurrentSession({...currentSession, patientId: e.target.value})}
                  >
                      <option value="">Sélectionner un patient</option>
                      {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date et Heure</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    value={currentSession.date ? new Date(currentSession.date).toISOString().slice(0, 16) : ''}
                    onChange={e => setCurrentSession({...currentSession, date: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select 
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      value={currentSession.type || 'Consultation'}
                      onChange={e => setCurrentSession({...currentSession, type: e.target.value})}
                    >
                        <option value="Consultation">Consultation</option>
                        <option value="Therapy">Thérapie</option>
                        <option value="Evaluation">Évaluation</option>
                        <option value="Follow-up">Suivi</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                    <select 
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      value={currentSession.status || SessionStatus.SCHEDULED}
                      onChange={e => setCurrentSession({...currentSession, status: e.target.value as SessionStatus})}
                    >
                        <option value={SessionStatus.SCHEDULED}>Planifié</option>
                        <option value={SessionStatus.COMPLETED}>Terminé</option>
                        <option value={SessionStatus.CANCELLED}>Annulé</option>
                    </select>
                  </div>
                </div>

                {/* Show notes field prominently if editing or completing */}
                <div className={`transition-all duration-200 ${currentSession.status === SessionStatus.COMPLETED ? 'bg-green-50 p-3 rounded-lg border border-green-200' : ''}`}>
                   <div className="flex items-center mb-1">
                      <FileText size={16} className={`mr-2 ${currentSession.status === SessionStatus.COMPLETED ? 'text-green-600' : 'text-slate-400'}`} />
                      <label className="block text-sm font-medium text-slate-700">Notes de séance / Résumé</label>
                   </div>
                   <textarea 
                      rows={4}
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      value={currentSession.summary || ''}
                      onChange={e => setCurrentSession({...currentSession, summary: e.target.value})}
                      placeholder="Notes cliniques, observations, progrès..."
                   />
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 bg-white"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm"
                    >
                        {currentSession.status === SessionStatus.COMPLETED ? 'Terminer & Sauvegarder' : 'Sauvegarder'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};