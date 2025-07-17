import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface PreviousGamesCTAProps {
  onOpenModal: () => void;
}

const PreviousGamesCTA: React.FC<PreviousGamesCTAProps> = ({ onOpenModal }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl p-4 border border-purple-500/30 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Try Another Game</h3>
          </div>
        </div>
        
        <button
          onClick={onOpenModal}
          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all transform hover:scale-105 flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <Calendar className="w-4 h-4" />
          Play Now
        </button>
      </div>
    </div>
  );
};

export default PreviousGamesCTA;