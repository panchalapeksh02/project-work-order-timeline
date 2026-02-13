// src/app/core/services/data.service.ts
import { Injectable } from '@angular/core';
import { WorkCenterDocument, WorkOrderDocument } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DataService {

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
    // Note: Dates are hardcoded relative to a hypothetical "today". 
    // In a real app, you might generate these relative to new Date() to always show data.
    return [
      {
        docId: 'wo1', docType: 'workOrder',
        data: { name: 'Order #101', workCenterId: 'wc1', status: 'complete', startDate: '2025-02-10', endDate: '2025-02-12' }
      },
      {
        docId: 'wo2', docType: 'workOrder',
        data: { name: 'Order #102', workCenterId: 'wc1', status: 'in-progress', startDate: '2025-02-13', endDate: '2025-02-16' }
      },
      {
        docId: 'wo3', docType: 'workOrder',
        data: { name: 'Order #205', workCenterId: 'wc2', status: 'blocked', startDate: '2025-02-11', endDate: '2025-02-15' }
      },
      {
        docId: 'wo4', docType: 'workOrder',
        data: { name: 'Order #300', workCenterId: 'wc3', status: 'open', startDate: '2025-02-10', endDate: '2025-02-18' }
      },
      {
        docId: 'wo5', docType: 'workOrder',
        data: { name: 'Order #401', workCenterId: 'wc4', status: 'complete', startDate: '2025-02-09', endDate: '2025-02-11' }
      },
      {
        docId: 'wo6', docType: 'workOrder',
        data: { name: 'Order #402', workCenterId: 'wc4', status: 'in-progress', startDate: '2025-02-12', endDate: '2025-02-14' }
      },
      {
        docId: 'wo7', docType: 'workOrder',
        data: { name: 'Order #500', workCenterId: 'wc5', status: 'open', startDate: '2025-02-14', endDate: '2025-02-20' }
      },
      {
        docId: 'wo8', docType: 'workOrder',
        data: { name: 'Order #501', workCenterId: 'wc5', status: 'open', startDate: '2025-02-08', endDate: '2025-02-10' }
      }
    ];
  }
}
