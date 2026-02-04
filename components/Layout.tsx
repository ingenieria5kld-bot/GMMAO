
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'assets', label: 'Activos', icon: '🚢' },
    { id: 'orders', label: 'Órdenes OT', icon: '🛠️' },
    { id: 'maintenance', label: 'Planes', icon: '📅' },
    { id: 'inventory', label: 'Inventario', icon: '📦' },
    { id: 'personnel', label: 'Personal', icon: '👥' },
    { id: 'reports', label: 'Reportes', icon: '📈' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-slate-800 text-white flex flex-col sticky top-0 md:h-screen">
        <div className="p-6 bg-slate-900 flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-blue-400">NavalGMAO</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${
                activeTab === item.id ? 'bg-blue-600' : 'hover:bg-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 bg-slate-900 text-xs text-slate-400 text-center">
          v1.0.0 | Modo Offline Activo
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-slate-50">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 capitalize">
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-500">Local DB Ready</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;
