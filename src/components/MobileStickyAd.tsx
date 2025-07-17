import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

declare global {
  interface Window { googletag: any; }
}

const REFRESH_INTERVAL = 30000; // 30 seconds

const MobileStickyAd: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const slotRef = useRef<any>(null);
  const timerRef = useRef<number>();

  useEffect(() => {
    const gpt = window.googletag;
    if (!gpt?.cmd) return;

    gpt.cmd.push(() => {
      // define slot only once
      slotRef.current = gpt
        .defineSlot('/11446729/Chimerical-crostata_Mob_01', [300, 250], 'div-gpt-ad-1752568566934-0')
        .addService(gpt.pubads());
      gpt.pubads().enableSingleRequest();
      gpt.pubads().disableInitialLoad();

      // listen for viewability
      gpt.pubads().addEventListener('impressionViewable', event => {
        if (event.slot === slotRef.current) {
          // schedule a refresh after the interval
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            gpt.cmd.push(() => {
              gpt.pubads().refresh([slotRef.current], { changeCorrelator: false });
            });
          }, REFRESH_INTERVAL);
        }
      });

      gpt.enableServices();
      // initial load when component mounts
      gpt.display('div-gpt-ad-1752568566934-0');
      setIsLoaded(true);
      // and fetch immediately via refresh
      gpt.pubads().refresh([slotRef.current], { changeCorrelator: false });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClose = () => setIsVisible(false);
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 shadow-lg">
      <div className="relative flex justify-center items-center p-2">
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
          aria-label="Close ad"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        <div
          id="div-gpt-ad-1752568566934-0"
          style={{ minWidth: '300px', minHeight: '250px' }}
          className="flex items-center justify-center"
        >
          {!isLoaded && <div className="text-gray-500 text-sm">Loading advertisement...</div>}
        </div>
      </div>
    </div>
  );
};

export default MobileStickyAd;