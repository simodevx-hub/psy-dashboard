import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { Activity } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = StorageService.login(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Identifiants invalides. Essayez admin / password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-teal-600 p-8 text-center">
            <div className="inline-flex bg-white/20 p-4 rounded-full text-white mb-4 backdrop-blur-sm">
                <Activity size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">psymaghreb board</h1>
            <p className="text-teal-100 mt-2">Votre espace de gestion clinique</p>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom d'utilisateur</label>
                <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="Ex: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
                <input 
                type="password" 
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
                {error}
                </div>
            )}

            <button 
                type="submit" 
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-all transform active:scale-[0.98] shadow-lg"
            >
                Se connecter
            </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400 space-y-1">
            <p>Identifiants de démonstration :</p>
            <p className="font-mono bg-slate-100 inline-block px-2 py-1 rounded mx-1 text-slate-600">admin / password</p>
            <p className="font-mono bg-slate-100 inline-block px-2 py-1 rounded mx-1 text-slate-600">user / password</p>
            </div>
        </div>
      </div>
    </div>
  );
};