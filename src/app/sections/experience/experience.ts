import { Component } from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import { IntersectionObserverDirective } from './intersection-observer.directive';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.html',
  styleUrls: ['./experience.scss'],
  standalone: true,
  imports: [NgStyle, NgForOf, IntersectionObserverDirective, NgClass, NgIf]
})

export class Experience {
  startYear = 2018;
  endYear = 2026;

  hoveredItem: ExperienceItem | null = null;

  experiences = EXPERIENCES; // the html file can only access experiences declared in this class

  years: number[] = Array.from(
    { length: this.endYear - this.startYear + 2 },
    (_, i) => this.startYear + i
  );

  getBarStyle(start: number, end: number): { [key: string]: string } {
    const totalYears = this.endYear - this.startYear + 1;
    const startPercent = ((start - this.startYear) / totalYears) * 100;
    const widthPercent = ((end - start + 1) / totalYears) * 100;

    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`
    };
  }

  onHover(item: ExperienceItem | null) {
    this.hoveredItem = item;
  }
}


export interface ExperienceItem {
  startYear: number;
  endYear: number;
  label: string;
  type: 'work' | 'education';
  info: string;
  alignment: 'left' | 'right';
}

export const EXPERIENCES: ExperienceItem[] = [
  {
    startYear: 2021,
    endYear: 2021,
    label: 'Intern at solvistas GmbH',
    info: 'Intern at solvistas GmbH\nTasks, tech, etc.',
    type: 'work',
    alignment: 'left'
  },
  {
    startYear: 2018,
    endYear: 2021.4,
    label: 'High School',
    info: 'High School\n2018–2021',
    type: 'education',
    alignment: 'left'
  }
];
