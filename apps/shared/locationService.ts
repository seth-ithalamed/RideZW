export interface LocationPoint {
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
}

export interface ZimbabwePlace {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  category: 'airport' | 'shopping' | 'hospital' | 'education' | 'transit' | 'business' | 'residential' | 'hotel' | 'landmark';
  relevance: number;
}

export const ZIMBABWE_PLACES_DATABASE: ZimbabwePlace[] = [
  // Harare Airports & Transport Hubs
  {
    id: 'zw-hre-01',
    name: 'Robert Gabriel Mugabe International Airport',
    address: 'Airport Road, Hatfield, Harare',
    neighborhood: 'Hatfield',
    city: 'Harare',
    lat: -17.9318,
    lng: 31.0928,
    category: 'airport',
    relevance: 0.99
  },
  {
    id: 'zw-hre-02',
    name: 'Mbare Musika Bus Terminus & Market',
    address: 'Ardbennie Rd, Mbare, Harare',
    neighborhood: 'Mbare',
    city: 'Harare',
    lat: -17.8596,
    lng: 31.0425,
    category: 'transit',
    relevance: 0.95
  },
  {
    id: 'zw-hre-03',
    name: 'Roadport International Bus Terminal',
    address: 'Robert Mugabe Way & 5th St, Harare CBD',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8322,
    lng: 31.0585,
    category: 'transit',
    relevance: 0.94
  },
  {
    id: 'zw-hre-04',
    name: 'Fourth Street (Simon Muzenda) Bus Terminus',
    address: 'Simon Muzenda St & George Silundika Ave, Harare',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8285,
    lng: 31.0560,
    category: 'transit',
    relevance: 0.93
  },
  {
    id: 'zw-hre-05',
    name: 'Market Square Bus Rank',
    address: 'Bank St & Mbuya Nehanda St, Harare CBD',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8340,
    lng: 31.0420,
    category: 'transit',
    relevance: 0.92
  },

  // Harare CBD & Commercial Centres
  {
    id: 'zw-hre-06',
    name: 'Joina City Mall',
    address: 'Jason Moyo Ave & Julius Nyerere Way, Harare CBD',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8308,
    lng: 31.0488,
    category: 'shopping',
    relevance: 0.98
  },
  {
    id: 'zw-hre-07',
    name: 'First Mutual Tower',
    address: '95 Jason Moyo Ave, Harare CBD',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8292,
    lng: 31.0522,
    category: 'business',
    relevance: 0.96
  },
  {
    id: 'zw-hre-08',
    name: 'Eastgate Shopping Mall',
    address: 'Robert Mugabe Way & Sam Nujoma St, Harare CBD',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8315,
    lng: 31.0545,
    category: 'shopping',
    relevance: 0.95
  },
  {
    id: 'zw-hre-09',
    name: 'Sam Levy’s Village',
    address: 'Piers Rd & Borrowdale Rd, Borrowdale, Harare',
    neighborhood: 'Borrowdale',
    city: 'Harare',
    lat: -17.7554,
    lng: 31.0852,
    category: 'shopping',
    relevance: 0.99
  },
  {
    id: 'zw-hre-10',
    name: 'Avondale Shopping Centre',
    address: 'King George Rd & Bath Rd, Avondale, Harare',
    neighborhood: 'Avondale',
    city: 'Harare',
    lat: -17.7946,
    lng: 31.0392,
    category: 'shopping',
    relevance: 0.96
  },
  {
    id: 'zw-hre-11',
    name: 'Arundel Village Shopping Centre',
    address: 'Golden Stairs Rd & Mount Pleasant Dr, Mt Pleasant',
    neighborhood: 'Mount Pleasant',
    city: 'Harare',
    lat: -17.7602,
    lng: 31.0525,
    category: 'shopping',
    relevance: 0.93
  },
  {
    id: 'zw-hre-12',
    name: 'Westgate Shopping Mall',
    address: 'Lomagundi Rd (A1), Westgate, Harare',
    neighborhood: 'Westgate',
    city: 'Harare',
    lat: -17.7650,
    lng: 30.9850,
    category: 'shopping',
    relevance: 0.94
  },
  {
    id: 'zw-hre-13',
    name: 'Longcheng Plaza',
    address: 'Samora Machel Ave West & Mutley Bend, Belvedere',
    neighborhood: 'Belvedere',
    city: 'Harare',
    lat: -17.8220,
    lng: 31.0060,
    category: 'shopping',
    relevance: 0.92
  },
  {
    id: 'zw-hre-14',
    name: 'Highland Park Shopping Mall',
    address: 'Enterprise Rd (ED Mnangagwa Rd), Highlands, Harare',
    neighborhood: 'Highlands',
    city: 'Harare',
    lat: -17.7910,
    lng: 31.0965,
    category: 'shopping',
    relevance: 0.95
  },
  {
    id: 'zw-hre-15',
    name: 'Village Walk Borrowdale',
    address: 'Borrowdale Rd, Borrowdale, Harare',
    neighborhood: 'Borrowdale',
    city: 'Harare',
    lat: -17.7530,
    lng: 31.0870,
    category: 'shopping',
    relevance: 0.93
  },

  // Harare Medical & Education
  {
    id: 'zw-hre-16',
    name: 'Parirenyatwa Group of Hospitals',
    address: 'Mazowe St, Belgravia, Harare',
    neighborhood: 'Belgravia',
    city: 'Harare',
    lat: -17.8085,
    lng: 31.0455,
    category: 'hospital',
    relevance: 0.97
  },
  {
    id: 'zw-hre-17',
    name: 'Sally Mugabe Central Hospital (Harare Hospital)',
    address: 'Lobengula Rd & Remembrance Dr, Southerton',
    neighborhood: 'Southerton',
    city: 'Harare',
    lat: -17.8540,
    lng: 31.0260,
    category: 'hospital',
    relevance: 0.94
  },
  {
    id: 'zw-hre-18',
    name: 'Avenues Clinic',
    address: 'Baines Ave & Mazowe St, Avenues, Harare',
    neighborhood: 'Avenues',
    city: 'Harare',
    lat: -17.8182,
    lng: 31.0485,
    category: 'hospital',
    relevance: 0.95
  },
  {
    id: 'zw-hre-19',
    name: 'University of Zimbabwe (UZ Main Campus)',
    address: 'Churchill Ave, Mount Pleasant, Harare',
    neighborhood: 'Mount Pleasant',
    city: 'Harare',
    lat: -17.7840,
    lng: 31.0530,
    category: 'education',
    relevance: 0.97
  },
  {
    id: 'zw-hre-20',
    name: 'Harare Polytechnic College',
    address: 'Herbert Chitepo Ave & Bishop Gaul Ave, Belvedere',
    neighborhood: 'Belvedere',
    city: 'Harare',
    lat: -17.8210,
    lng: 31.0310,
    category: 'education',
    relevance: 0.91
  },

  // Harare Residential & Suburbs
  {
    id: 'zw-hre-21',
    name: 'Chitungwiza Town Centre Mall',
    address: 'Mangwende Dr, Seke, Chitungwiza',
    neighborhood: 'Chitungwiza',
    city: 'Chitungwiza',
    lat: -18.0125,
    lng: 31.0590,
    category: 'shopping',
    relevance: 0.94
  },
  {
    id: 'zw-hre-22',
    name: 'Mabvuku Shopping Centre (Kamunhu)',
    address: 'Mabvuku Main Rd, Mabvuku, Harare',
    neighborhood: 'Mabvuku',
    city: 'Harare',
    lat: -17.8480,
    lng: 31.1890,
    category: 'shopping',
    relevance: 0.89
  },
  {
    id: 'zw-hre-23',
    name: 'Kuwadzana Roundabout & Complex',
    address: 'Bulawayo Rd, Kuwadzana, Harare',
    neighborhood: 'Kuwadzana',
    city: 'Harare',
    lat: -17.8380,
    lng: 30.9320,
    category: 'transit',
    relevance: 0.91
  },
  {
    id: 'zw-hre-24',
    name: 'Budiriro 1 Shopping Centre',
    address: 'Current St, Budiriro, Harare',
    neighborhood: 'Budiriro',
    city: 'Harare',
    lat: -17.8860,
    lng: 30.9480,
    category: 'shopping',
    relevance: 0.88
  },
  {
    id: 'zw-hre-25',
    name: 'Glen View 8 Complex (Area 8)',
    address: 'Willowvale Rd, Glen View, Harare',
    neighborhood: 'Glen View',
    city: 'Harare',
    lat: -17.8830,
    lng: 30.9650,
    category: 'business',
    relevance: 0.90
  },
  {
    id: 'zw-hre-26',
    name: 'Madokero Mall',
    address: 'Kirkman Rd, Madokero Estate, Harare',
    neighborhood: 'Tynwald / Madokero',
    city: 'Harare',
    lat: -17.7830,
    lng: 30.9420,
    category: 'shopping',
    relevance: 0.92
  },

  // Bulawayo Key Locations
  {
    id: 'zw-byo-01',
    name: 'Joshua Mqabuko Nkomo International Airport',
    address: 'Airport Rd, Bulawayo',
    neighborhood: 'Airport / North End',
    city: 'Bulawayo',
    lat: -20.0174,
    lng: 28.6179,
    category: 'airport',
    relevance: 0.98
  },
  {
    id: 'zw-byo-02',
    name: 'Bulawayo City Hall & Large City Hall',
    address: 'Fife St & 8th Ave, Bulawayo CBD',
    neighborhood: 'Bulawayo CBD',
    city: 'Bulawayo',
    lat: -20.1558,
    lng: 28.5833,
    category: 'landmark',
    relevance: 0.97
  },
  {
    id: 'zw-byo-03',
    name: 'National University of Science and Technology (NUST)',
    address: 'Gwanda Rd, Woodlands, Bulawayo',
    neighborhood: 'Woodlands',
    city: 'Bulawayo',
    lat: -20.1782,
    lng: 28.6435,
    category: 'education',
    relevance: 0.96
  },
  {
    id: 'zw-byo-04',
    name: 'United Bulawayo Hospitals (UBH)',
    address: 'St Lukes Way, Ascot, Bulawayo',
    neighborhood: 'Ascot',
    city: 'Bulawayo',
    lat: -20.1685,
    lng: 28.6120,
    category: 'hospital',
    relevance: 0.95
  },
  {
    id: 'zw-byo-05',
    name: 'Mpilo Central Hospital',
    address: 'Vera Rd, Mzilikazi, Bulawayo',
    neighborhood: 'Mzilikazi',
    city: 'Bulawayo',
    lat: -20.1320,
    lng: 28.5680,
    category: 'hospital',
    relevance: 0.95
  },
  {
    id: 'zw-byo-06',
    name: 'Ascot Shopping Centre',
    address: '12th Ave Ext & Gwanda Rd, Ascot, Bulawayo',
    neighborhood: 'Ascot',
    city: 'Bulawayo',
    lat: -20.1620,
    lng: 28.6080,
    category: 'shopping',
    relevance: 0.93
  },
  {
    id: 'zw-byo-07',
    name: 'Renkini Bus Terminus',
    address: '6th Ave Ext, Makokoba, Bulawayo',
    neighborhood: 'Makokoba',
    city: 'Bulawayo',
    lat: -20.1460,
    lng: 28.5720,
    category: 'transit',
    relevance: 0.94
  },
  {
    id: 'zw-byo-08',
    name: 'Bradfield Shopping Centre',
    address: 'Hillside Rd, Bradfield, Bulawayo',
    neighborhood: 'Bradfield',
    city: 'Bulawayo',
    lat: -20.1760,
    lng: 28.5910,
    category: 'shopping',
    relevance: 0.92
  },

  // Victoria Falls
  {
    id: 'zw-vfa-01',
    name: 'Victoria Falls Rainforest Gate',
    address: 'Livingstone Way, Victoria Falls',
    neighborhood: 'Rainforest Reserve',
    city: 'Victoria Falls',
    lat: -17.9244,
    lng: 25.8560,
    category: 'landmark',
    relevance: 0.99
  },
  {
    id: 'zw-vfa-02',
    name: 'Victoria Falls International Airport',
    address: 'Bulawayo-Victoria Falls Rd (A8), Victoria Falls',
    neighborhood: 'Airport',
    city: 'Victoria Falls',
    lat: -18.0959,
    lng: 25.8390,
    category: 'airport',
    relevance: 0.98
  },
  {
    id: 'zw-vfa-03',
    name: 'The Victoria Falls Hotel',
    address: '1 Mallet Dr, Victoria Falls',
    neighborhood: 'Falls Resort',
    city: 'Victoria Falls',
    lat: -17.9288,
    lng: 25.8455,
    category: 'hotel',
    relevance: 0.96
  },
  {
    id: 'zw-vfa-04',
    name: 'Victoria Falls Town Centre Mall (Sawanga)',
    address: 'Livingstone Way & Pioneer Rd, Victoria Falls',
    neighborhood: 'Town Centre',
    city: 'Victoria Falls',
    lat: -17.9315,
    lng: 25.8350,
    category: 'shopping',
    relevance: 0.94
  },

  // Mutare
  {
    id: 'zw-mut-01',
    name: 'Mutare Main Bus Terminus (Sakubva Musika)',
    address: 'Sakubva Rd, Sakubva, Mutare',
    neighborhood: 'Sakubva',
    city: 'Mutare',
    lat: -18.9950,
    lng: 32.6510,
    category: 'transit',
    relevance: 0.95
  },
  {
    id: 'zw-mut-02',
    name: 'Mutare Civic Centre & Town Hall',
    address: 'Robert Mugabe Way, Mutare CBD',
    neighborhood: 'Mutare CBD',
    city: 'Mutare',
    lat: -18.9728,
    lng: 32.6723,
    category: 'landmark',
    relevance: 0.96
  },

  // Gweru
  {
    id: 'zw-gwe-01',
    name: 'Gweru Clock Tower & Civic Centre',
    address: 'Main St & Robert Mugabe Way, Gweru CBD',
    neighborhood: 'Gweru CBD',
    city: 'Gweru',
    lat: -19.4587,
    lng: 29.8149,
    category: 'landmark',
    relevance: 0.96
  },
  {
    id: 'zw-gwe-02',
    name: 'Midlands State University (MSU Main Campus)',
    address: 'Senga Rd, Senga, Gweru',
    neighborhood: 'Senga',
    city: 'Gweru',
    lat: -19.4890,
    lng: 29.8450,
    category: 'education',
    relevance: 0.97
  }
];

/**
 * Searches places across the local Zimbabwe index and falls back to Nominatim OSM geocoding
 */
export async function searchPlaces(query: string, cityFilter?: string): Promise<ZimbabwePlace[]> {
  const cleanQ = (query || '').trim().toLowerCase();

  // If query is empty, return top places in the current city or general top landmarks
  if (cleanQ.length === 0) {
    if (cityFilter) {
      const cityMatches = ZIMBABWE_PLACES_DATABASE.filter(
        p => p.city.toLowerCase() === cityFilter.toLowerCase()
      );
      if (cityMatches.length > 0) return cityMatches.slice(0, 8);
    }
    return ZIMBABWE_PLACES_DATABASE.slice(0, 8);
  }

  // 1. Search local indexed database
  const localMatches = ZIMBABWE_PLACES_DATABASE.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(cleanQ);
    const addrMatch = p.address.toLowerCase().includes(cleanQ);
    const neighMatch = p.neighborhood.toLowerCase().includes(cleanQ);
    const cityMatch = p.city.toLowerCase().includes(cleanQ);

    const matchesFilter = !cityFilter || p.city.toLowerCase() === cityFilter.toLowerCase();
    return (nameMatch || addrMatch || neighMatch || cityMatch) && matchesFilter;
  });

  if (localMatches.length >= 4) {
    return localMatches.slice(0, 8);
  }

  // 2. Query OpenStreetMap Nominatim for exact addresses / streets in Zimbabwe
  try {
    const qParam = cleanQ.includes('zimbabwe') ? cleanQ : `${cleanQ}, Zimbabwe`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      qParam
    )}&countrycodes=zw&format=json&addressdetails=1&limit=6`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const osmResults: ZimbabwePlace[] = data.map((item: any, idx: number) => {
          const parts = item.display_name.split(',');
          const shortName = parts[0]?.trim() || item.name || query;
          const suburb =
            item.address?.suburb ||
            item.address?.village ||
            item.address?.town ||
            item.address?.neighbourhood ||
            item.address?.district ||
            'Zimbabwe';
          const cityName =
            item.address?.city ||
            item.address?.town ||
            item.address?.state ||
            cityFilter ||
            'Harare';

          return {
            id: `osm-${item.place_id || idx}`,
            name: shortName,
            address: item.display_name,
            neighborhood: suburb,
            city: cityName,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            category: (item.type === 'aerodrome'
              ? 'airport'
              : item.type === 'hospital'
              ? 'hospital'
              : 'landmark') as any,
            relevance: 0.95
          };
        });

        // Deduplicate
        const merged = [...localMatches, ...osmResults];
        const seen = new Set<string>();
        const unique: ZimbabwePlace[] = [];

        for (const p of merged) {
          const key = `${p.name.toLowerCase()}-${p.lat.toFixed(3)}-${p.lng.toFixed(3)}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(p);
          }
        }
        return unique.slice(0, 8);
      }
    }
  } catch (err) {
    // Return local matches if remote fails
  }

  return localMatches;
}

/**
 * Calculates distance (km), duration (minutes), and upfront fare estimates based on coordinate geometry
 */
export function calculateTripRoute(pickup: LocationPoint, destination: LocationPoint) {
  const earthRadiusKm = 6371;
  const dLat = ((destination.lat - pickup.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - pickup.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pickup.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = earthRadiusKm * c;

  // Zimbabwean urban road factor ~1.28x straight line distance
  const distanceKm = Number(Math.max(1.0, straightKm * 1.28).toFixed(1));
  const avgSpeedKmh = 32;
  const durationMinutes = Math.max(5, Math.round((distanceKm / avgSpeedKmh) * 60));

  // Category rates
  const rates = {
    economy: { base: 3.0, perKm: 0.85, perMin: 0.1 },
    comfort: { base: 5.0, perKm: 1.2, perMin: 0.15 },
    xl: { base: 8.0, perKm: 1.6, perMin: 0.2 },
    motorbike: { base: 1.8, perKm: 0.5, perMin: 0.05 }
  };

  const getFare = (cat: keyof typeof rates) => {
    const r = rates[cat];
    const raw = r.base + distanceKm * r.perKm + durationMinutes * r.perMin;
    return Math.max(r.base, Math.ceil(raw * 2) / 2); // rounded to nearest $0.50
  };

  return {
    distanceKm,
    durationMinutes,
    fares: {
      economy: getFare('economy'),
      comfort: getFare('comfort'),
      xl: getFare('xl'),
      motorbike: getFare('motorbike')
    }
  };
}

/**
 * Reverse geocodes coordinates to a clean LocationPoint
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationPoint> {
  // Find nearest local landmark
  let closest: ZimbabwePlace | null = null;
  let minDistance = Infinity;

  for (const place of ZIMBABWE_PLACES_DATABASE) {
    const dLat = (place.lat - lat) * 111;
    const dLng = (place.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = place;
    }
  }

  if (closest && minDistance < 0.4) {
    return {
      address: closest.name,
      neighborhood: closest.neighborhood,
      city: closest.city,
      lat,
      lng
    };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        const name = parts[0]?.trim() || 'Current Location';
        const suburb =
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.village ||
          closest?.neighborhood ||
          'Local Sector';
        const city =
          data.address?.city ||
          data.address?.town ||
          closest?.city ||
          'Harare';

        return {
          address: name,
          neighborhood: suburb,
          city,
          lat,
          lng
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    address: closest ? `Near ${closest.name}` : `GPS Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    neighborhood: closest ? closest.neighborhood : 'Harare Sector',
    city: closest ? closest.city : 'Harare',
    lat,
    lng
  };
}
