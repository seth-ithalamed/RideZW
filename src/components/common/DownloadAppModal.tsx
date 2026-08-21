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
  Check,
  Car,
  Radio,
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
  const [activeViewMode, setActiveViewMode] = useState<'install' | 'qrcode'>('install');

  useEffect(() => {
    setActiveTab(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    setIsInstallable(isPWAInstallable());
    setPermissionStatus(getNotificationPermissionStatus());
  }, [isOpen]);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ridezw.co.zw';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

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

  // Instant 1-Tap Web App Install (PWA / Standalone Mobile Wrapper)
  const handleInstantInstall = async () => {
    if (isInstallable) {
      const installed = await promptPWAInstall();
      if (installed) {
        onClose();
        return;
      }
    }
    
    // In iframe or when browser requires top-level window context for PWA prompt
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-sky-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <RideZWLogo size="sm" light />
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-slate-950 inline" />
              Instant Mobile Web App (Zero Store Download)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Install RideZW Directly to Your Home Screen
          </h2>
          <p className="text-xs text-sky-200 mt-1 leading-relaxed">
            RideZW is a lightweight, full-powered Progressive Mobile App that installs instantly onto your device without needing the Google Play Store or Apple App Store.
          </p>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-sky-900/80 rounded-xl border border-sky-800">
            <button
              onClick={() => setActiveTab('rider')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs text-slate-700">
          
          {/* Navigation View Switcher (1-Tap Install vs QR Code) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveViewMode('install')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeViewMode === 'install'
                    ? 'bg-sky-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1-Tap Instant Install
              </button>
              <button
                onClick={() => setActiveViewMode('qrcode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeViewMode === 'qrcode'
                    ? 'bg-sky-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan Phone QR Code</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              PWA Standalone • &lt; 2 MB
            </span>
          </div>

          {activeViewMode === 'install' ? (
            <>
              {/* Primary Instant Install Action Box */}
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-50 border border-amber-300/90 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded">
                      NO APP STORE REQUIRED • INSTANT ACCESS
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {activeTab === 'rider' ? 'RideZW Passenger Mobile App' : 'RideZW Driver Cockpit & Dispatch Terminal'}
                    </h3>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Wraps directly as a native standalone mobile app on your phone with full background notifications, real-time GPS tracking, and offline data cache.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-400 rounded-xl text-slate-950 shrink-0 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                </div>

                <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleInstantInstall}
                    className="px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1-Tap Install (Web App)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </button>

                  <a
                    href={`/api/download/apk?role=${activeTab}`}
                    download={activeTab === 'driver' ? 'RideZW_Driver_v2.4.0.apk' : 'RideZW_Rider_v2.4.0.apk'}
                    className="px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <Download className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Download Android APK</span>
                  </a>
                </div>

                {isInIframe && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-sky-900">
                    <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Why 1-Tap Opens in New Tab:</strong> Browser security restrictions in iframes (preview sandboxes) block automatic home-screen installation dialogs. Clicking <strong>1-Tap Install</strong> opens the app in a standalone tab where your browser (Chrome / Safari / Edge) can immediately trigger <em>"Add to Home Screen / Install"</em>.
                    </span>
                  </div>
                )}
              </div>

              {/* Background Alerts & Audio Test Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Background Push Notifications & Chime</h4>
                      <p className="text-[10px] text-slate-500">Alerts deliver when the screen is locked or app is minimized</p>
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
                    {permissionStatus === 'granted' ? 'Notifications Active' : 'Permission Required'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {permissionStatus !== 'granted' && (
                    <button
                      onClick={handleRequestNotifications}
                      className="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-300" />
                      <span>Grant Background Notification Permission</span>
                    </button>
                  )}

                  <button
                    onClick={handleTestAudio}
                    className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-sky-700" />
                    <span>{testedSound ? 'Playing Alert Sound... 🔊' : 'Test Background Audio Chime'}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Installation Guides */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-[10px] text-slate-500">
                  How 1-Tap Installation Works (Android & iOS)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Android Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">Android (Chrome / Samsung Internet)</h5>
                        <span className="text-[10px] text-slate-500">Samsung, Xiaomi, Huawei, Tecno</span>
                      </div>
                    </div>
                    <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                      <li>Tap <strong>"Install App on Device"</strong> above</li>
                      <li>Chrome will show <strong>"Add RideZW to Home screen"</strong></li>
                      <li>Tap <strong>"Install"</strong> — an icon will appear on your home screen</li>
                      <li>Opens full-screen like a native app with push notifications</li>
                    </ol>
                  </div>

                  {/* iOS iPhone Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🍏</span>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">Apple iPhone (iOS Safari)</h5>
                        <span className="text-[10px] text-slate-500">iOS 16.4+ Supports Web Push</span>
                      </div>
                    </div>
                    <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                      <li>Open the app in <strong>Safari</strong> on your iPhone</li>
                      <li>Tap the <strong>Share button (⎋)</strong> at the bottom of the screen</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                      <li>Launch from your Home Screen for full background alerts</li>
                    </ol>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* QR Code Scan View */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-sm text-slate-900">Scan QR Code with Phone Camera</h4>
                <p className="text-[11px] text-slate-600">
                  Point your smartphone camera at this QR code to open RideZW on your phone and install it directly to your home screen.
                </p>
              </div>

              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-sm">
                <QRCodeSVG value={appUrl} size={180} level="M" includeMargin={false} />
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Mobile Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Advantages of Progressive Web App Wrapper */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant updates without manual app store downloads</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                Zero Storage Bloat (&lt; 2MB)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                Works on 2G/3G/4G Networks
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            RideZW Progressive Web App Architecture
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
