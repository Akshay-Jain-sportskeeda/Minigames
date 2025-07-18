import React, { useState, useEffect } from 'react';
import MobileStickyAd from './components/MobileStickyAd';
import { cricketPlayers, loadPlayersFromSheet } from './data/players';
import { generateQuestion, calculateScore, initializeGame, resetGameState } from './utils/gameLogic';
import { GameState, Question } from './types/game';
import PlayerCard from './components/PlayerCard';
import AnswerInput from './components/AnswerInput';
import ResultModal from './components/ResultModal';
import GameComplete from './components/GameComplete';
import { Play, Brain, Loader2, Calendar } from 'lucide-react';
import { getDateFromUrl, getTodayString } from './utils/dateUtils';
import PreviousGamesCTA from './components/PreviousGamesCTA';
import PreviousGamesModal from './components/PreviousGamesModal';
import { 
  trackGameStart, 
  trackQuestionAnswered, 
  trackGameComplete, 
  trackGameRestart,
  trackPlayerLoad,
  trackError,
  trackTimeSpentOnQuestion,
  trackPageView,
  trackEngagement
} from './utils/analytics';

function App() {
  const [gameStarted, setGameStarted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState(cricketPlayers);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    totalQuestions: 0, // Will be set based on available players
    score: 0,
    answers: []
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    userAnswer: number;
    correctAnswer: number;
    points: number;
  } | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [appStartTime] = useState<number>(Date.now());
  const [showPreviousGamesModal, setShowPreviousGamesModal] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackPageView('Cricket Stats Game - Home');
  }, []);

  // Track engagement time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const engagementTime = Date.now() - appStartTime;
      trackEngagement(engagementTime);
    }, 30000); // Track every 30 seconds

    return () => clearInterval(interval);
  }, [appStartTime]);

  // Load players data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Check if there's a specific date in the URL
        const urlDate = getDateFromUrl();
        const targetDate = urlDate || getTodayString();
        
        console.log('Loading data for date:', targetDate);
        
        const loadedPlayers = await loadPlayersFromSheet(targetDate);
        if (loadedPlayers.length > 0) {
          setPlayers(loadedPlayers);
          trackPlayerLoad(loadedPlayers.length, 'Google Sheets');
          console.log(`Loaded ${loadedPlayers.length} players for ${targetDate} challenge`);
          
          // Auto-start the game once players are loaded
          initializeGameWithPlayers(loadedPlayers);
        } else {
          // If no players for today, show a message
          setPlayers([]);
          trackPlayerLoad(0, 'Google Sheets');
        }
      } catch (error) {
        console.error('Error loading players:', error);
        trackError('Data Loading', error instanceof Error ? error.message : 'Unknown error');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const initializeGameWithPlayers = (loadedPlayers: Player[]) => {
    if (loadedPlayers.length === 0) return;
    
    // Reset game state and initialize with current players
    resetGameState();
    initializeGame(loadedPlayers);
    
    setGameState({
      currentQuestion: 0,
      totalQuestions: loadedPlayers.length, // Use all available players
      score: 0,
      answers: []
    });
    const question = generateQuestion(loadedPlayers);
    setCurrentQuestion(question);
    setUserAnswer(0);
    setQuestionStartTime(Date.now());
    
    // Track game start
    trackGameStart(loadedPlayers.length);
    trackPageView('Cricket Stats Game - Playing');
    
    console.log(`Starting game with ${loadedPlayers.length} players, ${loadedPlayers.length} questions`);
  };

  const submitAnswer = () => {
    if (!currentQuestion) return;

    const correctAnswer = currentQuestion.player.answer;
    const points = calculateScore(userAnswer, correctAnswer, currentQuestion.maxValue);
    const isPerfect = userAnswer === correctAnswer;
    
    // Track time spent on question
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    trackTimeSpentOnQuestion(gameState.currentQuestion + 1, timeSpent);
    
    // Track question answered
    trackQuestionAnswered(
      gameState.currentQuestion + 1,
      currentQuestion.player.name,
      userAnswer,
      correctAnswer,
      points,
      isPerfect
    );
    
    const newAnswer = {
      question: currentQuestion,
      userAnswer,
      correctAnswer,
      points
    };

    setCurrentResult({
      userAnswer,
      correctAnswer,
      points
    });

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      answers: [...prev.answers, newAnswer]
    }));

    setShowResult(true);
  };

  const nextQuestion = () => {
    setShowResult(false);
    setCurrentResult(null);
    setUserAnswer(0);
    
    const nextQuestionNumber = gameState.currentQuestion + 1;
    
    if (nextQuestionNumber >= gameState.totalQuestions) {
      // Game complete - track completion
      const finalGameState = {
        ...gameState,
        currentQuestion: nextQuestionNumber
      };
      
      const baseScoreTotal = gameState.answers.reduce((total, answer) => {
        const baseScore = answer.userAnswer === answer.correctAnswer ? 100 : answer.points;
        return total + baseScore;
      }, 0);
      
      const averageScore = Math.round(gameState.score / gameState.totalQuestions);
      const accuracyPercentage = Math.round(baseScoreTotal / gameState.totalQuestions);
      const perfectAnswers = gameState.answers.filter(a => a.userAnswer === a.correctAnswer).length;
      
      trackGameComplete(
        gameState.score,
        averageScore,
        perfectAnswers,
        gameState.totalQuestions,
        accuracyPercentage
      );
      
      trackPageView('Cricket Stats Game - Results');
      
      setGameState(prev => ({
        ...prev,
        currentQuestion: nextQuestionNumber
      }));
      setCurrentQuestion(null);
    } else {
      setGameState(prev => ({
        ...prev,
        currentQuestion: nextQuestionNumber
      }));
      const question = generateQuestion(players);
      setCurrentQuestion(question);
      setQuestionStartTime(Date.now());
    }
  };

  const restartGame = () => {
    trackGameRestart();
    setCurrentQuestion(null);
    setUserAnswer(0);
    setShowResult(false);
    setCurrentResult(null);
    resetGameState(); // Reset the used players tracking
    
    // Restart the game immediately with current players
    if (players.length > 0) {
      initializeGameWithPlayers(players);
    }
    trackPageView('Cricket Stats Game - Playing');
  };

  // Get today's date for display
  const urlDate = getDateFromUrl();
  const displayDate = urlDate ? new Date(urlDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Loading Cricket Challenge...</h2>
          <p className="text-gray-400">Fetching players for {displayDate}</p>
        </div>
      </div>
    );
  }

  // Show message if no players available for today
  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
        <div className="max-w-lg mx-auto pt-8">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-8 text-center mb-4">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-100 mb-3">No Challenge Available</h1>
            <p className="text-gray-400 mb-4">
              There are no cricket players scheduled for this date's challenge.
            </p>
            <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 text-sm text-gray-300">
              <p className="font-medium mb-1">Date: {displayDate}</p>
              <p>Try selecting a different date or check back later!</p>
            </div>
          </div>
          
          {/* Previous Games CTA for no data state */}
          <PreviousGamesCTA onOpenModal={() => setShowPreviousGamesModal(true)} />
          
          {/* Previous Games Modal */}
          <PreviousGamesModal 
            isOpen={showPreviousGamesModal} 
            onClose={() => setShowPreviousGamesModal(false)} 
          />
        </div>
      </div>
    );
  }


  if (gameState.currentQuestion >= gameState.totalQuestions) {
    return <GameComplete gameState={gameState} onRestart={restartGame} />;
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Preparing Your Challenge...</h2>
          <p className="text-gray-400">Setting up cricket questions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="pb-[270px]"> {/* Add bottom padding to account for sticky ad */}
        <div className="max-w-md mx-auto">
          {/* Combined Player Card and Answer Input */}
          <div className="p-3">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
              {/* Player Section */}
              <PlayerCard
                player={currentQuestion.player}
                statLabel={currentQuestion.statLabel}
                currentQuestion={gameState.currentQuestion + 1}
                totalQuestions={gameState.totalQuestions}
              />

              {/* Answer Section */}
              <div className="p-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <AnswerInput
                      key={`${currentQuestion.player.id}-${currentQuestion.statLabel}-${gameState.currentQuestion}`}
                      maxValue={currentQuestion.maxValue}
                      onAnswerChange={setUserAnswer}
                      unit={currentQuestion.unit}
                      correctAnswer={currentQuestion.player.answer}
                    />
                  </div>
                  <button
                    id="submit-button"
                    onClick={submitAnswer}
                    disabled={userAnswer === 0}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-base font-semibold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg whitespace-nowrap"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Ad */}
      <MobileStickyAd />
      
        {showResult && currentResult && (
          <ResultModal
            isVisible={showResult}
            userAnswer={currentResult.userAnswer}
            correctAnswer={currentResult.correctAnswer}
            points={currentResult.points}
            onNext={nextQuestion}
            isLastQuestion={gameState.currentQuestion + 1 >= gameState.totalQuestions}
          />
        )}
        
        {/* Previous Games Modal */}
        <PreviousGamesModal 
          isOpen={showPreviousGamesModal} 
          onClose={() => setShowPreviousGamesModal(false)} 
        />
    </div>
  );
}

export default App;