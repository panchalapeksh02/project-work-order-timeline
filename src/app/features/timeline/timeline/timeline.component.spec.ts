import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineComponent } from './timeline.component';
import { TimelineService } from '../../../core/services/timeline.service';
import { signal, computed } from '@angular/core';
import { ViewMode, WorkOrderDocument } from '../../../core/models/models';
import { OrderModalComponent } from '../order-modal/order-modal.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';

// --- 1. Mock the Child Component ---
// This prevents the real modal from rendering and complicating the test
@Component({
  selector: 'app-order-modal',
  standalone: true,
  template: ''
})
class MockOrderModalComponent {
  @Input() order: any;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() saveEvent = new EventEmitter<any>();
  @Output() deleteEvent = new EventEmitter<string>();
}

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let timelineServiceSpy: jasmine.SpyObj<TimelineService>;

  // --- 2. Mock Data & Signals ---
  const mockViewMode = signal<ViewMode>('Day');
  const mockWorkCenters = signal([]);
  const mockWorkOrders = signal([]);
  
  // Create a fixed date range for testing style calculations
  // Start: Jan 1, 2024. End: Jan 5, 2024
  const startDate = new Date('2024-01-01T00:00:00');
  const dates = [
    new Date(startDate),
    new Date(startDate.setDate(startDate.getDate() + 1)),
    new Date(startDate.setDate(startDate.getDate() + 1)),
    new Date(startDate.setDate(startDate.getDate() + 1)),
    new Date(startDate.setDate(startDate.getDate() + 1)),
  ];
  const mockVisibleDates = signal(dates);
  const mockConflictingOrderIds = computed(() => new Set<string>());
  const mockFilteredWorkCenters = computed(() => []);

  beforeEach(async () => {
    // --- 3. Setup Service Spy ---
    timelineServiceSpy = jasmine.createSpyObj('TimelineService', [
      'setMode',
      'setSearchTerm',
      'updateOrder',
      'addOrder',
      'deleteOrder'
    ]);

    // Attach signals to the spy (mimicking the real service properties)
    // @ts-ignore - forcing read-only properties for testing
    timelineServiceSpy.viewMode = mockViewMode;
    // @ts-ignore
    timelineServiceSpy.workCenters = mockWorkCenters;
    // @ts-ignore
    timelineServiceSpy.workOrders = mockWorkOrders;
    // @ts-ignore
    timelineServiceSpy.visibleDates = mockVisibleDates;
    // @ts-ignore
    timelineServiceSpy.conflictingOrderIds = mockConflictingOrderIds;
    // @ts-ignore
    timelineServiceSpy.filteredWorkCenters = mockFilteredWorkCenters;

    await TestBed.configureTestingModule({
      imports: [TimelineComponent],
      providers: [
        { provide: TimelineService, useValue: timelineServiceSpy }
      ]
    })
    .overrideComponent(TimelineComponent, {
      remove: { imports: [OrderModalComponent] },
      add: { imports: [MockOrderModalComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('View Mode', () => {
    it('should call service to set view mode', () => {
      component.setViewMode('Week');
      expect(timelineServiceSpy.setMode).toHaveBeenCalledWith('Week');
    });
  });

  describe('Search', () => {
    it('should call service to set search term', () => {
      const input = document.createElement('input');
      input.value = 'Assembly';
      const event = { target: input } as unknown as Event;

      component.onSearch(event);
      expect(timelineServiceSpy.setSearchTerm).toHaveBeenCalledWith('Assembly');
    });
  });

  describe('Modal Actions', () => {
    it('should open modal for creating a new order', () => {
      component.onCreateOrder('wc1');
      
      expect(component.isModalOpen()).toBeTrue();
      const selected = component.selectedOrder();
      expect(selected?.docId).toBe(''); // Empty ID for new
      expect(selected?.data.workCenterId).toBe('wc1');
    });

    it('should open modal for editing an existing order', () => {
      const existingOrder: WorkOrderDocument = {
        docId: '123',
        docType: 'workOrder',
        data: { name: 'Test', workCenterId: 'wc1', startDate: '', endDate: '', status: 'open' }
      };
      
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation'); // Ensure stopPropagation is called

      component.onEditOrder(existingOrder, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isModalOpen()).toBeTrue();
      expect(component.selectedOrder()).toEqual(existingOrder);
    });

    it('should close modal and reset selection', () => {
      component.isModalOpen.set(true);
      component.closeModal();
      expect(component.isModalOpen()).toBeFalse();
      expect(component.selectedOrder()).toBeNull();
    });
  });

  describe('CRUD Operations', () => {
    it('should call updateOrder if docId exists', () => {
      const existingOrder: WorkOrderDocument = {
        docId: '123',
        docType: 'workOrder',
        data: { name: 'Update', workCenterId: 'wc1', startDate: '', endDate: '', status: 'open' }
      };

      component.onSaveOrder(existingOrder);

      expect(timelineServiceSpy.updateOrder).toHaveBeenCalledWith(existingOrder);
      expect(component.isModalOpen()).toBeFalse();
    });

    it('should generate ID and call addOrder if docId is missing', () => {
      const newOrder: WorkOrderDocument = {
        docId: '',
        docType: 'workOrder',
        data: { name: 'New', workCenterId: 'wc1', startDate: '', endDate: '', status: 'open' }
      };

      component.onSaveOrder(newOrder);

      expect(newOrder.docId).not.toBe(''); // ID should be generated
      expect(newOrder.docId).toContain('wo_');
      expect(timelineServiceSpy.addOrder).toHaveBeenCalledWith(newOrder);
      expect(component.isModalOpen()).toBeFalse();
    });

    it('should call deleteOrder', () => {
      component.onDeleteOrder('123');
      expect(timelineServiceSpy.deleteOrder).toHaveBeenCalledWith('123');
      expect(component.isModalOpen()).toBeFalse();
    });
  });

  describe('Style Calculations (getOrderStyles)', () => {
    const baseDate = new Date('2024-01-01T00:00:00');
    const cleanDates = [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      return d;
    });

    beforeEach(() => {
      // Update the signal with our clean dates before these tests run
      mockVisibleDates.set(cleanDates);
    });

    it('should return empty object if dates are missing', () => {
      const order: WorkOrderDocument = {
        docId: '1', docType: 'workOrder', data: { startDate: '', endDate: '', name: '', workCenterId: '', status: 'open' }
      };
      const styles = component.getOrderStyles(order);
      expect(styles).toEqual({});
    });

    it('should calculate correct position for DAY mode', () => {
      mockViewMode.set('Day'); 
      
      // Order starts Jan 2, Ends Jan 4 (2 days duration)
      const order: WorkOrderDocument = {
        docId: '1', docType: 'workOrder', 
        data: { 
          startDate: '2024-01-02T00:00:00', 
          endDate: '2024-01-04T00:00:00', 
          name: '', workCenterId: '', status: 'open' 
        }
      };

      const styles = component.getOrderStyles(order);
      
      // Offset: Jan 2 - Jan 1 = 1 day. 
      // 1 day * 100px = 100px left
      // Duration: Jan 4 - Jan 2 = 2 days.
      // 2 days * 100px = 200px width
      expect(styles['left']).toBe('100px');
      expect(styles['width']).toBe('200px');
    });

    it('should calculate correct position for WEEK mode', () => {
      mockViewMode.set('Week');
      // In component: pixelsPerDay = 100 / 7 (~14.2857)
      const order: WorkOrderDocument = {
        docId: '1', docType: 'workOrder', 
        data: { 
          startDate: '2024-01-02T00:00:00', 
          endDate: '2024-01-09T00:00:00', 
          name: '', workCenterId: '', status: 'open' 
        }
      };
      // Offset: 1 day (Jan 2 vs Jan 1)
      // Duration: 7 days (Jan 9 vs Jan 2)

      const styles = component.getOrderStyles(order);
      
      // Left: 1 * (100/7) approx 14.28px
      // Width: 7 * (100/7) = 100px
      const leftVal = parseFloat(styles['left']!.replace('px', ''));
      const widthVal = parseFloat(styles['width']!.replace('px', ''));

      expect(leftVal).toBeCloseTo(14.28, 1);
      expect(widthVal).toBeCloseTo(100, 1);
    });
  });
});
