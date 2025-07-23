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


  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl p-4 text-center border border-indigo-500/30">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Calendar className="w-5 h-5" />
        <h3 className="text-lg font-bold">New Challenge Tomorrow</h3>
      </div>
      
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-4 h-4" />
        <span className="text-sm opacity-80">Time remaining:</span>
      </div>

      <div className="flex justify-center gap-2">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2 min-w-[60px]">
          <div className="text-xl font-bold">
            {formatTime(timeLeft.hours)}
          </div>
          <div className="text-xs opacity-80">Hours</div>
        </div>
        
        <div className="flex items-center text-xl font-bold">:</div>
        
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2 min-w-[60px]">
          <div className="text-xl font-bold">
            {formatTime(timeLeft.minutes)}
          </div>
          <div className="text-xs opacity-80">Minutes</div>
        </div>
        
        <div className="flex items-center text-xl font-bold">:</div>
        
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2 min-w-[60px]">
          <div className="text-xl font-bold">
            {formatTime(timeLeft.seconds)}
          </div>
          <div className="text-xs opacity-80">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;