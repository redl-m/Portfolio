import {AfterViewInit, Component, HostListener, OnDestroy} from '@angular/core';
import {Navbar} from './shared/navbar/navbar';
import {Hero} from './sections/hero/hero';
import {About} from './sections/about/about';
import {Projects} from './sections/projects/projects';
import {Experience} from './sections/experience/experience';
import {LeafletModule} from '@bluehalo/ngx-leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Navbar, Hero, About, Projects, Experience,
    LeafletModule
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
  private readonly SCROLL_LOCK_MS = 900; // match your timeout


  /**
   * Adds event listener after component initialization.
   */
  ngAfterViewInit(): void {
    this.sections = Array.from(document.querySelectorAll('.section')) as HTMLElement[];

    // Mouse wheel listener
    window.addEventListener('wheel', this.onScroll, {passive: false});

    // Touch event listeners
    window.addEventListener('touchstart', this.onTouchStart, {passive: false});
    window.addEventListener('touchmove', this.onTouchMove, {passive: false});

    setTimeout(() => this.updateCurrentSection(), 100);
  }


  /**
   * Cleans up on component destruction by removing the event listener.
   */
  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.onScroll);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
  }


  /**
   * Finds which section is currently in the viewport
   * and updates the component's state (currentIndex).
   */
  private updateCurrentSection(): void {
    let closestIndex = 0;
    let minDistance = Infinity;

    this.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      // Find the section whose top edge is closest to the top of the viewport.
      const distance = Math.abs(rect.top);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    this.currentIndex = closestIndex;
  }

  /**
   * Detects any scroll (navbar clicks, scrollbar drag, etc.)
   * and updates the current index if we aren't in the middle of a snap-scroll.
   */
  @HostListener('window:scroll')
  onNativeScroll() {
    if (!this.isScrolling) {
      this.updateCurrentSection();
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
      // optionally reset lastScrollTime here if you prefer
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
