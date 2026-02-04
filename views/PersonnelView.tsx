
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Personnel, SystemType } from '../types';

const PersonnelView: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await dbService.getAll<Personnel>('personnel');
    setPersonnel(data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {personnel.length === 0 && <p className="text-slate-500">No hay personal registrado.</p>}
      {personnel.map(p => (
        <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{p.name}</h4>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{p.role}</p>
            <span className="mt-1 inline-block text-[10px] bg-blue-50 text-blue-700 px-2 rounded-full font-bold">
              {p.specialty}
            </span>
          </div>
        </div>
      ))}
      <button className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all">
        <span className="text-2xl mb-1">➕</span>
        <span className="text-xs font-bold uppercase tracking-widest">Nuevo Técnico</span>
      </button>
    </div>
  );
};

export default PersonnelView;
