import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Projects} from './projects';

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a list of projects', () => {
    expect(component.projects).toBeDefined();
    expect(component.projects.length).toBeGreaterThan(0);
  });

  it('each project should have a libraryStack array', () => {
    component.projects.forEach(project => {
      expect(project.techStack).toBeDefined();
      expect(Array.isArray(project.techStack)).toBeTrue();
      expect(project.techStack.length).toBeGreaterThan(0);
    });
  });

  it('each techStack item should have name, iconUrl, and link', () => {
    component.projects.forEach(project => {
      project.techStack.forEach(tech => {
        expect(tech.name).toBeDefined();
        expect(typeof tech.name).toBe('string');
        expect(tech.iconUrl).toBeDefined();
        expect(typeof tech.iconUrl).toBe('string');
        expect(tech.link).toBeDefined();
        expect(typeof tech.link).toBe('string');
      });
    });
  });
});
