import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(localStorage.getItem('dark-mode') === 'true');
  darkMode$ = this.darkModeSubject.asObservable();

  get isDarkMode() { return this.darkModeSubject.value; }
  setDarkMode(isDark: boolean) {
    this.darkModeSubject.next(isDark);
    localStorage.setItem('dark-mode', String(isDark));
    console.log('dark-mode');
  }
}
