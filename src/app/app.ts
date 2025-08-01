import {AfterViewInit, Component, HostListener, OnDestroy} from '@angular/core';
import { Navbar } from './shared/navbar/navbar';
import { Hero } from './sections/hero/hero';
import { About } from './sections/about/about';
import { Projects } from './sections/projects/projects';
import { Experience } from './sections/experience/experience';
import { LeafletModule } from '@bluehalo/ngx-leaflet';

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


  /**
   * Adds event listener after component initialization.
   */
  ngAfterViewInit(): void {
    this.sections = Array.from(document.querySelectorAll('.section')) as HTMLElement[];

    // Mouse wheel listener
    window.addEventListener('wheel', this.onScroll, { passive: false });

    // Touch event listeners
    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });

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
    // Check if the event target is the map or a child of the map
    const target = event.target as HTMLElement;
    if (target.closest('#map-container')) {
      return; // Do nothing, let the map handle the touch
    }

    if (this.isScrolling) {
      event.preventDefault();
      return;
    }
    this.touchStartY = event.touches[0].clientY;
  };


  /**
   * Handles touch actions while moving.
   * @param event The touch event to handle.
   */
  private onTouchMove = (event: TouchEvent) => {
    // Check if the event target is the map or a child of the map
    const target = event.target as HTMLElement;
    if (target.closest('#map-container')) {
      return; // Do nothing, let the map handle the movement
    }

    if (this.isScrolling) {
      event.preventDefault();
      return;
    }

    const touchEndY = event.touches[0].clientY;
    const swipeDistance = this.touchStartY - touchEndY;
    const swipeThreshold = 50; // Minimum pixels to count as a swipe

    if (Math.abs(swipeDistance) > swipeThreshold) {
      event.preventDefault();
      const direction = swipeDistance > 0 ? 1 : -1;
      this.scrollToSection(direction);
      this.touchStartY = touchEndY;
    }
  };


  /**
   * Logic for scrolling to a section.
   * @param direction The direction to scroll to: -1: upwards, 1: downwards
   * @private
   */
  private scrollToSection(direction: number) {
    if (this.isScrolling) {
      return;
    }

    const targetIndex = this.currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= this.sections.length) {
      return;
    }

    this.isScrolling = true;
    this.currentIndex = targetIndex;

    this.sections[this.currentIndex].scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      this.isScrolling = false;
    }, 900);
  }


  /**
   * Handles mouse wheel scrolling.
   * @param event The wheel event to handle.
   */
  private onScroll = (event: WheelEvent) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    this.scrollToSection(direction);
  };
}
