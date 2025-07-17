import React from 'react';
import { GooglePublisherTag } from 'react-gpt';

interface AdProviderProps {
  children: React.ReactNode;
  publisherId?: string;
}

const AdProvider: React.FC<AdProviderProps> = ({ 
  children, 
  publisherId = 'YOUR_PUBLISHER_ID' // Replace with your actual Google Ad Manager publisher ID
}) => {
  return (
    <GooglePublisherTag
      path={`/${publisherId}`}
      targeting={{
        game_type: 'cricket',
        content_category: 'sports'
      }}
    >
      {children}
    </GooglePublisherTag>
  );
};

export default AdProvider;