import React, { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Phone,
  MessageSquare,
  Star,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Users,
  Bike,
  CheckCircle,
  Share2,
  Send,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Info,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Activity,
  LogOut,
  Crosshair,
  Loader2,
  Navigation,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../../services/store';
import { MapVisualizer } from '../common/MapVisualizer';
import { MapboxLocationSearchInput } from '../common/MapboxLocationSearchInput';
import {
  searchMapboxPlaces,
  MapboxPlace,
  reverseGeocodeCoordinates,
  findNearestLandmark
} from '../../services/mapboxService';
import {
  Currency,
  Language,
  LocationPoint,
  PaymentMethod,
  VehicleCategory,
  Trip,
  DriverProfile,
  CoverageCity
} from '../../types';
import { CITY_LOCATIONS_MAP, HARARE_LOCATIONS, BULAWAYO_LOCATIONS, TRANSLATIONS } from '../../data/mockData';

interface RiderAppProps {
  currency: Currency;
  language: Language;
}

export const RiderApp: React.FC<RiderAppProps> = ({ currency, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const state = store.getState();
  const rider = state.rider;
  const activeTrip = state.activeTrip;
  const coverageCities = state.coverageCities || [];

  const [city, setCity] = useState<string>(rider.city || 'Harare');
  const locationOptions: LocationPoint[] = CITY_LOCATIONS_MAP[city] || [
    { address: `${city} Central Business District`, neighborhood: 'CBD', city, lat: -17.8292, lng: 31.0522 },
    { address: `${city} Main Transit Hub & Terminus`, neighborhood: 'Terminus', city, lat: -17.8350, lng: 31.0450 },
    { address: `${city} Central Hospital & Health Quarter`, neighborhood: 'Medical', city, lat: -17.8180, lng: 31.0600 },
    { address: `${city} Commercial Shopping Centre`, neighborhood: 'Commercial', city, lat: -17.8050, lng: 31.0800 }
  ];

  const [pickup, setPickup] = useState<LocationPoint>(locationOptions[0]);
  const [destination, setDestination] = useState<LocationPoint>(locationOptions[2] || locationOptions[1] || locationOptions[0]);
  const [category, setCategory] = useState<VehicleCategory>('economy');
  const [proposedFareUSD, setProposedFareUSD] = useState<number>(6.0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ecocash');

  // GPS Auto-Detection & Geolocation States
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  // UI Modals
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'rider' | 'driver'; text: string; time: string }>>([
    { sender: 'driver', text: 'Maswera sei! I am on my way to your pickup point.', time: 'Just now' }
  ]);
  const [newChatText, setNewChatText] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosSubmitted, setSosSubmitted] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Auto-detect GPS on component mount
  useEffect(() => {
    autoDetectGpsLocation(true);
  }, []);

  const autoDetectGpsLocation = async (silent: boolean = false) => {
    if (!navigator.geolocation) {
      if (!silent) alert('Geolocation is not supported by your device / browser.');
      return;
    }

    setIsDetectingGps(true);
    if (!silent) {
      setGpsStatus('Acquiring high-precision GPS coordinates...');
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resolved = await reverseGeocodeCoordinates(latitude, longitude);
          setPickup(resolved);
          setIsGpsActive(true);
          setGpsStatus(`GPS Active: ${resolved.address}`);
          if (resolved.city && resolved.city !== city) {
            setCity(resolved.city);
          }
        } catch (err) {
          console.warn('GPS geocode failed:', err);
          const fallbackLoc: LocationPoint = {
            address: `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            neighborhood: 'Current Sector',
            city,
            lat: latitude,
            lng: longitude
          };
          setPickup(fallbackLoc);
          setIsGpsActive(true);
          setGpsStatus(`GPS Fixed: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        console.warn('Geolocation error or permission denied:', err);
        setIsDetectingGps(false);
        if (!silent) {
          setGpsStatus('GPS permission unavailable. Please search or pick a landmark below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Currency Converter Helper (fees rounded up)
  const formatMoney = (amountUSD: number) => {
    if (currency === 'ZWG') {
      const zwg = Math.ceil(amountUSD * state.settings.exchangeRateUSDToZWG);
      return `${zwg} ZiG`;
    }
    return `$${amountUSD.toFixed(2)}`;
  };

  // Upfront Estimate Calculator - Always rounded up to next whole dollar unit
  const currentPricing = state.pricingConfigs.find((p) => p.category === category) || state.pricingConfigs[0];
  const dLat = Math.abs(pickup.lat - destination.lat) * 111;
  const dLng = Math.abs(pickup.lng - destination.lng) * 111 * Math.cos((pickup.lat * Math.PI) / 180);
  const distanceKm = Number((Math.sqrt(dLat * dLat + dLng * dLng) + 1.2).toFixed(1));
  const estMinutes = Math.max(8, Math.round(distanceKm * 2.2));
  const rawFare = currentPricing.baseFareUSD + distanceKm * currentPricing.perKmUSD + estMinutes * currentPricing.perMinuteUSD;
  const estimatedFareUSD = Math.max(Math.ceil(currentPricing.baseFareUSD), Math.ceil(rawFare));

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const locs: LocationPoint[] = CITY_LOCATIONS_MAP[newCity] || [
      { address: `${newCity} Central Business District`, neighborhood: 'CBD', city: newCity, lat: -17.8292, lng: 31.0522 },
      { address: `${newCity} Main Transit Hub & Terminus`, neighborhood: 'Terminus', city: newCity, lat: -17.8350, lng: 31.0450 }
    ];
    setPickup(locs[0]);
    setDestination(locs[1] || locs[0]);
  };

  const handleUseCurrentLocation = () => {
    autoDetectGpsLocation(false);
  };

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  const handleRequestRide = () => {
    store.requestRide({
      pickup,
      destination,
      category,
      proposedFareUSD,
      paymentMethod
    });
  };

  const handleSendMessage = () => {
    if (!newChatText.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'rider', text: newChatText, time: 'Just now' }
    ]);
    const replyText =
      chatMessages.length === 1
        ? 'Arriving in 2 minutes outside the main entrance!'
        : 'Got it, looking out for you now!';
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'driver', text: replyText, time: 'Just now' }
      ]);
    }, 1200);
    setNewChatText('');
  };

  const handleTriggerSos = () => {
    if (!activeTrip) return;
    store.triggerSos({
      tripId: activeTrip.id,
      triggeredBy: 'rider',
      lat: pickup.lat,
      lng: pickup.lng,
      address: pickup.address
    });
    setSosSubmitted(true);
  };

  const handleCompleteRating = () => {
    const lastTrip = state.tripHistory[0];
    if (lastTrip) {
      store.rateTrip(lastTrip.id, ratingVal, ratingComment, 'rider');
    }
    setShowRatingModal(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Nearby online drivers (drivers can operate without permit restrictions)
  const nearbyDrivers = state.drivers
    .filter((d) => d.isOnline && !d.isBlockedDueToDebt)
    .map((d) => ({
      id: d.id,
      lat: d.currentLat,
      lng: d.currentLng,
      name: d.name,
      plate: d.vehicle.plateNumber,
      category: d.vehicle.category
    }));

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* City & Profile Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center font-bold text-xs">
            {rider.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900 font-bold text-xs">{rider.name}</h2>
              <span className="flex items-center gap-1 text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                ★ {rider.rating}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500">{rider.phone} • {rider.totalTrips} COMPLETED</p>
          </div>
        </div>

        {/* Right: City Selector & Logout */}
        <div className="flex items-center gap-2">
          {/* City Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-sky-800 shrink-0" />
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer pr-1"
            >
              {coverageCities.map((c) => (
                <option key={c.id} value={c.name} disabled={c.status === 'inactive'}>
                  {c.name} ({c.code || c.name.slice(0, 3).toUpperCase()}) {c.status === 'coming_soon' ? '• Pipeline' : ''}
                </option>
              ))}
            </select>
            <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
              LIVE
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => store.logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Log out of Rider Account"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>

      {/* Map Stage */}
      <div className="relative">
        <MapVisualizer
          pickup={activeTrip ? activeTrip.pickup : pickup}
          destination={activeTrip ? activeTrip.destination : destination}
          driverLocation={
            activeTrip && activeTrip.driverVehicle
              ? {
                  lat: pickup.lat + 0.005,
                  lng: pickup.lng - 0.004,
                  name: activeTrip.driverName || 'Driver',
                  plate: activeTrip.driverVehicle.plateNumber,
                  category: activeTrip.category
                }
              : null
          }
          nearbyDrivers={nearbyDrivers}
          progressPercent={activeTrip?.routeProgress || 0}
          height="h-64 sm:h-72"
          city={city}
        />

        {/* Live Trip SOS Float Button */}
        {activeTrip && activeTrip.status !== 'completed' && activeTrip.status !== 'cancelled' && (
          <button
            onClick={() => {
              setSosModalOpen(true);
              setSosSubmitted(false);
            }}
            className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded shadow-md flex items-center gap-1 border border-rose-400 animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 fill-white" />
            <span>SOS DISPATCH</span>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STATE 1: NO ACTIVE TRIP — REQUEST & NEGOTIATION FORM */}
      {/* ------------------------------------------------------------- */}
      {!activeTrip && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">RideZW Bilateral Negotiation Protocol</div>
              <h3 className="text-slate-900 font-bold text-sm">Propose Your Trip & Fair Fare</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Algorithm Baseline</span>
              <p className="text-sky-800 font-mono font-bold text-sm">{formatMoney(estimatedFareUSD)}</p>
            </div>
          </div>

          {/* GPS Auto-Detection & Location Guide Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-1.5 rounded-full ${isGpsActive ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                {isDetectingGps ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-800">
                    {isDetectingGps
                      ? 'Acquiring GPS Coordinates...'
                      : isGpsActive
                      ? 'GPS Auto-Detected Pickup'
                      : 'Pickup Location Ready'}
                  </span>
                  {isGpsActive && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      LIVE GPS
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  {gpsStatus || 'Type any landmark, shopping centre, growth point, or street below'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => autoDetectGpsLocation(false)}
              disabled={isDetectingGps}
              className="text-[11px] font-bold text-sky-800 hover:text-sky-950 bg-white hover:bg-sky-50 px-2.5 py-1 rounded border border-sky-200 shadow-2xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              {isDetectingGps ? (
                <Loader2 className="w-3 h-3 animate-spin text-sky-700" />
              ) : (
                <Navigation className="w-3 h-3 text-sky-700" />
              )}
              <span>{isDetectingGps ? 'Locating...' : 'Auto-Detect My GPS'}</span>
            </button>
          </div>

          {/* Pickup & Destination Mapbox Geocoding Search */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pickup Mapbox Search */}
              <MapboxLocationSearchInput
                id="pickup-mapbox-search"
                label="Pickup Location"
                type="pickup"
                city={city}
                value={pickup}
                onChange={(newLoc) => {
                  setPickup(newLoc);
                  setIsGpsActive(false);
                }}
                onUseGps={handleUseCurrentLocation}
                placeholder={`Type place, landmark, shop or street in ${city}...`}
              />

              {/* Destination Mapbox Search */}
              <MapboxLocationSearchInput
                id="dest-mapbox-search"
                label="Destination Point"
                type="destination"
                city={city}
                value={destination}
                onChange={(newLoc) => setDestination(newLoc)}
                onSwap={handleSwapLocations}
                placeholder={`Type destination, mall, complex or township in ${city}...`}
              />
            </div>

            {/* Quick Zimbabwe Township & Landmark Shortcuts */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Quick Landmarks & Growth Points:</span>
                <span className="text-[9px] text-slate-400">Tap to set as destination</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'KwaKamunhu (Mabvuku)', loc: { address: 'KwaKamunhu Shopping Centre', neighborhood: 'Mabvuku', city: 'Harare', lat: -17.8488, lng: 31.1872 } },
                  { name: 'Sam Levy’s Village', loc: { address: 'Sam Levy\'s Village, Borrowdale', neighborhood: 'Borrowdale', city: 'Harare', lat: -17.7554, lng: 31.0872 } },
                  { name: 'Machipisa (Highfield)', loc: { address: 'Machipisa Shopping Centre', neighborhood: 'Highfield', city: 'Harare', lat: -17.8872, lng: 31.0025 } },
                  { name: 'Joina City Mall', loc: { address: 'Joina City Mall, Jason Moyo Ave', neighborhood: 'Harare CBD', city: 'Harare', lat: -17.8308, lng: 31.0488 } },
                  { name: 'PaMereki (Warren Park)', loc: { address: 'Mereki Braai Centre', neighborhood: 'Warren Park D', city: 'Harare', lat: -17.8385, lng: 30.9782 } },
                  { name: 'Makoni (Chitungwiza)', loc: { address: 'Makoni Shopping Centre', neighborhood: 'Seke', city: 'Chitungwiza', lat: -18.0085, lng: 31.0821 } },
                  { name: 'Majuru (Goromonzi)', loc: { address: 'Majuru Growth Point & Shopping Centre', neighborhood: 'Goromonzi District', city: 'Goromonzi', lat: -17.8167, lng: 31.4167 } }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDestination(item.loc)}
                    className="text-[10px] font-medium bg-slate-100 hover:bg-sky-100 hover:text-sky-950 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors truncate"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mapbox Route Telemetry & Traffic Speed */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-sky-50/80 border border-sky-200 rounded-lg px-3 py-1.5 text-[10px] text-sky-950 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Mapbox Live Driving Engine: <strong>{distanceKm} km</strong> (~{estMinutes} mins drive)</span>
              </div>
              <span className="text-slate-500 font-sans text-[10px]">
                {pickup.neighborhood} → {destination.neighborhood}
              </span>
            </div>
          </div>

          {/* Vehicle Category Selector (Grid 4) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Select Vehicle Class</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'economy', label: 'Economy Sedan', icon: Car, desc: 'Fit / Vitz / Demio', min: 4.0 },
                { id: 'comfort', label: 'Comfort AC', icon: Sparkles, desc: 'Axio / Allion / Allex', min: 7.0 },
                { id: 'xl', label: 'XL Commuter', icon: Users, desc: 'Alphard / Wish (6-seater)', min: 10.0 },
                { id: 'motorbike', label: 'Motorbike Boda', icon: Bike, desc: 'Fast Courier & Solo', min: 2.5 }
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id as VehicleCategory);
                      setProposedFareUSD(cat.min);
                    }}
                    className={`p-2.5 rounded border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-800' : 'text-slate-500'}`} />
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-sky-800' : 'text-slate-600'}`}>
                        ${cat.min.toFixed(2)}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                      {cat.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{cat.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RideZW Proposed Fare Stepper & Rapid Chips */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Your Proposed Offer</span>
              <span className="text-[10px] font-mono text-slate-500">
                {distanceKm} km • ~{estMinutes} mins
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setProposedFareUSD((p) => Math.max(2.0, Number((p - 0.5).toFixed(2))))}
                className="w-9 h-9 rounded bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-100 flex items-center justify-center shadow-xs"
              >
                -
              </button>
              <div className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-center shadow-xs">
                <span className="text-lg font-mono font-extrabold text-slate-900">{formatMoney(proposedFareUSD)}</span>
                {currency === 'USD' && (
                  <span className="text-[10px] font-mono text-slate-400 block">
                    ~{Math.ceil(proposedFareUSD * state.settings.exchangeRateUSDToZWG)} ZiG (Rounded)
                  </span>
                )}
              </div>
              <button
                onClick={() => setProposedFareUSD((p) => Math.ceil(p + 1.0))}
                className="w-9 h-9 rounded bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-100 flex items-center justify-center shadow-xs"
              >
                +
              </button>
            </div>

            {/* Quick Pricing Chips - Always Rounded Up */}
            <div className="flex gap-1.5">
              {[Math.max(2, estimatedFareUSD - 1), estimatedFareUSD, estimatedFareUSD + 2, estimatedFareUSD + 4].map((price, idx) => (
                <button
                  key={idx}
                  onClick={() => setProposedFareUSD(Math.max(2, Math.ceil(price)))}
                  className={`flex-1 py-1 rounded border text-[11px] font-mono font-bold ${
                    proposedFareUSD === Math.ceil(price)
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ${Math.ceil(price).toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Payment Channel</label>
              <span className="text-[10px] text-slate-500 font-medium">All Mobile Money & Cards Supported</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {[
                { id: 'clicknpay', label: 'ClicknPay', desc: 'OpenAPI Gateway' },
                { id: 'ecocash', label: 'EcoCash', desc: 'USD / ZiG Wallet' },
                { id: 'onemoney', label: 'OneMoney', desc: 'NetOne Mobile' },
                { id: 'innbucks', label: 'InnBucks', desc: 'Simbisa Instant' },
                { id: 'telecash', label: 'Telecash', desc: 'Telecel Money' },
                { id: 'zipit_bank', label: 'ZIPIT / Bank', desc: 'Instant Interbank' },
                { id: 'cash', label: 'Cash USD/ZiG', desc: 'Direct to Driver' },
                { id: 'card', label: 'Card / POS', desc: 'Visa/Mastercard' }
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                  className={`p-2 rounded border text-left text-xs transition-all ${
                    paymentMethod === pm.id
                      ? 'bg-sky-50 border-sky-600 font-bold text-sky-950 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-[11px] truncate">{pm.label}</div>
                  <div className="text-[9px] text-slate-500 truncate">{pm.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Request Button */}
          <button
            onClick={handleRequestRide}
            className="w-full py-2.5 bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs rounded shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Broadcast Offer of {formatMoney(proposedFareUSD)} to Nearby Drivers</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STATE 2: ACTIVE NEGOTIATION — DRIVER BIDS & COUNTER OFFERS */}
      {/* ------------------------------------------------------------- */}
      {activeTrip && activeTrip.status === 'negotiating' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-slate-900 font-bold text-sm">Negotiating Live ({activeTrip.offers.length} Driver Bids)</h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Route: {activeTrip.pickup.neighborhood} → {activeTrip.destination.neighborhood} ({activeTrip.distanceKm} km)
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Your Offer</span>
              <p className="text-indigo-600 font-mono font-bold text-sm">{formatMoney(activeTrip.proposedFareUSD)}</p>
            </div>
          </div>

          {/* Incoming Driver Offers List */}
          <div className="space-y-2">
            {activeTrip.offers.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded border border-dashed border-slate-200">
                <Activity className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                <p className="font-bold text-slate-700">Broadcasting to licensed drivers in {city}...</p>
                <p className="text-[11px]">Switch to Driver Cockpit in the top menu to submit a test bid!</p>
              </div>
            ) : (
              activeTrip.offers.map((offer) => {
                const driver = state.drivers.find((d) => d.id === offer.driverId);
                return (
                  <div
                    key={offer.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 hover:border-indigo-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={offer.driverAvatar}
                        alt={offer.driverName}
                        className="w-10 h-10 rounded object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{offer.driverName}</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1 py-0.2 rounded">
                            ★ {offer.driverRating}
                          </span>
                          {driver?.governmentPermitStatus === 'valid' && (
                            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> GOV LICENSED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {offer.vehicleModel} • <strong className="font-mono text-slate-800">{offer.vehiclePlate}</strong> ({offer.etaMinutes}m away)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Driver Asks</span>
                        <span className="text-base font-mono font-bold text-slate-900">{formatMoney(offer.offeredAmount)}</span>
                      </div>

                      <button
                        onClick={() => store.riderAcceptOffer(offer.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <button
              onClick={() => store.cancelTrip('Rider cancelled request')}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Cancel Request
            </button>
            <span className="text-[10px] font-mono text-slate-400">DISPATCH ID: {activeTrip.id}</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STATE 3: TRIP DISPATCHED / IN PROGRESS */}
      {/* ------------------------------------------------------------- */}
      {activeTrip && activeTrip.status !== 'negotiating' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                STATUS: {activeTrip.status.replace('_', ' ').toUpperCase()}
              </span>
              <h3 className="text-slate-900 font-bold text-sm mt-1">
                {activeTrip.status === 'driver_arriving'
                  ? 'Driver is en route to pickup location'
                  : activeTrip.status === 'arrived'
                  ? 'Driver has arrived outside!'
                  : 'Trip in progress to destination'}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Agreed Fare</span>
              <p className="text-emerald-600 font-mono font-bold text-base">{formatMoney(activeTrip.agreedFareUSD)}</p>
            </div>
          </div>

          {/* Assigned Driver Details Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={activeTrip.driverAvatar}
                alt={activeTrip.driverName}
                className="w-11 h-11 rounded object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{activeTrip.driverName}</span>
                  <span className="text-[10px] font-mono bg-white text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded">
                    ★ {activeTrip.driverRating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {activeTrip.driverVehicle?.make} {activeTrip.driverVehicle?.model} •{' '}
                  <strong className="font-mono text-slate-900">{activeTrip.driverVehicle?.plateNumber}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChatModal(true)}
                className="p-2 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-700" />
                <span>Chat</span>
              </button>
              <a
                href={`tel:${activeTrip.driverPhone}`}
                className="p-2 rounded bg-sky-800 hover:bg-sky-900 text-white flex items-center gap-1.5 text-xs font-bold shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Verification Code Box (Boarding Security) */}
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-950 block">RideZW Boarding Pin</span>
              <span className="text-[11px] text-sky-800">Verify this with driver before boarding</span>
            </div>
            <span className="text-base font-mono font-extrabold text-slate-900 bg-amber-400 border border-amber-500 px-3 py-1 rounded shadow-xs">
              {activeTrip.id.slice(-4).toUpperCase()}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShareToast(true)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Live Trip Link</span>
            </button>

            {activeTrip.status === 'in_progress' && (
              <button
                onClick={() => {
                  store.completeTrip();
                  setShowRatingModal(true);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs"
              >
                Simulate Trip Completion
              </button>
            )}
          </div>
        </div>
      )}

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-3 rounded border border-slate-700 text-xs shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Live tracking URL copied to clipboard!</span>
          <button onClick={() => setShareToast(false)} className="ml-2 text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CHAT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-md shadow-xl flex flex-col h-[480px]">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-xs text-slate-900">Chat with {activeTrip?.driverName}</span>
              </div>
              <button onClick={() => setShowChatModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-slate-50 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded max-w-[80%] ${
                    msg.sender === 'rider'
                      ? 'ml-auto bg-sky-800 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[9px] block mt-1 ${msg.sender === 'rider' ? 'text-sky-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-1.5 bg-sky-800 text-white font-bold rounded text-xs hover:bg-sky-900"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SOS EMERGENCY MODAL */}
      {/* ------------------------------------------------------------- */}
      {sosModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-sm">24/7 SOS Emergency Assistance</h3>
                <p className="text-[11px] text-slate-500">Live GPS dispatch & ZRP Police coordination</p>
              </div>
            </div>

            {!sosSubmitted ? (
              <>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1 text-slate-700">
                  <p>
                    <strong>Coordinates:</strong> {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                  </p>
                  <p>
                    <strong>Vehicle:</strong> {activeTrip?.driverVehicle?.make} ({activeTrip?.driverVehicle?.plateNumber})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pressing the button below will immediately notify the RideZW 24/7 Security Desk and your emergency contacts.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSosModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTriggerSos}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow-xs"
                  >
                    Confirm SOS Alert
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-center py-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">Emergency Alert Broadcasted</h4>
                <p className="text-xs text-slate-600">
                  Response team notified. Stay on the line or move to a crowded area.
                </p>
                <button
                  onClick={() => setSosModalOpen(false)}
                  className="w-full py-1.5 bg-slate-800 text-white rounded text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RATING MODAL */}
      {/* ------------------------------------------------------------- */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-sm p-5 shadow-2xl space-y-4 text-center">
            <h3 className="text-slate-900 font-bold text-sm">Rate Your Ride</h3>
            <p className="text-xs text-slate-500">How was your trip with {activeTrip?.driverName}?</p>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingVal(star)}
                  className={`text-xl ${ratingVal >= star ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Leave a comment (optional)..."
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 h-16"
            />

            <button
              onClick={handleCompleteRating}
              className="w-full py-2 bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs rounded shadow-xs"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
