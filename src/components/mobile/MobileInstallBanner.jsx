import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';

export const MobileInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed app)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isInStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check if previously dismissed in this session
    if (sessionStorage.getItem('uber_mobile_prompt_dismissed')) {
      setDismissed(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Android / Chrome PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('uber_mobile_prompt_dismissed', 'true');
  };

  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-neutral-950 text-white p-3.5 rounded-2xl border border-neutral-800 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-xl shadow shrink-0">
            U
          </div>
          <div className="leading-tight">
            <h4 className="text-xs font-bold text-white flex items-center space-x-1">
              <span>Install Uber App</span>
            </h4>
            <p className="text-[10px] text-neutral-400">
              {isIOS ? 'Tap Share and "Add to Home Screen"' : 'Fast, native mobile experience'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl flex items-center space-x-1 transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          ) : isIOS ? (
            <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] rounded-lg font-bold flex items-center space-x-1">
              <Share className="w-3 h-3 text-uber-blue" />
              <span>Add to Home</span>
            </span>
          ) : null}

          <button
            onClick={handleDismiss}
            className="p-1 text-neutral-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
