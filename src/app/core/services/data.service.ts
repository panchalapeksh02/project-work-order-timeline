import { Injectable } from '@angular/core';
import { WorkCenterDocument, WorkOrderDocument } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_KEY = 'app_work_orders';

  getWorkCenters(): WorkCenterDocument[] {
    return [
      { docId: 'wc1', docType: 'workCenter', data: { name: 'Extrusion Line A', group: 'Production' } },
      { docId: 'wc2', docType: 'workCenter', data: { name: 'CNC Machine 1', group: 'Machining' } },
      { docId: 'wc3', docType: 'workCenter', data: { name: 'Assembly Station', group: 'Assembly' } },
      { docId: 'wc4', docType: 'workCenter', data: { name: 'Quality Control', group: 'Quality' } },
      { docId: 'wc5', docType: 'workCenter', data: { name: 'Packaging Line', group: 'Logistics' } },
    ];
  }

  getWorkOrders(): WorkOrderDocument[] {
    // 1. Try to load from Local Storage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // 2. If empty, return default data (and save it for next time)
    const defaultData: WorkOrderDocument[] = [
      // --- Extrusion Line A (HAS CONFLICT) ---
      {
        docId: 'wo1', docType: 'workOrder',
        data: { name: 'Order #101 (Base)', workCenterId: 'wc1', status: 'complete', startDate: '2026-02-10', endDate: '2026-02-14' }
      },
      {
        docId: 'wo2', docType: 'workOrder',
        data: { name: 'Order #102 (Conflict!)', workCenterId: 'wc1', status: 'in-progress', startDate: '2026-02-12', endDate: '2026-02-16' }
      },
      
      // --- CNC Machine 1 (Sequential, No Conflict) ---
      {
        docId: 'wo3', docType: 'workOrder',
        data: { name: 'Order #205', workCenterId: 'wc2', status: 'blocked', startDate: '2026-02-08', endDate: '2026-02-10' }
      },
      {
        docId: 'wo4', docType: 'workOrder',
        data: { name: 'Order #206', workCenterId: 'wc2', status: 'open', startDate: '2026-02-11', endDate: '2026-02-15' }
      },

      // --- Assembly Station (HAS CONFLICT) ---
      {
        docId: 'wo5', docType: 'workOrder',
        data: { name: 'Order #300 (Long Run)', workCenterId: 'wc3', status: 'open', startDate: '2026-02-09', endDate: '2026-02-18' }
      },
      {
        docId: 'wo6', docType: 'workOrder',
        data: { name: 'Order #301 (Rush Job)', workCenterId: 'wc3', status: 'in-progress', startDate: '2026-02-14', endDate: '2026-02-15' }
      },

      // --- Quality Control (Gap in schedule) ---
      {
        docId: 'wo7', docType: 'workOrder',
        data: { name: 'Order #401', workCenterId: 'wc4', status: 'complete', startDate: '2026-02-09', endDate: '2026-02-11' }
      },
      {
        docId: 'wo8', docType: 'workOrder',
        data: { name: 'Order #402', workCenterId: 'wc4', status: 'in-progress', startDate: '2026-02-15', endDate: '2026-02-17' }
      },

      // --- Packaging Line (Tight Schedule) ---
      {
        docId: 'wo9', docType: 'workOrder',
        data: { name: 'Order #500', workCenterId: 'wc5', status: 'open', startDate: '2026-02-10', endDate: '2026-02-12' }
      },
      {
        docId: 'wo10', docType: 'workOrder',
        data: { name: 'Order #501', workCenterId: 'wc5', status: 'open', startDate: '2026-02-12', endDate: '2026-02-14' }
      },
      {
        docId: 'wo11', docType: 'workOrder',
        data: { name: 'Order #502', workCenterId: 'wc5', status: 'blocked', startDate: '2026-02-14', endDate: '2026-02-16' }
      }
    ];

    this.saveWorkOrders(defaultData);
    return defaultData;
  }

  saveWorkOrders(orders: WorkOrderDocument[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
  }
}
