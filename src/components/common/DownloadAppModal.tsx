import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Bell,
  CheckCircle2,
  Share2,
  QrCode,
  ShieldCheck,
  Zap,
  Volume2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { RideZWLogo } from './RideZWLogo';
import {
  promptPWAInstall,
  isPWAInstallable,
  requestBrowserNotificationPermission,
  getNotificationPermissionStatus,
  triggerLocalNotification,
  playNotificationSound
} from '../../services/notificationService';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'rider' | 'driver';
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'rider'
}) => {
  const [activeTab, setActiveTab] = useState<'rider' | 'driver'>(defaultRole);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(getNotificationPermissionStatus());
  const [copied, setCopied] = useState(false);
  const [testedSound, setTestedSound] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    setActiveTab(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    setIsInstallable(isPWAInstallable());
    setPermissionStatus(getNotificationPermissionStatus());
  }, [isOpen]);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ridezw.co.zw';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestNotifications = async () => {
    const status = await requestBrowserNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      triggerLocalNotification(
        'RideZW Notifications Enabled! 🚗🔔',
        'You will now receive background ride alerts, driver counter-offers, and live trip status updates.'
      );
    }
  };

  const handleTestAudio = () => {
    playNotificationSound();
    setTestedSound(true);
    setTimeout(() => setTestedSound(false), 2500);
  };

  const handlePWAInstall = async () => {
    const installed = await promptPWAInstall();
    if (installed) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-sky-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <RideZWLogo size="sm" light />
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase">
              Mobile App Hub
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            Install RideZW Mobile & Enable Background Alerts
          </h2>
          <p className="text-xs text-sky-200 mt-1 leading-relaxed">
            Get instant background notifications for trips, fare bids, driver arrival, and real-time GPS tracking.
          </p>

          {/* App Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-sky-900/80 rounded-xl border border-sky-800">
            <button
              onClick={() => setActiveTab('rider')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'rider'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Rider Passenger App</span>
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'driver'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Driver Partner App</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
          {/* 1. Direct 1-Click PWA Installation */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider bg-amber-200/60 px-2 py-0.5 rounded">
                  Recommended • Instant Install
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {activeTab === 'rider' ? 'RideZW Passenger PWA' : 'RideZW Driver Terminal PWA'}
                </h3>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  No 100MB download needed. Adds directly to your home screen, loads instantly even on 2G/3G Econet/NetOne, and runs with zero storage bloat.
                </p>
              </div>
              <div className="p-3 bg-amber-400 rounded-xl text-slate-950 shrink-0 shadow-xs">
                <Download className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handlePWAInstall}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs shadow-sm flex items-center gap-2 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>1-Click Install to Phone</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Mobile Web Link'}</span>
              </button>
            </div>
          </div>

          {/* 2. Background Functionality & Notification Setup */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Background Push Notifications & Sound</h4>
                  <p className="text-[10px] text-slate-500">Stay notified even when the app is minimized</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  permissionStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : permissionStatus === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {permissionStatus === 'granted'
                  ? 'Active & Enabled'
                  : permissionStatus === 'denied'
                  ? 'Permission Blocked'
                  : 'Pending Setup'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {activeTab === 'driver' ? 'New Trip Audio Chimes' : 'Driver Bid Alerts'}
                </span>
                <p className="text-slate-500 text-[10.5px]">
                  {activeTab === 'driver'
                    ? 'Audio chimes play when a new passenger ride request is broadcast near your GPS location.'
                    : 'Get pinged instantly when nearby drivers accept your price or send counter-offers.'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Background GPS Sync
                </span>
                <p className="text-slate-500 text-[10.5px]">
                  Drivers can navigate using Google Maps or Waze while RideZW operates in background mode.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {permissionStatus !== 'granted' && (
                <button
                  onClick={handleRequestNotifications}
                  className="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-300" />
                  <span>Grant Notification Permission</span>
                </button>
              )}

              <button
                onClick={handleTestAudio}
                className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-700" />
                <span>{testedSound ? 'Playing Alert Sound... 🔊' : 'Test Background Chime'}</span>
              </button>
            </div>
          </div>

          {/* 3. Platform Specific Installation Guide */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-[10px] text-slate-500">
              How to Install on Your Device
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Android Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🤖</span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Android (Chrome / Brave)</h5>
                    <span className="text-[10px] text-slate-500">Samsung, Xiaomi, Huawei, Tecno</span>
                  </div>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                  <li>Open <strong>{appUrl.replace('https://', '')}</strong> in Chrome</li>
                  <li>Tap the <strong>three dots (⋮)</strong> menu in the top right</li>
                  <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                  <li>Allow notifications when prompted</li>
                </ol>
              </div>

              {/* iOS iPhone Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍏</span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Apple iPhone (iOS Safari)</h5>
                    <span className="text-[10px] text-slate-500">iOS 16.4+ Supports Web Push</span>
                  </div>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                  <li>Open <strong>{appUrl.replace('https://', '')}</strong> in <strong>Safari</strong></li>
                  <li>Tap the <strong>Share icon (⎋)</strong> at the bottom bar</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Launch from Home Screen to receive Push notifications</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 4. Native App Packages & Store Badges */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed & Verified for Zimbabwe Transport Operations</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                APK v2.4.0 Live
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                PWA Standalone Ready
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            RideZW Universal PWA • Instant Offline Sync
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
