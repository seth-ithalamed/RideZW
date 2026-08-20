import React from 'react';
import {
  Car,
  Smartphone,
  ShieldCheck,
  Globe,
  DollarSign,
  User,
  LogIn,
  LogOut
} from 'lucide-react';
import { store } from '../../services/store';
import { Currency, Language, NavigationTab } from '../../types';
import { RideZWLogo } from './RideZWLogo';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  sosCount: number;
  onLogout?: () => void;
  onOpenAuth: (mode: 'signin' | 'signup', role: 'rider' | 'driver' | 'admin') => void;
  onOpenDownloadModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  language,
  setLanguage,
  sosCount,
  onLogout,
  onOpenAuth,
  onOpenDownloadModal
}) => {
  const state = store.getState();
  const authUser = state.authenticatedUser;
  const isHome = activeTab === 'landing' && !authUser;

  const handleLogout = () => {
    store.logout();
    if (onLogout) {
      onLogout();
    }
  };

  const getPortalInfo = () => {
    if (!authUser) {
      if (activeTab === 'rider') {
        return {
          title: 'Rider Portal',
          icon: Smartphone,
          user: state.rider.name,
          color: 'bg-sky-50 text-sky-900 border-sky-200'
        };
      }
      if (activeTab === 'driver') {
        const d = state.drivers.find((dr) => dr.id === state.activeDriverId) || state.drivers[0];
        return {
          title: 'Driver Cockpit',
          icon: Car,
          user: d.name,
          color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
        };
      }
      if (activeTab === 'admin') {
        const a = state.adminUsers.find((adm) => adm.isRootSuperAdmin) || state.adminUsers[0];
        return {
          title: 'Operations Suite',
          icon: ShieldCheck,
          user: `${a.name} (Root Super-Admin)`,
          color: 'bg-amber-50 text-amber-950 border-amber-200'
        };
      }
      return null;
    }

    if (authUser.role === 'admin') {
      return {
        title: 'Operations Suite',
        icon: ShieldCheck,
        user: `${authUser.name} (Root Super-Admin)`,
        color: 'bg-amber-50 text-amber-950 border-amber-200'
      };
    }
    if (authUser.role === 'driver') {
      return {
        title: 'Driver Cockpit',
        icon: Car,
        user: `${authUser.name}${authUser.details ? ` (${authUser.details})` : ''}`,
        color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
      };
    }
    if (authUser.role === 'rider') {
      return {
        title: 'Rider Portal',
        icon: Smartphone,
        user: authUser.name,
        color: 'bg-sky-50 text-sky-900 border-sky-200'
      };
    }
    return null;
  };

  const portalInfo = getPortalInfo();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between py-2.5 gap-3">
          {/* Left: Brand Logo & User Context Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isHome) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  handleLogout();
                }
              }}
              className="text-left focus:outline-none hover:opacity-95 transition-opacity"
              title="RideZW Home"
            >
              <RideZWLogo size="sm" showTagline={true} />
            </button>

            {/* In-Portal Context Badge (Only for current role) */}
            {portalInfo && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${portalInfo.color}`}>
                <portalInfo.icon className="w-3.5 h-3.5" />
                <span>{portalInfo.title}</span>
              </div>
            )}
          </div>

          {/* Center / Right: Controls & User Authentication State */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector (USD / ZiG) */}
            <div className="flex items-center bg-slate-100 border border-slate-200/80 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-sky-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="United States Dollar"
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('ZWG')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  currency === 'ZWG'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Zimbabwe Gold (ZiG)"
              >
                ZiG
              </button>
            </div>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200/80 rounded-lg p-0.5 text-[11px] font-mono font-medium">
              <Globe className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'text-sky-900 font-bold bg-white shadow-xs' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('sn')}
                className={`px-1.5 py-0.5 rounded ${language === 'sn' ? 'text-sky-900 font-bold bg-white shadow-xs' : 'text-slate-500'}`}
                title="ChiShona"
              >
                SN
              </button>
              <button
                onClick={() => setLanguage('nd')}
                className={`px-1.5 py-0.5 rounded ${language === 'nd' ? 'text-sky-900 font-bold bg-white shadow-xs' : 'text-slate-500'}`}
                title="isiNdebele"
              >
                ND
              </button>
            </div>

            {/* Navigation Actions based on Authentication */}
            {isHome ? (
              <div className="flex items-center gap-2">
                {onOpenDownloadModal && (
                  <button
                    onClick={onOpenDownloadModal}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs transition-colors cursor-pointer"
                    title="Install Mobile App on Android / iOS"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                    <span>Get App</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenAuth('signin', 'rider')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('signup', 'rider')}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-amber-400 font-bold text-xs shadow-xs transition-all"
                >
                  <span>Book a Ride</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {portalInfo && (
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold">{portalInfo.user}</span>
                  </div>
                )}

                {/* SINGLE EXPLICIT LOGOUT BUTTON */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  title="Log out and return to marketing website"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
