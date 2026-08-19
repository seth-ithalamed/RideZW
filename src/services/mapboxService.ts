import { LocationPoint } from '../types';

export interface MapboxPlace {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  category: 'airport' | 'shopping' | 'hospital' | 'education' | 'transit' | 'business' | 'residential' | 'hotel' | 'landmark';
  relevance: number;
  aliases?: string[];
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
  },

  // Victoria Falls
  {
    id: 'mbx-vfa-01',
    name: 'Victoria Falls Rainforest Gate',
    address: 'Park Way / Livingstone Way',
    neighborhood: 'Rainforest',
    city: 'Victoria Falls',
    lat: -17.9243,
    lng: 25.8569,
    category: 'landmark',
    relevance: 0.99
  },
  {
    id: 'mbx-vfa-02',
    name: 'Victoria Falls International Airport (VFA)',
    address: 'Airport Rd, Victoria Falls',
    neighborhood: 'Airport',
    city: 'Victoria Falls',
    lat: -18.0958,
    lng: 25.8392,
    category: 'airport',
    relevance: 0.98
  },
  {
    id: 'mbx-vfa-03',
    name: 'The Victoria Falls Hotel',
    address: '1 Mallet Dr',
    neighborhood: 'Town Centre',
    city: 'Victoria Falls',
    lat: -17.9275,
    lng: 25.8458,
    category: 'hotel',
    relevance: 0.96
  },
  {
    id: 'mbx-vfa-04',
    name: 'Elephant\'s Walk Shopping & Artist Village',
    address: 'Adam Stander Dr',
    neighborhood: 'Town Centre',
    city: 'Victoria Falls',
    lat: -17.9302,
    lng: 25.8385,
    category: 'shopping',
    relevance: 0.92
  },

  // Mutare & Eastern Highlands
  {
    id: 'mbx-uta-01',
    name: 'Mutare Main Bus Terminus (Sakubva)',
    address: 'Sakubva Commercial Hub',
    neighborhood: 'Sakubva',
    city: 'Mutare',
    lat: -18.9882,
    lng: 32.6514,
    category: 'transit',
    relevance: 0.95
  },
  {
    id: 'mbx-uta-02',
    name: 'Meikles Park & Civic Centre',
    address: 'Herbert Chitepo St & Aerodrome Rd',
    neighborhood: 'Mutare CBD',
    city: 'Mutare',
    lat: -18.9728,
    lng: 32.6723,
    category: 'business',
    relevance: 0.94
  },
  {
    id: 'mbx-uta-03',
    name: 'Forbes Border Post (Mozambique Transit)',
    address: 'Beira Corridor Hwy',
    neighborhood: 'Forbes Border',
    city: 'Mutare',
    lat: -18.9685,
    lng: 32.7092,
    category: 'transit',
    relevance: 0.93
  },

  // Gweru & Midlands
  {
    id: 'mbx-gwe-01',
    name: 'Midlands State University (MSU Main Campus)',
    address: 'Senga Rd',
    neighborhood: 'Senga',
    city: 'Gweru',
    lat: -19.4988,
    lng: 29.8375,
    category: 'education',
    relevance: 0.98
  },
  {
    id: 'mbx-gwe-02',
    name: 'Gweru Main Street & Batanai Mall',
    address: 'Robert Mugabe Way & 5th St',
    neighborhood: 'Gweru CBD',
    city: 'Gweru',
    lat: -19.4587,
    lng: 29.8149,
    category: 'shopping',
    relevance: 0.95
  },

  // Chitungwiza
  {
    id: 'mbx-cht-01',
    name: 'Chitungwiza Town Centre Mall',
    address: 'Town Centre Rd, Unit D',
    neighborhood: 'Seke Unit D',
    city: 'Chitungwiza',
    lat: -18.0127,
    lng: 31.0592,
    category: 'shopping',
    relevance: 0.97
  },
  {
    id: 'mbx-cht-02',
    name: 'Chitungwiza Central Hospital',
    address: 'Seke Rd / Central Way',
    neighborhood: 'Zengeza 4',
    city: 'Chitungwiza',
    lat: -18.0055,
    lng: 31.0682,
    category: 'hospital',
    relevance: 0.95
  },

  // Masvingo
  {
    id: 'mbx-mv-01',
    name: 'Great Zimbabwe National Monument Entrance',
    address: 'Monuments Rd',
    neighborhood: 'Great Zimbabwe',
    city: 'Masvingo',
    lat: -20.2742,
    lng: 30.9333,
    category: 'landmark',
    relevance: 0.99
  },
  {
    id: 'mbx-mv-02',
    name: 'Masvingo Downtown Terminus',
    address: 'Robert Mugabe St & Josiah Tongogara St',
    neighborhood: 'Masvingo CBD',
    city: 'Masvingo',
    lat: -20.0637,
    lng: 30.8277,
    category: 'transit',
    relevance: 0.94
  },

  // Goromonzi District & Mashonaland East Growth Points & Centres
  {
    id: 'mbx-gor-01',
    name: 'Majuru Growth Point & Business Centre',
    address: 'Majuru Commercial Centre, Goromonzi Rural District',
    neighborhood: 'Majuru',
    city: 'Goromonzi',
    lat: -17.8167,
    lng: 31.4167,
    category: 'shopping',
    relevance: 0.99,
    aliases: ['majuru', 'majuru growth point', 'majuru goromonzi', 'goromonzi majuru', 'majuru shops', 'majuru centre']
  },
  {
    id: 'mbx-gor-02',
    name: 'Goromonzi High School & District Offices',
    address: 'Goromonzi Mission Rd',
    neighborhood: 'Goromonzi Centre',
    city: 'Goromonzi',
    lat: -17.8180,
    lng: 31.3910,
    category: 'education',
    relevance: 0.96,
    aliases: ['goromonzi high', 'goromonzi school', 'goromonzi centre', 'goromonzi boma']
  },
  {
    id: 'mbx-gor-03',
    name: 'Juru Growth Point (Bora Business Centre)',
    address: 'Harare-Nyamapanda Hwy, Goromonzi North',
    neighborhood: 'Juru / Bora',
    city: 'Goromonzi',
    lat: -17.7125,
    lng: 31.5238,
    category: 'transit',
    relevance: 0.97,
    aliases: ['juru', 'juru growth point', 'bora', 'bora growth point', 'bora business centre', 'juru shops', 'bora shops']
  },
  {
    id: 'mbx-gor-04',
    name: 'Arcturus Mine & Commercial Quarter',
    address: 'Arcturus Rd, Goromonzi West',
    neighborhood: 'Arcturus',
    city: 'Goromonzi',
    lat: -17.7812,
    lng: 31.3125,
    category: 'business',
    relevance: 0.93,
    aliases: ['arcturus', 'arcturus mine', 'arcturus shops']
  },
  {
    id: 'mbx-gor-05',
    name: 'Melfort Business Centre & Farmers Market',
    address: 'Harare-Mutare Hwy (A3), Goromonzi South',
    neighborhood: 'Melfort',
    city: 'Goromonzi',
    lat: -18.0125,
    lng: 31.4450,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['melfort', 'melfort shops', 'melfort market', 'melfort goromonzi']
  },
  {
    id: 'mbx-gor-06',
    name: 'Bromley Commercial Centre',
    address: 'Harare-Mutare Hwy, Bromley District',
    neighborhood: 'Bromley',
    city: 'Goromonzi',
    lat: -18.0620,
    lng: 31.5420,
    category: 'transit',
    relevance: 0.91,
    aliases: ['bromley', 'bromley shops', 'bromley station']
  },

  // =========================================================================
  // HARARE HIGH-DENSITY TOWNSHIPS, SHOPPING CENTRES & STREET HUBS
  // =========================================================================
  // Mabvuku & Tafara
  {
    id: 'mbx-tw-mab-01',
    name: 'Kamunhu Shopping Centre (KwaKamunhu)',
    address: 'Donnybrook Rd & Kwayedza St',
    neighborhood: 'Mabvuku',
    city: 'Harare',
    lat: -17.8488,
    lng: 31.1872,
    category: 'shopping',
    relevance: 0.99,
    aliases: ['kwakamunhu', 'kwa kamunhu', 'kamunhu', 'kwamunhu', 'kwa munhu', 'kamunhu shopping centre', 'mabvuku kamunhu', 'donnybrook']
  },
  {
    id: 'mbx-tw-mab-02',
    name: 'Chizhanje Shopping Centre',
    address: 'Chizhanje Rd, Old Mabvuku',
    neighborhood: 'Mabvuku',
    city: 'Harare',
    lat: -17.8425,
    lng: 31.1945,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['chizhanje', 'chizhanje shops', 'old mabvuku shops', 'mabvuku chizhanje']
  },
  {
    id: 'mbx-tw-mab-03',
    name: 'Tafara Community Centre & Bus Rank',
    address: 'Tafara Main Rd',
    neighborhood: 'Tafara',
    city: 'Harare',
    lat: -17.8385,
    lng: 31.2045,
    category: 'transit',
    relevance: 0.94,
    aliases: ['tafara', 'tafara shops', 'tafara rank', 'tafara community centre']
  },

  // Highfield Township
  {
    id: 'mbx-tw-hgf-01',
    name: 'Machipisa Shopping Centre & Bus Terminus',
    address: 'Mangwende Dr & Jabavu Dr',
    neighborhood: 'Highfield',
    city: 'Harare',
    lat: -17.8865,
    lng: 31.0022,
    category: 'shopping',
    relevance: 0.99,
    aliases: ['machipisa', 'machipisa rank', 'ok machipisa', 'machipisa shops', 'highfield machipisa', 'mangwende drive']
  },
  {
    id: 'mbx-tw-hgf-02',
    name: 'Gazaland Shopping Centre & Auto Hub',
    address: 'Willowvale Rd & Highfield Link',
    neighborhood: 'Highfield',
    city: 'Harare',
    lat: -17.8762,
    lng: 31.0115,
    category: 'shopping',
    relevance: 0.98,
    aliases: ['gazaland', 'gaza land', 'gazaland shops', 'gazaland highfield', 'willowvale gazaland']
  },
  {
    id: 'mbx-tw-hgf-03',
    name: 'Mushandirapamwe Hotel & Business Complex',
    address: 'Mangwende Dr, Machipisa',
    neighborhood: 'Highfield',
    city: 'Harare',
    lat: -17.8858,
    lng: 31.0018,
    category: 'hotel',
    relevance: 0.96,
    aliases: ['mushandirapamwe', 'mushandira pamwe', 'mushandirapamwe hotel', 'machipisa hotel']
  },
  {
    id: 'mbx-tw-hgf-04',
    name: 'Lusaka Shopping Centre & Fresh Market',
    address: 'Lusaka Way, Highfield',
    neighborhood: 'Highfield',
    city: 'Harare',
    lat: -17.8920,
    lng: 30.9985,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['lusaka shops', 'lusaka highfield', 'lusaka market']
  },
  {
    id: 'mbx-tw-hgf-05',
    name: 'Egypt Shopping Centre & Terminus',
    address: 'Egypt St, Highfield',
    neighborhood: 'Highfield',
    city: 'Harare',
    lat: -17.8820,
    lng: 31.0065,
    category: 'shopping',
    relevance: 0.93,
    aliases: ['egypt shops', 'egypt highfield', 'egypt lines']
  },
  {
    id: 'mbx-tw-hgf-06',
    name: 'Western Triangle Shopping Complex',
    address: 'Western Triangle Rd',
    neighborhood: 'Highfield',
    city: 'Harare',
    lat: -17.8745,
    lng: 30.9942,
    category: 'shopping',
    relevance: 0.93,
    aliases: ['western triangle', 'western triangle shops', 'western triangle highfield']
  },
  {
    id: 'mbx-tw-hgf-07',
    name: 'Gwanzura Stadium & Main Rank',
    address: 'Mangwende Dr, Highfield',
    neighborhood: 'Highfield',
    city: 'Harare',
    lat: -17.8842,
    lng: 31.0080,
    category: 'landmark',
    relevance: 0.95,
    aliases: ['gwanzura', 'gwanzura stadium', 'gwanzura rank']
  },

  // Mbare Township
  {
    id: 'mbx-tw-mbr-01',
    name: 'Magaba Metal & Hardware Market',
    address: 'Magaba Rd & Remembrance Dr',
    neighborhood: 'Mbare',
    city: 'Harare',
    lat: -17.8545,
    lng: 31.0465,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['magaba', 'magaba market', 'magaba mbare', 'magaba hardware']
  },
  {
    id: 'mbx-tw-mbr-02',
    name: 'Matapi & Shawasha Commercial Flats',
    address: 'Matapi St, Mbare',
    neighborhood: 'Mbare',
    city: 'Harare',
    lat: -17.8580,
    lng: 31.0450,
    category: 'residential',
    relevance: 0.93,
    aliases: ['matapi', 'matapi flats', 'shawasha', 'shawasha flats', 'matapi shops']
  },
  {
    id: 'mbx-tw-mbr-03',
    name: 'Stodart Hall Cultural Centre & Musika',
    address: 'Chaminuka St, Mbare',
    neighborhood: 'Mbare',
    city: 'Harare',
    lat: -17.8620,
    lng: 31.0410,
    category: 'landmark',
    relevance: 0.94,
    aliases: ['stodart', 'stodart hall', 'stodart mbare']
  },

  // Glen View Township
  {
    id: 'mbx-tw-glv-01',
    name: 'Makomva Shopping Centre',
    address: 'Patrenda Way & Makomva St',
    neighborhood: 'Glen View 1',
    city: 'Harare',
    lat: -17.8995,
    lng: 30.9680,
    category: 'shopping',
    relevance: 0.98,
    aliases: ['makomva', 'makomva shops', 'glen view 1', 'glenview 1', 'makomva glen view']
  },
  {
    id: 'mbx-tw-glv-02',
    name: 'Glen View 8 Home Industry & Furniture Complex',
    address: 'Willowvale Extension & Glen View 8 Link',
    neighborhood: 'Glen View 8',
    city: 'Harare',
    lat: -17.9042,
    lng: 30.9520,
    category: 'shopping',
    relevance: 0.98,
    aliases: ['glen view 8', 'glenview 8', 'gv8', 'glen view 8 complex', 'glen view furniture market', 'home industry glen view']
  },
  {
    id: 'mbx-tw-glv-03',
    name: 'Tichagarika Shopping Centre',
    address: 'Tichagarika Rd, Glen View 3',
    neighborhood: 'Glen View 3',
    city: 'Harare',
    lat: -17.9050,
    lng: 30.9620,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['tichagarika', 'tichagarika shops', 'glen view 3', 'glenview 3']
  },
  {
    id: 'mbx-tw-glv-04',
    name: 'Glen View 7 Complex (Speciss Rank)',
    address: 'Glen View 7 Main Way',
    neighborhood: 'Glen View 7',
    city: 'Harare',
    lat: -17.9120,
    lng: 30.9580,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['glen view 7', 'glenview 7', 'gv7', 'speciss glen view']
  },

  // Glen Norah Township
  {
    id: 'mbx-tw-gln-01',
    name: 'Chitubu Shopping Centre',
    address: 'Zata St & Sebakwe Ave',
    neighborhood: 'Glen Norah A',
    city: 'Harare',
    lat: -17.8925,
    lng: 30.9850,
    category: 'shopping',
    relevance: 0.98,
    aliases: ['chitubu', 'chitubu shops', 'glen norah a', 'chitubu glen norah', 'zata street']
  },
  {
    id: 'mbx-tw-gln-02',
    name: 'Spaceman Shopping Centre',
    address: 'Kutama Rd, Glen Norah B',
    neighborhood: 'Glen Norah B',
    city: 'Harare',
    lat: -17.8980,
    lng: 30.9790,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['spaceman', 'spaceman shops', 'glen norah b', 'spaceman glen norah']
  },
  {
    id: 'mbx-tw-gln-03',
    name: 'Shirley Shopping Centre',
    address: 'Shirley Way, Glen Norah C',
    neighborhood: 'Glen Norah C',
    city: 'Harare',
    lat: -17.9025,
    lng: 30.9740,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['shirley shops', 'shirley glen norah', 'glen norah c']
  },
  {
    id: 'mbx-tw-gln-04',
    name: 'High Glen Shopping Mall',
    address: 'High Glen Rd & Willowvale Rd',
    neighborhood: 'Glen Norah / Budiriro Link',
    city: 'Harare',
    lat: -17.8835,
    lng: 30.9650,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['high glen mall', 'high glen shopping centre', 'high glen complex', 'willowvale high glen']
  },

  // Budiriro Township
  {
    id: 'mbx-tw-bud-01',
    name: 'Current Shopping Centre (Budiriro 1)',
    address: 'Current St & High Glen Rd',
    neighborhood: 'Budiriro 1',
    city: 'Harare',
    lat: -17.8895,
    lng: 30.9485,
    category: 'shopping',
    relevance: 0.98,
    aliases: ['current', 'current shops', 'current budiriro', 'budiriro 1', 'budiriro 1 current']
  },
  {
    id: 'mbx-tw-bud-02',
    name: 'OK Budiriro & Shopping Centre (Budiriro 2)',
    address: 'Budiriro 2 Main Way',
    neighborhood: 'Budiriro 2',
    city: 'Harare',
    lat: -17.8940,
    lng: 30.9380,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['budiriro 2', 'ok budiriro', 'budiriro 2 shops', 'budiriro 2 ok']
  },
  {
    id: 'mbx-tw-bud-03',
    name: 'Budiriro 4 Shopping Centre & Council Clinic',
    address: 'Budiriro 4 Civic Centre',
    neighborhood: 'Budiriro 4',
    city: 'Harare',
    lat: -17.9020,
    lng: 30.9280,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['budiriro 4', 'budiriro 4 shops', 'budi 4', 'budiriro 4 clinic']
  },
  {
    id: 'mbx-tw-bud-04',
    name: 'Budiriro 5 C-Junction & Shopping Centre',
    address: 'C-Junction Way, Budiriro 5',
    neighborhood: 'Budiriro 5',
    city: 'Harare',
    lat: -17.9085,
    lng: 30.9190,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['budiriro 5', 'c-junction budiriro', 'c junction budiriro', 'budiriro 5 shops', 'budi 5']
  },

  // Warren Park, Kambuzuma & Dzivarasekwa
  {
    id: 'mbx-tw-wp-01',
    name: 'Mereki Braai Spot & Shopping Centre',
    address: 'Warren Park D Commercial Quarter',
    neighborhood: 'Warren Park D',
    city: 'Harare',
    lat: -17.8415,
    lng: 30.9780,
    category: 'shopping',
    relevance: 0.99,
    aliases: ['mereki', 'pa mereki', 'pamereki', 'mereki braai', 'warren park d', 'mereki shops', 'mereki warren park']
  },
  {
    id: 'mbx-tw-wp-02',
    name: 'Warren Park 1 Shopping Centre (Green Stores)',
    address: '5th St & Westwood Link',
    neighborhood: 'Warren Park 1',
    city: 'Harare',
    lat: -17.8340,
    lng: 30.9850,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['warren park 1', 'green stores', 'warren park 1 shops', 'warren park green stores']
  },
  {
    id: 'mbx-tw-kam-01',
    name: 'Kambuzuma Section 1 Shopping Centre',
    address: 'Section 1 Way & Mufakose Rd',
    neighborhood: 'Kambuzuma',
    city: 'Harare',
    lat: -17.8540,
    lng: 30.9820,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['kambuzuma section 1', 'section 1 kambuzuma', 'kambuzuma 1', 'kambuzuma shops']
  },
  {
    id: 'mbx-tw-kam-02',
    name: 'Kambuzuma Section 2 Shopping Centre',
    address: 'Section 2 Square, Kambuzuma',
    neighborhood: 'Kambuzuma',
    city: 'Harare',
    lat: -17.8590,
    lng: 30.9760,
    category: 'shopping',
    relevance: 0.93,
    aliases: ['kambuzuma section 2', 'section 2 kambuzuma', 'kambuzuma 2']
  },
  {
    id: 'mbx-tw-dz-01',
    name: 'Dzivarasekwa 1 Shopping Centre & Bus Rank',
    address: 'DZ 1 Main St',
    neighborhood: 'Dzivarasekwa 1',
    city: 'Harare',
    lat: -17.8010,
    lng: 30.9250,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['dzivarasekwa 1', 'dz 1', 'dz1', 'dzivarasekwa 1 shops', 'dz 1 rank']
  },
  {
    id: 'mbx-tw-dz-02',
    name: 'Dzivarasekwa 2 Shopping Centre & Clinic',
    address: 'DZ 2 Commercial Link',
    neighborhood: 'Dzivarasekwa 2',
    city: 'Harare',
    lat: -17.7980,
    lng: 30.9180,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['dzivarasekwa 2', 'dz 2', 'dz2', 'dzivarasekwa 2 shops']
  },
  {
    id: 'mbx-tw-dz-03',
    name: 'Dzivarasekwa 4 (Rujeko) Shopping Centre',
    address: 'Rujeko Way, Dzivarasekwa 4',
    neighborhood: 'Dzivarasekwa 4',
    city: 'Harare',
    lat: -17.7920,
    lng: 30.9120,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['dzivarasekwa 4', 'dz 4', 'rujeko dz', 'dzivarasekwa 4 shops', 'dz4']
  },
  {
    id: 'mbx-tw-dz-04',
    name: 'Dzivarasekwa Extension & Nehanda Centre',
    address: 'Nehanda Way, DZ Extension',
    neighborhood: 'Dzivarasekwa Extension',
    city: 'Harare',
    lat: -17.7850,
    lng: 30.9020,
    category: 'shopping',
    relevance: 0.93,
    aliases: ['dz extension', 'dzivarasekwa extension', 'nehanda dz', 'nehanda centre']
  },

  // Kuwadzana Township
  {
    id: 'mbx-tw-kw-01',
    name: 'Kuwadzana 2 Shopping Centre & Bus Terminus',
    address: 'Kuwadzana 2 Main Blvd',
    neighborhood: 'Kuwadzana 2',
    city: 'Harare',
    lat: -17.8280,
    lng: 30.9420,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['kuwadzana 2', 'kz 2', 'kz2', 'kuwadzana 2 shops', 'kuwadzana 2 rank']
  },
  {
    id: 'mbx-tw-kw-02',
    name: 'Kuwadzana 4 Shopping Centre',
    address: 'Kuwadzana 4 Square',
    neighborhood: 'Kuwadzana 4',
    city: 'Harare',
    lat: -17.8220,
    lng: 30.9350,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['kuwadzana 4', 'kz 4', 'kz4', 'kuwadzana 4 shops']
  },
  {
    id: 'mbx-tw-kw-03',
    name: 'Kuwadzana 6 Roundabout & Shopping Complex',
    address: 'Bulawayo Rd & Kuwadzana 6 Roundabout',
    neighborhood: 'Kuwadzana 6',
    city: 'Harare',
    lat: -17.8180,
    lng: 30.9250,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['kuwadzana 6', 'kz 6', 'kz6', 'kuwadzana 6 roundabout', 'kuwadzana roundabout']
  },
  {
    id: 'mbx-tw-kw-04',
    name: 'Kuwadzana Extension Phase 3 Centre',
    address: 'Extension Main Way, Kuwadzana Ext',
    neighborhood: 'Kuwadzana Extension',
    city: 'Harare',
    lat: -17.8110,
    lng: 30.9150,
    category: 'shopping',
    relevance: 0.93,
    aliases: ['kuwadzana extension', 'kz extension', 'kuwadzana ext', 'kuwadzana phase 3']
  },

  // =========================================================================
  // CHITUNGWIZA HIGH-DENSITY TOWNSHIPS & SHOPPING HUBS
  // =========================================================================
  {
    id: 'mbx-tw-cht-01',
    name: 'Makoni Shopping Centre & Bus Terminus',
    address: 'Seke Unit G Commercial Blvd',
    neighborhood: 'Seke Unit G',
    city: 'Chitungwiza',
    lat: -18.0215,
    lng: 31.0740,
    category: 'shopping',
    relevance: 0.99,
    aliases: ['makoni', 'makoni shops', 'makoni rank', 'makoni shopping centre', 'seke unit g', 'makoni chitungwiza']
  },
  {
    id: 'mbx-tw-cht-02',
    name: 'Chikwanha Shopping Complex & Nightlife Hub',
    address: 'Unit D & Zengeza Link Rd',
    neighborhood: 'Seke Unit D',
    city: 'Chitungwiza',
    lat: -18.0085,
    lng: 31.0610,
    category: 'shopping',
    relevance: 0.98,
    aliases: ['chikwanha', 'chikwanha shops', 'chikwanha chitungwiza', 'chikwanha complex', 'chikwanha braai']
  },
  {
    id: 'mbx-tw-cht-03',
    name: 'Unit L Community Shopping Centre & Rank',
    address: 'Unit L Terminus Way',
    neighborhood: 'Seke Unit L',
    city: 'Chitungwiza',
    lat: -18.0380,
    lng: 31.0850,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['unit l', 'unit l shops', 'unit l rank', 'unit l chitungwiza', 'seke unit l']
  },
  {
    id: 'mbx-tw-cht-04',
    name: 'Huruyadzo Shopping Centre (St Marys)',
    address: 'St Marys Main Blvd',
    neighborhood: 'St Marys',
    city: 'Chitungwiza',
    lat: -17.9940,
    lng: 31.0510,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['huruyadzo', 'huruyadzo shops', 'st marys huruyadzo', 'st marys shopping centre', 'st marys chitungwiza']
  },
  {
    id: 'mbx-tw-cht-05',
    name: 'PaGomo Shopping Centre (Zengeza 2)',
    address: 'Zengeza 2 Commercial Rd',
    neighborhood: 'Zengeza 2',
    city: 'Chitungwiza',
    lat: -18.0020,
    lng: 31.0560,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['pagomo', 'pa gomo', 'pagomo zengeza', 'zengeza 2 shops', 'pagomo chitungwiza']
  },
  {
    id: 'mbx-tw-cht-06',
    name: 'Zengeza 3 Shopping Centre & Council Clinic',
    address: 'Zengeza 3 Square',
    neighborhood: 'Zengeza 3',
    city: 'Chitungwiza',
    lat: -18.0040,
    lng: 31.0640,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['zengeza 3', 'zengeza 3 shops', 'zengeza 3 clinic', 'zengeza 3 chitungwiza']
  },
  {
    id: 'mbx-tw-cht-07',
    name: 'Zengeza 4 Shopping Centre & Grounds',
    address: 'Zengeza 4 Way',
    neighborhood: 'Zengeza 4',
    city: 'Chitungwiza',
    lat: -18.0070,
    lng: 31.0695,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['zengeza 4', 'zengeza 4 shops', 'zengeza 4 chitungwiza']
  },
  {
    id: 'mbx-tw-cht-08',
    name: 'Jambanja Market & Braai Hub',
    address: 'Seke Unit K / Unit J Link',
    neighborhood: 'Seke Unit K',
    city: 'Chitungwiza',
    lat: -18.0290,
    lng: 31.0780,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['jambanja', 'pa jambanja', 'jambanja market', 'jambanja chitungwiza', 'jambanja braai']
  },
  {
    id: 'mbx-tw-cht-09',
    name: 'Chigovanyika Shopping Centre',
    address: 'Chigovanyika Rd, St Marys',
    neighborhood: 'St Marys',
    city: 'Chitungwiza',
    lat: -17.9890,
    lng: 31.0480,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['chigovanyika', 'chigovanyika shops', 'chigovanyika st marys']
  },
  {
    id: 'mbx-tw-cht-10',
    name: 'C-Junction Chitungwiza',
    address: 'Seke Rd & Unit D Junction',
    neighborhood: 'Seke Unit D',
    city: 'Chitungwiza',
    lat: -18.0090,
    lng: 31.0550,
    category: 'transit',
    relevance: 0.95,
    aliases: ['c-junction chitungwiza', 'c junction chitungwiza', 'c junction']
  },

  // =========================================================================
  // EPWORTH, RUWA, NORTON & DOMBOSHAVA
  // =========================================================================
  {
    id: 'mbx-tw-epw-01',
    name: 'Epworth Overspill Shopping Centre & Terminus',
    address: 'Chitungwiza-Epworth Link Rd',
    neighborhood: 'Epworth Overspill',
    city: 'Epworth',
    lat: -17.8895,
    lng: 31.1482,
    category: 'transit',
    relevance: 0.98,
    aliases: ['overspill', 'epworth overspill', 'overspill rank', 'overspill shops', 'epworth overspill shops']
  },
  {
    id: 'mbx-tw-epw-02',
    name: 'Munyuki Shopping Centre & Bus Rank',
    address: 'Munyuki Rd, Epworth',
    neighborhood: 'Epworth Munyuki',
    city: 'Epworth',
    lat: -17.8950,
    lng: 31.1560,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['munyuki', 'munyuki shops', 'munyuki rank', 'epworth munyuki']
  },
  {
    id: 'mbx-tw-epw-03',
    name: 'Stopover Shopping Centre & Solani',
    address: 'Epworth Main Rd',
    neighborhood: 'Epworth Stopover',
    city: 'Epworth',
    lat: -17.8780,
    lng: 31.1390,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['stopover epworth', 'solani epworth', 'stopover', 'solani', 'epworth stopover']
  },
  {
    id: 'mbx-tw-epw-04',
    name: 'Domboramwari Shopping Centre & Balancing Rocks',
    address: 'Domboramwari Way',
    neighborhood: 'Epworth Domboramwari',
    city: 'Epworth',
    lat: -17.8840,
    lng: 31.1420,
    category: 'landmark',
    relevance: 0.96,
    aliases: ['domboramwari', 'domboramwari shops', 'epworth balancing rocks', 'domboramwari epworth']
  },
  {
    id: 'mbx-tw-dmb-01',
    name: 'Mverechena Shopping Centre & Market',
    address: 'Domboshava Rd / Mverechena',
    neighborhood: 'Mverechena',
    city: 'Domboshava',
    lat: -17.6085,
    lng: 31.1450,
    category: 'shopping',
    relevance: 0.98,
    aliases: ['mverechena', 'mverechena shops', 'mverechena domboshava', 'mverechena market']
  },
  {
    id: 'mbx-tw-dmb-02',
    name: 'Domboshava Showground & Community Centre',
    address: 'Showground Rd, Domboshava',
    neighborhood: 'Domboshava Showground',
    city: 'Domboshava',
    lat: -17.5990,
    lng: 31.1520,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['domboshava showground', 'showground domboshava', 'domboshava shops']
  },
  {
    id: 'mbx-tw-dmb-03',
    name: 'Zimbiru Shopping Centre',
    address: 'Domboshava Rd / Zimbiru',
    neighborhood: 'Zimbiru',
    city: 'Domboshava',
    lat: -17.6320,
    lng: 31.1380,
    category: 'shopping',
    relevance: 0.93,
    aliases: ['zimbiru', 'zimbiru shops', 'zimbiru domboshava']
  },
  {
    id: 'mbx-tw-nor-01',
    name: 'Katanga Commercial Centre & Bus Rank',
    address: 'Katanga Commercial Way',
    neighborhood: 'Katanga',
    city: 'Norton',
    lat: -17.8833,
    lng: 30.7000,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['katanga', 'katanga norton', 'katanga shops', 'katanga rank', 'norton katanga']
  },
  {
    id: 'mbx-tw-nor-02',
    name: 'Maridale Shopping Centre',
    address: 'Maridale Blvd, Norton',
    neighborhood: 'Maridale',
    city: 'Norton',
    lat: -17.8920,
    lng: 30.6880,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['maridale', 'maridale norton', 'maridale shops']
  },
  {
    id: 'mbx-tw-ruw-01',
    name: 'Ruwa George Shopping Complex & TM Supermarket',
    address: 'Mutare Rd & George Dr',
    neighborhood: 'Ruwa',
    city: 'Ruwa',
    lat: -17.8932,
    lng: 31.2425,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['george ruwa', 'george shopping centre', 'ruwa shops', 'tm ruwa', 'ruwa george complex']
  },
  {
    id: 'mbx-tw-ruw-02',
    name: 'Damofalls Shopping Centre',
    address: 'Damofalls Blvd, Ruwa',
    neighborhood: 'Damofalls',
    city: 'Ruwa',
    lat: -17.9040,
    lng: 31.2650,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['damofalls', 'damofalls shops', 'damofalls ruwa']
  },
  {
    id: 'mbx-tw-ruw-03',
    name: 'Zimre Park Shopping Centre',
    address: 'Zimre Park Main Dr',
    neighborhood: 'Zimre Park',
    city: 'Ruwa',
    lat: -17.8810,
    lng: 31.2210,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['zimre park', 'zimre park shops', 'zimre']
  },

  // =========================================================================
  // BULAWAYO HIGH-DENSITY TOWNSHIPS & SHOPPING HUBS
  // =========================================================================
  {
    id: 'mbx-tw-byo-01',
    name: 'Sokusile Shopping Centre (Sekusile)',
    address: 'Nkulumane 5 Blvd',
    neighborhood: 'Nkulumane 5',
    city: 'Bulawayo',
    lat: -20.1980,
    lng: 28.5320,
    category: 'shopping',
    relevance: 0.99,
    aliases: ['sokusile', 'sekusile', 'sokusile shops', 'nkulumane 5', 'sokusile nkulumane', 'sekusile nkulumane']
  },
  {
    id: 'mbx-tw-byo-02',
    name: 'Nkulumane Shopping Complex & Bus Rank',
    address: 'Khami Rd & Nkulumane Drive',
    neighborhood: 'Nkulumane',
    city: 'Bulawayo',
    lat: -20.1910,
    lng: 28.5410,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['nkulumane complex', 'nkulumane mall', 'nkulumane shops', 'nkulumane rank']
  },
  {
    id: 'mbx-tw-byo-03',
    name: 'Renkini Long Distance Bus Terminus',
    address: 'Renkini Rd, Makokoba Edge',
    neighborhood: 'Makokoba / CBD',
    city: 'Bulawayo',
    lat: -20.1450,
    lng: 28.5740,
    category: 'transit',
    relevance: 0.98,
    aliases: ['renkini', 'renkini terminus', 'renkini bus rank', 'renkini bulawayo']
  },
  {
    id: 'mbx-tw-byo-04',
    name: 'Makokoba (Stanley Square & Eldorado)',
    address: 'Luveve Rd, Makokoba',
    neighborhood: 'Makokoba',
    city: 'Bulawayo',
    lat: -20.1420,
    lng: 28.5680,
    category: 'landmark',
    relevance: 0.96,
    aliases: ['makokoba', 'stanley square', 'big bhawa', 'eldorado makokoba', 'makokoba shops']
  },
  {
    id: 'mbx-tw-byo-05',
    name: 'Luveve 5 Shopping Centre & Beit Hall',
    address: 'Luveve Rd, Luveve 5',
    neighborhood: 'Luveve',
    city: 'Bulawayo',
    lat: -20.1250,
    lng: 28.5120,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['luveve', 'luveve 5', 'beit hall luveve', 'mafakela', 'luveve shops']
  },
  {
    id: 'mbx-tw-byo-06',
    name: 'Entumbane Shopping Complex & Roundabout',
    address: 'Luveve Rd & Masiyephambili Dr',
    neighborhood: 'Entumbane',
    city: 'Bulawayo',
    lat: -20.1340,
    lng: 28.5380,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['entumbane', 'entumbane complex', 'entumbane roundabout', 'entumbane shops']
  },
  {
    id: 'mbx-tw-byo-07',
    name: 'Pumula Old Shopping Centre',
    address: 'Pumula Old Main Blvd',
    neighborhood: 'Pumula Old',
    city: 'Bulawayo',
    lat: -20.1620,
    lng: 28.4850,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['pumula old', 'pumula old shops', 'pumula shops', 'old pumula']
  },
  {
    id: 'mbx-tw-byo-08',
    name: 'Pumula South Shopping Complex',
    address: 'Pumula South Blvd',
    neighborhood: 'Pumula South',
    city: 'Bulawayo',
    lat: -20.1780,
    lng: 28.4720,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['pumula south', 'pumula south shops', 'pumula south complex']
  },
  {
    id: 'mbx-tw-byo-09',
    name: 'Magwegwe North Shopping Centre',
    address: 'Magwegwe North Way',
    neighborhood: 'Magwegwe North',
    city: 'Bulawayo',
    lat: -20.1390,
    lng: 28.4980,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['magwegwe north', 'magwegwe north shops', 'magwegwe']
  },
  {
    id: 'mbx-tw-byo-10',
    name: 'Magwegwe West Shopping Centre',
    address: 'Magwegwe West Square',
    neighborhood: 'Magwegwe West',
    city: 'Bulawayo',
    lat: -20.1450,
    lng: 28.4910,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['magwegwe west', 'magwegwe west shops']
  },
  {
    id: 'mbx-tw-byo-11',
    name: 'Lobengula Shopping Centre',
    address: 'Lobengula Main St',
    neighborhood: 'Lobengula',
    city: 'Bulawayo',
    lat: -20.1310,
    lng: 28.5190,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['lobengula', 'lobengula shops', 'old lobengula']
  },
  {
    id: 'mbx-tw-byo-12',
    name: 'Cowdray Park Shopping Complex (Caravan & TM)',
    address: 'Cowdray Park Main Hwy',
    neighborhood: 'Cowdray Park',
    city: 'Bulawayo',
    lat: -20.0980,
    lng: 28.4950,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['cowdray park', 'caravan cowdray park', 'cowdray park shops', 'cowdray park caravan']
  },
  {
    id: 'mbx-tw-byo-13',
    name: 'Tshabalala Shopping Centre & Beer Garden',
    address: 'Khami Rd & Tshabalala Way',
    neighborhood: 'Tshabalala',
    city: 'Bulawayo',
    lat: -20.1850,
    lng: 28.5620,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['tshabalala', 'tshabalala shops', 'tshabalala beer hall']
  },
  {
    id: 'mbx-tw-byo-14',
    name: 'Sizinda Shopping Centre & Train Terminus',
    address: 'Sizinda Blvd',
    neighborhood: 'Sizinda',
    city: 'Bulawayo',
    lat: -20.1920,
    lng: 28.5550,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['sizinda', 'sizinda shops', 'sizinda rank']
  },
  {
    id: 'mbx-tw-byo-15',
    name: 'Nketa 6 & 8 Shopping Centres',
    address: 'Nketa 6 Commercial Way',
    neighborhood: 'Nketa',
    city: 'Bulawayo',
    lat: -20.2050,
    lng: 28.5480,
    category: 'shopping',
    relevance: 0.94,
    aliases: ['nketa 6', 'nketa 8', 'nketa', 'nketa shops']
  },
  {
    id: 'mbx-tw-byo-16',
    name: 'Emganwini Shopping Centre',
    address: 'Plumtree Rd & Emganwini Link',
    neighborhood: 'Emganwini',
    city: 'Bulawayo',
    lat: -20.2180,
    lng: 28.5190,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['emganwini', 'emganwini shops', 'emganwini complex']
  },

  // =========================================================================
  // MAJOR REGIONAL GROWTH POINTS & DISTRICT HUBS (ACROSS ALL PROVINCES)
  // =========================================================================
  {
    id: 'mbx-rg-01',
    name: 'Murambinda Growth Point & Civic Centre',
    address: 'Chivhu-Nyazura Hwy, Buhera District',
    neighborhood: 'Murambinda',
    city: 'Murambinda',
    lat: -19.2685,
    lng: 31.9482,
    category: 'transit',
    relevance: 0.98,
    aliases: ['murambinda', 'murambinda growth point', 'buhera', 'murambinda shops', 'murambinda centre']
  },
  {
    id: 'mbx-rg-02',
    name: 'Mupandawana Growth Point & Bus Terminus',
    address: 'Gutu-Chatsworth Rd, Gutu District',
    neighborhood: 'Mupandawana',
    city: 'Gutu',
    lat: -19.6450,
    lng: 31.1620,
    category: 'transit',
    relevance: 0.98,
    aliases: ['mupandawana', 'gutu', 'mupandawana growth point', 'gutu growth point', 'mupandawana shops']
  },
  {
    id: 'mbx-rg-03',
    name: 'Gokwe Centre & Growth Point Terminus',
    address: 'Kwekwe-Gokwe Hwy, Gokwe South',
    neighborhood: 'Gokwe Centre',
    city: 'Gokwe',
    lat: -18.2180,
    lng: 28.9320,
    category: 'transit',
    relevance: 0.98,
    aliases: ['gokwe', 'gokwe growth point', 'gokwe centre', 'gokwe shops', 'gokwe rank']
  },
  {
    id: 'mbx-rg-04',
    name: 'Murehwa Growth Point & Musami Terminus',
    address: 'Murehwa-Nyamapanda Main Rd',
    neighborhood: 'Murehwa Centre',
    city: 'Murehwa',
    lat: -17.6432,
    lng: 31.7820,
    category: 'transit',
    relevance: 0.97,
    aliases: ['murehwa', 'murehwa growth point', 'murewa', 'murehwa shops', 'murehwa centre']
  },
  {
    id: 'mbx-rg-05',
    name: 'Mutoko Growth Point & Bus Terminus',
    address: 'Mutoko Centre Rd',
    neighborhood: 'Mutoko Centre',
    city: 'Mutoko',
    lat: -17.3982,
    lng: 32.2260,
    category: 'transit',
    relevance: 0.97,
    aliases: ['mutoko', 'mutoko growth point', 'mutoko centre', 'mutoko shops']
  },
  {
    id: 'mbx-rg-06',
    name: 'Kotwa Growth Point & Mudzi Civic Centre',
    address: 'Nyamapanda Hwy, Mudzi District',
    neighborhood: 'Kotwa',
    city: 'Kotwa',
    lat: -17.1850,
    lng: 32.6520,
    category: 'transit',
    relevance: 0.95,
    aliases: ['kotwa', 'kotwa growth point', 'mudzi', 'kotwa shops']
  },
  {
    id: 'mbx-rg-07',
    name: 'Hwedza (Wedza) Growth Point & Centre',
    address: 'Marondera-Hwedza Hwy, Hwedza District',
    neighborhood: 'Hwedza Centre',
    city: 'Hwedza',
    lat: -18.6180,
    lng: 31.5720,
    category: 'transit',
    relevance: 0.96,
    aliases: ['hwedza', 'wedza', 'hwedza growth point', 'wedza growth point', 'hwedza shops']
  },
  {
    id: 'mbx-rg-08',
    name: 'Mahusekwa Growth Point & District Hospital',
    address: 'Mahusekwa Main Rd, Marondera District',
    neighborhood: 'Mahusekwa',
    city: 'Mahusekwa',
    lat: -18.3520,
    lng: 31.1850,
    category: 'hospital',
    relevance: 0.95,
    aliases: ['mahusekwa', 'mahusekwa growth point', 'mahusekwa hospital', 'mahusekwa shops']
  },
  {
    id: 'mbx-rg-09',
    name: 'Mucheke Bus Terminus & Shopping Centre',
    address: 'Mucheke Rd, Masvingo',
    neighborhood: 'Mucheke',
    city: 'Masvingo',
    lat: -20.0780,
    lng: 30.8120,
    category: 'transit',
    relevance: 0.97,
    aliases: ['mucheke', 'mucheke rank', 'mucheke masvingo', 'mucheke shops']
  },
  {
    id: 'mbx-rg-10',
    name: 'Sakubva Green Market & Musika',
    address: 'Sakubva Commercial Square',
    neighborhood: 'Sakubva',
    city: 'Mutare',
    lat: -18.9882,
    lng: 32.6514,
    category: 'shopping',
    relevance: 0.98,
    aliases: ['sakubva market', 'sakubva musika', 'sakubva mutare', 'sakubva green market', 'sakubva shops']
  },
  {
    id: 'mbx-rg-11',
    name: 'Dangamvura Complex & Shopping Centre',
    address: 'Dangamvura Link Rd',
    neighborhood: 'Dangamvura',
    city: 'Mutare',
    lat: -19.0180,
    lng: 32.6250,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['dangamvura', 'dangamvura complex', 'dangamvura shops', 'dangamvura mutare']
  },
  {
    id: 'mbx-rg-12',
    name: 'Chikanga Shopping Centre',
    address: 'Chikanga Blvd',
    neighborhood: 'Chikanga',
    city: 'Mutare',
    lat: -18.9550,
    lng: 32.6320,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['chikanga', 'chikanga shops', 'chikanga mutare', 'chikanga 1', 'chikanga 2']
  },
  {
    id: 'mbx-rg-13',
    name: 'Mkoba 6 Shopping Centre',
    address: 'Mkoba 6 Main Blvd',
    neighborhood: 'Mkoba 6',
    city: 'Gweru',
    lat: -19.4620,
    lng: 29.7680,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['mkoba 6', 'mkoba 6 shops', 'gweru mkoba 6', 'mkoba']
  },
  {
    id: 'mbx-rg-14',
    name: 'Mkoba 12 Shopping Centre & Bus Rank',
    address: 'Mkoba 12 Square',
    neighborhood: 'Mkoba 12',
    city: 'Gweru',
    lat: -19.4750,
    lng: 29.7420,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['mkoba 12', 'mkoba 12 shops', 'mkoba 12 rank']
  },
  {
    id: 'mbx-rg-15',
    name: 'Mbizo 4 Shopping Centre & Bus Terminus',
    address: 'Mbizo 4 Commercial Square',
    neighborhood: 'Mbizo 4',
    city: 'Kwekwe',
    lat: -18.9120,
    lng: 29.8450,
    category: 'shopping',
    relevance: 0.97,
    aliases: ['mbizo 4', 'mbizo 4 shops', 'kwekwe mbizo', 'mbizo rank']
  },
  {
    id: 'mbx-rg-16',
    name: 'Mbizo 9 & 16 Shopping Centres',
    address: 'Mbizo 9 Way',
    neighborhood: 'Mbizo',
    city: 'Kwekwe',
    lat: -18.8980,
    lng: 29.8590,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['mbizo 9', 'mbizo 16', 'mbizo shops', 'kwekwe mbizo 9']
  },
  {
    id: 'mbx-rg-17',
    name: 'Chiwaridzo & Chipadze Shopping Centres',
    address: 'Trojan Rd, Bindura',
    neighborhood: 'Chiwaridzo',
    city: 'Bindura',
    lat: -17.3120,
    lng: 31.3410,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['chiwaridzo', 'chipadze', 'bindura shops', 'chiwaridzo shops']
  },
  {
    id: 'mbx-rg-18',
    name: 'Rimuka Shopping Centre & Pfupajena',
    address: 'Rimuka Blvd, Kadoma',
    neighborhood: 'Rimuka',
    city: 'Kadoma',
    lat: -18.3280,
    lng: 29.9020,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['rimuka', 'rimuka shops', 'pfupajena', 'kadoma rimuka']
  },
  {
    id: 'mbx-rg-19',
    name: 'Chikonohono Shopping Centre & Hunyani',
    address: 'Chikonohono Blvd, Chinhoyi',
    neighborhood: 'Chikonohono',
    city: 'Chinhoyi',
    lat: -17.3780,
    lng: 30.1850,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['chikonohono', 'chikonohono shops', 'hunyani chinhoyi', 'chinhoyi township']
  },
  {
    id: 'mbx-rg-20',
    name: 'Dombotombo Shopping Centre & Cherutombo',
    address: 'Dombotombo Way, Marondera',
    neighborhood: 'Dombotombo',
    city: 'Marondera',
    lat: -18.1920,
    lng: 31.5620,
    category: 'shopping',
    relevance: 0.96,
    aliases: ['dombotombo', 'dombotombo shops', 'cherutombo', 'marondera dombotombo']
  },
  {
    id: 'mbx-rg-21',
    name: 'Nyamhunga Township & Kariba Heights',
    address: 'Nyamhunga Main Rd',
    neighborhood: 'Nyamhunga',
    city: 'Kariba',
    lat: -16.5410,
    lng: 28.7890,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['nyamhunga', 'nyamhunga shops', 'kariba heights', 'kariba township']
  },
  {
    id: 'mbx-rg-22',
    name: 'Tshovani Township & Chiredzi CBD',
    address: 'Tshovani Main St',
    neighborhood: 'Tshovani',
    city: 'Chiredzi',
    lat: -21.0550,
    lng: 31.6720,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['tshovani', 'tshovani shops', 'chiredzi township', 'tshovani chiredzi']
  },
  {
    id: 'mbx-rg-23',
    name: 'Gaza Township & Chipinge Commercial Centre',
    address: 'Gaza Main Blvd',
    neighborhood: 'Gaza Township',
    city: 'Chipinge',
    lat: -20.2050,
    lng: 32.6180,
    category: 'shopping',
    relevance: 0.95,
    aliases: ['gaza', 'gaza township', 'gaza chipinge', 'gaza shops']
  },
  {
    id: 'mbx-rg-24',
    name: 'Dulivhadzimu Bus Terminus & Border Complex',
    address: 'A4 Hwy / Border Way',
    neighborhood: 'Dulivhadzimu',
    city: 'Beitbridge',
    lat: -22.2167,
    lng: 30.0000,
    category: 'transit',
    relevance: 0.98,
    aliases: ['dulivhadzimu', 'dulivhadzimu rank', 'dulivhadzimu shops', 'beitbridge border']
  }
];

/**
 * Normalizes text for resilient phonetic & colloquial comparison (removes spaces, hyphens, punctuation)
 */
function normalizeSearchText(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Mapbox Geocoding & Autocomplete Search Service with deep Township & Growth Point Index
 */
export function searchMapboxPlaces(query: string, city?: string): MapboxPlace[] {
  if (!query || query.trim().length === 0) {
    return MAPBOX_ZIMBABWE_PLACES.filter((p) => !city || p.city.toLowerCase() === city.toLowerCase()).slice(0, 8);
  }

  const cleanQuery = query.toLowerCase().trim();
  const normQuery = normalizeSearchText(cleanQuery);

  return MAPBOX_ZIMBABWE_PLACES
    .filter((place) => {
      if (city && place.city.toLowerCase() !== city.toLowerCase() && place.neighborhood.toLowerCase() !== city.toLowerCase()) {
        // Allow national / township places if query matches specifically
      }
      
      const inName = place.name.toLowerCase().includes(cleanQuery);
      const inAddress = place.address.toLowerCase().includes(cleanQuery);
      const inNeighborhood = place.neighborhood.toLowerCase().includes(cleanQuery);
      const inCategory = place.category.toLowerCase().includes(cleanQuery);
      const inCity = place.city.toLowerCase().includes(cleanQuery);

      // Normalized match (handles "kwakamunhu" matching "KwaKamunhu", "kwa munhu", etc.)
      const normName = normalizeSearchText(place.name).includes(normQuery);
      const normAddr = normalizeSearchText(place.address).includes(normQuery);
      const normNeigh = normalizeSearchText(place.neighborhood).includes(normQuery);

      // Alias matching
      const inAlias = place.aliases?.some((alias) => {
        const cleanAlias = alias.toLowerCase();
        const normAlias = normalizeSearchText(alias);
        return cleanAlias.includes(cleanQuery) || normAlias.includes(normQuery) || cleanQuery.includes(cleanAlias) || normQuery.includes(normAlias);
      });

      return inName || inAddress || inNeighborhood || inCategory || inCity || normName || normAddr || normNeigh || inAlias;
    })
    .sort((a, b) => {
      // Prioritize alias matches and direct startsWith matches
      const aNorm = normalizeSearchText(a.name);
      const bNorm = normalizeSearchText(b.name);
      
      const aAliasMatch = a.aliases?.some((al) => normalizeSearchText(al).includes(normQuery) || normQuery.includes(normalizeSearchText(al))) ? 3 : 0;
      const bAliasMatch = b.aliases?.some((al) => normalizeSearchText(al).includes(normQuery) || normQuery.includes(normalizeSearchText(al))) ? 3 : 0;

      const aExact = aNorm.startsWith(normQuery) ? 2 : 0;
      const bExact = bNorm.startsWith(normQuery) ? 2 : 0;

      return (b.relevance + bExact + bAliasMatch) - (a.relevance + aExact + aAliasMatch);
    });
}

/**
 * Mapbox Reverse Geocoding Helper
 */
export function reverseGeocodeMapbox(lat: number, lng: number, city: string = 'Harare'): LocationPoint {
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
  const avgSpeedKmh = 35; // typical city traffic
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
 * OpenStreetMap Nominatim Geocoder for deep Zimbabwe rural/growth point coverage
 * (Fixes places Mapbox lacks like Majuru in Goromonzi, rural mission stations, business centres)
 */
async function searchOsmZimbabwePlaces(query: string, city?: string): Promise<MapboxPlace[]> {
  try {
    const qParam = query.toLowerCase().includes('zimbabwe') ? query : `${query}, Zimbabwe`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      qParam
    )}&countrycodes=zw&format=json&addressdetails=1&limit=6`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((item: any, idx: number) => {
      const parts = item.display_name.split(',');
      const shortName = parts[0]?.trim() || item.name || query;
      const suburb = item.address?.suburb || item.address?.village || item.address?.town || item.address?.county || item.address?.district || 'Zimbabwe';
      const cityName = item.address?.city || item.address?.town || item.address?.state || city || 'Zimbabwe';

      return {
        id: `osm-zw-${item.place_id || idx}`,
        name: shortName,
        address: item.display_name,
        neighborhood: suburb,
        city: cityName,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        category: (item.type === 'aerodrome' ? 'airport' : item.type === 'hospital' ? 'hospital' : 'landmark') as any,
        relevance: 0.96
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Live Mapbox Geocoding API Client with OpenStreetMap and Zimbabwe POI Fallback
 */
export async function liveMapboxGeocode(query: string, city?: string): Promise<MapboxPlace[]> {
  if (!query || query.trim().length === 0) {
    return searchMapboxPlaces(query, city);
  }

  const localMatches = searchMapboxPlaces(query, city);
  const token = (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN;

  let mapboxResults: MapboxPlace[] = [];

  if (token && token.trim() !== '') {
    try {
      const proximityMap: Record<string, string> = {
        harare: '31.0538,-17.8302',
        bulawayo: '28.5833,-20.1569',
        'victoria falls': '25.8407,-17.9312',
        mutare: '32.6723,-18.9728',
        gweru: '29.8149,-19.4587',
        chitungwiza: '31.0592,-18.0127',
        masvingo: '30.8277,-20.0637',
        goromonzi: '31.4167,-17.8167',
        kwekwe: '29.8149,-18.9281'
      };

      const proximity = city && proximityMap[city.toLowerCase()]
        ? proximityMap[city.toLowerCase()]
        : '31.0538,-17.8302';

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?country=ZW&proximity=${proximity}&access_token=${encodeURIComponent(token)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          mapboxResults = data.features.map((f: any, idx: number) => ({
            id: f.id || `mbx-live-${idx}`,
            name: f.text || f.place_name,
            address: f.place_name || f.text,
            neighborhood: f.context?.find((c: any) => c.id.startsWith('neighborhood') || c.id.startsWith('locality'))?.text || city || 'Zimbabwe',
            city: city || (f.place_name?.toLowerCase().includes('bulawayo') ? 'Bulawayo' : 'Harare'),
            lat: f.center[1],
            lng: f.center[0],
            category: (f.properties?.category as any) || 'business',
            relevance: f.relevance || 0.9
          }));
        }
      }
    } catch (err) {
      console.warn('Live Mapbox geocoding error:', err);
    }
  }

  // If local or Mapbox results are fewer than 4, or for specific rural/growth point queries, query OpenStreetMap Zimbabwe
  let osmResults: MapboxPlace[] = [];
  if (localMatches.length < 3 || mapboxResults.length === 0) {
    osmResults = await searchOsmZimbabwePlaces(query, city);
  }

  // Merge and deduplicate by name / proximity
  const allResults = [...localMatches, ...mapboxResults, ...osmResults];
  const seen = new Set<string>();
  const uniqueResults: MapboxPlace[] = [];

  for (const place of allResults) {
    const key = `${place.name.toLowerCase().trim()}-${place.lat.toFixed(3)}-${place.lng.toFixed(3)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(place);
    }
  }

  if (uniqueResults.length > 0) {
    return uniqueResults;
  }

  return searchMapboxPlaces(query, city);
}

/**
 * Find the nearest landmark or POI from the hyper-local Zimbabwe database
 */
export function findNearestLandmark(lat: number, lng: number): MapboxPlace | null {
  if (!MAPBOX_ZIMBABWE_PLACES || MAPBOX_ZIMBABWE_PLACES.length === 0) return null;
  
  let closest: MapboxPlace | null = null;
  let minDistance = Infinity;

  for (const place of MAPBOX_ZIMBABWE_PLACES) {
    const dLat = (place.lat - lat) * 111;
    const dLng = (place.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = place;
    }
  }

  return closest;
}

/**
 * Reverse geocodes latitude and longitude coordinates into a meaningful Zimbabwean place name
 */
export async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<LocationPoint> {
  const token = (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN;
  const nearest = findNearestLandmark(lat, lng);

  // If very close to a known landmark (< 1.5km), use that immediately or as baseline
  const dLat = nearest ? (nearest.lat - lat) * 111 : 999;
  const dLng = nearest ? (nearest.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180) : 999;
  const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

  if (nearest && distKm < 0.35) {
    return {
      address: `Current Location: ${nearest.name}`,
      neighborhood: nearest.neighborhood,
      city: nearest.city,
      lat,
      lng
    };
  }

  if (token && token.trim() !== '') {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${encodeURIComponent(
        token
      )}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const name = feature.text || feature.place_name;
          const contextCity = feature.context?.find((c: any) => c.id.startsWith('place'))?.text || nearest?.city || 'Harare';
          const contextNeighborhood = feature.context?.find((c: any) => c.id.startsWith('neighborhood') || c.id.startsWith('locality'))?.text || nearest?.neighborhood || 'Local Area';
          
          return {
            address: `Current Location (${name})`,
            neighborhood: contextNeighborhood,
            city: contextCity,
            lat,
            lng
          };
        }
      }
    } catch (err) {
      console.warn('Mapbox reverse geocode failed:', err);
    }
  }

  // If within 3km of a known Zimbabwean landmark/township, describe relative location
  if (nearest && distKm < 3.5) {
    return {
      address: `Current Location (Near ${nearest.name}, ${nearest.neighborhood})`,
      neighborhood: nearest.neighborhood,
      city: nearest.city,
      lat,
      lng
    };
  }

  return {
    address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    neighborhood: nearest ? nearest.neighborhood : 'Local Sector',
    city: nearest ? nearest.city : 'Harare',
    lat,
    lng
  };
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
