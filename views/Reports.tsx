
import React from 'react';

const Reports: React.FC = () => {
  const reportTypes = [
    { title: 'Historial de Activos', desc: 'Resumen completo de intervenciones por equipo.', icon: '📜' },
    { title: 'Cumplimiento Preventivo', desc: '% de O.T. preventivas cerradas vs planificadas.', icon: '✅' },
    { title: 'Consumo de Materiales', desc: 'Listado de repuestos usados en el período.', icon: '📉' },
    { title: 'Horas Hombre', desc: 'Reporte de carga de trabajo por técnico.', icon: '⏱️' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((rep, i) => (
          <div key={i} className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer flex gap-6">
            <div className="text-4xl">{rep.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{rep.title}</h3>
              <p className="text-slate-500">{rep.desc}</p>
              <button className="mt-4 text-blue-600 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                Generar Informe <span>➔</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-800 text-white p-6 rounded-xl flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold">Exportación Masiva</h4>
          <p className="text-slate-400 text-sm">Descarga toda la base de datos local en formato JSON para respaldo manual.</p>
        </div>
        <button className="bg-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Backup DB</button>
      </div>
    </div>
  );
};

export default Reports;
