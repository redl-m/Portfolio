import { AfterViewInit, Component, HostListener } from '@angular/core';
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
export class App implements AfterViewInit {
  private sections: HTMLElement[] = [];
  private isScrolling = false;
  private currentIndex = 0;
  // how much of the next section must be visible before snapping
  private readonly VISIBILITY_THRESHOLD = 0.15;

  ngAfterViewInit(): void {
    this.sections = Array.from(document.querySelectorAll('.section')) as HTMLElement[];
  }

  /**
   * Listen non‑passively so we can preventDefault(),
   * but only if we decide to snap.
   */
  @HostListener('window:wheel', ['$event'])
  onScroll(event: WheelEvent) {
    // If already animating, just prevent anything happening
    if (this.isScrolling) {
      event.preventDefault();
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    const targetIndex = this.currentIndex + direction;

    // Out of bounds ‑ let it scroll normally (or hit page limits)
    if (targetIndex < 0 || targetIndex >= this.sections.length) {
      return;
    }

    const target = this.sections[targetIndex];
    const rect = target.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate what fraction of the target is already in view
    let visibleFraction: number;
    if (direction > 0) {
      // Scrolling down: how many pixels of the top of target are inside
      const visiblePx = Math.max(0, viewportHeight - rect.top);
      visibleFraction = visiblePx / viewportHeight;
    } else {
      // Scrolling up: how many pixels of the bottom of target are inside
      const visiblePx = Math.max(0, rect.bottom);
      visibleFraction = visiblePx / viewportHeight;
    }

    // Only snap if ≥ threshold is visible
    if (visibleFraction >= this.VISIBILITY_THRESHOLD) {
      event.preventDefault();
      this.isScrolling = true;
      this.currentIndex = targetIndex;

      this.sections[this.currentIndex].scrollIntoView({ behavior: 'smooth' });

      // Unlock after the smooth‑scroll duration (roughly)
      setTimeout(() => {
        this.isScrolling = false;
      }, 900);
    }
    // Otherwise: let the browser scroll naturally
  }
}
