import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Play, Loader2, X } from 'lucide-react';
import { getAvailableGameDates, checkDataAvailability, navigateToDateGame, GameDate } from '../utils/dateUtils';

// Cache for available dates to avoid repeated API calls
let cachedAvailableDates: (GameDate & { hasData: boolean })[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    // Check if we have valid cached data
    const now = Date.now();
    if (cachedAvailableDates && (now - cacheTimestamp) < CACHE_DURATION) {
      const availableDatesOnly = cachedAvailableDates.filter(date => date.hasData);
      setAvailableDates(availableDatesOnly);
      return;
    }
    
    if (availableDates.length > 0 && !cachedAvailableDates) return; // Already loaded this session
    
    setLoading(true);
    try {
      const dates = getAvailableGameDates();
      
      // Check data availability for each date in smaller, faster batches
      const datesWithAvailability = [];
      const batchSize = 3; // Reduced batch size for faster initial response
      
      for (let i = 0; i < dates.length; i += batchSize) {
        const batch = dates.slice(i, i + batchSize);
        
        // Use Promise.allSettled to handle failures gracefully and continue processing
        const batchResults = await Promise.allSettled(
          batch.map(async (date) => {
            try {
              const hasData = await checkDataAvailability(date.date);
              return { ...date, hasData };
            } catch (error) {
              // Silently handle errors and assume no data
              return { ...date, hasData: false };
            }
          })
        );
        
        // Extract successful results
        const successfulResults = batchResults
          .filter((result): result is PromiseFulfilledResult<GameDate & { hasData: boolean }> => 
            result.status === 'fulfilled'
          )
          .map(result => result.value);
          
        datesWithAvailability.push(...successfulResults);
        
        // Show partial results immediately for better UX
        if (i === 0) {
          const partialAvailableDates = successfulResults.filter(date => date.hasData);
          if (partialAvailableDates.length > 0) {
            setAvailableDates(partialAvailableDates);
            setLoading(false); // Show partial results while continuing to load
          }
        }
      }
      
      // Filter to only show dates with available data
      const availableDatesOnly = datesWithAvailability.filter(date => date.hasData);
      
      // Cache the results
      cachedAvailableDates = datesWithAvailability;
      cacheTimestamp = now;
      
      setAvailableDates(availableDatesOnly);
    } catch (error) {
      console.error('Error loading available dates:', error);
      // If there's an error, show any cached data we might have
      if (cachedAvailableDates) {
        const availableDatesOnly = cachedAvailableDates.filter(date => date.hasData);
        setAvailableDates(availableDatesOnly);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date: GameDate) => {
    setCheckingDate(date.date);
    
    try {
      // Reduced delay for faster navigation
      await new Promise(resolve => setTimeout(resolve, 200));
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