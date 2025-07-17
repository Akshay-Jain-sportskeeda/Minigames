import React from 'react';
import AdBanner from './AdBanner';
import { Trophy, Star, RotateCcw, Share2 } from 'lucide-react';
import { GameState } from '../types/game';
import CountdownTimer from './CountdownTimer';
import PreviousGamesCTA from './PreviousGamesCTA';
import PreviousGamesModal from './PreviousGamesModal';
import { trackShare } from '../utils/analytics';

interface GameCompleteProps {
  gameState: GameState;
  onRestart: () => void;
}

const GameComplete: React.FC<GameCompleteProps> = ({ gameState, onRestart }) => {
  const [showPreviousGamesModal, setShowPreviousGamesModal] = React.useState(false);

  // Calculate accuracy based on base scores (excluding bonus points)
  const baseScoreTotal = gameState.answers.reduce((total, answer) => {
    // Remove bonus points from perfect guesses for accuracy calculation
    const baseScore = answer.userAnswer === answer.correctAnswer ? 100 : answer.points;
    return total + baseScore;
  }, 0);
  
  const averageScore = Math.round(gameState.score / gameState.totalQuestions);
  const accuracyPercentage = Math.round(baseScoreTotal / gameState.totalQuestions);
  
  // Perfect guesses are ONLY when the answer is exactly the same as the actual answer
  const perfectAnswers = gameState.answers.filter(a => a.userAnswer === a.correctAnswer).length;
  
  const getPerformanceLevel = (avgScore: number) => {
    if (avgScore >= 80) return { label: 'Cricket Legend!', color: 'text-yellow-400', stars: 5 };
    if (avgScore >= 65) return { label: 'Cricket Expert!', color: 'text-green-400', stars: 4 };
    if (avgScore >= 50) return { label: 'Cricket Fan!', color: 'text-blue-400', stars: 3 };
    if (avgScore >= 35) return { label: 'Cricket Enthusiast!', color: 'text-purple-400', stars: 2 };
    return { label: 'Keep Learning!', color: 'text-gray-400', stars: 1 };
  };

  const performance = getPerformanceLevel(averageScore);

  const handleShare = () => {
    trackShare(gameState.score);
    const gameUrl = window.location.href;
    const shareText = `I scored ${gameState.score} points in the Cricket Stats Game! Can you beat my score? Play now: ${gameUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Stats Game',
        text: shareText
      });
    } else {
      // Fallback for browsers that don't support native sharing
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Score and game link copied to clipboard!');
      }).catch(() => {
        // If clipboard fails, show the text to copy manually
        prompt('Copy this text to share:', shareText);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        {/* Main Results Card - Compact for Mobile */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 md:p-8 mb-4">
          <div className="text-center mb-6">
            <Trophy className="w-12 h-12 md:w-20 md:h-20 text-yellow-400 mx-auto mb-3" />
            <h1 className="text-2xl md:text-4xl font-bold text-gray-100 mb-2">Game Complete!</h1>
            <h2 className={`text-lg md:text-2xl font-semibold mb-3 ${performance.color}`}>
              {performance.label}
            </h2>
            
            <div className="flex justify-center mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 md:w-8 md:h-8 ${
                    i < performance.stars ? 'text-yellow-400 fill-current' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 md:p-6 rounded-lg md:rounded-xl text-center border border-blue-500/30">
              <div className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{gameState.score}</div>
              <div className="text-xs md:text-sm text-blue-200">Total Score</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-3 md:p-6 rounded-lg md:rounded-xl text-center border border-green-500/30">
              <div className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{accuracyPercentage}%</div>
              <div className="text-xs md:text-sm text-green-200">Accuracy</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-3 md:p-6 rounded-lg md:rounded-xl text-center border border-purple-500/30">
              <div className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{perfectAnswers}</div>
              <div className="text-xs md:text-sm text-purple-200">Perfect</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 md:py-4 px-4 md:px-6 rounded-lg md:rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              Play Again
            </button>
            
            <button
              onClick={handleShare}
              className="px-4 md:px-6 py-3 md:py-4 border-2 border-emerald-500 text-emerald-400 rounded-lg md:rounded-xl font-semibold hover:bg-emerald-900/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
        
        {/* Countdown Timer for Next Challenge */}
        <div className="mb-4">
          <CountdownTimer />
        </div>
        
        {/* Ad Banner */}
        <div className="mb-4">
          <AdBanner
            adUnitPath="/cricket-game/game-complete"
            size={[[300, 250], [320, 100]]}
            className="flex justify-center"
          />
        </div>
        
        {/* Previous Games CTA */}
        <div className="mb-4">
          <PreviousGamesCTA onOpenModal={() => setShowPreviousGamesModal(true)} />
        </div>

        {/* Detailed Answers - Mobile Optimized */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-100 text-center">📊 Your Performance</h3>
          
          <div className="space-y-3">
            {gameState.answers.map((answer, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-lg p-3 hover:shadow-md transition-all">
                {/* Mobile: Stack everything vertically */}
                <div className="block md:hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-bold text-gray-100 text-sm">{answer.question.player.name}</div>
                      <div className="text-xs text-gray-400">{answer.question.player.country}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                      answer.userAnswer === answer.correctAnswer 
                        ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 text-yellow-300 border border-yellow-700/50' 
                        : answer.points >= 75 
                        ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                        : answer.points >= 50 
                        ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' 
                        : answer.points >= 25 
                        ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50' 
                        : 'bg-orange-900/50 text-orange-300 border border-orange-700/50'
                    }`}>
                      {answer.userAnswer === answer.correctAnswer ? `🎯 ${answer.points}` : `${answer.points}pts`}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">{answer.question.statLabel}</div>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-400">Your: </span>
                      <span className="font-semibold text-blue-400">{answer.userAnswer.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Actual: </span>
                      <span className="font-semibold text-emerald-400">{answer.correctAnswer.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop: Grid layout */}
                <div className="hidden md:grid md:grid-cols-4 gap-4 items-center">
                  {/* Player Info */}
                  <div>
                    <div className="font-bold text-gray-100 text-lg">{answer.question.player.name}</div>
                    <div className="text-sm text-gray-400">{answer.question.player.country}</div>
                    <div className="text-xs text-gray-500 mt-1">{answer.question.statLabel}</div>
                  </div>
                  
                  {/* Your Answer */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-400 mb-1">Your Guess</div>
                    <div className="text-lg font-bold text-blue-400">
                      {answer.userAnswer.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Correct Answer */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-400 mb-1">Actual</div>
                    <div className="text-lg font-bold text-emerald-400">
                      {answer.correctAnswer.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border ${
                      answer.userAnswer === answer.correctAnswer 
                        ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 text-yellow-300 border-yellow-700/50' 
                        : answer.points >= 75 
                        ? 'bg-green-900/50 text-green-300 border-green-700/50' 
                        : answer.points >= 50 
                        ? 'bg-blue-900/50 text-blue-300 border-blue-700/50' 
                        : answer.points >= 25 
                        ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50' 
                        : 'bg-orange-900/50 text-orange-300 border-orange-700/50'
                    }`}>
                      {answer.userAnswer === answer.correctAnswer ? (
                        <span className="flex items-center gap-1">
                          🎯 {answer.points}
                        </span>
                      ) : (
                        `${answer.points} pts`
                      )}
                    </div>
                    
                    {/* Accuracy indicator */}
                    <div className="text-xs text-gray-500 mt-1">
                      {answer.userAnswer === answer.correctAnswer 
                        ? 'Perfect!' 
                        : `${Math.abs(answer.userAnswer - answer.correctAnswer)} off`
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Previous Games Modal */}
      <PreviousGamesModal 
        isOpen={showPreviousGamesModal} 
        onClose={() => setShowPreviousGamesModal(false)} 
      />
    </div>
  );
};

export default GameComplete;