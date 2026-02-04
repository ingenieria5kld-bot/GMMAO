
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { WorkOrder, Asset, Part, WorkOrderStatus } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    openOrders: 0,
    overdueMaintenance: 0,
    criticalAssets: 0,
    lowStock: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [orders, assets, parts, plans] = await Promise.all([
        dbService.getAll<WorkOrder>('workOrders'),
        dbService.getAll<Asset>('assets'),
        dbService.getAll<Part>('parts'),
        dbService.getAll<any>('plans'),
      ]);

      const open = orders.filter(o => o.status !== WorkOrderStatus.CLOSED).length;
      const critical = assets.filter(a => a.criticality === 'Crítica').length;
      const low = parts.filter(p => p.stock <= p.minStock).length;
      
      const now = new Date();
      const overdue = plans.filter((p: any) => new Date(p.nextExecution) < now).length;

      setStats({
        openOrders: open,
        overdueMaintenance: overdue,
        criticalAssets: critical,
        lowStock: low
      });
    };
    fetchData();
  }, []);

  const cards = [
    { label: 'O.T. Abiertas', value: stats.openOrders, color: 'text-orange-600', bg: 'bg-orange-50', icon: '🛠️' },
    { label: 'Preventivos Vencidos', value: stats.overdueMaintenance, color: 'text-red-600', bg: 'bg-red-50', icon: '⚠️' },
    { label: 'Activos Críticos', value: stats.criticalAssets, color: 'text-purple-600', bg: 'bg-purple-50', icon: '⚓' },
    { label: 'Bajo Stock', value: stats.lowStock, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '📦' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`${card.bg} p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color} mt-1`}>{card.value}</p>
            </div>
            <div className="text-3xl opacity-80">{card.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>Últimas Intervenciones</span>
            <span className="text-xs font-normal text-slate-400">(Auto-actualizado)</span>
          </h3>
          <div className="space-y-4">
             {/* Mock placeholder for actual list */}
             <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-blue-500">
               <p className="text-sm font-bold">Compresor Frío Nº2 - Revisión Mensual</p>
               <p className="text-xs text-slate-500">Estado: En Proceso | Técnico: Juan Pérez</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-green-500">
               <p className="text-sm font-bold">Cuadro Eléctrico Auxiliar - Sustitución Térmico</p>
               <p className="text-xs text-slate-500">Estado: Cerrada | Técnico: Mario Gómez</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Alertas de Repuestos</h3>
          <div className="divide-y divide-slate-100">
            {stats.lowStock === 0 ? (
              <p className="text-slate-500 text-sm py-2">No hay alertas de stock mínimo.</p>
            ) : (
              <p className="text-red-500 text-sm py-2">Existen {stats.lowStock} materiales por debajo del stock de seguridad.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
