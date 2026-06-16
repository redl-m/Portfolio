import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Author {
  name: string;
  isUser: boolean; // Used to highlight name in the author list
}

interface Conference {
  name: string;
  shortName: string;
  location: string;
  dates: string;
  publisher: string;
}

interface Publication {
  title: string;
  authors: Author[];
  tldr: string;
  conference: Conference;
  status: 'Published' | 'Accepted' | 'Under Review' | 'In Preparation';
  link?: string;
}

@Component({
  selector: 'app-research',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './research.html',
  styleUrl: './research.scss'
})
export class Research {

  publications: Publication[] = [
    {
      title: 'Deploying Privacy-Preserving Local LLMs: A Comparative Study Under Realistic Hardware Constraints',
      status: 'Accepted',
      authors: [
        { name: 'Michael J. Redl', isUser: true },
        { name: 'Florian Michahelles', isUser: false }
      ],
      tldr: 'An evaluation of local LLM deployment on consumer-grade hardware compared to remote API solutions, focusing on privacy-preserving AI and performance metrics.',
      conference: {
        name: 'Human Choice and Computers',
        shortName: 'HCC17',
        location: 'Vienna',
        dates: 'September 2026',
        publisher: 'Springer Nature'
      },
      link: '#'
    },
    {
      title: 'Beyond Passive Explainability: Implementing and Evaluating a Human-in-the-Loop AI Recruitment System',
      status: 'In Preparation',
      authors: [
        { name: 'Michael J. Redl', isUser: true },
        { name: 'Florian Michahelles', isUser: false }
      ],
      tldr: 'A hybrid Human-in-the-Loop recruitment system that bridges the actionability gap by translating passive XAI metrics into dynamic, LLM-generated interview questions and candidate summaries.',
      conference: {
        name: 'To Be Announced',
        shortName: 'TBA',
        location: 'TBA',
        dates: 'Data TBA',
        publisher: 'TBA'
      }
    }
  ];

  /**
   * Maps the publication status to a specific CSS class for badge coloring.
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'Published': return 'status-published';
      case 'Accepted': return 'status-accepted';
      case 'Under Review': return 'status-review';
      case 'In Preparation': return 'status-prep';
      default: return '';
    }
  }
}
