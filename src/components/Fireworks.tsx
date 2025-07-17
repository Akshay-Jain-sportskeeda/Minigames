import React, { useEffect, useState } from 'react';

interface FireworksProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const Fireworks: React.FC<FireworksProps> = ({ isVisible, onComplete }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate firework particles
      const newParticles = [];
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.5
        });
      }
      
      setParticles(newParticles);

      // Auto-complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Firework particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: '1s'
          }}
        />
      ))}

      {/* Confetti effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={`confetti-${i}`}
            className="absolute w-2 h-2 opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
              animation: `confetti-fall 2s linear ${Math.random() * 0.5}s forwards`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Fireworks;