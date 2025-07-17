import React from 'react';
import { GooglePublisherTag, Adsense } from 'react-gpt';

interface AdBannerProps {
  adUnitPath: string;
  size: [number, number] | [number, number][];
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ adUnitPath, size, className = '' }) => {
  return (
    <div className={`ad-container ${className}`}>
      <GooglePublisherTag>
        <Adsense
          path={adUnitPath}
          size={size}
          format="auto"
          responsive={true}
        />
      </GooglePublisherTag>
    </div>
  );
};

export default AdBanner;