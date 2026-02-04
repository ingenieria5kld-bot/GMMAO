
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { MaintenancePlan, Asset } from '../types';

const Maintenance: React.FC = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pData, aData] = await Promise.all([
      dbService.getAll<MaintenancePlan>('plans'),
      dbService.getAll<Asset>('assets')
    ]);
    setPlans(pData);
    setAssets(aData);
  };

  const getAssetName = (id: number) => assets.find(a => a.id === id)?.name || 'Equipo Desconocido';

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
        💡 <strong>Nota Técnica:</strong> Los planes preventivos generan automáticamente órdenes de trabajo cuando la fecha actual sobrepasa la fecha de "Próxima Ejecución".
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 && <p className="text-slate-500">No hay planes de mantenimiento configurados.</p>}
        {plans.map(plan => (
          <div key={plan.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-1">{getAssetName(plan.assetId)}</h4>
            <p className="text-sm text-slate-500 mb-4">Frecuencia: Cada {plan.frequencyDays} días</p>
            <div className="flex justify-between text-xs font-medium mb-4">
              <div className="text-slate-400">Última: {plan.lastExecution}</div>
              <div className="text-blue-600 font-bold">Próxima: {plan.nextExecution}</div>
            </div>
            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm font-bold transition-colors">
              Ver Checklist
            </button>
          </div>
        ))}

        <button className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all">
          <span className="text-2xl mb-2">➕</span>
          <span className="font-bold">Añadir Plan Preventivo</span>
        </button>
      </div>
    </div>
  );
};

export default Maintenance;
