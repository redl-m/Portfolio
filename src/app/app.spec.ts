import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { ComponentFixture } from '@angular/core/testing';
import { ɵLOTTIE_OPTIONS } from 'ngx-lottie';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('App Component', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let mockSections: HTMLElement[];

  beforeEach(async () => {
    // Create fake section elements
    mockSections = ['sec0', 'sec1', 'sec2'].map(id => {
      const el = document.createElement('div');
      el.classList.add('section');
      el.id = id;
      return el;
    });

    // Spy document.querySelectorAll to return our mocks
    spyOn(document, 'querySelectorAll').and.returnValue(mockSections as any);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ɵLOTTIE_OPTIONS, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('ngAfterViewInit should populate sections', () => {
    component.ngAfterViewInit();
    const sections = (component as any).sections;
    expect(sections.length).toBe(3);
    expect(sections.map((s: { id: any; }) => s.id)).toEqual(['sec0', 'sec1', 'sec2']);
  });

  describe('onScroll logic', () => {
    let event: Partial<WheelEvent>;
    const MOCK_VIEWPORT_HEIGHT = 800;
    let threshold: number;

    beforeEach(() => {
      // The 'get' is important for getter properties.
      spyOnProperty(window, 'innerHeight', 'get').and.returnValue(MOCK_VIEWPORT_HEIGHT);

      component.ngAfterViewInit();
      threshold = (component as any).VISIBILITY_THRESHOLD;

      // Reset component state for each test
      (component as any).isScrolling = false;
      (component as any).currentIndex = 0;

      // Create a default event object for scrolling down
      event = { deltaY: 100, preventDefault: jasmine.createSpy() };
    });

    it('ignores scroll when already scrolling', () => {
      (component as any).isScrolling = true;
      component.onScroll(event as WheelEvent);
      expect(event.preventDefault).toHaveBeenCalled();
      expect((component as any).currentIndex).toBe(0);
    });

    it('does not snap when target index out of bounds', () => {
      (component as any).currentIndex = mockSections.length - 1; // Start at the last section
      component.onScroll(event as WheelEvent);
      expect((component as any).currentIndex).toBe(mockSections.length - 1);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not snap if visible fraction below threshold', () => {
      const target = mockSections[1];
      // Set the top position so the visible fraction is just below the threshold
      const rectTop = MOCK_VIEWPORT_HEIGHT - (MOCK_VIEWPORT_HEIGHT * (threshold - 0.01));
      spyOn(target, 'getBoundingClientRect').and.returnValue({ top: rectTop, bottom: 0 } as any);

      component.onScroll(event as WheelEvent);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect((component as any).currentIndex).toBe(0);
    });

    it('snaps down when visible fraction above threshold', fakeAsync(() => {
      const target = mockSections[1]; // Target is the next section
      spyOn(target, 'scrollIntoView');

      // Make the target section visible just enough to pass the threshold
      const rectTop = MOCK_VIEWPORT_HEIGHT - (MOCK_VIEWPORT_HEIGHT * (threshold + 0.1));
      spyOn(target, 'getBoundingClientRect').and.returnValue({ top: rectTop, bottom: 0 } as any);

      component.onScroll(event as WheelEvent);

      expect(event.preventDefault).toHaveBeenCalled();
      expect((component as any).isScrolling).toBeTrue();
      expect((component as any).currentIndex).toBe(1);
      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      tick(900);
      expect((component as any).isScrolling).toBeFalse();
    }));

    it('snaps up when scrolling up and visible fraction above threshold', fakeAsync(() => {
      // Setup initial state: we are on the second section
      (component as any).currentIndex = 1;
      // Create an event for scrolling up
      event = { deltaY: -100, preventDefault: jasmine.createSpy() };

      const target = mockSections[0]; // Target is the previous section
      spyOn(target, 'scrollIntoView');

      // Make the target section visible just enough to pass the threshold from the bottom
      const rectBottom = MOCK_VIEWPORT_HEIGHT * (threshold + 0.1);
      spyOn(target, 'getBoundingClientRect').and.returnValue({ top: 0, bottom: rectBottom } as any);

      component.onScroll(event as WheelEvent);

      expect(event.preventDefault).toHaveBeenCalled();
      expect((component as any).currentIndex).toBe(0);
      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      tick(900);
      expect((component as any).isScrolling).toBeFalse();
    }));
  });
});
