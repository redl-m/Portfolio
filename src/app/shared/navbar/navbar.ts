import { AfterViewInit, Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements AfterViewInit, OnDestroy {

  /** id of the section that is currently in view */
  active = '';

  /** private IntersectionObserver */
  #io?: IntersectionObserver;

  ngAfterViewInit(): void {
    /* Sections that should trigger the highlight */
    // TODO: pressing a button currently does not lead to the section perfectly, but offset a bit
    const sectionIds = ['start', 'about', 'projects', 'experience'];

    /* Configure & start the observer once the view is ready */
    this.#io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.active = entry.target.id;      // triggers [class.active] binding
          }
        }
      },
      {
        root: null,
        /* 30% of viewport from the top counts as “inside” */
        rootMargin: '-30% 0px -70% 0px',
        threshold: 0
      }
    );

    /* Observe each section if it exists in the DOM */
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) { this.#io.observe(el); }
    }
  }

  ngOnDestroy(): void {
    this.#io?.disconnect();
  }
}
