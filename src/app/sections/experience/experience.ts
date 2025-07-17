import { Component } from '@angular/core';
import { NgClass, NgForOf, NgIf, NgStyle } from '@angular/common';

// --- Data Structures ---
/**
 * Defines the structure for the detailed information in the info windows.
 */
export interface ExperienceInfo {
  title: string;
  description: string;
  links?: { url: string; text: string }[];
}

/**
 * Defines the structure for each item on the timeline.
 */
export interface ExperienceItem {
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
export class Experience {
  startYear = 2018;
  endYear = 2026;

  // Separate state for hovered work and education items
  hoveredWorkItem: ExperienceItem | null = null;
  hoveredEducationItem: ExperienceItem | null = null;

  experiences: ExperienceItem[] = EXPERIENCES;

  hideTimeoutWork: any = null;
  hideTimeoutEducation: any = null;

  isMouseInsideWorkInfoWindow = false;
  isMouseInsideEducationInfoWindow = false;



  years: number[] = Array.from(
    { length: this.endYear - this.startYear + 2 },
    (_, i) => this.startYear + i
  );

  /**
   * Calculates the positioning and width for a bar on the timeline.
   */
  getBarStyle(start: number, end: number): { [key: string]: string } {
    const totalDuration = this.endYear - this.startYear + 1;
    const startPercent = ((start - this.startYear) / totalDuration) * 100;
    const widthPercent = ((end - start + 0.08) / totalDuration) * 100; // TODO: what is this number??

    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`
    };
  }

  /**
   * Handles mouse hover events on timeline bars to show the correct info window.
   */
  onHover(item: ExperienceItem | null): void {
    if (window.innerWidth < 768) {
      this.hoveredWorkItem = item?.type === 'work' ? item : null;
      this.hoveredEducationItem = item?.type === 'education' ? item : null;
      return;
    }

    if (item) {
      if (item.type === 'work') {
        clearTimeout(this.hideTimeoutWork);
        this.hoveredWorkItem = item;
      } else if (item.type === 'education') {
        clearTimeout(this.hideTimeoutEducation);
        this.hoveredEducationItem = item;
      }
    } else {
      // No item hovered — start timers for both
      if (this.hoveredWorkItem && !this.isMouseInsideWorkInfoWindow) {
        this.hideTimeoutWork = setTimeout(() => {
          this.hoveredWorkItem = null;
        }, 1500);
      }
      if (this.hoveredEducationItem && !this.isMouseInsideEducationInfoWindow) {
        this.hideTimeoutEducation = setTimeout(() => {
          this.hoveredEducationItem = null;
        }, 1500);
      }
    }
  }


  onInfoEnter(type: 'work' | 'education'): void {
    if (type === 'work') {
      this.isMouseInsideWorkInfoWindow = true;
      clearTimeout(this.hideTimeoutWork);
    } else {
      this.isMouseInsideEducationInfoWindow = true;
      clearTimeout(this.hideTimeoutEducation);
    }
  }

  onInfoLeave(type: 'work' | 'education'): void {
    if (type === 'work') {
      this.isMouseInsideWorkInfoWindow = false;
      this.hideTimeoutWork = setTimeout(() => {
        this.hoveredWorkItem = null;
      }, 1500);
    } else {
      this.isMouseInsideEducationInfoWindow = false;
      this.hideTimeoutEducation = setTimeout(() => {
        this.hoveredEducationItem = null;
      }, 1500);
    }
  }



}

// --- Data ---
export const EXPERIENCES: ExperienceItem[] = [
  {
    startYear: 2021.5,
    endYear: 2021.9,
    type: 'work',
    info: {
      title: 'Intern at solvistas',
      description: 'Intern in HR, financial and secretarial division.',
      links: [{ url: 'https://www.solvistas.com/', text: 'Company Website' }]
    }
  },
  {
    startYear: 2022.5,
    endYear: 2022.9,
    type: 'work',
    info: {
      title: 'Software Development Intern at solvistas',
      description: 'Development of company intern working hours timekeeping system.',
      links: [{ url: 'https://www.solvistas.com/', text: 'Company Website' }]
    }
  },
  {
    startYear: 2018.7,
    endYear: 2022.5,
    type: 'education',
    info: {
      title: 'b[r]g Enns',
      description: 'Academic high school with a chosen scientific branch, focus on Informatics and voluntary partly tuition in English.',
      links: [{ url: 'https://www.brgenns.ac.at/', text: 'School Website' }]
    }
  },
  {
    startYear: 2022.8,
    endYear: 2026,
    type: 'education',
    info: {
      title: 'BSc Informatics at TU Wien',
      description: 'Currently pursuing a Bachelor\'s degree with a focus on Artificial Intelligence and Machine Learning at TU Wien.',
      links: [{ url: 'https://informatics.tuwien.ac.at/bachelor/informatics/', text: 'Study Breakdown and Description' }] // TODO: add Bachelor Thesis when complete
    }
  }
];
