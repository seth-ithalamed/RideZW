import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationPoint, VehicleCategory } from '../../types';
import {
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
  Navigation,
  Shield,
  Compass,
  Crosshair,
  MapPin,
  Car,
  Bike,
  Sparkles,
  Users
} from 'lucide-react';
import { searchMapboxPlaces, MapboxPlace } from '../../services/mapboxService';

export type MapTileStyle = 'streets' | 'light' | 'dark' | 'satellite';

interface MapVisualizerProps {
  pickup?: LocationPoint | null;
  destination?: LocationPoint | null;
  driverLocation?: { lat: number; lng: number; name: string; plate: string; category?: VehicleCategory } | null;
  nearbyDrivers?: Array<{ id: string; lat: number; lng: number; name: string; plate: string; category: VehicleCategory }>;
  progressPercent?: number; // 0 to 100
  height?: string;
  interactive?: boolean;
  onSelectLocation?: (loc: LocationPoint) => void;
  city?: string;
  showSearchBar?: boolean;
  showLayerToggle?: boolean;
  defaultStyle?: MapTileStyle;
}

const CITY_COORDS: Record<string, [number, number]> = {
  harare: [-17.8292, 31.0522],
  bulawayo: [-20.1569, 28.5833],
  'victoria falls': [-17.9311, 25.8307],
  mutare: [-18.9728, 32.6695],
  gweru: [-19.4587, 29.8153],
  masvingo: [-20.0744, 30.8328],
  chinhoyi: [-17.3667, 30.2000],
  kwekwe: [-18.9281, 29.8149],
  marondera: [-18.1853, 31.5519],
  kadoma: [-18.3333, 29.9167],
  zvishavane: [-20.3267, 30.0665],
  beitbridge: [-22.2167, 30.0000],
  hwange: [-18.3647, 25.4981]
};

const TILE_URLS: Record<MapTileStyle, { url: string; attribution: string }> = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
  }
};

export const MapVisualizer: React.FC<MapVisualizerProps> = ({
  pickup,
  destination,
  driverLocation,
  nearbyDrivers = [],
  progressPercent = 0,
  height = 'h-72',
  interactive = true,
  onSelectLocation,
  city = 'Harare',
  showSearchBar = false,
  showLayerToggle = true,
  defaultStyle = 'light'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [currentStyle, setCurrentStyle] = useState<MapTileStyle>(defaultStyle);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const cityKey = (city || 'Harare').toLowerCase();
  const defaultCenter = CITY_COORDS[cityKey] || CITY_COORDS['harare'];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if existing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    const tileConfig = TILE_URLS[currentStyle];
    const tileLayer = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      subdomains: 'abc'
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersLayerRef.current = L.layerGroup().addTo(map);

    if (interactive && onSelectLocation) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const address = `${city} Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        onSelectLocation({
          address,
          neighborhood: `${city} Sector`,
          city,
          lat,
          lng
        });
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const tileConfig = TILE_URLS[currentStyle];
    const newTile = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      subdomains: 'abc'
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [currentStyle]);

  // Center on City change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (!pickup && !destination && (!nearbyDrivers || nearbyDrivers.length === 0)) {
      mapInstanceRef.current.setView(defaultCenter, 13);
    }
  }, [city]);

  // Render Markers, Route, and Fit Bounds
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (routePolylineRef.current) {
      mapInstanceRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const boundsPoints: L.LatLngExpression[] = [];

    // 1. Pickup Marker
    if (pickup) {
      const pickupIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background-color: #059669; color: white; padding: 6px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
            </div>
            <div style="background-color: #0f172a; color: #6ee7b7; font-size: 10px; font-weight: 700; font-family: monospace; padding: 2px 6px; border-radius: 4px; margin-top: 2px; border: 1px solid rgba(5,150,105,0.4); white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              PICKUP: ${pickup.neighborhood || pickup.address.slice(0, 15)}
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(markersLayerRef.current);
      boundsPoints.push([pickup.lat, pickup.lng]);
    }

    // 2. Destination Marker
    if (destination) {
      const destIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background-color: #e11d48; color: white; padding: 6px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
            </div>
            <div style="background-color: #0f172a; color: #fda4af; font-size: 10px; font-weight: 700; font-family: monospace; padding: 2px 6px; border-radius: 4px; margin-top: 2px; border: 1px solid rgba(225,29,72,0.4); white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              DROPOFF: ${destination.neighborhood || destination.address.slice(0, 15)}
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(markersLayerRef.current);
      boundsPoints.push([destination.lat, destination.lng]);
    }

    // 3. Active Moving Driver Marker
    let movingDriverLat = driverLocation?.lat;
    let movingDriverLng = driverLocation?.lng;

    if (pickup && destination && progressPercent > 0) {
      movingDriverLat = pickup.lat + (destination.lat - pickup.lat) * (progressPercent / 100);
      movingDriverLng = pickup.lng + (destination.lng - pickup.lng) * (progressPercent / 100);
    }

    if (movingDriverLat !== undefined && movingDriverLng !== undefined) {
      const activeCarIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <div style="background-color: #0284c7; color: white; padding: 7px; border-radius: 9999px; box-shadow: 0 0 15px rgba(2,132,199,0.7); border: 2.5px solid #fbbf24; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([movingDriverLat, movingDriverLng], { icon: activeCarIcon }).addTo(markersLayerRef.current);
      boundsPoints.push([movingDriverLat, movingDriverLng]);
    }

    // 4. Nearby Fleet Markers
    nearbyDrivers.forEach((driver) => {
      const isMoto = driver.category === 'motorbike';
      const fleetIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
            <div style="background-color: #0f172a; color: #fbbf24; padding: 5px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid #fbbf24; display: flex; align-items: center; justify-content: center;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
            <div style="background-color: #0f172a; color: white; font-size: 8px; font-weight: 700; font-family: monospace; padding: 1px 4px; border-radius: 3px; margin-top: 1px; border: 1px solid #334155; white-space: nowrap;">
              ${driver.plate}
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([driver.lat, driver.lng], { icon: fleetIcon })
        .bindPopup(`<strong>${driver.name}</strong><br/>Plate: ${driver.plate}<br/>Class: ${driver.category}`)
        .addTo(markersLayerRef.current!);

      boundsPoints.push([driver.lat, driver.lng]);
    });

    // 5. Draw Route Line between Pickup and Destination
    if (pickup && destination) {
      const latlngs: L.LatLngExpression[] = [
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      ];

      const polyline = L.polyline(latlngs, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      routePolylineRef.current = polyline;
    }

    // 6. Auto-fit bounds if multiple points exist
    if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (boundsPoints.length === 1) {
      mapInstanceRef.current.setView(boundsPoints[0], 14);
    }
  }, [pickup, destination, driverLocation, nearbyDrivers, progressPercent]);

  // Search geocoding
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const results = searchMapboxPlaces(q, city);
      setSearchResults(results.slice(0, 5));
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (place: MapboxPlace) => {
    setSearchQuery(place.name);
    setIsSearching(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([place.lat, place.lng], 15);
    }
    if (onSelectLocation) {
      onSelectLocation({
        address: place.name,
        neighborhood: place.neighborhood,
        city: place.city,
        lat: place.lat,
        lng: place.lng
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      if (pickup) {
        mapInstanceRef.current.setView([pickup.lat, pickup.lng], 14);
      } else {
        mapInstanceRef.current.setView(defaultCenter, 13);
      }
    }
  };

  return (
    <div className={`relative w-full ${height} bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-xs select-none`}>
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Search Bar Overlay */}
      {showSearchBar && (
        <div className="absolute top-2.5 left-2.5 right-12 z-20 max-w-sm">
          <div className="relative">
            <div className="flex items-center bg-white/95 backdrop-blur-md border border-slate-300 rounded-lg shadow-md px-2.5 py-1.5 gap-2">
              <Search className="w-3.5 h-3.5 text-sky-800 shrink-0" />
              <input
                type="text"
                placeholder={`Search ${city} landmarks & streets...`}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setIsSearching(true)}
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-mono whitespace-nowrap">
                LEAFLET
              </span>
            </div>

            {isSearching && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                {searchResults.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleSelectSearchResult(place)}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{place.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {place.address} • {place.neighborhood}
                      </p>
                    </div>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {place.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Style & Zoom Controls */}
      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20">
        {showLayerToggle && (
          <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-md p-0.5 shadow-md">
            <button
              onClick={() => setCurrentStyle('light')}
              title="Carto Positron Light"
              className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${
                currentStyle === 'light' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setCurrentStyle('streets')}
              title="OpenStreetMap Standard"
              className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${
                currentStyle === 'streets' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              OSM
            </button>
            <button
              onClick={() => setCurrentStyle('dark')}
              title="Dark Matter"
              className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${
                currentStyle === 'dark' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setCurrentStyle('satellite')}
              title="Satellite Imagery"
              className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${
                currentStyle === 'satellite' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sat
            </button>
          </div>
        )}

        <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-md shadow-md overflow-hidden self-end">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 border-b border-slate-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 border-b border-slate-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRecenter}
            title="Re-center Map"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* City Status Badge */}
      {!showSearchBar && (
        <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded text-[10px] font-mono text-slate-200 flex items-center gap-1.5 shadow-sm z-20">
          <Navigation className="w-3 h-3 text-amber-400" />
          <span className="font-bold uppercase tracking-wider">{city} GPS RADAR</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>
      )}

      {/* Attribution Watermark */}
      <div className="absolute bottom-1.5 left-2.5 flex items-center gap-1 text-[9px] font-mono text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 backdrop-blur-xs z-20">
        <span>© OpenStreetMap &amp; Leaflet</span>
      </div>
    </div>
  );
};
