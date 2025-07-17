import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Play, Loader2, X } from 'lucide-react';
import { getAvailableGameDates, checkDataAvailability, navigateToDateGame, GameDate } from '../utils/dateUtils';

interface PreviousGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PreviousGamesModal: React.FC<PreviousGamesModalProps> = ({ isOpen, onClose }) => {
  const [availableDates, setAvailableDates] = useState<GameDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingDate, setCheckingDate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableDates();
    }
  }, [isOpen]);

  const loadAvailableDates = async () => {
    if (availableDates.length > 0) return; // Already loaded
    
    setLoading(true);
    try {
      const dates = getAvailableGameDates();
      
      // Check data availability for each date in batches to improve performance
      const datesWithAvailability = [];
      const batchSize = 5;
      
      for (let i = 0; i < dates.length; i += batchSize) {
        const batch = dates.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (date) => {
            try {
              const hasData = await checkDataAvailability(date.date);
              return { ...date, hasData };
            } catch (error) {
              console.error(`Error checking data for ${date.date}:`, error);
              return { ...date, hasData: false };
            }
          })
        );
        datesWithAvailability.push(...batchResults);
      }
      
      // Filter to only show dates with available data
      const availableDatesOnly = datesWithAvailability.filter(date => date.hasData);
      setAvailableDates(availableDatesOnly);
    } catch (error) {
      console.error('Error loading available dates:', error);
    } finally {
      setLoading(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Previous Games</h2>
              <p className="text-sm text-gray-400">Play challenges from other days</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mr-2" />
              <span className="text-gray-400">Loading available games...</span>
            </div>
          ) : availableDates.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-1">No previous games available</p>
              <p className="text-sm text-gray-500">Check back tomorrow for new challenges!</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-400 text-center">
                  Available cricket challenges:
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date.date}
                    onClick={() => handleDateSelect(date)}
                    disabled={checkingDate === date.date}
                    className={`
                      relative p-2 rounded-lg border transition-all text-center group
                      ${checkingDate === date.date
                        ? 'bg-blue-900/50 border-blue-700/50 text-blue-300 cursor-wait'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white transform hover:scale-105'
                      }
                    `}
                  >
                    {checkingDate === date.date ? (
                      <div className="flex items-center justify-center py-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-medium opacity-75">
                          {date.dayOfWeek}
                        </div>
                        <div className="text-xs font-bold mb-1">
                          {date.displayDate}
                        </div>
                        <Play className="w-3 h-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Each day features different cricket players
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviousGamesModal;