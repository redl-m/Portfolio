import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {Subscription} from 'rxjs';
import {ViewportService} from '../../services/viewport.service';

// --- Data Structures ---
export interface ExperienceInfo {
  title: string;
  description: string;
  links?: { url: string; text: string }[];
}

export interface ExperienceItem {
  id: number;
  startYear: number;
  endYear: number;
  type: 'work' | 'education';
  info: ExperienceInfo;
  parentId?: number; // Nested events
  isOverlay?: boolean;
}

// --- Component ---
@Component({
  selector: 'app-experience',
  templateUrl: './experience.html',
  styleUrls: ['./experience.scss'],
  standalone: true,
  imports: [NgStyle, NgForOf, NgClass, NgIf]
})
export class Experience implements OnInit, OnDestroy {

  // --- Timeline Configuration ---
  startYear = 2018;
  endYear = 2026;  // This +1 gets displayed on the timeline
  years: number[] = [];

  // --- State Management ---
  experiences: ExperienceItem[] = EXPERIENCES;
  hoveredWorkItem: ExperienceItem | null = null;
  hoveredEducationItem: ExperienceItem | null = null;
  selectedExperience: ExperienceItem | null = null;
  isMobileView = false;
  isWorkLabelHovered = false;
  isEducationLabelHovered = false;
  instantHoverId: number | null = null;

  private resizeSubscription: Subscription | null = null;

  // --- Hover Persistence Logic ---
  private hideTimeoutWork: any;
  private hideTimeoutEducation: any;
  private isMouseInsideWorkInfoWindow = false;
  private isMouseInsideEducationInfoWindow = false;


  /**
   * Constructs the Experience component.
   * @param zone NgZone to run change detection for subscriptions outside of Angular's context.
   * @param viewportService Service to detect viewport changes (e.g., mobile vs. desktop).
   */
  constructor(private zone: NgZone, private viewportService: ViewportService) {
    this.years = Array.from(
      {length: this.endYear - this.startYear + 2},
      (_, i) => this.startYear + i
    );
  }


  /**
   * Initializes the component. Subscribes to viewport changes to toggle mobile view
   * and clean up state when switching from mobile to desktop.
   */
  ngOnInit(): void {
    this.resizeSubscription = this.viewportService.isMobileView$.subscribe((isMobile) => {
      this.zone.run(() => {
        this.isMobileView = isMobile;

        if (!this.isMobileView) {
          this.selectedExperience = null;
          document.body.classList.remove('no-scroll');
        }
      });
    });
  }


  /**
   * Cleans up the component on destruction. Unsubscribes from observables
   * to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }


  /**
   * Calculates the dynamic CSS styles for an experience bar in the desktop timeline.
   * @param start The start year of the experience, can be a float for months in percentages.
   * @param end The end year of the experience, can be a float for months in percentages.
   * @returns A style object with `left` and `width` percentages.
   */
  getDesktopBarStyle(start: number, end: number): { [key: string]: string } {
    const totalDuration = this.endYear - this.startYear + 1;
    const startPercent = ((start - this.startYear) / totalDuration) * 100;
    const widthPercent = Math.max(((end - start) / totalDuration) * 100, 0.5); // Use Math.max to ensure a minimum width for very short events

    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`
    };
  }


  /**
   * Calculates the dynamic CSS styles for an experience bar in the mobile timeline.
   * @param start The start year of the experience, can be a float for months in percentages.
   * @param end The end year of the experience, can be a float for months in percentages.
   * @returns A style object with `top` and `height` percentages.
   */
  getMobileBarStyle(start: number, end: number): { [key: string]: string } {
    const totalDuration = this.endYear - this.startYear + 1;
    const startPercent = ((start - this.startYear) / totalDuration) * 100;
    const heightPercent = Math.max(((end - start) / totalDuration) * 100, 1);

    return {
      top: `${startPercent}%`,
      height: `${heightPercent}%`
    };
  }


  /**
   * Handles the click event on an experience item in mobile view.
   * Sets the selected item to display its details in a modal and prevents background scrolling.
   * @param item The ExperienceItem that was clicked.
   */
  onSelectItem(item: ExperienceItem): void {
    if (!this.isMobileView) return;
    this.selectedExperience = item;
    document.body.classList.add('no-scroll');
  }


  /**
   * Closes the experience details modal in mobile view and restores background scrolling.
   */
  closeModal(): void {
    this.selectedExperience = null;
    document.body.classList.remove('no-scroll');
  }


  /**
   * Handles hover events, treating work and education windows independently.
   * @param item The ExperienceItem being hovered, or null if the mouse leaves all items.
   */
  onHover(item: ExperienceItem | null): void {
    if (this.isMobileView) return;

    // 1. Instant Visual State (Snappy animation)
    this.instantHoverId = item ? item.id : null;

    // 2. Delayed Info Window State
    const FADE_TRANSITION_DURATION = 200;

    if (item) {
      // Work Logic
      if (item.type === 'work') {
        clearTimeout(this.hideTimeoutWork);

        // Handle Work Window Transition
        if (this.hoveredWorkItem && this.hoveredWorkItem.id !== item.id) {
          this.hoveredWorkItem = null;
          setTimeout(() => { this.hoveredWorkItem = item; }, FADE_TRANSITION_DURATION);
        } else if (!this.hoveredWorkItem) {
          this.hoveredWorkItem = item;
        }

        // Trigger leave of education
        this.scheduleHide('education');

        // Education logic
      } else {
        clearTimeout(this.hideTimeoutEducation);

        // Handle Education Window Transition
        if (this.hoveredEducationItem && this.hoveredEducationItem.id !== item.id) {
          this.hoveredEducationItem = null;
          setTimeout(() => { this.hoveredEducationItem = item; }, FADE_TRANSITION_DURATION);
        } else if (!this.hoveredEducationItem) {
          this.hoveredEducationItem = item;
        }

        // Trigger leave of work
        this.scheduleHide('work');
      }
    } else {
      // Mouse leaves all items
      this.scheduleHide('work');
      this.scheduleHide('education');
    }
  }


  /**
   * Handles the mouse entering an info window in desktop view.
   * This cancels any scheduled timeout to hide the window, keeping it visible.
   * @param type The type of info window ('work' or 'education').
   */
  onInfoEnter(type: 'work' | 'education'): void {
    if (type === 'work') {
      this.isMouseInsideWorkInfoWindow = true;
      clearTimeout(this.hideTimeoutWork);
    } else {
      this.isMouseInsideEducationInfoWindow = true;
      clearTimeout(this.hideTimeoutEducation);
    }
  }


  /**
   * Handles the mouse leaving an info window in desktop view.
   * This schedules the window to be hidden after a short delay.
   * @param type The type of info window ('work' or 'education').
   */
  onInfoLeave(type: 'work' | 'education'): void {
    if (type === 'work') {
      this.isMouseInsideWorkInfoWindow = false;
      this.scheduleHide('work');
    } else {
      this.isMouseInsideEducationInfoWindow = false;
      this.scheduleHide('education');
    }
  }


  /**
   * Schedules an info window to be hidden after a delay. This is only triggered
   * if the mouse is not over the corresponding experience bar or the info window itself.
   * @param type The type of info window to schedule for hiding.
   */
  private scheduleHide(type: 'work' | 'education'): void {
    const delay = 1500;

    if (type === 'work') {
      // Clear existing timer
      clearTimeout(this.hideTimeoutWork);

      //  Schedule new timer if conditions are met
      if (this.hoveredWorkItem && !this.isMouseInsideWorkInfoWindow) {
        this.hideTimeoutWork = setTimeout(() => {
          this.hoveredWorkItem = null;
        }, delay);
      }
    } else { // type === 'education'
      // Clear existing timer
      clearTimeout(this.hideTimeoutEducation);

      // Schedule new timer if conditions are met
      if (this.hoveredEducationItem && !this.isMouseInsideEducationInfoWindow) {
        this.hideTimeoutEducation = setTimeout(() => {
          this.hoveredEducationItem = null;
        }, delay);
      }
    }
  }


  /**
   * Returns true if the duration (end - start) is less than 6 months.
   * Assumes start/end are years with fractional parts (e.g. 2022.5).
   */
  isLabelHidden(start: number, end: number): boolean {
    const durationYears = Math.max(0, end - start);
    const durationMonths = durationYears * 12;
    return durationMonths < 6; // strictly less than 6 months
  }


  /**
   * Helper to determine if a bar should be scaled visually.
   * @param item The ExperienceItem to check.
   */
  shouldScale(item: ExperienceItem): boolean {
    if (!this.instantHoverId) return false;

    // 1. Direct Hover
    if (this.instantHoverId === item.id) return true;

    // 2. Parent is Hovered -> Child (Overlay) Scales too
    return item.parentId === this.instantHoverId;
  }
}

// --- Data ---
export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 1,
    startYear: 2020.5,
    endYear: 2020.8,
    type: 'work',
    info: {
      title: 'Intern at SVS',
      description: 'First work experience as intern at an insurance company.',
      links: [{url: 'https://www.svs.at/', text: 'Company Website'}]
    }
  },
  {
    id: 2,
    startYear: 2021.5,
    endYear: 2021.75,
    type: 'work',
    info: {
      title: 'Intern at solvistas',
      description: 'Intern in HR, financial and secretarial division.',
      links: [{url: 'https://www.solvistas.com/', text: 'Company Website'}]
    }
  },
  {
    id: 3,
    startYear: 2022.5,
    endYear: 2022.75,
    type: 'work',
    info: {
      title: 'Software Development Intern at solvistas',
      description: 'Development of company intern working hours timekeeping system.',
      links: [{url: 'https://www.solvistas.com/', text: 'Company Website'}]
    }
  },
  {
    id: 4,
    startYear: 2022.83,
    endYear: 2023.58,
    type: 'work',
    info: {
      title: 'Civil Service in a Kindergarden',
      description: 'Compulsory civil service in a kindergarden in Enns.'
    }
  },
  {
    id: 5,
    startYear: 2024.5,
    endYear: 2024.8,
    type: 'work',
    info: {
      title: 'Production Intern at BMW',
      description: 'Production intern at BMW Group Austria.',
      links: [{url: 'https://www.bmwgroup-werke.com/steyr/de.html', text: 'Company Website'}]
    }
  },
  {
    id: 6,
    startYear: 2018,
    endYear: 2022.5,
    type: 'education',
    info: {
      title: 'b[r]g Enns',
      description: 'Academic high school with a chosen scientific branch, focus on Informatics and voluntary partly tuition in English.',
      links: [{url: 'https://www.brgenns.ac.at/', text: 'School Website'}]
    }
  },
  {
    id: 7,
    startYear: 2023.8,
    endYear: 2026.58,
    type: 'education',
    info: {
      title: 'BSc Informatics at TU Wien',
      description: 'Currently pursuing a Bachelor\'s degree with a focus on Artificial Intelligence and Machine Learning at TU Wien.',
      links: [{url: 'https://informatics.tuwien.ac.at/bachelor/informatics', text: 'Study Breakdown and Description'}]
    }
  }
  /*
  ,
  {
    id: 8,
    startYear: 2026.8,
    endYear: 2029.58,
    type: 'education',
    info: {
      title: 'MSc Logic and Artifical Intelligence at TU Wien',
      description: 'Currently pursuing a Master\'s degree in Logic and AI at TU Wien.',
      links: [{url: 'https://informatics.tuwien.ac.at/master/logic-and-artificial-intelligence', text: 'Study Breakdown and Description'}]
    }
  },
  // Exchange Semester at Aalto University
  {
    id: 9,
    startYear: 2027.2,
    endYear: 2027.58,
    type: 'education',
    isOverlay: true,
    parentId: 8,
    info: {
      title: 'Exchange semester at Aalto University',
      description: 'Semester abroad focusing on Machine Learning.',
      links: [{url: 'https://www.aalto.fi', text: 'University website'}]
    }
  }
   */
];
