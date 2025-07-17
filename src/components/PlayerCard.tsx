import React from 'react';
import { Player } from '../types/game';
import { Flag } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  statLabel: string;
  currentQuestion: number;
  totalQuestions: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, statLabel, currentQuestion, totalQuestions }) => {
  const isFirstQuestion = currentQuestion === 1;

  return (
    <div className="relative">
      {/* Question Counter - Top Right */}
      <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/20">
        {currentQuestion}/{totalQuestions}
      </div>

      <div className="relative h-42 bg-gradient-to-br from-emerald-600 to-green-700">
        <img
          src={player.image}
          alt={player.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-3 text-white">
          <h2 className="text-lg font-bold mb-1">{player.name}</h2>
          <div className="flex items-center gap-2 text-sm">
            <Flag className="w-3 h-3" />
            <span className="opacity-90">{player.country}</span>
            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs">
              {player.role}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-3 text-center bg-gray-700 border-t border-gray-600">
        <h3 className="text-base font-semibold text-gray-100">
          {statLabel}
        </h3>
      </div>
      
      {/* Instructions for first question only - placed below stat label */}
      {isFirstQuestion && (
        <div className="px-3 pb-2 bg-gray-700 text-left">
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Enter your guess for the above stats</div>
            <div>• Get points on how close you are to the actual answer</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;