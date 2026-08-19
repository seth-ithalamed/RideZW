import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  Crosshair,
  Loader2,
  X,
  Building2,
  Plane,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Bus,
  Home,
  Compass,
  ArrowUpDown
} from 'lucide-react';
import { LocationPoint } from '../../types';
import { MapboxPlace, liveMapboxGeocode, searchMapboxPlaces } from '../../services/mapboxService';

interface MapboxLocationSearchInputProps {
  id?: string;
  label: string;
  type: 'pickup' | 'destination';
  city: string;
  value: LocationPoint;
  onChange: (location: LocationPoint) => void;
  onUseGps?: () => void;
  onSwap?: () => void;
  placeholder?: string;
}

export const MapboxLocationSearchInput: React.FC<MapboxLocationSearchInputProps> = ({
  id,
  label,
  type,
  city,
  value,
  onChange,
  onUseGps,
  onSwap,
  placeholder
}) => {
  const [query, setQuery] = useState<string>(value ? value.address : '');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<MapboxPlace[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Sync internal search input with external location changes
  useEffect(() => {
    if (value && value.address) {
      setQuery(value.address);
    }
  }, [value?.address, value?.lat, value?.lng]);

  // Click outside listener to close search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 1) {
      // Empty query shows top city POIs from Mapbox index
      const defaultPlaces = searchMapboxPlaces('', city);
      setResults(defaultPlaces);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const places = await liveMapboxGeocode(searchTerm, city);
      setResults(places);
    } catch (err) {
      console.warn('Mapbox search error, fallback to local database:', err);
      setResults(searchMapboxPlaces(searchTerm, city));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(text);
    }, 250);
  };

  const handleSelectPlace = (place: MapboxPlace) => {
    const newLocation: LocationPoint = {
      address: place.name,
      neighborhood: place.neighborhood,
      city: place.city || city,
      lat: place.lat,
      lng: place.lng
    };

    setQuery(place.name);
    onChange(newLocation);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleSelectPlace(results[0]);
      } else if (query.trim().length > 0) {
        handleSelectCustomTypedLocation();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectCustomTypedLocation = () => {
    if (!query || query.trim().length === 0) return;

    // Check if query matches any known place/suburb/growth point aliases
    const matchedPlace = searchMapboxPlaces(query, city)[0];
    if (matchedPlace) {
      handleSelectPlace(matchedPlace);
      return;
    }

    // Derived approximate coordinate based on city / query context
    const isBulawayo = query.toLowerCase().includes('bulawayo') || city.toLowerCase() === 'bulawayo';
    const isGoromonzi = query.toLowerCase().includes('goromonzi') || query.toLowerCase().includes('majuru');
    const isMutare = query.toLowerCase().includes('mutare') || city.toLowerCase() === 'mutare';
    const isVicFalls = query.toLowerCase().includes('victoria falls') || city.toLowerCase() === 'victoria falls';
    const isGweru = query.toLowerCase().includes('gweru') || city.toLowerCase() === 'gweru';
    const isChitungwiza = query.toLowerCase().includes('chitungwiza') || query.toLowerCase().includes('makoni') || query.toLowerCase().includes('zengeza') || query.toLowerCase().includes('seke');
    
    let defaultLat = -17.8292;
    let defaultLng = 31.0522;
    let districtName = city;

    if (isGoromonzi) {
      defaultLat = -17.8167;
      defaultLng = 31.4167;
      districtName = 'Goromonzi District';
    } else if (isChitungwiza) {
      defaultLat = -18.0127;
      defaultLng = 31.0592;
      districtName = 'Chitungwiza Urban';
    } else if (isBulawayo) {
      defaultLat = -20.1569;
      defaultLng = 28.5833;
      districtName = 'Bulawayo Metropolitan';
    } else if (isMutare) {
      defaultLat = -18.9728;
      defaultLng = 32.6723;
      districtName = 'Mutare Urban';
    } else if (isVicFalls) {
      defaultLat = -17.9312;
      defaultLng = 25.8407;
      districtName = 'Victoria Falls';
    } else if (isGweru) {
      defaultLat = -19.4587;
      defaultLng = 29.8149;
      districtName = 'Gweru Urban';
    }

    const customLoc: LocationPoint = {
      address: query.trim(),
      neighborhood: districtName,
      city: isGoromonzi ? 'Goromonzi' : isChitungwiza ? 'Chitungwiza' : isBulawayo ? 'Bulawayo' : city,
      lat: defaultLat,
      lng: defaultLng
    };

    onChange(customLoc);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(true);
    executeSearch('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'airport':
        return <Plane className="w-3.5 h-3.5 text-sky-600" />;
      case 'shopping':
        return <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />;
      case 'hospital':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-600" />;
      case 'education':
        return <GraduationCap className="w-3.5 h-3.5 text-purple-600" />;
      case 'transit':
        return <Bus className="w-3.5 h-3.5 text-emerald-600" />;
      case 'hotel':
        return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'landmark':
        return <Compass className="w-3.5 h-3.5 text-teal-600" />;
      case 'residential':
        return <Home className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const isPickup = type === 'pickup';

  return (
    <div ref={containerRef} className="space-y-1 relative" id={id}>
      {/* Label and Quick Actions */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              isPickup ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-rose-500 ring-2 ring-rose-100'
            }`}
          />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-2">
          {isPickup && onUseGps && (
            <button
              type="button"
              onClick={onUseGps}
              className="text-[10px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded border border-sky-200 transition-colors"
              title="Locate via device GPS coordinates"
            >
              <Crosshair className="w-2.5 h-2.5 text-sky-700" />
              <span>Current GPS</span>
            </button>
          )}

          {!isPickup && onSwap && (
            <button
              type="button"
              onClick={onSwap}
              className="text-[10px] text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-200 transition-colors"
              title="Swap pickup and destination points"
            >
              <ArrowUpDown className="w-2.5 h-2.5" />
              <span>Swap</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mapbox Geocoding Search Input Box */}
      <div className="relative">
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700" />
          ) : (
            <Search className={`w-3.5 h-3.5 ${isPickup ? 'text-emerald-600' : 'text-rose-600'}`} />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            executeSearch(query);
          }}
          placeholder={placeholder || `Type any place, landmark, shop, street in ${city}...`}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-20 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white font-medium shadow-2xs transition-all"
        />

        {/* Action badges on the right side of input */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
              title="Clear text"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 uppercase">
            MAPBOX
          </span>
        </div>
      </div>

      {/* Selected Location Pill Details */}
      {value && value.lat && value.lng && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
          <span className="truncate max-w-[200px]">
            {value.neighborhood} • {value.city}
          </span>
          <span className="text-[9px] text-slate-400">
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* Mapbox Live Geocoding Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-sky-700" />
              <span>Places, Landmarks & Growth Points in {city}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Quick GPS Auto-Detect Option for Pickup */}
          {isPickup && onUseGps && (
            <button
              type="button"
              onClick={() => {
                onUseGps();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 bg-emerald-50/80 hover:bg-emerald-100 transition-colors flex items-center justify-between gap-2 border-b border-emerald-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded bg-emerald-600 text-white shrink-0">
                  <Crosshair className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-950 truncate">
                    Auto-Detect My Current GPS Location
                  </p>
                  <p className="text-[10px] text-emerald-700 truncate">
                    Use device GPS coordinates & reverse geocode
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-emerald-800 uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-200/70 shrink-0">
                LIVE GPS
              </span>
            </button>
          )}

          {/* Places List */}
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={handleSelectCustomTypedLocation}
              className="w-full text-left px-3 py-2 bg-amber-50/70 hover:bg-amber-100/80 transition-colors flex items-center justify-between gap-2 border-b border-amber-200/60 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded bg-amber-500 text-white shrink-0">
                  <MapPin className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    Use &quot;{query}&quot;
                  </p>
                  <p className="text-[10px] text-amber-800 truncate">
                    Set as custom location / Landmark / Growth point
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-amber-800 uppercase font-mono px-1.5 py-0.5 rounded bg-amber-200/70 shrink-0">
                CUSTOM PLACE
              </span>
            </button>
          )}

          {results.length > 0 ? (
            results.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelectPlace(place)}
                className="w-full text-left px-3 py-2.5 hover:bg-sky-50 transition-colors flex items-center justify-between gap-2.5 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-white border border-slate-200 shrink-0 mt-0.5">
                    {getCategoryIcon(place.category)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-950">
                      {place.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {place.address} • <span className="font-semibold text-slate-700">{place.neighborhood}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold block mb-0.5">
                    {place.category}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">
                    {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">No standard geocoded places found</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Click &ldquo;Use &quot;{query}&quot;&rdquo; above to set it as your exact custom pickup or destination pin.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
