
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { dbService } from '../services/db';
import { Asset, Criticality, ItemType } from '../types';

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSystemSelector, setShowSystemSelector] = useState(false);
  const [showCCSelector, setShowCCSelector] = useState(false);
  
  const [functionalSystems, setFunctionalSystems] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  
  const [systemSearch, setSystemSearch] = useState('');
  const [ccSearch, setCcSearch] = useState('');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [selectedCCId, setSelectedCCId] = useState<string | null>(null);
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', '500']));
  const [activeTab, setActiveTab] = useState('identification');
  
  const pictureInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    swbs: '510',
    code: 'AC-512-01',
    description: 'Chilled Water Unit No. 1',
    state: 'OPERATIONAL',
    system: '510 - CLIMATE CONTROL',
    costCenter: '9000 - ENGINE ROOM DEPT',
    manufacturer: 'CARRIER NAVAL',
    model: '30XW-V',
    serial: 'SN-99281-X',
    location: 'Auxiliary Mach. Room 2',
    criticality: Criticality.HIGH,
    pictureData: '',
    specs: {},
    operational: {}
  });

  useEffect(() => {
    loadAssets();
    loadSystems();
    loadCostCenters();
  }, []);

  const loadAssets = async () => setAssets(await dbService.getAll('assets'));
  const loadSystems = async () => setFunctionalSystems(await dbService.getAll('functionalSystems'));
  const loadCostCenters = async () => setCostCenters(await dbService.getAll('costCenters'));

  const handleAddItem = async (store: 'functionalSystems' | 'costCenters', parentId: string) => {
    const code = prompt("Nuevo Código SWBS/CC:");
    const desc = prompt("Descripción Funcional:");
    if (code && desc) {
      await dbService.add(store, { code, description: desc, parent: parentId });
      store === 'functionalSystems' ? loadSystems() : loadCostCenters();
    }
  };

  const handleDeleteItem = async (store: 'functionalSystems' | 'costCenters', id: string) => {
    if (!id || id === 'root') return alert("Selección no válida");
    if (confirm(`¿Eliminar código ${id} de la jerarquía naval?`)) {
      const item = (store === 'functionalSystems' ? functionalSystems : costCenters).find(i => i.code === id);
      if (item) {
        await dbService.delete(store, item.id);
        store === 'functionalSystems' ? loadSystems() : loadCostCenters();
      }
    }
  };

  const filteredSystems = useMemo(() => functionalSystems.filter(s => 
    s.code.toLowerCase().includes(systemSearch.toLowerCase()) || 
    s.description.toLowerCase().includes(systemSearch.toLowerCase())
  ), [functionalSystems, systemSearch]);

  const filteredCCs = useMemo(() => costCenters.filter(c => 
    c.code.toLowerCase().includes(ccSearch.toLowerCase()) || 
    c.description.toLowerCase().includes(ccSearch.toLowerCase())
  ), [costCenters, ccSearch]);

  const renderTree = (items: any[], allItems: any[], parentId: string, onSelect: (item: any) => void, selectedId: string | null, setSel: (id: string) => void) => {
    return items.filter(s => s.parent === parentId).map(item => (
      <div key={item.code} className="ml-4">
        <div 
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer rounded text-[11px] transition-all ${selectedId === item.code ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 text-slate-700'}`}
          onClick={(e) => { e.stopPropagation(); setSel(item.code); if (allItems.some(s => s.parent === item.code)) toggleNode(item.code); }}
          onDoubleClick={() => onSelect(item)}
        >
          <span className="w-4 text-center">{allItems.some(s => s.parent === item.code) ? (expandedNodes.has(item.code) ? '▼' : '▶') : ''}</span>
          <span>📁</span>
          <span className="font-bold">{item.code}</span>
          <span className="opacity-70">-</span>
          <span className="truncate">{item.description}</span>
        </div>
        {expandedNodes.has(item.code) && renderTree(items, allItems, item.code, onSelect, selectedId, setSel)}
      </div>
    ));
  };

  const toggleNode = (code: string) => {
    const next = new Set(expandedNodes);
    next.has(code) ? next.delete(code) : next.add(code);
    setExpandedNodes(next);
  };

  const selectSystem = (sys: any) => { setFormData({ ...formData, system: `${sys.code} - ${sys.description}`, swbs: sys.code }); setShowSystemSelector(false); };
  const selectCC = (cc: any) => { setFormData({ ...formData, costCenter: `${cc.code} - ${cc.description}` }); setShowCCSelector(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="bg-slate-100 px-3 py-1 rounded text-[10px] font-black text-slate-500 uppercase">Filtro SWBS</div>
           <input type="text" placeholder="Buscar por código o nombre..." className="border-b border-slate-200 py-1 w-64 text-sm focus:border-blue-500 outline-none transition-all" />
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-800 text-white px-5 py-2 rounded font-black text-xs uppercase tracking-widest hover:bg-blue-900 shadow-lg active:scale-95 transition-all">⊕ Alta de Activo</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-6 py-4">SWBS Code</th>
              <th className="px-6 py-4">Equipment Description</th>
              <th className="px-6 py-4">Location / Deck</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-300 italic uppercase text-xs tracking-widest">No naval assets indexed.</td></tr>}
            {assets.map((asset: any) => (
              <tr key={asset.id} className="hover:bg-blue-50/40 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-mono text-xs text-blue-800 font-bold">{asset.swbs}-{asset.code}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">{asset.description}</td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium uppercase">{asset.location}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 uppercase">{asset.state || 'OK'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg w-full max-w-6xl shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden max-h-[98vh]">
            <div className="bg-slate-900 p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-1 rounded text-white font-black text-xs">NAV</div>
                <h2 className="text-xs font-black text-white uppercase tracking-widest italic">Engineering Asset Wizard - SWBS Standard Compliance</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-red-400 font-bold text-xl px-2">✕</button>
            </div>

            <form onSubmit={async (e) => { e.preventDefault(); await dbService.add('assets', formData); setShowModal(false); loadAssets(); }} className="overflow-y-auto">
              <div className="p-4 grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-200">
                <div className="col-span-2">
                  <label className="block text-[9px] font-black text-blue-900 uppercase mb-1">SWBS Group</label>
                  <div className="flex gap-1">
                    <input className="w-full border-2 border-slate-300 rounded px-2 py-1 text-xs font-black bg-white" value={formData.swbs} readOnly />
                    <button type="button" onClick={() => setShowSystemSelector(true)} className="bg-blue-800 text-white px-2 rounded font-bold text-xs hover:bg-blue-700">...</button>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-black text-blue-900 uppercase mb-1">Asset ID</label>
                  <input className="w-full border-2 border-slate-300 rounded px-2 py-1 text-xs font-black text-blue-700" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="col-span-8">
                  <label className="block text-[9px] font-black text-blue-900 uppercase mb-1">Nomenclature / Service Name</label>
                  <input className="w-full border-2 border-slate-300 rounded px-2 py-1 text-xs font-bold" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>

              <div className="flex bg-slate-100 p-1 gap-1">
                {['identification', 'specs', 'operational'].map(t => (
                  <button key={t} type="button" onClick={() => setActiveTab(t)} className={`px-6 py-2 text-[10px] font-black uppercase tracking-tighter transition-all ${activeTab === t ? 'bg-white text-blue-800 shadow-sm border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                ))}
              </div>

              <div className="p-8 bg-white min-h-[450px]">
                {activeTab === 'identification' && (
                  <div className="grid grid-cols-12 gap-10 animate-in fade-in slide-in-from-top-1">
                    <div className="col-span-7 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Manufacturer</label>
                          <input className="w-full border border-slate-200 rounded p-2 text-xs font-bold" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Model / Type</label>
                          <input className="w-full border border-slate-200 rounded p-2 text-xs font-bold" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Physical Location (Compartment/Deck)</label>
                          <input className="w-full border border-slate-200 rounded p-2 text-xs font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-red-800 uppercase italic">Cost Center / Responsible Dept.</label>
                          <div className="flex gap-2">
                            <input className="flex-1 border border-slate-200 rounded p-2 text-xs bg-slate-50 font-bold" value={formData.costCenter} readOnly />
                            <button type="button" onClick={() => setShowCCSelector(true)} className="bg-slate-200 px-4 rounded text-[10px] font-black border border-slate-300">SEARCH</button>
                          </div>
                      </div>
                    </div>
                    <div className="col-span-5">
                      <div className="w-full h-64 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 group hover:border-blue-400 transition-all cursor-pointer overflow-hidden">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Drop Engineering Drawing / Photo</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab !== 'identification' && (
                   <div className="grid grid-cols-2 gap-10 animate-in fade-in">
                      {[1, 2].map(col => (
                        <div key={col} className="space-y-2">
                          {Array.from({length: 8}).map((_, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input className="w-32 bg-slate-100 border-none p-1 text-[10px] font-black text-slate-500 uppercase rounded" placeholder="PARAMETER..." />
                              <input className="flex-1 border border-slate-200 p-1 text-[10px] font-bold rounded" placeholder="Value / Unit" />
                            </div>
                          ))}
                        </div>
                      ))}
                   </div>
                )}
              </div>

              <div className="bg-slate-900 p-4 flex justify-end gap-3 px-8">
                <button type="button" onClick={() => setShowModal(false)} className="text-white border border-slate-700 px-10 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800">Abort</button>
                <button type="submit" className="bg-blue-600 text-white px-12 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-900/20">Commit Registry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selectores SWBS y CC */}
      {[
        { show: showSystemSelector, setShow: setShowSystemSelector, search: systemSearch, setSearch: setSystemSearch, filtered: filteredSystems, all: functionalSystems, sel: selectedSystemId, setSel: setSelectedSystemId, store: 'functionalSystems' as const, title: '⚓ SWBS Naval Tree' },
        { show: showCCSelector, setShow: setShowCCSelector, search: ccSearch, setSearch: setCcSearch, filtered: filteredCCs, all: costCenters, sel: selectedCCId, setSel: setSelectedCCId, store: 'costCenters' as const, title: '🗂️ Cost Centers Registry' }
      ].map((modal, idx) => modal.show && (
        <div key={idx} className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl flex flex-col min-h-[500px] border-2 border-slate-400">
            <div className="p-3 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{modal.title}</h3>
              <button onClick={() => modal.setShow(false)} className="text-slate-400 hover:text-red-500 font-bold px-2">✕</button>
            </div>
            
            <div className="p-2 border-b flex items-center justify-between bg-white px-3">
              <div className="flex gap-1">
                <button title="Nuevo" className="w-8 h-8 flex items-center justify-center hover:bg-emerald-50 border border-slate-200 rounded text-emerald-600 font-bold" onClick={() => handleAddItem(modal.store, modal.sel || 'root')}>⊕</button>
                <button title="Borrar" className="w-8 h-8 flex items-center justify-center hover:bg-red-50 border border-slate-200 rounded text-red-600" onClick={() => handleDeleteItem(modal.store, modal.sel!)}>🗑️</button>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1 w-64 flex items-center">
                 <span className="text-xs mr-2">🔍</span>
                 <input type="text" placeholder="Procurar..." className="w-full text-[11px] outline-none bg-transparent" value={modal.search} onChange={(e) => modal.setSearch(e.target.value)} />
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto bg-white font-mono scrollbar-thin">
              <div className={`flex items-center gap-2 py-1 px-3 cursor-pointer text-[10px] font-black rounded ${modal.sel === 'root' ? 'bg-blue-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`} onClick={() => modal.setSel('root')}>
                <span>▼</span><span>📁</span><span>BASE_DIRECTORY</span>
              </div>
              <div className="mt-2">{renderTree(modal.filtered, modal.all, 'root', (item) => { 
                if (modal.store === 'functionalSystems') selectSystem(item); else selectCC(item);
              }, modal.sel, modal.setSel)}</div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
               <button onClick={() => modal.setShow(false)} className="px-6 py-2 border-2 border-slate-200 rounded text-[10px] font-black uppercase hover:bg-white transition-all">Cancel</button>
               <button onClick={() => { const item = modal.all.find(i => i.code === modal.sel); if(item) { if (modal.store === 'functionalSystems') selectSystem(item); else selectCC(item); } }} className="px-10 py-2 bg-slate-900 text-white rounded text-[10px] font-black uppercase hover:bg-slate-800 transition-all disabled:opacity-20" disabled={!modal.sel || modal.sel === 'root'}>Select Record</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Assets;
