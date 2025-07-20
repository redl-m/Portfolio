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
    path: 'assets/hero/hero_ver2.json',
    autoplay: true,
    loop: false,
  };
}
