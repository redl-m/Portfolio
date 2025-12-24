import {
  Component, ElementRef, ViewChild, NgZone, AfterViewInit, OnInit, OnDestroy,
} from '@angular/core';
import * as L from 'leaflet';
import {CommonModule} from '@angular/common';
import {trigger, transition, style, animate, stagger, query} from '@angular/animations';
import {LeafletModule} from '@bluehalo/ngx-leaflet';
import {photoManifest} from '../../services/photo-manifest';
import {ViewportService} from '../../services/viewport.service';
import { ThemeService } from '../../services/theme.service';
import { fromEvent, Subscription} from 'rxjs';

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
    ]),
    // Animation for the mobile tile grid
    trigger('mobileTileAnimation', [
      transition('* => *', [
        query(':enter', [
          style({opacity: 0, transform: 'scale(0.8)'}),
          stagger('100ms', [
            animate('300ms ease-out', style({opacity: 1, transform: 'scale(1)'}))
          ])
        ], {optional: true})
      ])
    ])
  ]
})
export class About implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('bar', {static: false}) barEl!: ElementRef<HTMLDivElement>;

  // Mobile view options
  showMap = false;
  isMobileView = false;
  public isTabletView = false;
  private resizeSub?: Subscription;

  // Property to track the selected mobile tile
  public selectedTile: "tennis" | "causes" | "travelling" | null = null;
  private viewportSub?: Subscription;

  // Base map options
  options = {zoom: 2, worldCopyJump: true, center: L.latLng(20, 0), zoomControl: false};

  // Trips and their photos
  trips: Trip[] = [
    {name: 'Barcelona 2022', lat: 41.3874, lng: 2.1686, photos: photoManifest['Barcelona'] || []},
    {name: 'Paris 2022 & 2025', lat: 48.8566, lng: 2.3522, photos: photoManifest['Paris'] || []},
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
    {name: 'Munich 2025', lat: 48.1351, lng: 11.5820, photos: photoManifest['Munich'] || []},
    {name: 'Athens 2025', lat: 37.9838, lng: 23.7275, photos: photoManifest['Athens'] || []},
  ];

  // Arrays bound in the template
  hoveredPhotos: string[] = [];
  scrollingPhotos: string[] = [];
  currentTripName = '';

  private map!: L.Map;

  isDarkMode = false;

  constructor(private zone: NgZone, private viewportService: ViewportService, private theme: ThemeService) {
    this.isDarkMode = this.theme.isDarkMode; // retrieving dark mode from theme service
  }


  /**
   * Initializes the component and updates the isMobileView property based on the viewPortService.
   */
  ngOnInit() {
    this.viewportSub = this.viewportService.isMobileView$.subscribe(isMobile => {
      this.isMobileView = isMobile;
      if (!isMobile) {
        // Ensure tile is deselected when switching to desktop view
        this.selectedTile = null;
      }
    });
    // New: listen to window resizes for tablet detection
    this.checkTablet();
    this.resizeSub = fromEvent(window, 'resize').subscribe(() => this.checkTablet());
    }


  /**
   * Adds an event listener for the Leaflet map, which sets the hovered photos for the photo strip.
   */
  ngAfterViewInit() {
    this.map?.on('movestart', () => (this.hoveredPhotos = []));
  }


  /**
   * Cleans up the component on destroy.
   */
  ngOnDestroy(): void {
    this.map?.remove();
    this.viewportSub?.unsubscribe();
    this.resizeSub?.unsubscribe();
  }


  /**
   * Toggles between tiles and map on mobile.
   */
  toggleMap() {
    this.showMap = !this.showMap;
  }


  /**
   * Sets the selected tile for mobile view expansion by title.
   * @param tile The expanded tile's title.
   */
  selectTile(tile: 'tennis' | 'causes' | 'travelling' | null) {
    this.selectedTile = tile;
  }


  /**
   *
   * @private
   */
  private checkTablet() {
    const w = window.innerWidth;
    // Define breakpoints consistent with scss $max-mobile-width and $max-tablet-width
    this.isTabletView = w > this.viewportService.getMaxMobileWidth && w <= this.viewportService.getMaxTabletWidth;
  }



  /**
   * Applies custom settings and event listeners to the Leaflet map after
   * it has been initialized.
   * @param map The Leaflet map to be adjusted.
   */
  onMapReady(map: L.Map) {

    this.map = map;
    const mapContainer = this.map.getContainer();

    // Dark and light mode backgrounds for text
    const darkBg = 'rgba(239,229,255,0.5)';
    const lightBg = 'rgba(168,168,168,0.6)';

    // Overlay for Zoom using Control + Scroll
    const zoomOverlay = document.createElement('div');
    zoomOverlay.innerHTML = `<div style="color: ${this.isDarkMode ? '#222' : '#eee'}; font-family: sans-serif; text-align: center; font-size: 2.5em; font-weight: 550;">Use Ctrl + Scroll to Zoom</div>`;
    zoomOverlay.style.backgroundColor = this.isDarkMode ? darkBg : lightBg;
    zoomOverlay.style.position = 'absolute';
    zoomOverlay.style.top = '0';
    zoomOverlay.style.left = '0';
    zoomOverlay.style.width = '100%';
    zoomOverlay.style.height = '100%';
    zoomOverlay.style.display = 'flex';
    zoomOverlay.style.justifyContent = 'center';
    zoomOverlay.style.alignItems = 'center';
    zoomOverlay.style.zIndex = '1000';
    zoomOverlay.style.opacity = '0';
    zoomOverlay.style.pointerEvents = 'none';
    zoomOverlay.style.transition = 'opacity 300ms ease-in-out';

    // Overlay for hovering / clicking dots
    const hoverOverlay = document.createElement('div');
    hoverOverlay.innerHTML = `<div style="color: ${this.isDarkMode ? '#222' : '#eee'}; font-family: sans-serif; text-align: center; font-size: 2.5em; font-weight: 550;">${this.isMobileView || this.isTabletView ? 'Click dots to see travel memories' : 'Hover dots to see travel memories'}</div>`;
    hoverOverlay.style.backgroundColor = this.isDarkMode ? darkBg : lightBg;
    hoverOverlay.style.position = 'absolute';
    hoverOverlay.style.top = '0';
    hoverOverlay.style.left = '0';
    hoverOverlay.style.width = '100%';
    hoverOverlay.style.height = '100%';
    hoverOverlay.style.display = 'flex';
    hoverOverlay.style.justifyContent = 'center';
    hoverOverlay.style.alignItems = 'center';
    hoverOverlay.style.zIndex = '1000';
    hoverOverlay.style.opacity = '1';
    hoverOverlay.style.pointerEvents = 'none';
    hoverOverlay.style.transition = 'opacity 300ms ease-in-out';

    if (getComputedStyle(mapContainer).position === 'static') {
      mapContainer.style.position = 'relative';
    }

    zoomOverlay.classList.add('map-zoomOverlay');
    hoverOverlay.classList.add('map-zoomOverlay', 'map-hoverOverlay');

    if (!this.isMobileView && !this.isTabletView) {
      mapContainer.appendChild(zoomOverlay); // Control + Zoom is only relevant on desktop
    }
    mapContainer.appendChild(hoverOverlay);

    // Disable scroll wheel by default
    this.map.scrollWheelZoom.disable();

    // Variable to hold the timer for hiding the zoomOverlay
    let hideOverlayTimer: any;

    // Hide information on house leave
    mapContainer.addEventListener('mouseleave', () => {
      zoomOverlay.style.opacity = '0';
      this.map.scrollWheelZoom.disable();
      clearTimeout(hideOverlayTimer);
    });

    // Show zoomOverlay until first mouse enter
    mapContainer.addEventListener('mouseenter', () => {
      setTimeout(() => {
        hoverOverlay.style.opacity = '0';
      }, 1000);
    })

    // Listen for the wheel event on the map container.
    mapContainer.addEventListener('wheel', (e: WheelEvent) => {
      // Clear any existing timer every time a wheel event occurs
      clearTimeout(hideOverlayTimer);

      if (e.ctrlKey) {
        e.preventDefault();
        this.map.scrollWheelZoom.enable();
        zoomOverlay.style.opacity = '0';
      } else {
        this.map.scrollWheelZoom.disable();
        zoomOverlay.style.opacity = '1';
        // Set a new timer to hide the zoomOverlay after 1 second
        hideOverlayTimer = setTimeout(() => {
          zoomOverlay.style.opacity = '0';
        }, 1000);
      }
    }, {passive: false});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Vienna Home Marker
    const fg = L.featureGroup().addTo(map);
    L.circleMarker([48.2081, 16.3713], {
      radius: 6, color: '#bf30b6', weight: 2, fillOpacity: 0.9
    }).addTo(fg);

    // Add travel destination markers
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


  /**
   * Reveals the photo bar showing the rotating photos and trip name.
   * @param ev The Leaflet mouse event which initiates showing the photo bar.
   * @param trip The trip to show photos from.
   * @private
   */
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

    // Animation variables
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

      // Check for overflow to the left
      if ((p.x - halfBarWidth) < padding) {

        left = padding;
        transformX = '0%';
      }
      // Check for overflow to the right
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
}
