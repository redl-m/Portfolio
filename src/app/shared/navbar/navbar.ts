import { AfterViewInit, Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements AfterViewInit, OnDestroy {

  // id of the section that is currently in view
  active = '';

  // Tracks the state of the mobile menu
  isMobileMenuOpen = false;

  // private IntersectionObserver
  #io?: IntersectionObserver;

  /**
   * Toggles the mobile navigation menu open/closed.
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.classList.toggle('no-scroll', this.isMobileMenuOpen);
  }

  /**
   * Closes the mobile menu if it's open.
   * This is called when a navigation link is clicked.
   */
  closeMenuAndNavigate(): void {
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  ngAfterViewInit(): void {
    // Sections that should trigger the highlight
    const sectionIds = ['start', 'about', 'projects', 'experience'];

    // Configure & start the observer once the view is ready
    this.#io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.active = entry.target.id; // triggers [class.active] binding
          }
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -70% 0px',
        threshold: 0
      }
    );

    // Observe each section if it exists in the DOM
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) { this.#io.observe(el); }
    }
  }

  ngOnDestroy(): void {
    this.#io?.disconnect();
    // Ensure the scroll lock is removed if the component is destroyed
    document.body.classList.remove('no-scroll');
  }
}
