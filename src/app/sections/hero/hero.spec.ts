import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hero } from './hero';
import { ThemeService } from '../../services/theme.service';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { provideLottieOptions } from 'ngx-lottie';

describe('Hero component', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let darkMode$: BehaviorSubject<boolean>;

  beforeEach(async () => {
    darkMode$ = new BehaviorSubject<boolean>(false);

    mockThemeService = jasmine.createSpyObj('ThemeService', [], {
      isDarkMode: false,
      darkMode$: darkMode$.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [
        Hero
      ],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        provideLottieOptions({
          player: () => import('lottie-web')
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isDarkMode from the ThemeService', () => {
    expect(component.isDarkMode).toBe(false);
  });

  it('should assign light animation when onLightCreated is called', () => {
    const mockAnim = {} as AnimationItem;
    component.onLightCreated(mockAnim);
    expect(component.lightAnim).toBe(mockAnim);
  });

  it('should assign dark animation when onDarkCreated is called', () => {
    const mockAnim = {} as AnimationItem;
    component.onDarkCreated(mockAnim);
    expect(component.darkAnim).toBe(mockAnim);
  });

  it('should call swap on theme change', () => {
    spyOn<any>(component, 'swap');
    darkMode$.next(true);
    expect(component['swap']).toHaveBeenCalledWith(true);
  });

  it('should not run swap logic if animations are undefined', () => {
    component['swap'](true);
    expect(component.isDarkMode).toBe(true);
  });

  it('should pause both animations and sync the new one on swap', () => {
    const mockLight = {
      currentFrame: 42,
      pause: jasmine.createSpy(),
      goToAndPlay: jasmine.createSpy()
    } as unknown as AnimationItem;

    const mockDark = {
      currentFrame: 7,
      pause: jasmine.createSpy(),
      goToAndPlay: jasmine.createSpy()
    } as unknown as AnimationItem;

    component.lightAnim = mockLight;
    component.darkAnim = mockDark;

    component['swap'](true);
    expect(mockLight.pause).toHaveBeenCalled();
    expect(mockDark.pause).toHaveBeenCalled();
    expect(mockDark.goToAndPlay).toHaveBeenCalledWith(42, true);
  });
});
