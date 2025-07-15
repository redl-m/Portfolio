import { Component } from '@angular/core';
import { NgForOf, NgStyle } from '@angular/common';
import { IntersectionObserverDirective } from './intersection-observer.directive'; // adjust path as needed

@Component({
  selector: 'app-experience',
  templateUrl: './experience.html',
  styleUrls: ['./experience.scss'],
  standalone: true,
  imports: [NgStyle, NgForOf, IntersectionObserverDirective]
})

export class Experience {
  startYear = 2018;
  endYear = 2026;

  visibleBars: { [key: string]: boolean } = {};

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
}
