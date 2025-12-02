import React, { useState, useEffect } from 'react';
import { FinancialRecord } from '../types';
import { StorageService } from '../services/storage';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Download } from 'lucide-react';

export const Financials: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');

  useEffect(() => {
    setRecords(StorageService.getFinancials());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newRecord: FinancialRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      description,
      amount: parseFloat(amount),
      type
    };

    StorageService.saveFinancial(newRecord);
    setRecords(StorageService.getFinancials());
    setDescription('');
    setAmount('');
  };

  const handleDelete = (id: string) => {
    StorageService.deleteFinancial(id);
    setRecords(StorageService.getFinancials());
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Montant'];
    const rows = records.map(r => [
      new Date(r.date).toLocaleDateString(),
      r.description,
      r.type === 'income' ? 'Revenu' : 'Dépense',
      r.amount
    ]);
    
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.map(item => `"${item}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'finances_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncome = records.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netIncome = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Finances</h2>
        <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
            <Download size={20} className="mr-2" />
            Export CSV
        </button>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500">Revenus Totaux</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">+{totalIncome.toFixed(2)} €</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500">Dépenses Totales</p>
              <h3 className="text-2xl font-bold text-red-500 mt-1">-{totalExpense.toFixed(2)} €</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500">Bénéfice Net</p>
              <h3 className={`text-2xl font-bold mt-1 ${netIncome >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                  {netIncome.toFixed(2)} €
              </h3>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Ajouter une transaction</h3>
            <form onSubmit={handleAdd} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <input 
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="ex: Paiement Séance"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Montant (€)</label>
                    <input 
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                     <div className="flex space-x-2">
                         <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'income' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                         >
                             Revenu
                         </button>
                         <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                         >
                             Dépense
                         </button>
                     </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center">
                    <Plus size={18} className="mr-2" />
                    Ajouter
                </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-slate-700">Transactions Récentes</h3>
              </div>
              <div className="overflow-y-auto max-h-[500px]">
                  {records.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">Aucune transaction trouvée.</div>
                  ) : (
                      <table className="w-full text-left">
                          <tbody className="divide-y divide-slate-100">
                              {records.slice().reverse().map(record => (
                                  <tr key={record.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center">
                                            {record.type === 'income' ? (
                                                <ArrowUpCircle size={20} className="text-green-500 mr-3" />
                                            ) : (
                                                <ArrowDownCircle size={20} className="text-red-500 mr-3" />
                                            )}
                                            <div>
                                                <p className="font-medium text-slate-800">{record.description}</p>
                                                <p className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                          </div>
                                      </td>
                                      <td className={`px-6 py-4 font-bold text-right ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                          {record.type === 'income' ? '+' : '-'}{record.amount.toFixed(2)} €
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button onClick={() => handleDelete(record.id)} className="text-slate-400 hover:text-red-500">
                                              <Trash2 size={16} />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};