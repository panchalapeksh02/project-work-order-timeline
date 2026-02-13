import { Injectable } from '@angular/core';
import { WorkCenterDocument, WorkOrderDocument } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_KEY = 'app_work_orders';

  getWorkCenters(): WorkCenterDocument[] {
    return [
      { docId: 'wc1', docType: 'workCenter', data: { name: 'Extrusion Line A' } },
      { docId: 'wc2', docType: 'workCenter', data: { name: 'CNC Machine 1' } },
      { docId: 'wc3', docType: 'workCenter', data: { name: 'Assembly Station' } },
      { docId: 'wc4', docType: 'workCenter', data: { name: 'Quality Control' } },
      { docId: 'wc5', docType: 'workCenter', data: { name: 'Packaging Line' } },
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
      {
        docId: 'wo1', docType: 'workOrder',
        data: { name: 'Order #101', workCenterId: 'wc1', status: 'complete', startDate: '2026-02-10', endDate: '2026-02-12' }
      },
      {
        docId: 'wo2', docType: 'workOrder',
        data: { name: 'Order #102', workCenterId: 'wc1', status: 'in-progress', startDate: '2026-02-13', endDate: '2026-02-16' }
      },
      // ... add more sample data if you wish
    ];

    this.saveWorkOrders(defaultData);
    return defaultData;
  }

  saveWorkOrders(orders: WorkOrderDocument[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
  }
}
