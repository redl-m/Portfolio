import {
  Component, ElementRef, ViewChild, NgZone, AfterViewInit, OnInit, OnDestroy,
} from '@angular/core';
import * as L from 'leaflet';
import {CommonModule} from '@angular/common';
import {trigger, transition, style, animate} from '@angular/animations';
import {LeafletModule} from '@bluehalo/ngx-leaflet';
import {photoManifest} from '../../photo-manifest';

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
        style({opacity: 0, transform: 'translateY(20px)'}),
        animate('600ms ease-out', style({opacity: 1, transform: 'translateY(0)'})),
      ])
    ])
  ]
})
export class About implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('bar', {static: false}) barEl!: ElementRef<HTMLDivElement>;

  // Mobile view options
  showMap = false;
  isMobileView = false;
  isAboutSectionVisible = false; // New property to track section visibility

  /** Base map options */
  options = {zoom: 2, worldCopyJump: true, center: L.latLng(20, 0), zoomControl: false};

  /** Trips and their photos */
  trips: Trip[] = [

    {name: 'Barcelona 2022', lat: 41.3874, lng: 2.1686, photos: photoManifest['Barcelona'] || []},
    {name: 'Paris 2022', lat: 48.8566, lng: 2.3522, photos: photoManifest['Paris'] || []},
    {name: 'Berlin 2023', lat: 52.52, lng: 13.405, photos: photoManifest['Berlin'] || []},
    {name: 'Brussels 2023', lat: 50.8477, lng: 4.3572, photos: photoManifest['Brussels'] || []},
    {name: 'London 2023', lat: 51.5072, lng: -0.1276, photos: photoManifest['London'] || []},
    {name: 'Edinburgh 2023', lat: 55.9533, lng: -3.1883, photos: photoManifest['Edinburgh'] || []},
    {name: 'Glasgow 2023', lat: 55.8617, lng: -4.2583, photos: photoManifest['Glasgow'] || []},
    {name: 'Amsterdam 2023', lat: 52.3676, lng: 4.9041, photos: photoManifest['Amsterdam'] || []},
    {name: 'Milan 2023', lat: 45.4685, lng: 9.1824, photos: photoManifest['Milan'] || []},
    {name: 'Venice 2023', lat: 45.4404, lng: 12.316, photos: photoManifest['Venice'] || []},
    {name: 'New York 2024', lat: 40.7128, lng: -74.0060, photos: photoManifest['NewYork'] || []},
    {name: 'Prague 2024', lat: 50.0755, lng: 14.4378, photos: photoManifest['Prague'] || []},
    {name: 'Mallorca 2024', lat: 39.8533, lng: 3.1240, photos: photoManifest['Mallorca'] || []},
    {name: 'Hamburg 2024', lat: 53.5488, lng: 9.9872, photos: photoManifest['Hamburg'] || []},
    {name: 'Stockholm 2024', lat: 59.3327, lng: 18.0656, photos: photoManifest['Stockholm'] || []},
    {name: 'Lund 2024', lat: 55.7047, lng: 13.1910, photos: photoManifest['Lund'] || []},
    {name: 'Ystad 2024', lat: 55.4295, lng: 13.82, photos: photoManifest['Ystad'] || []},
    {name: 'Copenhagen 2024', lat: 55.6761, lng: 12.5683, photos: photoManifest['Copenhagen'] || []},
  ];

  /** Arrays bound in the template */
  hoveredPhotos: string[] = [];
  scrollingPhotos: string[] = [];
  currentTripName = '';

  private map!: L.Map;
  private intersectionObserver?: IntersectionObserver;

  constructor(private zone: NgZone) {
  }


  onMapReady(map: L.Map) {


    this.map = map;
    const mapContainer = this.map.getContainer();

    const isDark = document.documentElement.classList.contains('dark');
    console.log(isDark);
    const darkBg = 'rgba(239,229,255,0.5)';
    const lightBg = 'rgba(168,168,168,0.6)';  // or whatever your light‑mode overlay should be

    /** Zoom using Control + Scroll Logic */

    // Overlay
    const overlay = document.createElement('div');
    overlay.innerHTML = `<div style="color: ${isDark ? '#eee' : '#222'}; font-family: sans-serif; text-align: center; font-size: 2.5em; font-weight: 550;">Use Ctrl + Scroll to Zoom</div>`;
    overlay.style.backgroundColor = isDark ? darkBg : lightBg;
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'opacity 300ms ease-in-out';

    // Hovering information
    const info = document.createElement('div');
    info.innerHTML = `<div style="color: ${isDark ? '#eee' : '#222'}; font-family: sans-serif; text-align: center; font-size: 2.5em; font-weight: 550;">Hover dots to see travel memories</div>`;
    info.style.backgroundColor = isDark ? darkBg : lightBg;
    info.style.position = 'absolute';
    info.style.top = '0';
    info.style.left = '0';
    info.style.width = '100%';
    info.style.height = '100%';
    info.style.display = 'flex';
    info.style.justifyContent = 'center';
    info.style.alignItems = 'center';
    info.style.zIndex = '1000';
    info.style.opacity = '1';
    info.style.pointerEvents = 'none';
    info.style.transition = 'opacity 300ms ease-in-out';

    if (getComputedStyle(mapContainer).position === 'static') {
      mapContainer.style.position = 'relative';
    }

    overlay.classList.add('map-overlay');
    info.classList.add('map-overlay', 'map-info');

    mapContainer.appendChild(overlay);
    mapContainer.appendChild(info);

    // Disable scroll wheel by default
    this.map.scrollWheelZoom.disable();

    // Variable to hold the timer for hiding the overlay
    let hideOverlayTimer: any;

    // Hide information on house leave
    mapContainer.addEventListener('mouseleave', () => {
      overlay.style.opacity = '0';
      this.map.scrollWheelZoom.disable();
      clearTimeout(hideOverlayTimer);
    });

    // Show overlay until first mouse enter
    mapContainer.addEventListener('mouseenter', () => {
      setTimeout(() => {
        info.style.opacity = '0';
      }, 1000);
    })

    // Listen for the wheel event on the map container.
    mapContainer.addEventListener('wheel', (e: WheelEvent) => {
      // Clear any existing timer every time a wheel event occurs
      clearTimeout(hideOverlayTimer);

      if (e.ctrlKey) {
        e.preventDefault();
        this.map.scrollWheelZoom.enable();
        overlay.style.opacity = '0';
      } else {
        this.map.scrollWheelZoom.disable();
        overlay.style.opacity = '1';
        // Set a new timer to hide the overlay after 1 second
        hideOverlayTimer = setTimeout(() => {
          overlay.style.opacity = '0';
        }, 1000);
      }
    }, {passive: false});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const fg = L.featureGroup().addTo(map);
    L.circleMarker([48.2081, 16.3713], {
      radius: 6, color: '#bf30b6', weight: 2, fillOpacity: 0.9
    }).addTo(fg);

    this.zone.runOutsideAngular(() => {
      this.trips.forEach(trip => {
        const marker = L.circleMarker([trip.lat, trip.lng], {
          radius: 6, color: '#2d1a61', weight: 2, fillOpacity: 0.9
        }).addTo(fg);

        marker.on('mouseover', ev => this.zone.run(() => {
          if (this.barEl) this.showBar(ev, trip);
        }));

        marker.on('mouseout', () => this.zone.run(() => {
          this.hoveredPhotos = [];
          this.currentTripName = '';
        }));
      });
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
      }, {threshold: 0.1}); // Button appears when 10% of the section is visible
      this.intersectionObserver.observe(aboutSection);
    }
  }

  ngOnDestroy(): void {
    // Clean up the observer to prevent memory leaks
    this.intersectionObserver?.disconnect();
    this.map?.remove();
  }

  private showBar(ev: L.LeafletMouseEvent, trip: Trip) {

    // Don't proceed if the bar doesn't exist yet
    if (!this.barEl?.nativeElement) {
      console.warn("Bar element doesn't exist yet");
      return;
    }

    this.hoveredPhotos = trip.photos;
    this.scrollingPhotos = [...trip.photos, ...trip.photos];
    this.currentTripName = trip.name;

    const el = this.barEl.nativeElement;

    const frame = 300, gap = 6, count = trip.photos.length;

    // Calculate the image width and shift distance accurately to prevent animation stuttering.
    const imageWidth = frame - (2 * gap);
    const shift = -((imageWidth + gap) * count);
    const duration = count * 4.5;

    el.style.setProperty('--frame', `${frame}px`);
    el.style.setProperty('--gap', `${gap}px`);
    el.style.setProperty('--count', String(count));
    el.style.setProperty('--duration', `${duration}s`);
    el.style.setProperty('--shift', `${shift}px`);

    if (this.isMobileView) {
      // On mobile, CSS will handle centering
      el.style.position = 'fixed';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.transform = 'translate(-50%, -50%)';
    } else {
      // Dynamically position the bar to keep it within the map container
      const mapContainer = this.map.getContainer();
      const p = this.map.latLngToContainerPoint(ev.latlng);

      const barWidth = el.offsetWidth;
      const barHeight = el.offsetHeight;
      const mapWidth = mapContainer.clientWidth;

      // Define constants for positioning
      const padding = 20;
      const verticalOffset = 80;

      // --- Vertical Positioning ---
      let top = p.y;
      let transformY: string;

      if ((p.y - barHeight - verticalOffset) < padding) {

        transformY = `${verticalOffset}px`; // position bar below the marker

      } else {

        transformY = `calc(-100% - ${verticalOffset}px)`; // default: position the bar above the marker
      }

      // --- Horizontal Positioning ---
      let left = p.x;
      let transformX: string;

      const halfBarWidth = barWidth / 2;

      // Check if for overflow to the left
      if ((p.x - halfBarWidth) < padding) {

        left = padding;
        transformX = '0%';
      }
      // Check if for overflow to the right
      else if ((p.x + halfBarWidth) > (mapWidth - padding)) {
        left = mapWidth - padding;
        transformX = '-100%';
      }
      // Default: center it horizontally on the marker
      else {
        transformX = '-50%';
      }

      // Apply calculated styles
      el.style.position = 'absolute';
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.transform = `translate(${transformX}, ${transformY})`;
    }
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
