import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface PreviousGamesCTAProps {
  onOpenModal: () => void;
}

const PreviousGamesCTA: React.FC<PreviousGamesCTAProps> = ({ onOpenModal }) => {
  return (
    <button
      onClick={onOpenModal}
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl p-4 border border-purple-500/30 shadow-lg font-medium hover:from-purple-700 hover:to-indigo-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
    >
      <Calendar className="w-4 h-4" />
      Try Another Game
    </button>
  );
};

export default PreviousGamesCTA;