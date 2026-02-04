
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { MaintenancePlan, Asset } from '../types';

const emptyPlan: MaintenancePlan = {
  assetId: 0,
  type: 'Preventivo',
  description: '',
  estimatedHours: 0,
  frequencyValue: 0,
  frequencyUnit: 'Días',
  lastExecution: '',
  nextExecution: '',
  triggerCondition: '',
  checklist: []
};

const Maintenance: React.FC = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<MaintenancePlan>(emptyPlan);

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
  const formatFrequency = (plan: MaintenancePlan) => {
    if (!plan.frequencyValue || !plan.frequencyUnit) return 'Por condición';
    return `Cada ${plan.frequencyValue} ${plan.frequencyUnit.toLowerCase()}`;
  };
  const isTimeBased = (plan: MaintenancePlan) => plan.type === 'Preventivo' || plan.type === 'Predictivo';

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.assetId) return;
    const payload = {
      ...formData,
      frequencyValue: isTimeBased(formData) ? formData.frequencyValue : undefined,
      frequencyUnit: isTimeBased(formData) ? formData.frequencyUnit : undefined,
      triggerCondition: formData.type === 'Correctivo' ? formData.triggerCondition : undefined,
      lastExecution: isTimeBased(formData) ? formData.lastExecution : undefined,
      nextExecution: isTimeBased(formData) ? formData.nextExecution : undefined
    };
    await dbService.add('plans', payload);
    setShowModal(false);
    setFormData({ ...emptyPlan });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
        💡 <strong>Nota Técnica:</strong> Configure planes correctivos por condición y planes preventivos/predictivos por frecuencia o por horas de trabajo del activo.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Planes de Mantenimiento</h3>
          <p className="text-sm text-slate-500">Registre correctivos, preventivos y predictivos según la criticidad del activo.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span> Nuevo Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.length === 0 && <p className="text-slate-500">No hay planes de mantenimiento configurados.</p>}
        {plans.map(plan => (
          <div key={plan.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">{getAssetName(plan.assetId)}</h4>
                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">{plan.type}</p>
              </div>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">{formatFrequency(plan)}</span>
            </div>
            <p className="text-sm text-slate-600">{plan.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div>
                <span className="block text-slate-400">Horas estimadas</span>
                <span className="font-semibold text-slate-700">{plan.estimatedHours} h</span>
              </div>
              <div>
                <span className="block text-slate-400">{plan.type === 'Correctivo' ? 'Condición' : 'Próxima ejecución'}</span>
                <span className="font-semibold text-slate-700">
                  {plan.type === 'Correctivo' ? (plan.triggerCondition || 'No definida') : (plan.nextExecution || 'No definida')}
                </span>
              </div>
            </div>
            <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm font-bold transition-colors">
              Ver Checklist
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">Nuevo Plan de Mantenimiento</h3>
                <p className="text-xs text-slate-300">Defina el tipo, frecuencia y horas de trabajo requeridas.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Activo</label>
                  <select
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                    value={formData.assetId}
                    onChange={event => setFormData({ ...formData, assetId: Number(event.target.value) })}
                    required
                  >
                    <option value={0}>Seleccione un activo</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Tipo de Plan</label>
                  <select
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={event => setFormData({ ...formData, type: event.target.value as MaintenancePlan['type'] })}
                  >
                    <option value="Preventivo">Preventivo</option>
                    <option value="Predictivo">Predictivo</option>
                    <option value="Correctivo">Correctivo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Descripción del Plan</label>
                <textarea
                  className="w-full border border-slate-200 rounded px-3 py-2 text-sm h-24"
                  value={formData.description}
                  onChange={event => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Detalle el alcance, la tarea y los repuestos críticos."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Horas estimadas de trabajo</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                    value={formData.estimatedHours}
                    onChange={event => setFormData({ ...formData, estimatedHours: Number(event.target.value) })}
                    required
                  />
                </div>
                {isTimeBased(formData) ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600">Frecuencia</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                        value={formData.frequencyValue}
                        onChange={event => setFormData({ ...formData, frequencyValue: Number(event.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600">Unidad</label>
                      <select
                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                        value={formData.frequencyUnit}
                        onChange={event => setFormData({ ...formData, frequencyUnit: event.target.value as MaintenancePlan['frequencyUnit'] })}
                      >
                        <option value="Horas">Horas</option>
                        <option value="Días">Días</option>
                        <option value="Semanas">Semanas</option>
                        <option value="Meses">Meses</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">Condición / Disparador</label>
                    <input
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                      value={formData.triggerCondition}
                      onChange={event => setFormData({ ...formData, triggerCondition: event.target.value })}
                      placeholder="Ej. Vibraje > 7 mm/s, falla reportada, alarma de temperatura."
                      required
                    />
                  </div>
                )}
              </div>

              {isTimeBased(formData) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Última ejecución</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                      value={formData.lastExecution}
                      onChange={event => setFormData({ ...formData, lastExecution: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Próxima ejecución</label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                      value={formData.nextExecution}
                      onChange={event => setFormData({ ...formData, nextExecution: event.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Guardar Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
