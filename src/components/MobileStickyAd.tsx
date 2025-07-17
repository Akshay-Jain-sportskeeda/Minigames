import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

declare global {
  interface Window {
    googletag: any;
  }
}

const MobileStickyAd: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Display the ad when component mounts
    if (window.googletag && window.googletag.cmd) {
      window.googletag.cmd.push(() => {
        window.googletag.display('div-gpt-ad-1752568566934-0');
        setIsLoaded(true);
      });
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 shadow-lg">
      <div className="relative flex justify-center items-center p-2">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
          aria-label="Close ad"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        
        {/* Ad container */}
        <div 
          id="div-gpt-ad-1752568566934-0" 
          style={{ minWidth: '300px', minHeight: '250px' }}
          className="flex items-center justify-center"
        >
          {!isLoaded && (
            <div className="text-gray-500 text-sm">Loading advertisement...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileStickyAd;