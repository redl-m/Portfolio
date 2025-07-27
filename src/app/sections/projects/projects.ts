import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Library {
  name: string;
  iconUrl: string;
  link: string;
}

interface Project {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  libraryStack: Library[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})

export class Projects {
  public currentIndex = 0;

  // --- Properties for swipe gesture handling ---
  private startX = 0;
  public currentTranslate = 0;
  public isDragging = false;
  // A swipe of 50px or more will trigger navigation
  private readonly swipeThreshold = 100;

  projects = [

    {
      title: 'Emotion Detection',
      description: 'A web application for data visualization and analysis, built with Angular and D3.js. It helps users to interact with complex datasets through an intuitive interface.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
      link: '#',
      techStack: [
        { name: 'Angular', iconUrl: '/assets/icons/angular.svg', link: 'https://angular.io' },
        { name: 'D3.js', iconUrl: '/assets/icons/d3.svg', link: 'https://d3js.org' }
      ]
    },
    {
      title: 'AI-based candidate preselection',
      description: 'A system focussing on explainable AI for an AI-based candidate preselection program. The system was implemented and analyzed as part of my Bachelor\'s Thesis on XAI using PyTorch and Captum.',
      imageUrl: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
      link: '#',
      techStack: [
        { name: 'PyTorch', iconUrl: '/assets/icons/pytorch.svg', link: 'https://pytorch.org' },
        { name: 'Captum', iconUrl: '/assets/icons/captum.svg', link: 'https://captum.ai' }
      ]
    },
    {
      title: 'Project Gamma',
      description: 'A backend service for a cloud-based IoT system using Node.js and AWS Lambda. It processes real-time data from thousands of connected devices efficiently.',
      imageUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
      link: '#',
      techStack: [
        { name: 'Node.js', iconUrl: '/assets/icons/nodejs.svg', link: 'https://nodejs.org' },
      ]
    }
  ];

  // --- Navigation Logic ---

  goToProject(index: number): void {
    // Prevents navigation while a swipe is in progress
    if (this.isDragging) return;
    this.currentIndex = index;
  }

  nextProject(): void {
    this.currentIndex = (this.currentIndex + 1) % this.projects.length;
  }

  prevProject(): void {
    this.currentIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length;
  }

  /**
   *  Handles clicks on any card. If it's a preview card,
   * it becomes the active one.
   */
  handleCardClick(index: number): void {
    if (this.isDragging) return; // prevent click after swipe
    if (index !== this.currentIndex) {
      this.goToProject(index);
    }
  }

  getCardState(index: number): string {
    const prevIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length;
    const nextIndex = (this.currentIndex + 1) % this.projects.length;

    if (index === this.currentIndex) return 'is-active';
    if (index === prevIndex) return 'is-prev';
    if (index === nextIndex) return 'is-next';
    return 'is-hidden'; // Use a specific class for hidden cards
  }

  // --- Swipe Gesture Handlers (no changes to this logic) ---

  onPointerDown(event: PointerEvent): void {
    this.startX = event.clientX;
    this.isDragging = true;
    event.preventDefault();
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;
    const currentX = event.clientX;
    this.currentTranslate = currentX - this.startX;
  }

  @HostListener('window:pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    // Check if the swipe distance exceeds the threshold
    if (Math.abs(this.currentTranslate) > this.swipeThreshold) {
      if (this.currentTranslate < 0) {
        this.nextProject();
      } else {
        this.prevProject();
      }
    }

    // Snap back to position
    this.currentTranslate = 0;
  }
}
