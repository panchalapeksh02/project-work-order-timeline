import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderModalComponent } from './order-modal.component';
import { WorkOrderDocument } from '../../../core/models/models';

describe('OrderModalComponent', () => {
  let component: OrderModalComponent;
  let fixture: ComponentFixture<OrderModalComponent>;

  const mockOrder: WorkOrderDocument = {
    docId: 'wo1',
    docType: 'workOrder',
    data: {
      workCenterId: 'wc1',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      status: 'open',
      name: 'Order 1'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderModalComponent);
    component = fixture.componentInstance;
    component.order = mockOrder;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should clone the input order into localOrder', () => {
      // Use toEqual for object content comparison
      expect(component.localOrder).toEqual(mockOrder);
      expect(component.localOrder).not.toBe(mockOrder); 
    });

    it('should determine edit mode based on docId', () => {
      expect(component.isEditMode).toBeTrue();
    });

    it('should set isEditMode to false if docId is missing', () => {
      const newOrder = { 
        docId: '', 
        docType: 'workOrder', 
        data: { ...mockOrder.data } 
      } as WorkOrderDocument;

      component.order = newOrder;
      component.ngOnInit();
      
      expect(component.isEditMode).toBeFalse();
    });
  });

  describe('Validation Logic', () => {
    it('should return true if data is valid', () => {
      expect(component.validate()).toBeTrue();
      expect(component.errorMessage).toBe('');
    });

    it('should fail if Name is empty', () => {
      component.localOrder.data.name = '';
      expect(component.validate()).toBeFalse();
      expect(component.errorMessage).toContain('Name is required');
    });

    it('should fail if Start Date is empty', () => {
      component.localOrder.data.startDate = '';
      expect(component.validate()).toBeFalse();
      expect(component.errorMessage).toContain('Start Date is required');
    });

    it('should fail if End Date is empty', () => {
      component.localOrder.data.endDate = '';
      expect(component.validate()).toBeFalse();
      expect(component.errorMessage).toContain('End Date is required');
    });

    it('should fail if End Date is before Start Date', () => {
      component.localOrder.data.startDate = '2024-01-10';
      component.localOrder.data.endDate = '2024-01-05'; 
      expect(component.validate()).toBeFalse();
      expect(component.errorMessage).toContain('End Date cannot be before');
    });
  });

  describe('Actions', () => {
    it('should emit saveEvent with data if valid', () => {
      spyOn(component.saveEvent, 'emit');
      component.save();
      expect(component.saveEvent.emit).toHaveBeenCalledWith(component.localOrder);
    });

    it('should NOT emit saveEvent if invalid', () => {
      spyOn(component.saveEvent, 'emit');
      component.localOrder.data.name = ''; // Make it invalid
      component.save();
      expect(component.saveEvent.emit).not.toHaveBeenCalled();
    });

    it('should emit closeEvent when close is called', () => {
      spyOn(component.closeEvent, 'emit');
      component.close();
      expect(component.closeEvent.emit).toHaveBeenCalled();
    });

    it('should emit deleteEvent when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true); // Simulate User clicking OK
      spyOn(component.deleteEvent, 'emit');
      
      component.onDelete();
      
      // Check for the specific ID from mockOrder
      expect(component.deleteEvent.emit).toHaveBeenCalledWith('wo1');
    });

    it('should NOT emit deleteEvent when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false); // Simulate User clicking Cancel
      spyOn(component.deleteEvent, 'emit');
      
      component.onDelete();
      
      expect(component.deleteEvent.emit).not.toHaveBeenCalled();
    });
  });
});
