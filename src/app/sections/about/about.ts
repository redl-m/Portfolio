import {
  Component, ElementRef, ViewChild, NgZone, AfterViewInit, OnInit, OnDestroy,
} from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { photoManifest } from '../../photo-manifest';

interface Trip {
  name: string;
  lat: number;
  lng: number;
  photos: string[];
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, LeafletModule],

  templateUrl: './about.html',
  styleUrls: ['./about.scss'],
  animations: [
    trigger('tileFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ])
    ])
  ]
})
export class About implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('bar', { static: true }) barEl!: ElementRef<HTMLDivElement>;

  // Mobile view options
  showMap = false;
  isMobileView = false;
  isAboutSectionVisible = false; // New property to track section visibility

  /** Base map options */
  options = { zoom: 2, worldCopyJump: true, center: L.latLng(20, 0), zoomControl: false};

  /** Trips and their photos */
  trips: Trip[] = [
    // ... your existing trip data
    { name: 'Barcelona 2022', lat: 41.3874, lng: 2.1686, photos: photoManifest['Barcelona'] || [] },
    { name: 'Paris 2022', lat: 48.8566, lng: 2.3522, photos: photoManifest['Paris'] || [] },
    { name: 'Berlin 2023', lat: 52.52, lng: 13.405, photos: photoManifest['Berlin'] || [] },
    { name: 'Brussels 2023', lat: 50.8477, lng: 4.3572, photos: photoManifest['Brussels'] || [] },
    { name: 'London 2023', lat: 51.5072, lng: -0.1276, photos: photoManifest['London'] || [] },
    { name: 'Edinburgh 2023', lat: 55.9533, lng: -3.1883, photos: photoManifest['Edinburgh'] || [] },
    { name: 'Glasgow 2023', lat: 55.8617, lng: -4.2583, photos: photoManifest['Glasgow'] || [] },
    { name: 'Amsterdam 2023', lat: 52.3676, lng: 4.9041, photos: photoManifest['Amsterdam'] || [] },
    { name: 'Milan 2023', lat: 45.4685, lng: 9.1824, photos: photoManifest['Milan'] || [] },
    { name: 'Venice 2023', lat: 45.4404, lng: 12.316, photos: photoManifest['Venice'] || [] },
    { name: 'New York 2024', lat: 40.7128, lng: -74.0060, photos: photoManifest['NewYork'] || [] },
    { name: 'Prague 2024', lat: 50.0755, lng: 14.4378, photos: photoManifest['Prague'] || [] },
    { name: 'Mallorca 2024', lat: 39.8533, lng: 3.1240, photos: photoManifest['Mallorca'] || [] },
    { name: 'Hamburg 2024', lat: 53.5488, lng: 9.9872, photos: photoManifest['Hamburg'] || [] },
    { name: 'Stockholm 2024', lat: 59.3327, lng: 18.0656, photos: photoManifest['Stockholm'] || [] },
    { name: 'Lund 2024', lat: 55.7047, lng: 13.1910, photos: photoManifest['Lund'] || [] },
    { name: 'Ystad 2024', lat: 55.4295, lng: 13.82, photos: photoManifest['Ystad'] || [] },
    { name: 'Copenhagen 2024', lat: 55.6761, lng: 12.5683, photos: photoManifest['Copenhagen'] || [] },
  ];

  /** Arrays bound in the template */
  hoveredPhotos: string[]   = [];
  scrollingPhotos: string[] = [];
  currentTripName = '';

  private map!: L.Map;
  private intersectionObserver?: IntersectionObserver;

  constructor(private zone: NgZone) {}

  onMapReady(map: L.Map) {
    this.map = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const fg = L.featureGroup().addTo(map);
    const home = L.circleMarker([48.2081, 16.3713], { radius: 6, color: '#bf30b6', weight: 2, fillOpacity: 0.9 }).addTo(fg);

    this.trips.forEach(trip => {
      const marker = L.circleMarker([trip.lat, trip.lng], { radius: 6, color: '#2d1a61', weight: 2, fillOpacity: 0.9 }).addTo(fg);
      marker.on('mouseover', ev => this.zone.run(() => this.showBar(ev, trip)));
      marker.on('mouseout', () => this.zone.run(() => {
        this.hoveredPhotos = [];
        this.currentTripName = '';
      }));
    });

    map.fitBounds(fg.getBounds().pad(0.25));
    map.on('movestart', () => this.zone.run(() => (this.hoveredPhotos = [])));
  }

  ngAfterViewInit() {
    this.map?.on('movestart', () => (this.hoveredPhotos = []));

    // Observer to show/hide the mobile toggle button
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.zone.run(() => {
          this.isAboutSectionVisible = entry.isIntersecting;
        });
      }, { threshold: 0.1 }); // Button appears when 10% of the section is visible
      this.intersectionObserver.observe(aboutSection);
    }
  }

  ngOnDestroy(): void {
    // Clean up the observer to prevent memory leaks
    this.intersectionObserver?.disconnect();
  }

  private showBar(ev: L.LeafletMouseEvent, trip: Trip) {
    this.hoveredPhotos   = trip.photos;
    this.scrollingPhotos = [...trip.photos, ...trip.photos];
    this.currentTripName = trip.name;

    const p  = this.map.latLngToContainerPoint(ev.latlng);
    const el = this.barEl.nativeElement as HTMLElement;
    el.style.left = `${p.x}px`;
    el.style.top  = `${p.y}px`;

    const frame = 300, gap = 6, count = trip.photos.length;
    const duration = count * 4.5;
    const shift = -(frame + gap) * count;

    el.style.setProperty('--frame', `${frame}px`);
    el.style.setProperty('--gap', `${gap}px`);
    el.style.setProperty('--count', String(count));
    el.style.setProperty('--duration', `${duration}s`);
    el.style.setProperty('--shift', `${shift}px`);
  }

  ngOnInit() {
    this.updateView(window.innerWidth);
    window.addEventListener('resize', () => this.updateView(window.innerWidth));
  }

  updateView(width: number) {
    this.isMobileView = width < 768;
  }

  toggleMap() {
    this.showMap = !this.showMap;
  }
}
