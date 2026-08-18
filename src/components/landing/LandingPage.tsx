import React, { useState } from 'react';
import {
  Car,
  Smartphone,
  ShieldCheck,
  DollarSign,
  MapPin,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Clock,
  Sparkles,
  Wallet,
  Shield,
  CreditCard,
  TrendingUp,
  Users,
  Navigation,
  HelpCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import { Currency, Language, VehicleCategory } from '../../types';
import { RideZWLogo } from '../common/RideZWLogo';

interface LandingPageProps {
  currency: Currency;
  language: Language;
  onOpenAuth: (mode: 'signin' | 'signup', role: 'rider' | 'driver' | 'admin') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currency,
  language,
  onOpenAuth
}) => {
  const [estimatePickup, setEstimatePickup] = useState('Harare CBD (First St & Nelson Mandela)');
  const [estimateDropoff, setEstimateDropoff] = useState('Borrowdale Village (Sam Levy)');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('comfort');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const basePrices: Record<VehicleCategory, number> = {
    economy: 6.5,
    comfort: 9.0,
    xl: 14.0,
    motorbike: 4.5
  };

  const getEstimatedFareUSD = () => {
    return basePrices[selectedCategory] || 8.0;
  };

  const formatPrice = (usd: number) => {
    if (currency === 'ZWG') {
      return `ZWG ${(usd * 26.85).toFixed(2)}`;
    }
    return `$${usd.toFixed(2)}`;
  };

  const faqs = [
    {
      q: 'How does bilateral fare bidding work on RideZW?',
      a: 'When requesting a ride, you propose the fare you are comfortable paying. Nearby verified drivers will either accept your offer immediately or propose a transparent counter-bid. You choose the driver, vehicle, and price that best matches your preference.'
    },
    {
      q: 'What payment methods are supported across Zimbabwe?',
      a: 'RideZW natively supports all major Zimbabwean payment channels: EcoCash (USD & ZiG), NetOne OneMoney, Simbisa InnBucks USD, Telecash, ZIPIT / Instant Bank Transfer, USD Cash, and POS / Debit Cards.'
    },
    {
      q: 'Which cities and regions does RideZW cover?',
      a: 'RideZW operates across Zimbabwe including Harare, Bulawayo, Victoria Falls, Mutare, Gweru, Masvingo, Chinhoyi, Kwekwe, Marondera, and intercity transit corridors configured dynamically via our dispatch operations.'
    },
    {
      q: 'How are driver partners vetted for passenger safety?',
      a: 'Every driver must pass a background check, maintain a valid driver’s license with defensive driving certification, pass a police clearance certificate, and operate a vehicle with an active VID Certificate of Fitness and public passenger insurance.'
    },
    {
      q: 'How do driver payouts work?',
      a: 'Driver partners keep 88% of every fare (industry-low 12% platform fee) and can withdraw their earnings instantly to EcoCash, OneMoney, InnBucks, Telecash, or their bank accounts 24/7 with zero delay.'
    }
  ];

  return (
    <div className="space-y-12 pb-8">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a2540] via-[#0d3a54] to-[#071c2e] text-white p-6 sm:p-10 md:p-14 shadow-xl border border-sky-800/40">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Value Proposition, Action CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NATIONWIDE E-HAILING NETWORK • ALL ZIMBABWEAN CITIES</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
              Fair Fares. Bilateral Bidding. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                Your Ride, Nationwide.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Experience the smarter way to commute across Harare, Bulawayo, Victoria Falls, Mutare, Gweru, Masvingo, and nationwide. Set your own price, negotiate directly with verified drivers, and pay with <strong>USD Cash</strong>, <strong>EcoCash</strong>, <strong>OneMoney</strong>, <strong>InnBucks</strong>, <strong>Telecash</strong>, or <strong>ZIPIT</strong>.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenAuth('signup', 'rider')}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Smartphone className="w-4 h-4" />
                <span>Book a Ride Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('signup', 'driver')}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-sky-900/80 hover:bg-sky-800 text-white border border-sky-700/60 font-bold text-sm transition-all"
              >
                <Car className="w-4 h-4 text-amber-400" />
                <span>Drive & Earn Daily</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 border-t border-sky-800/60 grid grid-cols-3 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-amber-300 font-bold block">Commission</span>
                <span className="font-extrabold text-white text-sm">Low 12%</span>
                <span className="text-[10px] text-slate-400 block">Drivers keep 88%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-sky-300 font-bold block">Settlement</span>
                <span className="font-extrabold text-white text-sm">EcoCash Instant</span>
                <span className="text-[10px] text-slate-400 block">USD & ZiG Ready</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-emerald-300 font-bold block">Safety</span>
                <span className="font-extrabold text-white text-sm">ZRP Linked SOS</span>
                <span className="text-[10px] text-slate-400 block">VID Certified Fleet</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Fare Estimation & Booking Card */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-950 text-amber-400 flex items-center justify-center font-bold">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Instant Fare Calculator</h3>
                    <p className="text-[11px] text-slate-500">Live bilateral estimates for Zimbabwe</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ACTIVE
                </span>
              </div>

              {/* Pickup & Destination Inputs */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Pickup Location</span>
                  </label>
                  <select
                    value={estimatePickup}
                    onChange={(e) => setEstimatePickup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option>Harare CBD (First St & Nelson Mandela)</option>
                    <option>Avondale Shopping Centre</option>
                    <option>Borrowdale Village (Sam Levy)</option>
                    <option>Belgrave / Belgravia Offices</option>
                    <option>Robert Gabriel Mugabe Int. Airport</option>
                    <option>Bulawayo CBD (Jason Moyo St)</option>
                    <option>Bulawayo Hillside Shopping Centre</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Destination</span>
                  </label>
                  <select
                    value={estimateDropoff}
                    onChange={(e) => setEstimateDropoff(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option>Borrowdale Village (Sam Levy)</option>
                    <option>Harare CBD (First St & Nelson Mandela)</option>
                    <option>Robert Gabriel Mugabe Int. Airport</option>
                    <option>Westgate Shopping Complex</option>
                    <option>Chitungwiza Town Centre</option>
                    <option>Bulawayo JMN Nkomo Airport</option>
                    <option>Bulawayo Ascot Shopping Complex</option>
                  </select>
                </div>

                {/* Vehicle Class Selector */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Vehicle Category</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'economy', label: 'Economy', sub: 'Passo/Fit', icon: '🚗' },
                      { id: 'comfort', label: 'Comfort', sub: 'Axio/Premio', icon: '🚙' },
                      { id: 'xl', label: 'XL 6-Seater', sub: 'Wish/Noah', icon: '🚐' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id as VehicleCategory)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-sky-50 border-sky-600 text-sky-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base block mb-0.5">{cat.icon}</span>
                        <span className="font-bold text-[11px] block leading-tight">{cat.label}</span>
                        <span className="text-[9px] text-slate-500 font-mono block">{cat.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimated Price Box */}
              <div className="bg-slate-950 text-white rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block">
                    Suggested Bid Estimate
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-white">{formatPrice(getEstimatedFareUSD())}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Approx. 9.4 km • 18 min)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block font-mono">Multi-Currency</span>
                  <span className="text-[10px] text-amber-300 font-bold">EcoCash / Cash / ZiG</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onOpenAuth('signin', 'rider')}
                className="w-full py-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-amber-400 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Request Ride with this Bid</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HOW IT WORKS (RIDERS & DRIVERS) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-1 rounded-full">
            Transparent Transport Network
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How Bilateral Bidding Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A free-market matching mechanism where riders and drivers agree on mutually beneficial fares.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Set Your Route & Suggested Fare</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your pickup and destination in Harare or Bulawayo. Propose a price you feel is fair for the trip.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>No arbitrary algorithm surge multiples</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>See benchmark pricing instantly</span>
              </li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Review Live Offers from Drivers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nearby drivers accept your bid or send counter-offers. Compare driver ratings, vehicle models, and ETA.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Choose your preferred driver and car</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Transparent driver profile and ratings</span>
              </li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Travel Safely & Pay Flexibly</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enjoy GPS-tracked travel with integrated 24/7 ZRP emergency monitoring. Pay easily with USD Cash, EcoCash, or ZiG.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Live trip sharing with family</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant digital receipts</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. METROPOLITAN HUBS & NATIONWIDE COVERAGE */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Operating Across All Zimbabwean Cities & Hubs</h3>
            <p className="text-xs text-slate-500">Live GPS tracking and vetted driver fleets across all national transit corridors</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-900 font-mono font-bold text-[11px]">
              HARARE
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[11px]">
              BULAWAYO
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[11px]">
              VICTORIA FALLS
            </span>
            <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-900 font-mono font-bold text-[11px]">
              MUTARE
            </span>
            <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 font-mono font-bold text-[11px]">
              GWERU & NATIONWIDE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏛️</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Greater Harare & Chitungwiza</h4>
                  <span className="text-[10px] font-mono text-slate-500">Zone 1 • Active</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                140+ Drivers
              </span>
            </div>
            <p className="text-xs text-slate-600">
              CBD, Borrowdale, Avondale, Westgate, Belgravia, Newlands, RGM International Airport, and Chitungwiza.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌳</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Bulawayo (City of Kings)</h4>
                  <span className="text-[10px] font-mono text-slate-500">Zone 2 • Active</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                85+ Drivers
              </span>
            </div>
            <p className="text-xs text-slate-600">
              CBD, Hillside, Suburbs, Belmont Industrial, Ascot, Kumalo, and JMN International Airport.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌊</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Victoria Falls & Tourism Hub</h4>
                  <span className="text-[10px] font-mono text-slate-500">Zone 3 • Active</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                40+ Drivers
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Rainforest Gate, Kingdom, Elephant Hills, Airport Road, and Zambezi River Front.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⛰️</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Mutare & Eastern Highlands</h4>
                  <span className="text-[10px] font-mono text-slate-500">Zone 4 • Active</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                30+ Drivers
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Mutare CBD, Main Street, Chikanga, Dangamvura, Christmas Pass, and Forbes Border.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏭</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Midlands (Gweru & Kwekwe)</h4>
                  <span className="text-[10px] font-mono text-slate-500">Zone 5 • Active</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                45+ Drivers
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Gweru CBD, Midlands State University (MSU), Mkoba, Kwekwe CBD, and Mbizo.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏰</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Masvingo & Provincial Hubs</h4>
                  <span className="text-[10px] font-mono text-slate-500">Zone 6 • Active</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                25+ Drivers
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Masvingo CBD, Great Zimbabwe monument route, Chinhoyi Caves route, and Marondera.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DRIVER PARTNER PROGRAM */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-2.5 py-0.5 rounded bg-slate-950 text-amber-400 text-[10px] font-mono font-bold">
              DRIVER PARTNERSHIP PROGRAM
            </span>
            <h3 className="text-2xl font-black tracking-tight text-slate-950">
              Turn Your Vehicle Into A High-Earning Daily Business
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
              Join hundreds of Zimbabwean car owners making sustainable incomes. Enjoy 88% payout share, choose the trips you want, and withdraw your money to EcoCash any time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAuth('signup', 'driver')}
              className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>Apply to Drive Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500">Everything you need to know about riding and driving with RideZW</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs font-bold text-slate-800 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-sky-800' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
