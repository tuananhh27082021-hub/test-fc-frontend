'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  const ua = navigator.userAgent;

  return (
    /iPad|iPhone|iPod/.test(ua)
    || (/Mac OS/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt]
    = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Detect iOS
    setIsIOSDevice(isIOS());

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS doesn't support beforeinstallprompt, show prompt for iOS
    if (isIOS()) {
      setShowPrompt(true);
      return;
    }

    // Listen for beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ PWA installed');
        setShowPrompt(false);
      } else {
        console.log('❌ PWA installation dismissed');
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  // iOS installation instructions
  if (isIOSDevice) {
    return (
      <div className="fixed inset-x-4 bottom-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="rounded-3xl border border-border bg-white shadow-light">
          <div className="relative p-4 md:p-6">
            <button
              type="button"
              onClick={() => setShowPrompt(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-foreground-50 transition-colors hover:bg-gray-100 hover:text-foreground md:right-6 md:top-6"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-3 text-center">
              <h3 className="text-base font-bold text-foreground md:text-lg">
                Install App
              </h3>
              <p className="text-sm text-foreground-50">
                Add the app to your home screen for quick access
              </p>

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-foreground-50">Tap</span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  className="size-7 text-secondary"
                >
                  <path
                    fill="currentColor"
                    d="M50.21 19.87H40.8a1.641 1.641 0 0 0 0 3.28h9.41c.75 0 1.36.61 1.36 1.36v31.24c0 .75-.61 1.36-1.36 1.36H13.79c-.75 0-1.36-.61-1.36-1.36V24.5c0-.75.61-1.36 1.36-1.36h9.41a1.641 1.641 0 0 0 0-3.28h-9.41c-2.56 0-4.64 2.08-4.64 4.64v31.24c0 2.56 2.08 4.64 4.64 4.64h36.42c2.56 0 4.64-2.08 4.64-4.64V24.5a4.648 4.648 0 0 0-4.64-4.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M22.8 15.2c.42 0 .84-.16 1.16-.48l6.4-6.41v31.63a1.641 1.641 0 0 0 3.28 0V8.32l6.4 6.41c.32.32.74.48 1.16.48a1.635 1.635 0 0 0 1.16-2.79l-9.19-9.19c-.33-.33-.75-.49-1.17-.49-.42 0-.84.16-1.17.48l-9.19 9.19a1.63 1.63 0 0 0 0 2.31c.33.32.74.48 1.16.48z"
                  />
                </svg>

                <span className="text-sm text-foreground-50">
                  then
                  {' '}
                  <strong>&quot;Add to Home Screen&quot;</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android installation prompt
  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="rounded-3xl border border-border bg-white shadow-light">
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="flex-1">
            <h3 className="mb-2 text-base font-bold text-foreground md:text-lg">
              Install App
            </h3>
            <p className="text-sm text-foreground-50">
              Add the app to your home screen for quick access
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1 text-foreground-50 transition-colors hover:bg-gray-100 hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-3">
          <Button
            onClick={handleInstall}
            variant="default"
            size="sm"
            className="flex-1"
            noShadow
          >
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="flex-1"
            noShadow
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
