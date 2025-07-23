import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true, // Use standalone component for easier imports
  imports: [CommonModule], // Import CommonModule for *ngFor
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects {

  // Array of project objects
  projects = [
    {
      title: 'Project Alpha',
      description: 'A web application for data visualization and analysis, built with Angular and D3.js. It helps users to interact with complex datasets through an intuitive interface.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
      link: '#' // Add link to your project
    },
    {
      title: 'Project Beta',
      description: 'A mobile-first e-commerce platform developed with React Native. Focused on delivering a seamless shopping experience with features like AR product previews.',
      imageUrl: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
      link: '#' // Add link to your project
    },
    {
      title: 'Project Gamma',
      description: 'A backend service for a cloud-based IoT system using Node.js and AWS Lambda. It processes real-time data from thousands of connected devices efficiently.',
      imageUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
      link: '#' // Add link to your project
    }
  ];

}
