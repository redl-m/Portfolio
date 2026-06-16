import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {Navbar} from './shared/navbar/navbar';
import {Hero} from './sections/hero/hero';
import {About} from './sections/about/about';
import {Projects} from './sections/projects/projects';
import {Experience} from './sections/experience/experience';
import {LeafletModule} from '@bluehalo/ngx-leaflet';
import { ViewportService } from './services/viewport.service';
import { Subscription } from 'rxjs';
import {Research} from './sections/research/research';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Navbar, Hero, About, Projects, Experience,
    LeafletModule, Research
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss', '../styles.scss']
})
export class App implements AfterViewInit, OnDestroy {
  private sections: HTMLElement[] = [];
  private isScrolling = false;
  private currentIndex = 0;
  private touchStartY = 0;
  private lastScrollTime = 0;
  private readonly SCROLL_LOCK_MS = 900;

  private viewportSub: Subscription | undefined;
  private observer: IntersectionObserver | undefined;

  constructor(private viewportService: ViewportService) {}


  /**
   * Initializes sections, sets up the intersection observer, and adds scroll listeners.
   */
  ngAfterViewInit(): void {
    this.sections = Array.from(document.querySelectorAll('.section')) as HTMLElement[];

    // Intersection observer for manual scrolls using navbar
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If a section is at least 50% visible and we aren't currently JS-snapping
        if (entry.isIntersecting && !this.isScrolling) {
          const index = this.sections.indexOf(entry.target as HTMLElement);
          if (index !== -1) {
            this.currentIndex = index;
          }
        }
      });
    }, {
      root: null, // watches the browser viewport
      threshold: 0.5 // triggers when 50% of the section is visible
    });

    // Start observing all sections
    this.sections.forEach(section => this.observer?.observe(section));

    // Subscribe to viewport changes
    this.viewportSub = this.viewportService.isMobileView$.subscribe(isMobile => {
      if (isMobile) {
        this.removeScrollListeners();
      } else {
        this.addScrollListeners();
      }
    });
  }


  /**
   * Cleans up observers and listeners on component destruction.
   */
  ngOnDestroy(): void {
    this.removeScrollListeners();
    this.viewportSub?.unsubscribe();
    this.observer?.disconnect();
  }


  // Helper to remove listeners (Mobile cleanup)
  private removeScrollListeners(): void {
    window.removeEventListener('wheel', this.onScroll);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
  }


  /**
   * Attaches event listeners to handle scroll interactions.
   */
  private addScrollListeners(): void {
    window.addEventListener('wheel', this.onScroll, { passive: false });
    if (!this.viewportService.isMobile) {
      window.addEventListener('touchstart', this.onTouchStart, { passive: false });
      window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    }
  }


  /**
   * Handles touch actions on start.
   * @param event The touch event to handle.
   */
  private onTouchStart = (event: TouchEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('#map-container')) return;

    // avoid attempting to cancel if not cancelable
    if (this.isScrolling || (Date.now() - this.lastScrollTime) < this.SCROLL_LOCK_MS) {
      if (event.cancelable) event.preventDefault();
      return;
    }
    this.touchStartY = event.touches[0].clientY;
  };


  /**
   * Handles touch actions while moving.
   * @param event The touch event to handle.
   */
  private onTouchMove = (event: TouchEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('#map-container')) return;

    if (this.isScrolling || (Date.now() - this.lastScrollTime) < this.SCROLL_LOCK_MS) {
      if (event.cancelable) event.preventDefault();
      return;
    }

    const touchEndY = event.touches[0].clientY;
    const swipeDistance = this.touchStartY - touchEndY;
    const swipeThreshold = 50;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (event.cancelable) event.preventDefault();
      const direction = swipeDistance > 0 ? 1 : -1;
      this.scrollToSection(direction);
      this.touchStartY = touchEndY; // avoid repeated triggers from same gesture
    }
  };


  /**
   * Logic for scrolling to a section.
   * @param direction The direction to scroll to: -1: upwards, 1: downwards
   * @private
   */
  private scrollToSection(direction: number) {
    if (this.isScrolling) return;

    const targetIndex = this.currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= this.sections.length) return;

    this.isScrolling = true;
    this.currentIndex = targetIndex;

    // lock timestamp so subsequent events are ignored for SCROLL_LOCK_MS
    this.lastScrollTime = Date.now();

    this.sections[this.currentIndex].scrollIntoView({behavior: 'smooth'});

    setTimeout(() => {
      this.isScrolling = false;
      // optionally reset timeout here
    }, this.SCROLL_LOCK_MS);
  }


  /**
   * Handles mouse wheel scrolling.
   * @param event The wheel event to handle.
   */
  private onScroll = (event: WheelEvent) => {
    // If wheel happened over the map, let the map handle it.
    const target = event.target as HTMLElement;
    if (target && target.closest('#map-container')) {
      return;
    }

    // If we are already snapping (or locked), ignore additional wheel inputs
    if (this.isScrolling || (Date.now() - this.lastScrollTime) < this.SCROLL_LOCK_MS) {
      event.preventDefault();
      return;
    }

    // prevent default scroll so the page doesn't subtly move multiple sections
    event.preventDefault();

    // clamp the delta to a single step: only sign matters
    const direction = event.deltaY > 0 ? 1 : -1;

    // If you have a special case (e.g. ctrl+wheel zoom on section 1), keep it:
    if (!(event.ctrlKey && this.currentIndex === 1)) {
      this.scrollToSection(direction);
    }
  };
}
