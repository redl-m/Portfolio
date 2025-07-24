import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly maxMobileWidth = 768;
  private _isMobileView = new BehaviorSubject<boolean>(window.innerWidth <= this.maxMobileWidth);
  isMobileView$ = this._isMobileView.asObservable();

  constructor() {
    this.updateViewport();
    window.addEventListener('resize', this.updateViewport.bind(this));
  }

  private updateViewport() {
    const isMobile = window.innerWidth <= this.maxMobileWidth;
    this._isMobileView.next(isMobile);
  }

  get isMobile(): boolean {
    return this._isMobileView.value;
  }
}
