
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { dbService } from './services/db';
import Dashboard from './views/Dashboard';
import Assets from './views/Assets';
import WorkOrders from './views/WorkOrders';
import Maintenance from './views/Maintenance';
import Inventory from './views/Inventory';
import PersonnelView from './views/PersonnelView';
import Reports from './views/Reports';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    dbService.init().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold">Inicializando Sistema Naval...</h2>
        <p className="text-slate-400 mt-2">Cargando base de datos local (IndexedDB)</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'assets': return <Assets />;
      case 'orders': return <WorkOrders />;
      case 'maintenance': return <Maintenance />;
      case 'inventory': return <Inventory />;
      case 'personnel': return <PersonnelView />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
