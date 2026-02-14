// src/app/core/services/timeline.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { DataService } from './data.service';
import { WorkOrderDocument, ViewMode, WorkCenterDocument } from '../models/models';

@Injectable({
  providedIn: 'root',
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
    } else if (mode === 'Week') {
      // START: Find the Monday of the current week, then go back 2 weeks
      // TOTAL: 12 Weeks
      const start = new Date(center);
      const day = start.getDay(); // 0 is Sunday
      // Adjust to get Monday (if Sunday(0), go back 6 days. Else go back day-1)
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);

      const monday = new Date(start.setDate(diff));
      monday.setDate(monday.getDate() - 7 * 2); // Go back 2 weeks

      for (let i = 0; i < 12; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i * 7);
        dates.push(d);
      }
    } else if (mode === 'Month') {
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

  checkOverlap(newOrder: WorkOrderDocument): boolean {
    const newStart = new Date(newOrder.data.startDate).getTime();
    const newEnd = new Date(newOrder.data.endDate).getTime();

    return this.workOrders().some((existing) => {
      if (existing.docId === newOrder.docId) return false;
      if (existing.data.workCenterId !== newOrder.data.workCenterId) return false;
      const existingStart = new Date(existing.data.startDate).getTime();
      const existingEnd = new Date(existing.data.endDate).getTime();
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  }

  addOrder(order: WorkOrderDocument) {
    this.workOrders.update((orders) => {
      const newList = [...orders, order];
      this.dataService.saveWorkOrders(newList);
      return newList;
    });
  }

  updateOrder(updatedOrder: WorkOrderDocument) {
    this.workOrders.update((orders) => {
      const newList = orders.map((o) => (o.docId === updatedOrder.docId ? updatedOrder : o));
      this.dataService.saveWorkOrders(newList);
      return newList;
    });
  }

  deleteOrder(docId: string) {
    this.workOrders.update((orders) => {
      const newList = orders.filter((o) => o.docId !== docId);
      this.dataService.saveWorkOrders(newList);
      return newList;
    });
  }

  // Add this inside the TimelineService class

  // A Set of IDs for orders that have conflicts
  readonly conflictingOrderIds = computed(() => {
    const orders = this.workOrders();
    const conflicts = new Set<string>();

    // Compare every order against every other order
    for (let i = 0; i < orders.length; i++) {
      for (let j = i + 1; j < orders.length; j++) {
        const a = orders[i];
        const b = orders[j];

        // 1. Must be on the same Work Center
        if (a.data.workCenterId !== b.data.workCenterId) continue;

        // 2. Check Date Overlap
        const startA = new Date(a.data.startDate).getTime();
        const endA = new Date(a.data.endDate).getTime();
        const startB = new Date(b.data.startDate).getTime();
        const endB = new Date(b.data.endDate).getTime();

        // Overlap Formula: (StartA <= EndB) and (EndA >= StartB)
        if (startA <= endB && endA >= startB) {
          conflicts.add(a.docId);
          conflicts.add(b.docId);
        }
      }
    }
    return conflicts;
  });
}
