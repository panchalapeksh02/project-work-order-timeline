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
  
  // 1. The list of Work Centers (Rows)
  readonly workCenters = signal<WorkCenterDocument[]>(this.dataService.getWorkCenters());

  // 2. The list of Work Orders (Bars)
  readonly workOrders = signal<WorkOrderDocument[]>(this.dataService.getWorkOrders());

  // 3. Current View Mode (Day/Week/Month)
  readonly viewMode = signal<ViewMode>('Day');

  // 4. The "Center" date of the view (Defaults to today)
  readonly currentDate = signal<Date>(new Date());

  // --- Computed Values (Derived State) ---

  // Calculate the columns (dates) to display based on ViewMode
  readonly visibleDates = computed(() => {
    const mode = this.viewMode();
    const center = new Date(this.currentDate());
    const dates: Date[] = [];

    if (mode === 'Day') {
      // Show 14 days before and 14 days after today (approx 1 month total)
      const start = new Date(center);
      start.setDate(center.getDate() - 14);
      
      for (let i = 0; i < 30; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d);
      }
    } 
    else if (mode === 'Week') {
      // Show 4 weeks before and 4 weeks after
      // Logic: Find the Monday of the current week, then go back 4 weeks
      const start = new Date(center);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
      start.setDate(diff - 28); // Go back 4 weeks

      for (let i = 0; i < 12; i++) { // Show 12 weeks
        const d = new Date(start);
        d.setDate(start.getDate() + (i * 7));
        dates.push(d);
      }
    }
    else if (mode === 'Month') {
      // Show 6 months before and 6 months after
      const start = new Date(center);
      start.setMonth(center.getMonth() - 6);
      start.setDate(1); // Start of month

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

  // Helper to check for overlaps (We will use this later in the Form)
  checkOverlap(newOrder: WorkOrderDocument): boolean {
    const newStart = new Date(newOrder.data.startDate).getTime();
    const newEnd = new Date(newOrder.data.endDate).getTime();

    return this.workOrders().some(existing => {
      // 1. Skip if it's the same order (editing self)
      if (existing.docId === newOrder.docId) return false;
      
      // 2. Skip if different work center
      if (existing.data.workCenterId !== newOrder.data.workCenterId) return false;

      const existingStart = new Date(existing.data.startDate).getTime();
      const existingEnd = new Date(existing.data.endDate).getTime();

      // 3. Overlap Formula: (StartA <= EndB) and (EndA >= StartB)
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
