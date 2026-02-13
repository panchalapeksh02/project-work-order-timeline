import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkOrderDocument } from '../../../core/models/models';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss']
})
export class OrderModalComponent implements OnInit {
  @Input() order!: WorkOrderDocument;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() saveEvent = new EventEmitter<WorkOrderDocument>();
  @Output() deleteEvent = new EventEmitter<string>();

  localOrder: any; // TBD: Create a proper interface for this if needed
  isEditMode = false;

  ngOnInit() {
    // Create a deep copy to avoid editing the parent data directly until saved
    if (this.order) {
      this.localOrder = JSON.parse(JSON.stringify(this.order));
      this.isEditMode = !!this.localOrder.docId;
    }
  }

  save() {
    this.saveEvent.emit(this.localOrder);
  }

  close() {
    this.closeEvent.emit();
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this order?')) {
      this.deleteEvent.emit(this.localOrder.docId);
    }
  }
}
