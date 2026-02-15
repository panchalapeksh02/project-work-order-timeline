import { TestBed } from '@angular/core/testing';
import { TimelineService } from './timeline.service';
import { DataService } from './data.service';
import { WorkCenterDocument, WorkOrderDocument, ViewMode } from '../models/models';

describe('TimelineService', () => {
  let service: TimelineService;
  let dataServiceSpy: jasmine.SpyObj<DataService>;

  // --- Mock Data ---
  const mockWorkCenters: WorkCenterDocument[] = [
    { docId: 'wc1', docType: 'workCenter', data: { name: 'Assembly A', group: 'Factory 1' } },
    { docId: 'wc2', docType: 'workCenter', data: { name: 'Assembly B', group: 'Factory 1' } },
    { docId: 'wc3', docType: 'workCenter', data: { name: 'Packaging', group: 'Factory 2' } },
  ];

  const mockWorkOrders: WorkOrderDocument[] = [
    {
      docId: 'wo1',
      docType: 'workOrder',
      data: {
        workCenterId: 'wc1',
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        status: 'open',
        name: 'Order 1'
      }
    }
  ];

  beforeEach(() => {
    // Create a spy for DataService methods
    dataServiceSpy = jasmine.createSpyObj('DataService', ['getWorkCenters', 'getWorkOrders', 'saveWorkOrders']);

    // Return mock data when these methods are called
    dataServiceSpy.getWorkCenters.and.returnValue(mockWorkCenters);
    dataServiceSpy.getWorkOrders.and.returnValue(mockWorkOrders);

    TestBed.configureTestingModule({
      providers: [
        TimelineService,
        { provide: DataService, useValue: dataServiceSpy }
      ]
    });

    service = TestBed.inject(TimelineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize signals with data from DataService', () => {
      expect(service.workCenters()).toEqual(mockWorkCenters);
      expect(service.workOrders()).toEqual(mockWorkOrders);
      expect(service.viewMode()).toBe('Day');
      expect(dataServiceSpy.getWorkCenters).toHaveBeenCalled();
      expect(dataServiceSpy.getWorkOrders).toHaveBeenCalled();
    });
  });

  describe('View Mode and Date Calculations', () => {
    it('should update view mode', () => {
      service.setMode('Week');
      expect(service.viewMode()).toBe('Week');
    });

    it('should calculate visible dates correctly for DAY mode', () => {
      // Mock current date to a fixed point: Jan 10, 2024
      const fixedDate = new Date('2024-01-10T00:00:00');
      service.currentDate.set(fixedDate);
      service.setMode('Day');

      const dates = service.visibleDates();
      
      // Logic: Start 5 days before (Jan 5), Total 20 days
      expect(dates.length).toBe(20);
      expect(dates[0].getDate()).toBe(5); // Jan 5
      expect(dates[19].getDate()).toBe(24); // Jan 24
    });

    it('should calculate visible dates correctly for WEEK mode', () => {
      // Mock date: Wednesday, Jan 10, 2024
      const fixedDate = new Date('2024-01-10T00:00:00'); 
      service.currentDate.set(fixedDate);
      service.setMode('Week');

      const dates = service.visibleDates();

      // Logic: Find Monday of current week (Jan 8), go back 2 weeks (Dec 25, 2023)
      // Total 12 weeks
      expect(dates.length).toBe(12);
      
      // First date should be Monday, Dec 25, 2023
      expect(dates[0].getFullYear()).toBe(2023);
      expect(dates[0].getMonth()).toBe(11); // Dec
      expect(dates[0].getDate()).toBe(25);
    });

    it('should calculate visible dates correctly for MONTH mode', () => {
       // Mock date: Jan 10, 2024
       const fixedDate = new Date('2024-01-10T00:00:00');
       service.currentDate.set(fixedDate);
       service.setMode('Month');
 
       const dates = service.visibleDates();
 
       // Logic: 2 months before (Nov 2023), start on 1st. Total 12 months.
       expect(dates.length).toBe(12);
       
       // First date: Nov 1, 2023
       expect(dates[0].getFullYear()).toBe(2023);
       expect(dates[0].getMonth()).toBe(10); // Nov (0-indexed)
       expect(dates[0].getDate()).toBe(1);
    });
  });

  it('should add a new order and save to DataService', () => {
    const newOrder: WorkOrderDocument = {
      docId: 'wo2',
      docType: 'workOrder',
      data: {
        workCenterId: 'wc2',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'open',
        name: 'Order 2'
      }
    };
    
    service.addOrder(newOrder);
    const orders = service.workOrders();
    expect(orders.length).toBe(2);
    expect(orders.find(o => o.docId === 'wo2')).toEqual(newOrder);
    expect(dataServiceSpy.saveWorkOrders).toHaveBeenCalledWith(orders);
  });

  it('should delete an order and save to DataService', () => {
    service.deleteOrder('wo1');

    const orders = service.workOrders();
    expect(orders.length).toBe(0);
    expect(dataServiceSpy.saveWorkOrders).toHaveBeenCalledWith([]);
  });

  describe('Computed: filteredWorkCenters', () => {
    it('should return all centers if search term is empty', () => {
      service.setSearchTerm('');
      expect(service.filteredWorkCenters().length).toBe(3);
    });

    it('should filter centers by name (case insensitive)', () => {
      service.setSearchTerm('pack');
      const result = service.filteredWorkCenters();
      expect(result.length).toBe(1);
      expect(result[0].docId).toBe('wc3');
    });

    it('should sort results by group', () => {
      service.setSearchTerm('');
      
      // Mock data has Factory 1 (wc1, wc2) and Factory 2 (wc3)
      // Factory 1 should come before Factory 2 alphabetically
      const result = service.filteredWorkCenters();
      
      expect(result[0].data.group).toBe('Factory 1');
      expect(result[2].data.group).toBe('Factory 2');
    });
  });
});
