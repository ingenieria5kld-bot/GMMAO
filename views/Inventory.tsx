
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Part } from '../types';

const Inventory: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    const data = await dbService.getAll<Part>('parts');
    setParts(data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref/Código</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Repuesto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Existencias</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Mín.</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {parts.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Inventario vacío.</td></tr>
            )}
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-sm">{part.code}</td>
                <td className="px-6 py-4 font-medium">{part.name}</td>
                <td className="px-6 py-4 text-sm">{part.stock} {part.unit}</td>
                <td className="px-6 py-4 text-sm">{part.minStock} {part.unit}</td>
                <td className="px-6 py-4">
                  {part.stock <= part.minStock ? (
                    <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">STOCK BAJO</span>
                  ) : (
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">OK</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 mr-3">Ajuste</button>
                  <button className="text-slate-400">Movimientos</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
