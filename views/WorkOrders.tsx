
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { WorkOrder, Asset, WorkOrderStatus } from '../types';

const WorkOrders: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [ordData, assetData] = await Promise.all([
      dbService.getAll<WorkOrder>('workOrders'),
      dbService.getAll<Asset>('assets')
    ]);
    setOrders(ordData);
    setAssets(assetData);
  };

  const getAssetName = (id: number) => assets.find(a => a.id === id)?.name || 'N/A';

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button className="bg-white border px-3 py-1 rounded text-sm hover:bg-slate-50">Todas</button>
          <button className="bg-white border px-3 py-1 rounded text-sm hover:bg-slate-50">Abiertas</button>
          <button className="bg-white border px-3 py-1 rounded text-sm hover:bg-slate-50">Cerradas</button>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <span>🔧</span> Crear O.T. Correctiva
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Equipo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No hay órdenes de trabajo registradas.</td></tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">OT-{order.id}</td>
                <td className="px-6 py-4 font-medium">{getAssetName(order.assetId)}</td>
                <td className="px-6 py-4 text-sm">{order.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    order.status === WorkOrderStatus.OPEN ? 'bg-blue-100 text-blue-700' :
                    order.status === WorkOrderStatus.CLOSED ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{order.dateOpened}</td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:underline">Editar / Cerrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Basic modal structure would go here similar to Assets */}
    </div>
  );
};

export default WorkOrders;
