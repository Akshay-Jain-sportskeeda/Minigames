import React from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { getAccuracyMessage } from '../utils/gameLogic';
import Fireworks from './Fireworks';

interface ResultModalProps {
  isVisible: boolean;
  userAnswer: number;
  correctAnswer: number;
  points: number;
  onNext: () => void;
  isLastQuestion: boolean;
}

const ResultModal: React.FC<ResultModalProps> = ({
  isVisible,
  userAnswer,
  correctAnswer,
  points,
  onNext,
  isLastQuestion
}) => {
  if (!isVisible) return null;

  const isCorrect = points >= 70;
  const isPerfect = userAnswer === correctAnswer;
  const accuracyMessage = getAccuracyMessage(points);

  return (
    <>
      {/* Fireworks for perfect guesses */}
      {isPerfect && (
        <Fireworks 
          isVisible={isPerfect} 
          onComplete={() => {
            // Fireworks will play for 2 seconds, then auto-advance
            setTimeout(onNext, 500);
          }}
        />
      )}

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
          <div className="text-center">
            <div className="mb-6">
              {isPerfect ? (
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl animate-pulse">
                  🎯
                </div>
              ) : isCorrect ? (
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              ) : (
                <XCircle className="w-16 h-16 text-orange-400 mx-auto" />
              )}
            </div>
            
            <h3 className="text-2xl font-bold mb-2 text-gray-100">
              {accuracyMessage}
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-700 border border-gray-600 rounded-lg">
                <span className="text-gray-300">Your Answer:</span>
                <span className="font-semibold text-lg text-gray-100">{userAnswer.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
                <span className="text-gray-300">Correct Answer:</span>
                <span className="font-semibold text-lg text-emerald-400">
                  {correctAnswer.toLocaleString()}
                </span>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg border ${
                isPerfect 
                  ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-700/50' 
                  : 'bg-blue-900/30 border-blue-700/50'
              }`}>
                <span className="text-gray-300">Points Earned:</span>
                <div className="text-right">
                  {isPerfect ? (
                    <div>
                      <div className="text-sm text-gray-400">100 + 25 bonus</div>
                      <div className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                        🎯 {points} POINTS!
                      </div>
                    </div>
                  ) : (
                    <span className="font-bold text-xl text-blue-400">{points}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Only show next button if not perfect (perfect auto-advances) */}
            {!isPerfect && (
              <button
                onClick={onNext}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isLastQuestion ? (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    View Final Results
                  </>
                ) : (
                  'Next Question →'
                )}
              </button>
            )}

            {/* Show auto-advance message for perfect guesses */}
            {isPerfect && (
              <div className="text-sm text-gray-400 animate-pulse">
                🎉 Celebrating your perfect guess! Auto-advancing...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultModal;