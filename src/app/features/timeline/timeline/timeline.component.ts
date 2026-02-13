import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineService } from '../../../core/services/timeline.service';
import { ViewMode, WorkOrderDocument } from '../../../core/models/models';
import { OrderModalComponent } from '../order-modal/order-modal.component';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, OrderModalComponent],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  private timelineService = inject(TimelineService);

  viewMode = this.timelineService.viewMode;
  workCenters = this.timelineService.workCenters;
  workOrders = this.timelineService.workOrders;
  visibleDates = this.timelineService.visibleDates;

  // --- Modal State ---
  selectedOrder = signal<WorkOrderDocument | null>(null);
  isModalOpen = signal(false);

  setViewMode(mode: ViewMode) {
    this.timelineService.setMode(mode);
  }

  // --- Modal Actions ---

  onEditOrder(order: WorkOrderDocument, event: MouseEvent) {
    event.stopPropagation();
    this.selectedOrder.set(order);
    this.isModalOpen.set(true);
  }

  onCreateOrder(wcId: string) {
    const now = new Date();
   const [todayString] = new Date().toISOString().split('T');

    const newOrder: WorkOrderDocument = {
      docId: '',
      docType: 'workOrder',
      data: {
        name: 'New Order',
        workCenterId: wcId,
        status: 'open',
        startDate: todayString,
        endDate: todayString
      }
    };
    this.selectedOrder.set(newOrder);
    this.isModalOpen.set(true);
  }

  onSaveOrder(order: WorkOrderDocument) {
    if (order.docId) {
      this.timelineService.updateOrder(order);
    } else {
      order.docId = 'wo_' + Math.random().toString(36).substring(2, 9);
      this.timelineService.addOrder(order);
    }
    this.closeModal();
  }

  onDeleteOrder(docId: string) {
    this.timelineService.deleteOrder(docId);
    this.closeModal();
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  // --- Style Calculation ---

  getOrderStyles(order: WorkOrderDocument): Record<string, string> {
    const dates = this.visibleDates();
    
    if (!dates || dates.length === 0 || !order.data.startDate || !order.data.endDate) {
      return {};
    }

    // Access the first date safely without brackets to avoid auto-linking
    const firstDate = dates.at(0);
    if (!firstDate) return {};

    const timelineStartObj = new Date(firstDate);
    timelineStartObj.setHours(0, 0, 0, 0); 
    const timelineStart = timelineStartObj.getTime();

    const orderStartObj = new Date(order.data.startDate);
    orderStartObj.setHours(0, 0, 0, 0);
    const orderStart = orderStartObj.getTime();

    const orderEndObj = new Date(order.data.endDate);
    orderEndObj.setHours(0, 0, 0, 0);
    const orderEnd = orderEndObj.getTime();

    const msPerDay = 1000 * 60 * 60 * 24;
    const CELL_WIDTH_PX = 100;

    const offsetDays = (orderStart - timelineStart) / msPerDay;
    const durationDays = (orderEnd - orderStart) / msPerDay;

    let leftPx = 0;
    let widthPx = 0;
    const currentMode = this.viewMode();

    if (currentMode === 'Day') {
        leftPx = offsetDays * CELL_WIDTH_PX;
        widthPx = durationDays * CELL_WIDTH_PX;
    } 
    else if (currentMode === 'Week') {
        const pixelsPerDay = CELL_WIDTH_PX / 7;
        leftPx = offsetDays * pixelsPerDay;
        widthPx = durationDays * pixelsPerDay;
    } 
    else if (currentMode === 'Month') {
        const pixelsPerDay = CELL_WIDTH_PX / 30.44; 
        leftPx = offsetDays * pixelsPerDay;
        widthPx = durationDays * pixelsPerDay;
    }

    return {
      left: `${leftPx}px`,
      width: `${Math.max(widthPx, 5)}px`,
      position: 'absolute'
    };
  }
}
