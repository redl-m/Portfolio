import { Component } from '@angular/core';
import {
  LottieComponent,
  AnimationOptions
} from 'ngx-lottie';
import {AnimationItem} from 'lottie-web';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss']
})
export class Hero {
  options: AnimationOptions = {
    path: 'assets/hero/hero.json',   // relative to src/
    autoplay: true,
    loop: false,
  };


  // TODO: working, maybe adjust goToAndStop to -5 or so. Also, the animation shortly disappears
  /** Called once, right after the SVG/Canvas is created */
  animationCreated(anim: AnimationItem): void {
    /* Freeze on the final frame */
    anim.addEventListener('complete', () => {
      // frames are 0‑based, so last frame = totalFrames‑1
      anim.goToAndStop(anim.totalFrames - 10, true);
    });
  }
}
