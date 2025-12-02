import React, { useState, useEffect } from 'react';
import { User, ViewState, UserRole } from './types';
import { StorageService } from './services/storage';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Patients } from './components/Patients';
import { Sessions } from './components/Sessions';
import { Financials } from './components/Financials';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setView('dashboard');
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100">Loading...</div>;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onViewChange={setView} />;
      case 'patients':
        return <Patients />;
      case 'sessions':
        return <Sessions />;
      case 'financials':
        return user.role === UserRole.ADMIN ? <Financials /> : <div className="p-8 text-center text-red-500">Access Denied</div>;
      default:
        return <Dashboard onViewChange={setView} />;
    }
  };

  return (
    <Layout 
      user={user} 
      currentView={view} 
      onNavigate={setView} 
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;