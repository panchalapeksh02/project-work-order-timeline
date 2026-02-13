import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineService } from '../../../core/services/timeline.service';
import { ViewMode } from '../../../core/models/models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule], // We need CommonModule for @for loops and DatePipe
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  // Inject the service
  timelineService = inject(TimelineService);

  // Expose signals for the template
  viewMode = this.timelineService.viewMode;
  workCenters = this.timelineService.workCenters;
  visibleDates = this.timelineService.visibleDates;

  setViewMode(mode: string) {
    this.timelineService.setMode(mode as ViewMode);
  }
}
