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
  // How much of the next section must be visible before snapping
  private readonly VISIBILITY_THRESHOLD = 0.15;


  /**
   * Adds event listener after component initialization.
   */
  ngAfterViewInit(): void {
    this.sections = Array.from(document.querySelectorAll('.section')) as HTMLElement[];

    // Add non-passive wheel listener
    window.addEventListener('wheel', this.onScroll, { passive: false });

    // Run after a short delay to allow the browser to scroll to a hash (#) on load.
    setTimeout(() => this.updateCurrentSection(), 100);
  }


  /**
   * Cleans up on component destruction by removing the event listener.
   */
  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.onScroll);
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
   * Implements automatic, snappy scrolling behavior per section.
   * @param event The scrolling wheel event to handle.
   */
  private onScroll = (event: WheelEvent) => {
    if (this.isScrolling) {
      event.preventDefault();
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    const targetIndex = this.currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= this.sections.length) {
      return;
    }

    const target = this.sections[targetIndex];
    const rect = target.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    let visibleFraction: number;
    if (direction > 0) {
      const visiblePx = Math.max(0, viewportHeight - rect.top);
      visibleFraction = visiblePx / viewportHeight;
    } else {
      const visiblePx = Math.max(0, rect.bottom);
      visibleFraction = visiblePx / viewportHeight;
    }

    if (visibleFraction >= this.VISIBILITY_THRESHOLD) {
      event.preventDefault();
      this.isScrolling = true;
      this.currentIndex = targetIndex;

      this.sections[this.currentIndex].scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        this.isScrolling = false;
      }, 900);
    }
  };

}
