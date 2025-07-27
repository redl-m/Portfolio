import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {NgClass} from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements AfterViewInit, OnDestroy {
  // id of the section that is currently in view
  active = '';

  // Tracks the state of the mobile menu
  isMobileMenuOpen = false;

  /** track theme state */
  isDarkMode = false;

  /** subscription to theme changes */
  private themeSub!: Subscription;

  // private IntersectionObserver
  #io?: IntersectionObserver;

  constructor(private themeService: ThemeService) {
    // subscribe to theme changes
    this.themeSub = this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      document.documentElement.classList.toggle('dark', isDark);
    });

    // on init, sync HTML class with current theme
    document.documentElement.classList.toggle('dark', this.themeService.isDarkMode);
  }

  /** Toggles the mobile navigation menu open/closed. */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.classList.toggle('no-scroll', this.isMobileMenuOpen);
  }

  /** Closes the mobile menu if it's open. */
  closeMenuAndNavigate(): void {
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  /** flip theme and persist via service */
  toggleDarkMode(): void {
    this.themeService.setDarkMode(!this.isDarkMode);
  }

  ngAfterViewInit(): void {
    const sectionIds = ['start', 'about', 'projects', 'experience'];

    // Set up intersection observer to track active section
    this.#io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.active = entry.target.id;
          }
        }
      },
      { root: null, rootMargin: '-30% 0px -70% 0px', threshold: 0 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) { this.#io.observe(el); }
    }

    // Smooth scroll on nav-link clicks
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (event) => {
        const anchor = event.currentTarget as HTMLAnchorElement;
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#')) {
          event.preventDefault();
          this.closeMenuAndNavigate();
          const targetEl = document.getElementById(href.substring(1));
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.#io?.disconnect();
    document.body.classList.remove('no-scroll');
    this.themeSub.unsubscribe();
  }
}
