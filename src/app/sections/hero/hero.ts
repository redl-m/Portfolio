import { Component, ViewChild } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss']
})
export class Hero {
  @ViewChild('lightLottie') lightComp!: LottieComponent;
  @ViewChild('darkLottie')  darkComp!: LottieComponent;

  // Animations for light and dark mode
  lightAnim!: AnimationItem;
  darkAnim!:  AnimationItem;

  isDarkMode = false;

  lightOptions: AnimationOptions = {
    path: 'assets/hero/hero_v3.json',
    autoplay: true,
    loop: false,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  darkOptions: AnimationOptions = {
    path: 'assets/hero/hero_v3_dark.json',
    autoplay: true,
    loop: false,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };


  constructor(private theme: ThemeService) {
    this.isDarkMode = this.theme.isDarkMode;
    this.theme.darkMode$.subscribe(d => this.swap(d));
  }

  onLightCreated(anim: AnimationItem) { this.lightAnim = anim; }
  onDarkCreated(anim: AnimationItem)  { this.darkAnim  = anim; }


  /**
   * Swaps the dark and light mode animation mid-animation.
   * @param dark True if dark mode is active, false otherwise.
   * @private
   */
  private swap(dark: boolean) {
    this.isDarkMode = dark;
    // Ensure both animations exist
    if (!this.lightAnim || !this.darkAnim) return;

    // Get the current frame from whichever is showing
    const currentFrame = dark
      ? this.lightAnim.currentFrame
      : this.darkAnim.currentFrame;

    // Pause both
    this.lightAnim.pause();
    this.darkAnim.pause();

    // Sync the incoming animation to that frame
    const incoming = dark ? this.darkAnim : this.lightAnim;
    incoming.goToAndPlay(currentFrame, true);
  }
}
