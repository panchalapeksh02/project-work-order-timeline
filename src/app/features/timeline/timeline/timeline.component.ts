import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineService } from '../../../core/services/timeline.service';
import { ViewMode, WorkOrderDocument } from '../../../core/models/models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  private timelineService = inject(TimelineService);

  viewMode = this.timelineService.viewMode;
  workCenters = this.timelineService.workCenters;
  workOrders = this.timelineService.workOrders;
  visibleDates = this.timelineService.visibleDates;

  setViewMode(mode: ViewMode) {
    this.timelineService.setMode(mode);
  }

  getOrderStyles(order: WorkOrderDocument): Record<string, string> {
    const dates = this.visibleDates();
    
    if (!dates?.length || !order.data.startDate || !order.data.endDate) {
      return {};
    }

    // 1. Get Timeline Start & Normalize
    const [firstDate] = dates; 
    const timelineStartObj = new Date(firstDate);
    timelineStartObj.setHours(0, 0, 0, 0); 
    const timelineStart = timelineStartObj.getTime();

    // 2. Get Order Start/End & Normalize
    const orderStartObj = new Date(order.data.startDate);
    orderStartObj.setHours(0, 0, 0, 0);
    const orderStart = orderStartObj.getTime();

    const orderEndObj = new Date(order.data.endDate);
    orderEndObj.setHours(0, 0, 0, 0);
    const orderEnd = orderEndObj.getTime();

    // 3. Constants
    const msPerDay = 1000 * 60 * 60 * 24;
    const CELL_WIDTH_PX = 100; // Must match CSS .date-cell width

    // 4. Calculate Duration in Days
    const offsetDays = (orderStart - timelineStart) / msPerDay;
    const durationDays = (orderEnd - orderStart) / msPerDay;

    // 5. Adjust for View Mode (Day vs Week vs Month)
    let leftPx = 0;
    let widthPx = 0;
    const currentMode = this.viewMode(); // Get the current mode

    if (currentMode === 'Day') {
        // 1 Column = 1 Day
        leftPx = offsetDays * CELL_WIDTH_PX;
        widthPx = durationDays * CELL_WIDTH_PX;
    } 
    else if (currentMode === 'Week') {
        // 1 Column = 7 Days
        // So 1 Day takes up (100px / 7) space
        const pixelsPerDay = CELL_WIDTH_PX / 7;
        leftPx = offsetDays * pixelsPerDay;
        widthPx = durationDays * pixelsPerDay;
    } 
    else if (currentMode === 'Month') {
        // 1 Column = 1 Month (approx 30.44 days)
        // A more accurate way is to calculate based on the specific month length, 
        // but for a simple visual, we can use an average.
        const pixelsPerDay = CELL_WIDTH_PX / 30.44; 
        leftPx = offsetDays * pixelsPerDay;
        widthPx = durationDays * pixelsPerDay;
    }

    return {
      left: `${leftPx}px`,
      width: `${Math.max(widthPx, 5)}px`, // Ensure at least 5px wide so it's visible
      position: 'absolute'
    };
  }
}
