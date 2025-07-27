import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Experience } from './experience';
import { ViewportService } from '../../services/viewport.service';
import { of } from 'rxjs';

describe('ExperienceComponent', () => {
  let component: Experience;
  let fixture: ComponentFixture<Experience>;
  let mockViewportService: jasmine.SpyObj<ViewportService>;

  beforeEach(async () => {
    mockViewportService = jasmine.createSpyObj('ViewportService', ['isMobileView$']);
    mockViewportService.isMobileView$ = of(false);

    await TestBed.configureTestingModule({
      imports: [Experience],
      providers: [{ provide: ViewportService, useValue: mockViewportService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Experience);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the timeline component', () => {
    expect(component).toBeTruthy();
  });

  it('should generate the correct number of years', () => {
    const expectedYears = component.endYear - component.startYear + 2;
    expect(component.years.length).toBe(expectedYears);
  });

  it('should calculate correct desktop bar style', () => {
    const style = component.getDesktopBarStyle(2019, 2020);
    expect(style.left).toContain('%');
    expect(style.width).toContain('%');
  });

  it('should calculate correct mobile bar style', () => {
    const style = component.getMobileBarStyle(2019, 2020);
    expect(style.top).toContain('%');
    expect(style.height).toContain('%');
  });

  it('should update selectedExperience on mobile item select', () => {
    component.isMobileView = true;
    const item = component.experiences[0];
    component.onSelectItem(item);
    expect(component.selectedExperience).toBe(item);
  });

  it('should not update selectedExperience if not in mobile view', () => {
    component.isMobileView = false;
    const item = component.experiences[0];
    component.onSelectItem(item);
    expect(component.selectedExperience).toBeNull();
  });

  it('should clear selectedExperience on modal close', () => {
    component.selectedExperience = component.experiences[0];
    component.closeModal();
    expect(component.selectedExperience).toBeNull();
  });

  it('should unsubscribe on destroy', () => {
    const spy = spyOn(component['resizeSubscription']!, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle hover for work item', () => {
    component.isMobileView = false;
    const item = component.experiences.find(e => e.type === 'work')!;
    component.onHover(item);
    expect(component.hoveredWorkItem).toBe(item);
  });

  it('should handle hover for education item', () => {
    component.isMobileView = false;
    const item = component.experiences.find(e => e.type === 'education')!;
    component.onHover(item);
    expect(component.hoveredEducationItem).toBe(item);
  });

  it('should clear hovered items on null hover', () => {
    component.isMobileView = false;
    component.hoveredWorkItem = component.experiences.find(e => e.type === 'work')!;
    component.hoveredEducationItem = component.experiences.find(e => e.type === 'education')!;
    component.onHover(null);
    expect(component.hoveredWorkItem).toBeTruthy(); // hide is delayed
    expect(component.hoveredEducationItem).toBeTruthy();
  });

  it('should mark mouse inside info window on enter', () => {
    component.onInfoEnter('work');
    expect((component as any).isMouseInsideWorkInfoWindow).toBeTrue();
    component.onInfoEnter('education');
    expect((component as any).isMouseInsideEducationInfoWindow).toBeTrue();
  });

  it('should mark mouse outside info window on leave and schedule hide', () => {
    const spy = spyOn<any>(component, 'scheduleHide');
    component.onInfoLeave('work');
    expect(spy).toHaveBeenCalledWith('work');
    component.onInfoLeave('education');
    expect(spy).toHaveBeenCalledWith('education');
  });
});
