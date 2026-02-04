
import { Asset, WorkOrder, Part, MaintenancePlan, Personnel } from '../types';

const DB_NAME = 'NavalGMAO_DB';
const DB_VERSION = 2;

export class DBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        const stores = [
          { name: 'assets', key: 'id' },
          { name: 'workOrders', key: 'id' },
          { name: 'parts', key: 'id' },
          { name: 'plans', key: 'id' },
          { name: 'personnel', key: 'id' },
          { name: 'itemTypes', key: 'id' },
          { name: 'functionalSystems', key: 'id' }, // SWBS Hierachy
          { name: 'costCenters', key: 'id' }
        ];

        stores.forEach(s => {
          if (!db.objectStoreNames.contains(s.name)) {
            db.createObjectStore(s.name, { keyPath: s.key, autoIncrement: true });
          }
        });
        
        // Seed inicial SWBS si es necesario
        const systemStore = request.transaction.objectStore('functionalSystems');
        const initialSWBS = [
          { code: '100', description: 'HULL STRUCTURE', parent: 'root' },
          { code: '200', description: 'PROPULSION PLANT', parent: 'root' },
          { code: '300', description: 'ELECTRIC PLANT', parent: 'root' },
          { code: '400', description: 'COMMAND & SURVEILLANCE', parent: 'root' },
          { code: '500', description: 'AUXILIARY SYSTEMS', parent: 'root' },
          { code: '510', description: 'CLIMATE CONTROL', parent: '500' },
          { code: '600', description: 'OUTFIT & FURNISHINGS', parent: 'root' }
        ];
        initialSWBS.forEach(item => systemStore.put(item));
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = () => reject('Error opening IndexedDB');
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async add<T>(storeName: string, item: T): Promise<number> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result as number);
    });
  }

  async put<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: string, id: number): Promise<void> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
    });
  }
}

export const dbService = new DBService();
