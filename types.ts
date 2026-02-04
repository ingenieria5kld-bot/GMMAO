
export enum SystemType {
  ELECTRIC = 'Electricidad',
  REFRIGERATION = 'Refrigeración'
}

export enum Criticality {
  LOW = 'Baja',
  MEDIUM = 'Media',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export enum WorkOrderStatus {
  OPEN = 'Abierta',
  IN_PROGRESS = 'En Proceso',
  CLOSED = 'Cerrada',
  PENDING_PARTS = 'Pendiente Repuesto'
}

export interface Asset {
  id?: number;
  code: string;
  name: string;
  system: SystemType;
  location: string;
  criticality: Criticality;
  manufacturer: string;
  model: string;
  serial: string;
  observations: string;
}

export interface WorkOrder {
  id?: number;
  assetId: number;
  type: 'Preventiva' | 'Correctiva';
  status: WorkOrderStatus;
  assignedTo: string;
  description: string;
  manHours: number;
  partsUsed: { partId: number; quantity: number }[];
  dateOpened: string;
  dateClosed?: string;
}

export interface Part {
  id?: number;
  name: string;
  code: string;
  stock: number;
  minStock: number;
  unit: string;
}

export interface MaintenancePlan {
  id?: number;
  assetId: number;
  frequencyDays: number;
  lastExecution: string;
  nextExecution: string;
  checklist: string[];
}

export interface Personnel {
  id?: number;
  name: string;
  specialty: SystemType;
  role: string;
}

export interface ItemType {
  id?: number;
  code: string;
  description: string;
}
