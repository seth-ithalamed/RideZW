import React, { useState } from 'react';
import { LocationPoint, VehicleCategory } from '../../types';
import {
  Car,
  MapPin,
  Navigation,
  Bike,
  Users,
  Sparkles,
  Shield,
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
  Compass,
  Crosshair,
  ExternalLink,
  Map as MapIcon,
  Route,
  Clock,
  Eye
} from 'lucide-react';
import { searchMapboxPlaces, MapboxPlace, MapboxStyle } from '../../services/mapboxService';

interface MapVisualizerProps {
  pickup?: LocationPoint | null;
  destination?: LocationPoint | null;
  driverLocation?: { lat: number; lng: number; name: string; plate: string; category?: VehicleCategory } | null;
  nearbyDrivers?: Array<{ id: string; lat: number; lng: number; name: string; plate: string; category: VehicleCategory }>;
  progressPercent?: number; // 0 to 100
  height?: string;
  interactive?: boolean;
  onSelectLocation?: (loc: LocationPoint) => void;
  city?: 'Harare' | 'Bulawayo';
  showSearchBar?: boolean;
  showLayerToggle?: boolean;
  defaultStyle?: MapboxStyle;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({
  pickup,
  destination,
  driverLocation,
  nearbyDrivers = [],
  progressPercent = 0,
  height = 'h-64',
  interactive = true,
  onSelectLocation,
  city = 'Harare',
  showSearchBar = false,
  showLayerToggle = true,
  defaultStyle = 'streets'
}) => {
  const [mapStyle, setMapStyle] = useState<MapboxStyle>(defaultStyle);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activePin, setActivePin] = useState<{ x: number; y: number; address: string } | null>(null);

  // Map coordinate bounds for Harare & Bulawayo
  const bounds =
    city === 'Harare'
      ? { minLat: -17.95, maxLat: -17.74, minLng: 30.95, maxLng: 31.15 }
      : { minLat: -20.22, maxLat: -20.00, minLng: 28.50, maxLng: 28.70 };

  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.max(6, Math.min(94, x)), y: Math.max(6, Math.min(94, y)) };
  };

  const pickupCoord = pickup ? project(pickup.lat, pickup.lng) : null;
  const destCoord = destination ? project(destination.lat, destination.lng) : null;

  let currentCarPos = null;
  if (pickupCoord && destCoord) {
    const curX = pickupCoord.x + (destCoord.x - pickupCoord.x) * (progressPercent / 100);
    const curY = pickupCoord.y + (destCoord.y - pickupCoord.y) * (progressPercent / 100);
    currentCarPos = { x: curX, y: curY };
  } else if (driverLocation) {
    currentCarPos = project(driverLocation.lat, driverLocation.lng);
  }

  // Handle Search using Mapbox Geocoding Engine
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const activeCity: 'Harare' | 'Bulawayo' = city === 'Bulawayo' ? 'Bulawayo' : 'Harare';
      const results = searchMapboxPlaces(q, activeCity);
      setSearchResults(results.slice(0, 5));
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (place: MapboxPlace) => {
    const coord = project(place.lat, place.lng);
    setActivePin({ x: coord.x, y: coord.y, address: place.name });
    setSearchQuery(place.name);
    setIsSearching(false);
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

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // Estimate lat/lng from click
    const approxLng = bounds.minLng + (clickXPercent / 100) * (bounds.maxLng - bounds.minLng);
    const approxLat = bounds.maxLat - (clickYPercent / 100) * (bounds.maxLat - bounds.minLat);

    const address = `${city} Coordinate Point (${approxLat.toFixed(4)}, ${approxLng.toFixed(4)})`;
    setActivePin({ x: clickXPercent, y: clickYPercent, address });

    if (onSelectLocation) {
      onSelectLocation({
        address,
        neighborhood: `${city} Central Sector`,
        city,
        lat: approxLat,
        lng: approxLng
      });
    }
  };

  // Theme styles based on Mapbox layer selection
  const isDark = mapStyle === 'navigation-dark';
  const isSatellite = mapStyle === 'satellite';
  const isOutdoors = mapStyle === 'outdoors';

  const bgColor = isSatellite
    ? 'bg-[#0f1d13]'
    : isDark
    ? 'bg-[#08131f]'
    : isOutdoors
    ? 'bg-[#eaf4ea]'
    : 'bg-[#f1f5f9]';

  const roadStroke = isSatellite
    ? '#1c4228'
    : isDark
    ? '#132840'
    : isOutdoors
    ? '#cadac8'
    : '#cbd5e1';

  const arterialStroke = isSatellite
    ? '#2f663c'
    : isDark
    ? '#1d3e64'
    : isOutdoors
    ? '#b3ccb0'
    : '#94a3b8';

  const gridLineStroke = isSatellite
    ? '#132c1c'
    : isDark
    ? '#0d1e32'
    : isOutdoors
    ? '#dfeadf'
    : '#e2e8f0';

  return (
    <div
      className={`relative w-full ${height} ${bgColor} rounded-lg overflow-hidden border border-slate-300 dark:border-sky-900/60 shadow-xs select-none transition-colors duration-300`}
    >
      {/* Mapbox Search Autocomplete Bar Overlay */}
      {showSearchBar && (
        <div className="absolute top-2.5 left-2.5 right-12 z-30 max-w-sm">
          <div className="relative">
            <div className="flex items-center bg-white/95 backdrop-blur-md border border-slate-300 rounded-lg shadow-md px-2.5 py-1.5 gap-2">
              <Search className="w-3.5 h-3.5 text-sky-800 shrink-0" />
              <input
                type="text"
                placeholder={`Search ${city} via Mapbox Geocoding...`}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setIsSearching(true)}
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-mono whitespace-nowrap">
                MAPBOX
              </span>
            </div>

            {/* Geocoding Dropdown Suggestions */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-40 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
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

      {/* Interactive Map Surface */}
      <div
        onClick={handleMapClick}
        className={`w-full h-full cursor-crosshair relative ${is3DMode ? 'transform perspective-1000 rotate-x-12 scale-105 transition-transform duration-500' : ''}`}
      >
        {/* City Vector Network & Road Grid */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id={`mapbox-grid-${mapStyle}`} width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke={gridLineStroke} strokeWidth="1" />
            </pattern>
            <linearGradient id="mapboxRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill={`url(#mapbox-grid-${mapStyle})`} opacity="0.8" />

          {/* Urban Greenery / Parks / Water Bodies in Outdoors & Satellite */}
          {(isOutdoors || isSatellite) && (
            <>
              <circle cx="25%" cy="30%" r="60" fill={isSatellite ? '#15331f' : '#d1e7dd'} opacity="0.6" />
              <circle cx="75%" cy="75%" r="80" fill={isSatellite ? '#15331f' : '#d1e7dd'} opacity="0.6" />
              <path
                d="M 10 90 Q 40 70 80 85 T 100 80"
                stroke={isSatellite ? '#0d2838' : '#bfe3f7'}
                strokeWidth="12"
                fill="none"
                opacity="0.7"
              />
            </>
          )}

          {/* Primary Arterial Roads & Highways (Harare / Bulawayo) */}
          {city === 'Harare' ? (
            <>
              {/* Samora Machel Ave / Mutare Rd Highway */}
              <path d="M 0 52 Q 50 50 100 48" stroke={arterialStroke} strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 0 52 Q 50 50 100 48" stroke={isDark ? '#38bdf8' : '#f59e0b'} strokeWidth="1.5" fill="none" strokeDasharray="5 5" opacity="0.6" />

              {/* Julius Nyerere / Simon Mazorodze Rd */}
              <path d="M 52 0 Q 50 50 48 100" stroke={arterialStroke} strokeWidth="6" fill="none" strokeLinecap="round" />

              {/* Borrowdale Rd Corridor */}
              <path d="M 50 50 Q 65 30 85 10" stroke={arterialStroke} strokeWidth="5" fill="none" strokeLinecap="round" />

              {/* Airport Rd Corridor */}
              <path d="M 50 50 Q 65 75 90 95" stroke={arterialStroke} strokeWidth="5" fill="none" strokeLinecap="round" />

              {/* Lomagundi / Kirkman Rd */}
              <path d="M 50 50 Q 30 30 15 15" stroke={arterialStroke} strokeWidth="5" fill="none" strokeLinecap="round" />

              {/* Secondary Suburb Connectors */}
              <path d="M 20 20 L 80 20" stroke={roadStroke} strokeWidth="3" fill="none" />
              <path d="M 20 80 L 80 80" stroke={roadStroke} strokeWidth="3" fill="none" />
              <path d="M 15 50 L 85 50" stroke={roadStroke} strokeWidth="2.5" fill="none" />
            </>
          ) : (
            <>
              {/* Bulawayo Grid & Arterials (JMN Nkomo, Gwanda Rd, Plumtree Rd) */}
              <path d="M 0 50 L 100 50" stroke={arterialStroke} strokeWidth="6" fill="none" />
              <path d="M 50 0 L 50 100" stroke={arterialStroke} strokeWidth="6" fill="none" />
              <path d="M 50 50 L 85 85" stroke={arterialStroke} strokeWidth="5" fill="none" />
              <path d="M 50 50 L 15 15" stroke={arterialStroke} strokeWidth="5" fill="none" />
              <circle cx="50%" cy="50%" r="70" stroke={roadStroke} strokeWidth="3" fill="none" />
            </>
          )}

          {/* Active Route Polyline (Mapbox Navigation Style) */}
          {pickupCoord && destCoord && (
            <>
              {/* Route Glow Underlay */}
              <path
                d={`M ${pickupCoord.x}% ${pickupCoord.y}% Q ${(pickupCoord.x + destCoord.x) / 2 + 5}% ${(pickupCoord.y + destCoord.y) / 2 - 5}% ${destCoord.x}% ${destCoord.y}%`}
                fill="none"
                stroke={isDark ? '#0284c7' : '#0369a1'}
                strokeWidth="8"
                strokeOpacity="0.4"
                strokeLinecap="round"
              />
              {/* Main Mapbox Vector Line */}
              <path
                d={`M ${pickupCoord.x}% ${pickupCoord.y}% Q ${(pickupCoord.x + destCoord.x) / 2 + 5}% ${(pickupCoord.y + destCoord.y) / 2 - 5}% ${destCoord.x}% ${destCoord.y}%`}
                fill="none"
                stroke="url(#mapboxRouteGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 3"
              />
            </>
          )}
        </svg>

        {/* Nearby Idle Drivers (Mapbox Radar Pins) */}
        {nearbyDrivers.map((driver) => {
          const pos = project(driver.lat, driver.lng);
          return (
            <div
              key={driver.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-700 z-10"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-7 h-7 bg-sky-500/25 rounded-full animate-ping" />
                <div className="w-6 h-6 bg-slate-900 border-2 border-amber-400 rounded-full flex items-center justify-center text-amber-300 shadow-md">
                  {driver.category === 'motorbike' ? (
                    <Bike className="w-3 h-3" />
                  ) : driver.category === 'xl' ? (
                    <Users className="w-3 h-3" />
                  ) : driver.category === 'comfort' ? (
                    <Sparkles className="w-3 h-3" />
                  ) : (
                    <Car className="w-3 h-3" />
                  )}
                </div>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-slate-950/95 border border-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap shadow-xl z-30">
                <span className="font-bold text-white">{driver.name}</span>
                <span className="text-amber-400 font-bold">{driver.plate}</span>
                <span className="text-[8px] text-sky-300 uppercase">Mapbox Telemetry</span>
              </div>
            </div>
          );
        })}

        {/* Custom Dropped / Active Pin */}
        {activePin && (
          <div
            style={{ left: `${activePin.x}%`, top: `${activePin.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 animate-bounce"
          >
            <div className="flex flex-col items-center">
              <div className="bg-sky-600 text-white p-1 rounded-full shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <div className="bg-slate-950/95 text-sky-300 font-mono text-[9px] px-2 py-0.5 rounded mt-1 border border-sky-600 whitespace-nowrap shadow-md">
                {activePin.address}
              </div>
            </div>
          </div>
        )}

        {/* Pickup Location Marker */}
        {pickupCoord && (
          <div
            style={{ left: `${pickupCoord.x}%`, top: `${pickupCoord.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="flex flex-col items-center">
              <div className="bg-emerald-600 text-white p-1 rounded-full shadow-md border-2 border-white">
                <MapPin className="w-3.5 h-3.5 fill-white" />
              </div>
              <div className="bg-slate-900/95 text-emerald-300 font-mono font-bold text-[9px] px-1.5 py-0.2 rounded mt-0.5 border border-emerald-500/40 whitespace-nowrap">
                PICKUP: {pickup?.neighborhood || 'START'}
              </div>
            </div>
          </div>
        )}

        {/* Destination Location Marker */}
        {destCoord && (
          <div
            style={{ left: `${destCoord.x}%`, top: `${destCoord.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="flex flex-col items-center">
              <div className="bg-rose-600 text-white p-1 rounded-full shadow-md border-2 border-white animate-pulse">
                <MapPin className="w-3.5 h-3.5 fill-white" />
              </div>
              <div className="bg-slate-900/95 text-rose-300 font-mono font-bold text-[9px] px-1.5 py-0.2 rounded mt-0.5 border border-rose-500/40 whitespace-nowrap">
                DROPOFF: {destination?.neighborhood || 'DEST'}
              </div>
            </div>
          </div>
        )}

        {/* Live Moving Vehicle Marker */}
        {currentCarPos && (
          <div
            style={{ left: `${currentCarPos.x}%`, top: `${currentCarPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center shadow-xl border-2 border-amber-400">
                <Car className="w-4 h-4 fill-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mapbox Controls & Layer Switcher Overlay */}
      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20">
        {/* Layer Selector */}
        {showLayerToggle && (
          <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-md p-0.5 shadow-md">
            <button
              onClick={() => setMapStyle('streets')}
              title="Mapbox Streets (Default)"
              className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${
                mapStyle === 'streets' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setMapStyle('navigation-dark')}
              title="Mapbox Navigation Dark"
              className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${
                mapStyle === 'navigation-dark' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              title="Mapbox Satellite Streets"
              className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${
                mapStyle === 'satellite' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('outdoors')}
              title="Mapbox Outdoors"
              className={`px-1.5 py-1 rounded text-[9px] font-bold transition-all ${
                mapStyle === 'outdoors' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Terrain
            </button>
          </div>
        )}

        {/* Zoom & 3D Tilt Controls */}
        <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-md shadow-md overflow-hidden self-end">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2))}
            title="Zoom In"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 border-b border-slate-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
            title="Zoom Out"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 border-b border-slate-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            title="Toggle 3D Perspective"
            className={`p-1.5 transition-colors ${
              is3DMode ? 'text-amber-400 bg-sky-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-[9px] font-mono font-bold">3D</span>
          </button>
        </div>
      </div>

      {/* Mapbox Telemetry & City Indicator (Top-Left) */}
      {!showSearchBar && (
        <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded text-[10px] font-mono text-slate-200 flex items-center gap-1.5 shadow-sm">
          <Navigation className="w-3 h-3 text-amber-400" />
          <span className="font-bold uppercase tracking-wider">{city} MAPBOX RADAR</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>
      )}

      {/* Mapbox Official Attribution & Legal Watermark (Bottom-Left & Bottom-Right) */}
      <div className="absolute bottom-1.5 left-2.5 flex items-center gap-1.5 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-xs">
        <span className="font-bold text-white tracking-tight">mapbox</span>
        <span className="text-slate-500">|</span>
        <span>© OpenStreetMap</span>
      </div>

      <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[9px] font-mono text-sky-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
        <Shield className="w-3 h-3 text-amber-400" />
        <span>MAPBOX GEOCODING V6</span>
      </div>
    </div>
  );
};
