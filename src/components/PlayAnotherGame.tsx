import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Play, Loader2 } from 'lucide-react';
import { getAvailableGameDates, checkDataAvailability, navigateToDateGame, GameDate } from '../utils/dateUtils';

interface PlayAnotherGameProps {
  currentGameType: 'cricket' | 'tv-soap';
}

const PlayAnotherGame: React.FC<PlayAnotherGameProps> = ({ currentGameType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableDates, setAvailableDates] = useState<GameDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingDate, setCheckingDate] = useState<string | null>(null);

  const loadAvailableDates = async () => {
    if (availableDates.length > 0) return; // Already loaded
    
    setLoading(true);
    try {
      const dates = getAvailableGameDates();
      
      // Check data availability for each date
      const datesWithAvailability = await Promise.all(
        dates.map(async (date) => {
          const hasData = await checkDataAvailability(date.date);
          return { ...date, hasData };
        })
      );
      
      // Filter to only show dates with available data (excluding today)
      const availableDatesOnly = datesWithAvailability.filter(date => date.hasData && !date.isToday);
      setAvailableDates(availableDatesOnly);
    } catch (error) {
      console.error('Error loading available dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = () => {
    if (!isExpanded) {
      loadAvailableDates();
    }
    setIsExpanded(!isExpanded);
  };

  const handleDateSelect = async (date: GameDate) => {
    setCheckingDate(date.date);
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      navigateToDateGame(date.date);
    } catch (error) {
      console.error('Error navigating to date:', error);
      setCheckingDate(null);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
      {/* Small CTA Button */}
      <button
        onClick={handleToggleExpand}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-100">Play Another Game</h3>
            <p className="text-sm text-gray-400">Try challenges from other days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 bg-gray-750">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mr-2" />
              <span className="text-gray-400">Loading available games...</span>
            </div>
          ) : availableDates.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-1">No other games available</p>
              <p className="text-sm text-gray-500">Check back tomorrow for new challenges!</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-400 text-center">
                  Available {currentGameType === 'cricket' ? 'cricket' : 'TV soap'} challenges:
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableDates.map((date) => (
                  <button
                    key={date.date}
                    onClick={() => handleDateSelect(date)}
                    disabled={checkingDate === date.date}
                    className={`
                      relative p-3 rounded-lg border transition-all text-center group
                      ${checkingDate === date.date
                        ? 'bg-blue-900/50 border-blue-700/50 text-blue-300 cursor-wait'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white transform hover:scale-105'
                      }
                    `}
                  >
                    {checkingDate === date.date ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-medium opacity-75 mb-1">
                          {date.dayOfWeek}
                        </div>
                        <div className="text-sm font-bold mb-2">
                          {date.displayDate}
                        </div>
                        <Play className="w-4 h-4 mx-auto opacity-60 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Each day features different {currentGameType === 'cricket' ? 'cricket players' : 'TV episodes'}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayAnotherGame;