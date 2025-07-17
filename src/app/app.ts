import { Component } from '@angular/core';

// stand‑alone feature components
import { Navbar }     from './shared/navbar/navbar';
import { Hero }       from './sections/hero/hero';
import { About }      from './sections/about/about';
import { Projects }   from './sections/projects/projects';
import { Experience } from './sections/experience/experience';

import { LeafletModule } from '@bluehalo/ngx-leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    /* app features */
    Navbar, Hero, About, Projects, Experience,
    /* third‑party libs */
    LeafletModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected title = 'my-portfolio';
}
