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

  // Properties for swipe gesture handling
  private startX = 0;
  public currentTranslate = 0;
  public isDragging = false;
  // A swipe of 50px or more will trigger navigation
  private readonly swipeThreshold = 100;


  // --- Data ---
  projects = [

    {
      title: 'WIP: Emotion Detection',
      description: 'Emotion classification using PyTorch, also evaluating emotions\' development over time and visualizing it using D3.',
      imageUrl: '/assets/projects/neural_net.jpeg',
      link: '#',
      techStack: [
        { name: 'D3.js', iconUrl: '/assets/icons/d3.svg', link: 'https://d3js.org' },
        { name: 'PyTorch', iconUrl: '/assets/icons/pytorch.svg', link: 'https://pytorch.org' }
      ]
    },
    {
      title: 'Coming Soon: AI-based candidate preselection',
      description: 'A system focussing on explainable AI for an AI-based candidate preselection program. The system was implemented and analyzed as part of my Bachelor\'s Thesis on XAI using PyTorch and Captum.',
      imageUrl: '/assets/projects/wave_equalizer.jpeg',
      link: '#',
      techStack: [
        { name: 'Angular', iconUrl: '/assets/icons/angular.svg', link: 'https://angular.io' },
        { name: 'PyTorch', iconUrl: '/assets/icons/pytorch.svg', link: 'https://pytorch.org' },
        { name: 'Captum', iconUrl: '/assets/icons/captum.svg', link: 'https://captum.ai' }
      ]
    },
    {
      title: 'Coming Soon: Pneumonia Detection',
      description: 'A FastAI-based pneumonia detection system that analyzes chest X-ray images.',
      imageUrl: '/assets/projects/pneumonia_detection.jpeg',
      link: '#',
      techStack: [
        { name: 'FastAI', iconUrl: '/assets/icons/fastai.svg', link: 'https://fastai1.fast.ai/' },
      ]
    }
  ];

  // --- Navigation Logic ---
  /**
   * Switches to another project using its index.
   * @param index The new project's index.
   */
  goToProject(index: number): void {
    // Prevents navigation while a swipe is in progress
    if (this.isDragging) return;
    this.currentIndex = index;
  }


  /**
   * Switches to the next project in the carousel.
   */
  nextProject(): void {
    this.currentIndex = (this.currentIndex + 1) % this.projects.length;
  }


  /**
   * Switches to the previous project in the carousel.
   */
  prevProject(): void {
    this.currentIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length;
  }


  /**
   * Handles switching cards if an inactive card gets clicked.
   * @param index The clicked project's index.
   */
  handleCardClick(index: number): void {
    if (this.isDragging) return; // prevent click after swipe
    if (index !== this.currentIndex) {
      this.goToProject(index);
    }
  }


  /**
   * Returns the state of a project card, which can be is-active, is-prev, is-next or is-hidden.
   * @param index The index of the project, which state needs to be determined.
   */
  getCardState(index: number): string {
    const prevIndex = (this.currentIndex - 1 + this.projects.length) % this.projects.length;
    const nextIndex = (this.currentIndex + 1) % this.projects.length;

    if (index === this.currentIndex) return 'is-active';
    if (index === prevIndex) return 'is-prev';
    if (index === nextIndex) return 'is-next';
    return 'is-hidden'; // Use a specific class for hidden cards
  }

  // --- Swipe Gesture Handlers ---
  /**
   * Enables dragging when card is pointed at.
   * @param event The pointer event starting the swiping action.
   */
  onPointerDown(event: PointerEvent): void {
    this.startX = event.clientX;
    this.isDragging = true;
    event.preventDefault();
  }


  /**
   * Calculates translate in x direction after swipe.
   * @param event The pointer event of the swiping action.
   */
  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;
    const currentX = event.clientX;
    this.currentTranslate = currentX - this.startX;
  }


  /**
   * Shows next or previous project card based on threshold
   * and resets calculations when swipe has been ended.
   */
  @HostListener('window:pointerup', ['$event'])
  onPointerUp(): void {
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
