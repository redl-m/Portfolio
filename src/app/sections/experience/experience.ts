import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';

// --- Data Structures ---
export interface ExperienceInfo {
  title: string;
  description: string;
  links?: { url: string; text: string }[];
}

export interface ExperienceItem {
  id: number; // Unique ID for tracking
  startYear: number;
  endYear: number;
  type: 'work' | 'education';
  info: ExperienceInfo;
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
  endYear = 2026;
  years: number[] = [];

  // --- State Management ---
  experiences: ExperienceItem[] = EXPERIENCES;
  hoveredWorkItem: ExperienceItem | null = null;
  hoveredEducationItem: ExperienceItem | null = null;
  selectedExperience: ExperienceItem | null = null; // For mobile modal
  isMobileView = false;

  // --- Hover Persistence Logic ---
  private hideTimeoutWork: any;
  private hideTimeoutEducation: any;
  private isMouseInsideWorkInfoWindow = false;
  private isMouseInsideEducationInfoWindow = false;

  constructor(private zone: NgZone) {
    this.years = Array.from(
      {length: this.endYear - this.startYear + 2},
      (_, i) => this.startYear + i
    );
  }

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    this.checkIfMobile(window.innerWidth);
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = (event: UIEvent) => {
    this.zone.run(() => {
      this.checkIfMobile((event.target as Window).innerWidth);
    });
  }

  private checkIfMobile(width: number): void {
    this.isMobileView = width <= 960;
    // If we resize from mobile to desktop, clear any open modals
    if (!this.isMobileView) {
      this.selectedExperience = null;
      document.body.classList.remove('no-scroll');
    }
  }

  // --- Style Calculation ---
  /** Calculates style for DESKTOP horizontal bars. */
  getDesktopBarStyle(start: number, end: number): { [key: string]: string } {
    const totalDuration = this.endYear - this.startYear + 1;
    const startPercent = ((start - this.startYear) / totalDuration) * 100;
    // Use Math.max to ensure a minimum width for very short events
    const widthPercent = Math.max(((end - start) / totalDuration) * 100, 0.5);

    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`
    };
  }

  /** Calculates style for MOBILE vertical bars. */
  getMobileBarStyle(start: number, end: number): { [key: string]: string } {
    const totalDuration = this.endYear - this.startYear + 1;
    const startPercent = ((start - this.startYear) / totalDuration) * 100;
    const heightPercent = Math.max(((end - start) / totalDuration) * 100, 1);

    return {
      top: `${startPercent}%`,
      height: `${heightPercent}%`
    };
  }

  // --- Event Handlers ---
  /** Handles CLICK on mobile to open the modal. */
  onSelectItem(item: ExperienceItem): void {
    if (!this.isMobileView) return;
    this.selectedExperience = item;
    document.body.classList.add('no-scroll'); // Prevent background scroll
  }

  /** Closes the mobile modal. */
  closeModal(): void {
    this.selectedExperience = null;
    document.body.classList.remove('no-scroll');
  }

  /** Handles HOVER on desktop to show info windows. */
  onHover(item: ExperienceItem | null): void {
    if (this.isMobileView) return;

    if (item) {
      if (item.type === 'work') {
        clearTimeout(this.hideTimeoutWork);
        this.hoveredWorkItem = item;
      } else {
        clearTimeout(this.hideTimeoutEducation);
        this.hoveredEducationItem = item;
      }
    } else {
      this.scheduleHide('work');
      this.scheduleHide('education');
    }
  }

  /** Handles mouse entering a desktop info window to keep it open. */
  onInfoEnter(type: 'work' | 'education'): void {
    if (type === 'work') {
      this.isMouseInsideWorkInfoWindow = true;
      clearTimeout(this.hideTimeoutWork);
    } else {
      this.isMouseInsideEducationInfoWindow = true;
      clearTimeout(this.hideTimeoutEducation);
    }
  }

  /** Handles mouse leaving a desktop info window to schedule its closing. */
  onInfoLeave(type: 'work' | 'education'): void {
    if (type === 'work') {
      this.isMouseInsideWorkInfoWindow = false;
      this.scheduleHide('work');
    } else {
      this.isMouseInsideEducationInfoWindow = false;
      this.scheduleHide('education');
    }
  }

  private scheduleHide(type: 'work' | 'education'): void {
    const delay = 500; // Shorter delay for a snappier feel
    if (type === 'work' && this.hoveredWorkItem && !this.isMouseInsideWorkInfoWindow) {
      this.hideTimeoutWork = setTimeout(() => {
        this.hoveredWorkItem = null;
      }, delay);
    } else if (type === 'education' && this.hoveredEducationItem && !this.isMouseInsideEducationInfoWindow) {
      this.hideTimeoutEducation = setTimeout(() => {
        this.hoveredEducationItem = null;
      }, delay);
    }
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
    endYear: 2021.8,
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
    endYear: 2022.8,
    type: 'work',
    info: {
      title: 'Software Development Intern at solvistas',
      description: 'Development of company intern working hours timekeeping system.',
      links: [{url: 'https://www.solvistas.com/', text: 'Company Website'}]
    }
  },
  {
    id: 4,
    startYear: 2022.9,
    endYear: 2023.58,
    type: 'work',
    info: {title: 'Civil Service in a Kindergarden', description: 'Compulsory civil service in a kindergarden in Enns.'}
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
    startYear: 2018.07,
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
      links: [{url: 'https://informatics.tuwien.ac.at/bachelor/informatics/', text: 'Study Breakdown and Description'}]
    }
  }
];
