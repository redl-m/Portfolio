import { TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App } from './app';
import { provideLottieOptions } from 'ngx-lottie';

describe('App Component', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let componentAny: any; // To access private members for testing
  let mockSections: HTMLElement[];

  // Helper to create a mock TouchEvent
  const createTouchEvent = (clientY: number): TouchEvent => {
    // A simplified mock for Touch and TouchEvent for testing purposes
    const touch = new Touch({
      identifier: Date.now(),
      target: document.body, // The target of the specific touch point
      clientY: clientY
    });

    const touchEvent = new TouchEvent('touchevent', {
      touches: [touch],
      changedTouches: [touch],
      cancelable: true // Allows preventDefault() to be called without error
    });

    Object.defineProperty(touchEvent, 'target', {
      writable: false,
      value: document.body // The element that dispatched the event
    });

    return touchEvent;
  };

  beforeEach(async () => {
    // Create fake section elements, each with a spyable scrollIntoView method
    mockSections = ['hero', 'about', 'projects'].map(id => {
      const el = document.createElement('div');
      el.classList.add('section');
      el.id = id;
      spyOn(el, 'scrollIntoView'); // Spy on the method for each element
      return el;
    });

    // Spy on document.querySelectorAll to return our mock sections
    spyOn(document, 'querySelectorAll').and.returnValue(mockSections as any);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        // This provider is ESSENTIAL to fix the "No provider for InjectionToken LottieOptions!" error.
        provideLottieOptions({
          player: () => import('lottie-web'),
        }),
      ],
      // Use NO_ERRORS_SCHEMA to avoid having to declare all child components (Navbar, etc.)
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    componentAny = component; // Assign for private access

    // Manually trigger ngAfterViewInit to have full control over the test setup.
    // In a real scenario with fixture.detectChanges(), this would be called automatically.
    component.ngAfterViewInit();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // --- The rest of the test file remains the same ---

  describe('Initialization and Cleanup', () => {
    it('ngAfterViewInit should initialize sections from the DOM', () => {
      expect(document.querySelectorAll).toHaveBeenCalledWith('.section');
      expect(componentAny.sections.length).toBe(3);
      expect(componentAny.sections[0].id).toBe('hero');
    });

    it('ngAfterViewInit should add wheel and touch event listeners', () => {
      spyOn(window, 'addEventListener');
      // We need a fresh component instance for this test, as listeners are added in the root beforeEach
      const newFixture = TestBed.createComponent(App);
      const newComponent = newFixture.componentInstance;
      newComponent.ngAfterViewInit();
      expect(window.addEventListener).toHaveBeenCalledWith('wheel', (newComponent as any).onScroll, { passive: false });
      expect(window.addEventListener).toHaveBeenCalledWith('touchstart', (newComponent as any).onTouchStart, { passive: false });
      expect(window.addEventListener).toHaveBeenCalledWith('touchmove', (newComponent as any).onTouchMove, { passive: false });
    });

    it('ngOnDestroy should remove all event listeners', () => {
      spyOn(window, 'removeEventListener');
      component.ngOnDestroy();
      expect(window.removeEventListener).toHaveBeenCalledWith('wheel', componentAny.onScroll);
      expect(window.removeEventListener).toHaveBeenCalledWith('touchstart', componentAny.onTouchStart);
      expect(window.removeEventListener).toHaveBeenCalledWith('touchmove', componentAny.onTouchMove);
    });
  });

  describe('Core Scrolling Logic: scrollToSection()', () => {
    it('should scroll down to the next section and manage isScrolling flag', fakeAsync(() => {
      componentAny.currentIndex = 0;
      componentAny.scrollToSection(1);

      // Check immediate effects
      expect(componentAny.isScrolling).toBeTrue();
      expect(componentAny.currentIndex).toBe(1);
      expect(mockSections[1].scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      // Check effects after timeout
      tick(900);
      expect(componentAny.isScrolling).toBeFalse();
    }));

    it('should scroll up to the previous section', fakeAsync(() => {
      componentAny.currentIndex = 2;
      componentAny.scrollToSection(-1);

      expect(componentAny.currentIndex).toBe(1);
      expect(mockSections[1].scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      tick(900);
    }));

    it('should not scroll if already scrolling', () => {
      componentAny.isScrolling = true;
      componentAny.currentIndex = 0;
      componentAny.scrollToSection(1);

      expect(componentAny.currentIndex).toBe(0); // Should not change
      expect(mockSections[1].scrollIntoView).not.toHaveBeenCalled();
    });

    it('should not scroll if the target index is out of bounds (down)', () => {
      componentAny.currentIndex = 2; // Last section
      componentAny.scrollToSection(1); // Try to scroll down

      expect(componentAny.currentIndex).toBe(2);
      expect(componentAny.isScrolling).toBeFalse();
    });

    it('should not scroll if the target index is out of bounds (up)', () => {
      componentAny.currentIndex = 0; // First section
      componentAny.scrollToSection(-1); // Try to scroll up

      expect(componentAny.currentIndex).toBe(0);
      expect(componentAny.isScrolling).toBeFalse();
    });
  });

  describe('Wheel Event: onScroll()', () => {
    it('should call scrollToSection with direction 1 on scroll down', () => {
      spyOn(componentAny, 'scrollToSection');
      const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
      spyOn(wheelEvent, 'preventDefault');

      componentAny.onScroll(wheelEvent);

      expect(wheelEvent.preventDefault).toHaveBeenCalled();
      expect(componentAny.scrollToSection).toHaveBeenCalledWith(1);
    });

    it('should call scrollToSection with direction -1 on scroll up', () => {
      spyOn(componentAny, 'scrollToSection');
      const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
      spyOn(wheelEvent, 'preventDefault');

      componentAny.onScroll(wheelEvent);

      expect(wheelEvent.preventDefault).toHaveBeenCalled();
      expect(componentAny.scrollToSection).toHaveBeenCalledWith(-1);
    });
  });

  describe('Touch Events: onTouchStart() & onTouchMove()', () => {
    beforeEach(() => {
      spyOn(componentAny, 'scrollToSection');
    });

    it('onTouchStart should record the initial touch Y position', () => {
      const touchEvent = createTouchEvent(200);
      componentAny.onTouchStart(touchEvent);
      expect(componentAny.touchStartY).toBe(200);
    });

    it('onTouchMove should not trigger scroll if swipe distance is below threshold', () => {
      componentAny.touchStartY = 200;
      const touchEvent = createTouchEvent(220); // Swipe of -20px
      spyOn(touchEvent, 'preventDefault');

      componentAny.onTouchMove(touchEvent);

      expect(touchEvent.preventDefault).not.toHaveBeenCalled();
      expect(componentAny.scrollToSection).not.toHaveBeenCalled();
    });

    it('onTouchMove should trigger scroll down on a significant swipe up', () => {
      componentAny.touchStartY = 200;
      const touchEvent = createTouchEvent(140); // Swipe up of 60px
      spyOn(touchEvent, 'preventDefault');

      componentAny.onTouchMove(touchEvent);

      expect(touchEvent.preventDefault).toHaveBeenCalled();
      expect(componentAny.scrollToSection).toHaveBeenCalledWith(1); // Swipe up -> scroll down
      expect(componentAny.touchStartY).toBe(140); // Start Y should be reset
    });

    it('onTouchMove should trigger scroll up on a significant swipe down', () => {
      componentAny.touchStartY = 200;
      const touchEvent = createTouchEvent(260); // Swipe down of 60px
      spyOn(touchEvent, 'preventDefault');

      componentAny.onTouchMove(touchEvent);

      expect(touchEvent.preventDefault).toHaveBeenCalled();
      expect(componentAny.scrollToSection).toHaveBeenCalledWith(-1); // Swipe down -> scroll up
      expect(componentAny.touchStartY).toBe(260);
    });

    it('should not process touch events if already scrolling', () => {
      componentAny.isScrolling = true;
      const startEvent = createTouchEvent(200);
      const moveEvent = createTouchEvent(100);
      spyOn(startEvent, 'preventDefault');
      spyOn(moveEvent, 'preventDefault');

      componentAny.onTouchStart(startEvent);
      componentAny.onTouchMove(moveEvent);

      expect(startEvent.preventDefault).toHaveBeenCalled();
      expect(moveEvent.preventDefault).toHaveBeenCalled();
      expect(componentAny.scrollToSection).not.toHaveBeenCalled();
    });
  });
});
