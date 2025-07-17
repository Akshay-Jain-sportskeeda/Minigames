import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Set to midnight

      const difference = tomorrow.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl p-4 md:p-6 text-center border border-indigo-500/30">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Calendar className="w-5 h-5" />
        <h3 className="text-lg md:text-xl font-bold">New Challenge</h3>
      </div>
      
      <div className="mb-3">
        <p className="text-sm md:text-base opacity-90">
          New cricket players available on
        </p>
        <p className="font-semibold text-lg">
          {getTomorrowDate()}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="w-4 h-4" />
        <span className="text-sm opacity-80">Time remaining:</span>
      </div>

      <div className="flex justify-center gap-2 md:gap-4">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[70px]">
          <div className="text-xl md:text-2xl font-bold">
            {formatTime(timeLeft.hours)}
          </div>
          <div className="text-xs md:text-sm opacity-80">Hours</div>
        </div>
        
        <div className="flex items-center text-xl md:text-2xl font-bold">:</div>
        
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[70px]">
          <div className="text-xl md:text-2xl font-bold">
            {formatTime(timeLeft.minutes)}
          </div>
          <div className="text-xs md:text-sm opacity-80">Minutes</div>
        </div>
        
        <div className="flex items-center text-xl md:text-2xl font-bold">:</div>
        
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[70px]">
          <div className="text-xl md:text-2xl font-bold">
            {formatTime(timeLeft.seconds)}
          </div>
          <div className="text-xs md:text-sm opacity-80">Seconds</div>
        </div>
      </div>

      <div className="mt-4 text-xs md:text-sm opacity-75">
        🏏 Fresh challenges reset daily at midnight
      </div>
    </div>
  );
};

export default CountdownTimer;