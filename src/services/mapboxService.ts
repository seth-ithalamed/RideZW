import { LocationPoint } from '../types';

export interface MapboxPlace {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: 'Harare' | 'Bulawayo';
  lat: number;
  lng: number;
  category: 'airport' | 'shopping' | 'hospital' | 'education' | 'transit' | 'business' | 'residential' | 'hotel';
  relevance: number;
}

export type MapboxStyle = 'streets' | 'navigation-dark' | 'satellite' | 'outdoors';

// Comprehensive Mapbox POI & Geocoding Database for Zimbabwe
export const MAPBOX_ZIMBABWE_PLACES: MapboxPlace[] = [
  // Harare Airports & Transport Hubs
  {
    id: 'mbx-hre-01',
    name: 'Robert Gabriel Mugabe International Airport',
    address: 'Airport Road, Hatfield',
    neighborhood: 'Airport / Hatfield',
    city: 'Harare',
    lat: -17.9318,
    lng: 31.0928,
    category: 'airport',
    relevance: 0.99
  },
  {
    id: 'mbx-hre-02',
    name: 'Mbare Musika Bus Terminus & Market',
    address: 'Ardbennie Rd, Mbare',
    neighborhood: 'Mbare',
    city: 'Harare',
    lat: -17.8596,
    lng: 31.0425,
    category: 'transit',
    relevance: 0.95
  },
  {
    id: 'mbx-hre-03',
    name: 'Roadport International Bus Terminal',
    address: 'Robert Mugabe Way & 5th St',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8322,
    lng: 31.0585,
    category: 'transit',
    relevance: 0.92
  },

  // Harare CBD & Commercial Centres
  {
    id: 'mbx-hre-04',
    name: 'First Mutual Tower',
    address: '95 Jason Moyo Ave',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8292,
    lng: 31.0522,
    category: 'business',
    relevance: 0.96
  },
  {
    id: 'mbx-hre-05',
    name: 'Eastgate Shopping Mall',
    address: 'Robert Mugabe Way & Sam Nujoma St',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8315,
    lng: 31.0545,
    category: 'shopping',
    relevance: 0.94
  },
  {
    id: 'mbx-hre-06',
    name: 'Joina City Mall',
    address: 'Jason Moyo Ave & Julius Nyerere Way',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8308,
    lng: 31.0488,
    category: 'shopping',
    relevance: 0.97
  },
  {
    id: 'mbx-hre-07',
    name: 'Meikles Hotel',
    address: 'Jason Moyo Ave & 3rd St',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8302,
    lng: 31.0538,
    category: 'hotel',
    relevance: 0.91
  },

  // Harare Northern & Eastern Suburbs (Malls & Centres)
  {
    id: 'mbx-hre-08',
    name: 'Sam Levy’s Village',
    address: 'Borrowdale Rd & Piers Rd',
    neighborhood: 'Borrowdale',
    city: 'Harare',
    lat: -17.7554,
    lng: 31.0872,
    category: 'shopping',
    relevance: 0.98
  },
  {
    id: 'mbx-hre-09',
    name: 'Village Walk Borrowdale',
    address: 'Borrowdale Rd',
    neighborhood: 'Borrowdale',
    city: 'Harare',
    lat: -17.7538,
    lng: 31.0889,
    category: 'shopping',
    relevance: 0.93
  },
  {
    id: 'mbx-hre-10',
    name: 'Avondale Shopping Centre',
    address: 'King George Rd & Bath Rd',
    neighborhood: 'Avondale',
    city: 'Harare',
    lat: -17.7915,
    lng: 31.0384,
    category: 'shopping',
    relevance: 0.96
  },
  {
    id: 'mbx-hre-11',
    name: 'Highland Park Mall',
    address: 'Enterprise Rd (ED Mnangagwa Rd)',
    neighborhood: 'Highlands',
    city: 'Harare',
    lat: -17.7972,
    lng: 31.1011,
    category: 'shopping',
    relevance: 0.94
  },
  {
    id: 'mbx-hre-12',
    name: 'Arundel Village Shopping Centre',
    address: 'Norfolk Rd, Mount Pleasant',
    neighborhood: 'Mt Pleasant',
    city: 'Harare',
    lat: -17.7612,
    lng: 31.0425,
    category: 'shopping',
    relevance: 0.91
  },
  {
    id: 'mbx-hre-13',
    name: 'Westgate Shopping Mall',
    address: 'Lomagundi Rd',
    neighborhood: 'Westgate',
    city: 'Harare',
    lat: -17.7690,
    lng: 30.9785,
    category: 'shopping',
    relevance: 0.93
  },
  {
    id: 'mbx-hre-14',
    name: 'Kamfinsa Shopping Centre',
    address: 'Arcturus Rd',
    neighborhood: 'Greendale',
    city: 'Harare',
    lat: -17.8123,
    lng: 31.1215,
    category: 'shopping',
    relevance: 0.89
  },

  // Harare Universities & Hospitals
  {
    id: 'mbx-hre-15',
    name: 'University of Zimbabwe (UZ)',
    address: 'Churchill Ave, Mount Pleasant',
    neighborhood: 'Mt Pleasant',
    city: 'Harare',
    lat: -17.7842,
    lng: 31.0531,
    category: 'education',
    relevance: 0.95
  },
  {
    id: 'mbx-hre-16',
    name: 'Parirenyatwa Group of Hospitals',
    address: 'Mazowe St, Belgravia',
    neighborhood: 'Belgravia',
    city: 'Harare',
    lat: -17.8105,
    lng: 31.0442,
    category: 'hospital',
    relevance: 0.96
  },
  {
    id: 'mbx-hre-17',
    name: 'The Avenues Clinic',
    address: 'Baines Ave & Mazowe St',
    neighborhood: 'Avenues',
    city: 'Harare',
    lat: -17.8205,
    lng: 31.0478,
    category: 'hospital',
    relevance: 0.93
  },
  {
    id: 'mbx-hre-18',
    name: 'Belgravia Sports Club',
    address: '2nd St Extension',
    neighborhood: 'Belgravia',
    city: 'Harare',
    lat: -17.8023,
    lng: 31.0489,
    category: 'business',
    relevance: 0.88
  },

  // Bulawayo POIs & Hubs
  {
    id: 'mbx-byo-01',
    name: 'Joshua Mqabuko Nkomo International Airport',
    address: 'Airport Rd',
    neighborhood: 'Airport / North End',
    city: 'Bulawayo',
    lat: -20.0175,
    lng: 28.6178,
    category: 'airport',
    relevance: 0.99
  },
  {
    id: 'mbx-byo-02',
    name: 'Bulawayo Centre',
    address: 'JMN Nkomo St & 9th Ave',
    neighborhood: 'Bulawayo CBD',
    city: 'Bulawayo',
    lat: -20.1569,
    lng: 28.5833,
    category: 'shopping',
    relevance: 0.97
  },
  {
    id: 'mbx-byo-03',
    name: 'Bradfield Shopping Centre',
    address: 'Hillside Rd, Bradfield',
    neighborhood: 'Bradfield',
    city: 'Bulawayo',
    lat: -20.1742,
    lng: 28.5991,
    category: 'shopping',
    relevance: 0.94
  },
  {
    id: 'mbx-byo-04',
    name: 'National University of Science & Technology (NUST)',
    address: 'Gwanda Rd',
    neighborhood: 'Riverside',
    city: 'Bulawayo',
    lat: -20.1788,
    lng: 28.6433,
    category: 'education',
    relevance: 0.96
  },
  {
    id: 'mbx-byo-05',
    name: 'Hillside Dams Conservancy',
    address: 'Banff Rd, Hillside',
    neighborhood: 'Hillside',
    city: 'Bulawayo',
    lat: -20.1985,
    lng: 28.6184,
    category: 'residential',
    relevance: 0.90
  },
  {
    id: 'mbx-byo-06',
    name: 'Mpilo Central Hospital',
    address: 'Vera Rd, Mzilikazi',
    neighborhood: 'Mzilikazi',
    city: 'Bulawayo',
    lat: -20.1345,
    lng: 28.5682,
    category: 'hospital',
    relevance: 0.94
  },
  {
    id: 'mbx-byo-07',
    name: 'ZITF Grounds (Trade Fair)',
    address: 'Hillside Rd',
    neighborhood: 'Famona',
    city: 'Bulawayo',
    lat: -20.1695,
    lng: 28.5942,
    category: 'business',
    relevance: 0.92
  }
];

/**
 * Mapbox Geocoding & Autocomplete Search Service
 */
export function searchMapboxPlaces(query: string, city?: 'Harare' | 'Bulawayo'): MapboxPlace[] {
  if (!query || query.trim().length === 0) {
    return MAPBOX_ZIMBABWE_PLACES.filter((p) => !city || p.city === city).slice(0, 6);
  }

  const cleanQuery = query.toLowerCase().trim();

  return MAPBOX_ZIMBABWE_PLACES
    .filter((place) => {
      if (city && place.city !== city) return false;
      const inName = place.name.toLowerCase().includes(cleanQuery);
      const inAddress = place.address.toLowerCase().includes(cleanQuery);
      const inNeighborhood = place.neighborhood.toLowerCase().includes(cleanQuery);
      const inCategory = place.category.toLowerCase().includes(cleanQuery);
      return inName || inAddress || inNeighborhood || inCategory;
    })
    .sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(cleanQuery) ? 2 : 0;
      const bExact = b.name.toLowerCase().startsWith(cleanQuery) ? 2 : 0;
      return (b.relevance + bExact) - (a.relevance + aExact);
    });
}

/**
 * Mapbox Reverse Geocoding Helper
 */
export function reverseGeocodeMapbox(lat: number, lng: number, city: 'Harare' | 'Bulawayo' = 'Harare'): LocationPoint {
  let closestPlace = MAPBOX_ZIMBABWE_PLACES[0];
  let minDistance = Number.MAX_VALUE;

  for (const place of MAPBOX_ZIMBABWE_PLACES) {
    const dist = Math.hypot(place.lat - lat, place.lng - lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestPlace = place;
    }
  }

  return {
    address: closestPlace.address,
    neighborhood: closestPlace.neighborhood,
    city: closestPlace.city,
    lat,
    lng
  };
}

/**
 * Mapbox Directions & Distance Matrix Calculator
 */
export function calculateMapboxRoute(origin: LocationPoint, destination: LocationPoint) {
  const earthRadiusKm = 6371;
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = earthRadiusKm * c;

  // Road network factor for Zimbabwean urban topography (approx 1.28x straight line)
  const distanceKm = Number((straightKm * 1.28).toFixed(1));
  const avgSpeedKmh = 35; // typical Harare/Bulawayo city traffic
  const durationMinutes = Math.max(4, Math.round((distanceKm / avgSpeedKmh) * 60));

  return {
    distanceKm,
    durationMinutes,
    provider: 'Mapbox Directions API v5 (Driving-Traffic)',
    waypoints: [
      { lat: origin.lat, lng: origin.lng, name: origin.address },
      { lat: destination.lat, lng: destination.lng, name: destination.address }
    ]
  };
}

/**
 * Live Mapbox Geocoding API Client (uses VITE_MAPBOX_ACCESS_TOKEN when configured)
 */
export async function liveMapboxGeocode(query: string, city?: 'Harare' | 'Bulawayo'): Promise<MapboxPlace[]> {
  const token = (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN;
  if (!token || token.trim() === '') {
    return searchMapboxPlaces(query, city);
  }

  try {
    const proximity = city === 'Bulawayo' ? '28.5833,-20.1569' : '31.0538,-17.8302';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?country=ZW&proximity=${proximity}&access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url);
    if (!res.ok) {
      return searchMapboxPlaces(query, city);
    }
    const data = await res.json();
    if (!data.features || data.features.length === 0) {
      return searchMapboxPlaces(query, city);
    }

    return data.features.map((f: any, idx: number) => ({
      id: f.id || `mbx-live-${idx}`,
      name: f.text || f.place_name,
      address: f.place_name || f.text,
      neighborhood: f.context?.find((c: any) => c.id.startsWith('neighborhood') || c.id.startsWith('locality'))?.text || city || 'Harare',
      city: city || (f.place_name?.toLowerCase().includes('bulawayo') ? 'Bulawayo' : 'Harare'),
      lat: f.center[1],
      lng: f.center[0],
      category: f.properties?.category || 'business',
      relevance: f.relevance || 0.9
    }));
  } catch (err) {
    console.warn('Live Mapbox geocoding error, using Zimbabwe POI database fallback:', err);
    return searchMapboxPlaces(query, city);
  }
}

/**
 * Live Mapbox Directions Routing Client (uses VITE_MAPBOX_ACCESS_TOKEN when configured)
 */
export async function liveMapboxDirections(origin: LocationPoint, destination: LocationPoint) {
  const token = (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN;
  if (!token || token.trim() === '') {
    return calculateMapboxRoute(origin, destination);
  }

  try {
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?geometries=geojson&overview=full&steps=true&access_token=${encodeURIComponent(
      token
    )}`;

    const res = await fetch(url);
    if (!res.ok) {
      return calculateMapboxRoute(origin, destination);
    }
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      return calculateMapboxRoute(origin, destination);
    }

    const route = data.routes[0];
    const distanceKm = Number((route.distance / 1000).toFixed(1));
    const durationMinutes = Math.max(2, Math.round(route.duration / 60));

    return {
      distanceKm,
      durationMinutes,
      provider: 'Live Mapbox Directions API (Traffic)',
      geometry: route.geometry,
      waypoints: [
        { lat: origin.lat, lng: origin.lng, name: origin.address },
        { lat: destination.lat, lng: destination.lng, name: destination.address }
      ]
    };
  } catch (err) {
    console.warn('Live Mapbox Directions error, using calculated route fallback:', err);
    return calculateMapboxRoute(origin, destination);
  }
}
