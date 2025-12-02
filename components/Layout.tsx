import React, { useState } from 'react';
import { User, ViewState, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  LogOut, 
  Menu, 
  X,
  Activity
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, currentView, onNavigate, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'sessions', label: 'Séances', icon: Calendar },
  ];

  if (user.role === UserRole.ADMIN) {
    navItems.push({ id: 'financials', label: 'Finances', icon: DollarSign });
  }

  const handleNav = (id: string) => {
    onNavigate(id as ViewState);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-700">
          <Activity className="text-teal-400" size={28} />
          <h1 className="text-xl font-bold tracking-tight">PsychoDash</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-teal-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="text-sm">
              <p className="text-slate-400 text-xs uppercase font-bold">Connecté en tant que</p>
              <p className="font-semibold">{user.username}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-20">
          <div className="flex items-center space-x-2">
            <Activity className="text-teal-400" size={24} />
            <span className="font-bold text-lg">PsychoDash</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-slate-800 z-10 shadow-xl border-b border-slate-700">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    currentView === item.id ? 'bg-teal-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-3 text-red-400 hover:bg-slate-700 rounded-lg mt-4 border-t border-slate-700"
              >
                <LogOut size={20} className="mr-3" />
                Se déconnecter
              </button>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};