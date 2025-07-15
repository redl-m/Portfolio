import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  OnDestroy,
  AfterViewInit
} from '@angular/core';

@Directive({
  selector: '[intersectionObserver]',
  exportAs: 'intersectionObserver'
})
export class IntersectionObserverDirective implements AfterViewInit, OnDestroy {
  @Output() isVisible = new EventEmitter<boolean>();
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(([entry]) => {
      this.isVisible.emit(entry.isIntersecting);
    }, {
      threshold: 0.1
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
