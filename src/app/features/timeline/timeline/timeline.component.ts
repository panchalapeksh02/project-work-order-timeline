// src/app/features/timeline/timeline.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewMode } from '../../../core/models/models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  viewMode = signal<ViewMode>('Day');

  setViewMode(mode: string) {
    this.viewMode.set(mode as ViewMode);
  }
}
