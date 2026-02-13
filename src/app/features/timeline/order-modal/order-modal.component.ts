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

  localOrder: any;
  isEditMode = false;
  errorMessage = ''; // To show validation errors

  ngOnInit() {
    if (this.order) {
      this.localOrder = JSON.parse(JSON.stringify(this.order));
      this.isEditMode = !!this.localOrder.docId;
    }
  }

  save() {
    if (this.validate()) {
      this.saveEvent.emit(this.localOrder);
    }
  }

  validate(): boolean {
    this.errorMessage = '';
    const data = this.localOrder.data;

    // 1. Check Required Fields
    if (!data.name || !data.name.trim()) {
      this.errorMessage = 'Order Name is required.';
      return false;
    }
    if (!data.startDate) {
      this.errorMessage = 'Start Date is required.';
      return false;
    }
    if (!data.endDate) {
      this.errorMessage = 'End Date is required.';
      return false;
    }

    // 2. Check Date Logic
    const start = new Date(data.startDate).getTime();
    const end = new Date(data.endDate).getTime();

    if (end < start) {
      this.errorMessage = 'End Date cannot be before Start Date.';
      return false;
    }

    return true;
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
