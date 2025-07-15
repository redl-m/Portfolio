import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Experience } from './experience';

describe('ExperienceComponent', () => {
  let component: Experience;
  let fixture: ComponentFixture<Experience>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Experience]
    }).compileComponents();

    fixture = TestBed.createComponent(Experience);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the timeline component', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct number of year ticks', () => {
    const compiled = fixture.nativeElement;
    const ticks = compiled.querySelectorAll('.tick');
    expect(ticks.length).toBe(component.endYear - component.startYear + 2);
  });
});
