import React, { useEffect, useState, useRef } from 'react';

declare global {
  interface Window { googletag: any; }
}

const REFRESH_INTERVAL = 30000; // 30 seconds

interface DesktopAdProps {
  adId: string;
  className?: string;
}

const DesktopAd: React.FC<DesktopAdProps> = ({ adId, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const slotRef = useRef<any>(null);
  const timerRef = useRef<number>();

  useEffect(() => {
    const gpt = window.googletag;
    if (!gpt?.cmd) return;

    gpt.cmd.push(() => {
      // Find the slot by element ID
      slotRef.current = gpt.pubads().getSlots().find(
        slot => slot.getSlotElementId() === adId
      );

      if (!slotRef.current) return;

      // Listen for viewability
      gpt.pubads().addEventListener('impressionViewable', event => {
        if (event.slot === slotRef.current) {
          // Schedule a refresh after the interval
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            gpt.cmd.push(() => {
              gpt.pubads().refresh([slotRef.current], { changeCorrelator: false });
            });
          }, REFRESH_INTERVAL);
        }
      });

      // Initial load when component mounts
      gpt.display(adId);
      setIsLoaded(true);
      // And fetch immediately via refresh
      gpt.pubads().refresh([slotRef.current], { changeCorrelator: false });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [adId]);

  return (
    <div className={`flex justify-center items-center bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 ${className}`}>
      <div
        id={adId}
        style={
    adId === 'div-gpt-ad-LeaderC'
      ? { minWidth: '970px', minHeight: '90px' }
      : { minWidth: '300px', minHeight: '250px' }
  }
        className="flex items-center justify-center"
      >
        {!isLoaded && <div className="text-gray-500 text-sm">Loading advertisement...</div>}
      </div>
    </div>
  );
};

export default DesktopAd;