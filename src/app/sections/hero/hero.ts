import { Component } from '@angular/core';
import {
  LottieComponent,
  AnimationOptions
} from 'ngx-lottie';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss']
})
export class Hero {
  options: AnimationOptions = {
    path: 'assets/hero/hero_v3.json',
    autoplay: true,
    loop: false,
  };
}
