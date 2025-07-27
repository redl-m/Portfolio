import { ComponentFixture, TestBed } from '@angular/core/testing';
import { About } from './about';
import { ViewportService } from '../../services/viewport.service';
import { Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// About is a standalone component, so import it directly
describe('About Component', () => {
  let component: About;
  let fixture: ComponentFixture<About>;
  let mobileSubject: Subject<boolean>;

  beforeEach(async () => {
    mobileSubject = new Subject<boolean>();
    const viewportServiceStub: Partial<ViewportService> = {
      isMobileView$: mobileSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [About, NoopAnimationsModule],
      providers: [
        { provide: ViewportService, useValue: viewportServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    component = fixture.componentInstance;

    // Provide a fake bar element for showBar positioning
    const barDiv = document.createElement('div');
    component.barEl = new ElementRef<HTMLDivElement>(barDiv);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => component.ngOnInit());

    it('should subscribe and set isMobileView true', () => {
      mobileSubject.next(true);
      expect(component.isMobileView).toBeTrue();
    });

    it('should reset selectedTile when switching to desktop', () => {
      mobileSubject.next(true);
      component.selectedTile = 'travelling';
      mobileSubject.next(false);
      expect(component.isMobileView).toBeFalse();
      expect(component.selectedTile).toBeNull();
    });
  });

  describe('toggleMap', () => {
    it('should toggle the showMap flag', () => {
      component.showMap = false;
      component.toggleMap();
      expect(component.showMap).toBeTrue();
      component.toggleMap();
      expect(component.showMap).toBeFalse();
    });
  });

  describe('selectTile', () => {
    it('should set and clear selectedTile', () => {
      expect(component.selectedTile).toBeNull();
      (component as any).selectTile('causes');
      expect(component.selectedTile).toBe('causes');
      (component as any).selectTile(null);
      expect(component.selectedTile).toBeNull();
    });
  });

  describe('onMapReady', () => {
    let mockMap: any;
    let container: HTMLDivElement;

    beforeEach(() => {
      // Prepare a container for overlays
      container = document.createElement('div');
      container.style.position = 'static';

      // Mock map methods and properties
      mockMap = jasmine.createSpyObj('map', [
        'getContainer', 'on', 'fitBounds', 'latLngToContainerPoint', 'addLayer'
      ]);
      mockMap.getContainer.and.returnValue(container);
      mockMap.scrollWheelZoom = jasmine.createSpyObj('scrollWheelZoom', ['disable', 'enable']);
      mockMap.fitBounds.and.returnValue(null);
      mockMap.latLngToContainerPoint.and.returnValue({ x: 50, y: 50 });
      mockMap.on.and.callFake((event: string, fn: any) => {});
      mockMap.addLayer.and.callFake(() => {});

      // Provide remove method stub for cleanup in ngOnDestroy
      mockMap.remove = jasmine.createSpy('remove');

      // No stubbing of L imports; use real methods
    });

    it('should assign map instance', () => {
      component.onMapReady(mockMap as L.Map);
      expect((component as any).map).toBe(mockMap);
    });

    it('should append two overlays to the map container', () => {
      component.isMobileView = false;
      component.trips = [];
      component.onMapReady(mockMap as L.Map);
      const overlays = container.querySelectorAll('.map-overlay');
      expect(overlays.length).toBe(2);
    });
  });
});
