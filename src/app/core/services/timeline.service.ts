// src/app/core/services/timeline.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { DataService } from './data.service';
import { WorkOrderDocument, ViewMode, WorkCenterDocument } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private dataService = inject(DataService);

  // --- State Signals ---
  readonly workCenters = signal<WorkCenterDocument[]>(this.dataService.getWorkCenters());
  readonly workOrders = signal<WorkOrderDocument[]>(this.dataService.getWorkOrders());
  readonly viewMode = signal<ViewMode>('Day');
  readonly currentDate = signal<Date>(new Date());

  // --- Computed Values (Derived State) ---

  readonly visibleDates = computed(() => {
    const mode = this.viewMode();
    const center = new Date(this.currentDate());
    const dates: Date[] = [];

    if (mode === 'Day') {
      // START: 5 days before today
      // TOTAL: 20 days
      const start = new Date(center);
      start.setDate(center.getDate() - 5); 
      
      for (let i = 0; i < 20; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d);
      }
    } 
    else if (mode === 'Week') {
      // START: Find the Monday of the current week, then go back 2 weeks
      // TOTAL: 12 Weeks
      const start = new Date(center);
      const day = start.getDay(); // 0 is Sunday
      // Adjust to get Monday (if Sunday(0), go back 6 days. Else go back day-1)
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
      
      const monday = new Date(start.setDate(diff));
      monday.setDate(monday.getDate() - (7 * 2)); // Go back 2 weeks

      for (let i = 0; i < 12; i++) { 
        const d = new Date(monday);
        d.setDate(monday.getDate() + (i * 7));
        dates.push(d);
      }
    }
    else if (mode === 'Month') {
      // START: 2 Months before current month
      // TOTAL: 12 Months
      const start = new Date(center);
      start.setMonth(center.getMonth() - 2);
      start.setDate(1); // Always start on the 1st of the month

      for (let i = 0; i < 12; i++) {
        const d = new Date(start);
        d.setMonth(start.getMonth() + i);
        dates.push(d);
      }
    }

    return dates;
  });

  // --- Actions ---

  setMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  // ... (Keep existing add/update/delete/checkOverlap methods) ...
  
  checkOverlap(newOrder: WorkOrderDocument): boolean {
    const newStart = new Date(newOrder.data.startDate).getTime();
    const newEnd = new Date(newOrder.data.endDate).getTime();

    return this.workOrders().some(existing => {
      if (existing.docId === newOrder.docId) return false;
      if (existing.data.workCenterId !== newOrder.data.workCenterId) return false;
      const existingStart = new Date(existing.data.startDate).getTime();
      const existingEnd = new Date(existing.data.endDate).getTime();
      return (newStart <= existingEnd && newEnd >= existingStart);
    });
  }

  addOrder(order: WorkOrderDocument) {
    this.workOrders.update(orders => [...orders, order]);
  }

  updateOrder(updatedOrder: WorkOrderDocument) {
    this.workOrders.update(orders => 
      orders.map(o => o.docId === updatedOrder.docId ? updatedOrder : o)
    );
  }

  deleteOrder(docId: string) {
    this.workOrders.update(orders => orders.filter(o => o.docId !== docId));
  }
}
