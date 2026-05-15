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
  shortDescription: string;
  imageUrl: string;
  link: string;
  techStack: Library[];
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
      title: 'Emotion Detection',
      description: 'Emotion classification using PyTorch and attention estimation using OpenCV, also evaluating emotion and attention development over time, visualizing it using D3 and summarizing it using either a heuristic method, local LLM or remote LLM via an API.',
      shortDescription: 'Emotion classification using PyTorch and OpenCV, featuring D3 data visualization and LLM-powered summarization.',
      imageUrl: '/assets/projects/neural_net.jpeg',
      link: 'https://github.com/redl-m/Emotion-Detection',
      techStack: [
        { name: 'PyTorch', iconUrl: '/assets/icons/pytorch.svg', link: 'https://pytorch.org' },
        { name: 'D3.js', iconUrl: '/assets/icons/d3.svg', link: 'https://d3js.org' },
        { name: 'Dlib', iconUrl: '/assets/icons/dlib.svg', link: 'https://dlib.net' },
        { name: 'OpenCV', iconUrl: '/assets/icons/opencv.svg', link: 'https://opencv.org' },
        { name: 'transformers', iconUrl: '/assets/icons/huggingface.svg', link: 'https://huggingface.co' }
      ]
    },
    {
      title: 'AI-based candidate preselection',
      description: 'A system focussing on explainable AI for an AI-based candidate preselection program. The system was implemented and analyzed as part of my Bachelor\'s Thesis on XAI using FastAPI.',
      shortDescription: 'My Bachelor\'s Thesis project focusing on explainable AI for recruitment preselection.',
      imageUrl: '/assets/projects/wave_equalizer.jpeg',
      link: 'https://github.com/redl-m/TUW-BT',
      techStack: [
        { name: 'PyTorch', iconUrl: '/assets/icons/pytorch.svg', link: 'https://pytorch.org' },
        { name: 'transformers', iconUrl: '/assets/icons/huggingface.svg', link: 'https://huggingface.co' },
        { name: 'FastAPI', iconUrl: '/assets/icons/fastapi.svg', link: 'https://fastapi.tiangolo.com' },
        { name: 'Angular', iconUrl: '/assets/icons/angular.svg', link: 'https://angular.io' },
        { name: 'Pydantic', iconUrl: '/assets/icons/pydantic.svg', link: 'https://docs.pydantic.dev/latest' },
        { name: 'Matplotlib', iconUrl: '/assets/icons/matplotlib.svg', link: 'https://matplotlib.org' },
      ]
    },
    {
      title: 'Breast Cancer Detection',
      description: 'A TensorFlow-based breast cancer detection system that analyzes mammogram images.',
      shortDescription: 'A TensorFlow-based breast cancer detection system that analyzes mammogram images.',
      imageUrl: '/assets/projects/breast_cancer_detection.jpeg',
      link: 'https://github.com/redl-m/Breast-Cancer-Detection',
      techStack: [
        { name: 'TensorFlow', iconUrl: '/assets/icons/tensorflow.svg', link: 'https://www.tensorflow.org' },
        { name: 'Keras', iconUrl: '/assets/icons/keras.svg', link: 'https://keras.io' },
        { name: 'OpenCV', iconUrl: '/assets/icons/opencv.svg', link: 'https://opencv.org' },
        { name: 'Matplotlib', iconUrl: '/assets/icons/matplotlib.svg', link: 'https://matplotlib.org' },
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
