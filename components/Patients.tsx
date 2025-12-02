import React, { useState, useEffect } from 'react';
import { Patient, Session, SessionStatus } from '../types';
import { StorageService } from '../services/storage';
import { summarizeNotes } from '../services/gemini';
import { Search, Plus, Trash2, Edit2, Sparkles, X, FileText, Calendar, Activity, Download, Filter, Phone, User as UserIcon } from 'lucide-react';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [filterPathology, setFilterPathology] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Partial<Patient>>({});
  const [aiLoading, setAiLoading] = useState(false);
  
  // Journey / Details View State
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [patientSessions, setPatientSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    setPatients(StorageService.getPatients());
  };

  // Get unique pathologies for filter dropdown
  const uniquePathologies = Array.from(new Set(patients.map(p => p.pathology).filter(Boolean)));

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.lastName.toLowerCase().includes(search.toLowerCase()) || 
      p.firstName.toLowerCase().includes(search.toLowerCase());
    const matchesPathology = filterPathology ? p.pathology === filterPathology : true;
    return matchesSearch && matchesPathology;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      StorageService.deletePatient(id);
      loadPatients();
    }
  };

  const handleEdit = (patient: Patient) => {
    setCurrentPatient(patient);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentPatient({
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      age: 0,
      contact: '',
      pathology: '',
      notes: '',
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPatient.id && currentPatient.firstName && currentPatient.lastName) {
      StorageService.savePatient(currentPatient as Patient);
      loadPatients();
      setIsModalOpen(false);
    }
  };

  const handleAiSummary = async () => {
    if (!currentPatient.notes) return;
    setAiLoading(true);
    const summary = await summarizeNotes(currentPatient.notes);
    setCurrentPatient(prev => ({ ...prev, notes: prev.notes + `\n\n[Résumé IA]: ${summary}` }));
    setAiLoading(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Prénom', 'Nom', 'Age', 'Contact', 'Pathologie', 'Créé le'];
    const rows = filteredPatients.map(p => [
      p.id, p.firstName, p.lastName, p.age, p.contact, p.pathology, new Date(p.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.map(item => `"${item}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'patients_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewJourney = (patientId: string) => {
    setViewingPatientId(patientId);
    const allSessions = StorageService.getSessions();
    const pSessions = allSessions
        .filter(s => s.patientId === patientId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setPatientSessions(pSessions);
  };

  const closeJourney = () => {
    setViewingPatientId(null);
    setPatientSessions([]);
  };

  const viewingPatient = viewingPatientId ? patients.find(p => p.id === viewingPatientId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Patients</h2>
          <p className="text-slate-500">Gérer les dossiers patients et l'historique.</p>
        </div>
        <div className="flex space-x-2">
            <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            title="Exporter en CSV"
            >
            <Download size={20} className="mr-2" />
            <span className="hidden sm:inline">Export</span>
            </button>
            <button 
            onClick={handleAdd}
            className="flex items-center justify-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
            <Plus size={20} className="mr-2" />
            Ajouter
            </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
            type="text" 
            placeholder="Rechercher par nom..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400"
            />
        </div>
        <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <select
                value={filterPathology}
                onChange={(e) => setFilterPathology(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 appearance-none cursor-pointer"
            >
                <option value="">Toutes les pathologies</option>
                {uniquePathologies.map(path => (
                    <option key={path} value={path}>{path}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Nom</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Âge</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Contact</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Pathologie</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{patient.lastName}, {patient.firstName}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.age}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.contact}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                        {patient.pathology || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                       <button 
                        onClick={() => handleViewJourney(patient.id)} 
                        className="text-teal-600 hover:text-teal-800 p-1 flex items-center text-sm mr-2 border border-teal-100 bg-teal-50 rounded px-2 transition-colors"
                        title="Voir le dossier"
                      >
                        <FileText size={16} className="mr-1" /> Dossier
                      </button>
                      <button onClick={() => handleEdit(patient)} className="text-blue-600 hover:text-blue-800 p-1 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(patient.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Aucun patient trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
                <div key={patient.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{patient.lastName}, {patient.firstName}</h3>
                            <div className="flex items-center text-slate-500 text-sm mt-1">
                                <UserIcon size={14} className="mr-1" /> {patient.age} ans
                            </div>
                            <div className="flex items-center text-slate-500 text-sm mt-1">
                                <Phone size={14} className="mr-1" /> {patient.contact}
                            </div>
                        </div>
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                            {patient.pathology || 'N/A'}
                        </span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <button 
                            onClick={() => handleViewJourney(patient.id)} 
                            className="text-teal-600 text-sm font-medium flex items-center"
                        >
                            <FileText size={16} className="mr-1" /> Dossier
                        </button>
                        <div className="flex space-x-3">
                            <button onClick={() => handleEdit(patient)} className="text-blue-600">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(patient.id)} className="text-red-500">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                Aucun patient trouvé.
            </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white sticky top-0">
              <h3 className="text-xl font-bold text-slate-800">
                {currentPatient.id ? 'Modifier Patient' : 'Nouveau Patient'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    value={currentPatient.firstName || ''}
                    onChange={e => setCurrentPatient({...currentPatient, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    value={currentPatient.lastName || ''}
                    onChange={e => setCurrentPatient({...currentPatient, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Âge</label>
                  <input 
                    type="number" 
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    value={currentPatient.age || ''}
                    onChange={e => setCurrentPatient({...currentPatient, age: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                  <input 
                    type="text" 
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    value={currentPatient.contact || ''}
                    onChange={e => setCurrentPatient({...currentPatient, contact: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pathologie / Condition</label>
                <input 
                  type="text" 
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  value={currentPatient.pathology || ''}
                  onChange={e => setCurrentPatient({...currentPatient, pathology: e.target.value})}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Notes Cliniques (Général)</label>
                  <button 
                    type="button" 
                    onClick={handleAiSummary} 
                    disabled={aiLoading}
                    className="text-xs flex items-center text-purple-600 hover:text-purple-800 disabled:opacity-50 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
                  >
                    <Sparkles size={14} className="mr-1" />
                    {aiLoading ? 'Analyse...' : 'Résumé IA'}
                  </button>
                </div>
                <textarea 
                  rows={6}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  value={currentPatient.notes || ''}
                  onChange={e => setCurrentPatient({...currentPatient, notes: e.target.value})}
                  placeholder="Observations cliniques, antécédents..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 bg-white"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Journey Modal */}
      {viewingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
             {/* Header */}
             <div className="flex justify-between items-start p-6 border-b border-slate-200 bg-slate-50">
                 <div>
                     <h2 className="text-2xl font-bold text-slate-900">{viewingPatient.firstName} {viewingPatient.lastName}</h2>
                     <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                         <span className="flex items-center"><Activity size={16} className="mr-1"/> {viewingPatient.pathology || 'N/A'}</span>
                         <span>•</span>
                         <span>{viewingPatient.age} ans</span>
                         <span>•</span>
                         <span>{viewingPatient.contact}</span>
                     </div>
                 </div>
                 <button onClick={closeJourney} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full">
                     <X size={24} />
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: General Info & Notes */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                                <FileText size={18} className="mr-2 text-teal-600"/>
                                Notes Générales
                            </h3>
                            <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                                {viewingPatient.notes || 'Aucune note générale.'}
                            </p>
                        </div>
                         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                                <Activity size={18} className="mr-2 text-teal-600"/>
                                Stats
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Séances totales</span>
                                    <span className="font-medium text-slate-800">{patientSessions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Dernière visite</span>
                                    <span className="font-medium text-slate-800">
                                        {patientSessions[0] ? new Date(patientSessions[0].date).toLocaleDateString('fr-FR') : 'Aucune'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Timeline */}
                    <div className="md:col-span-2">
                         <h3 className="font-bold text-slate-800 mb-4 flex items-center px-1">
                            <Calendar size={18} className="mr-2 text-teal-600"/>
                            Parcours & Séances
                        </h3>
                        
                        <div className="space-y-4">
                            {patientSessions.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                                    Aucune séance enregistrée pour ce patient.
                                </div>
                            ) : (
                                patientSessions.map((session, index) => (
                                    <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${session.status === SessionStatus.COMPLETED ? 'bg-green-500' : session.status === SessionStatus.CANCELLED ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <div>
                                                <p className="font-semibold text-slate-800 flex items-center">
                                                    {new Date(session.date).toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
                                                </p>
                                                <p className="text-xs text-slate-500 flex items-center mt-1">
                                                    <Clock size={12} className="mr-1"/>
                                                    {new Date(session.date).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}
                                                    <span className="mx-2">•</span>
                                                    {session.type}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                                                session.status === SessionStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                                session.status === SessionStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {session.status === SessionStatus.COMPLETED ? 'Terminé' : session.status === SessionStatus.CANCELLED ? 'Annulé' : 'Planifié'}
                                            </span>
                                        </div>
                                        
                                        {session.summary && (
                                            <div className="mt-3 pl-2 border-l-2 border-slate-100 ml-1">
                                                <p className="text-sm text-slate-900 leading-relaxed">
                                                    {session.summary}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Clock({ size, className }: {size:number, className?: string}) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
}