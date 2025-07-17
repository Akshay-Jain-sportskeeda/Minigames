import { Player, Question } from '../types/game';

// Track used players to avoid repetition
let usedPlayerIds: Set<string> = new Set();
let availablePlayers: Player[] = [];

export const initializeGame = (players: Player[]) => {
  // Reset for new game
  usedPlayerIds.clear();
  availablePlayers = [...players]; // Create a copy
  console.log('Game initialized with players:', availablePlayers.map(p => p.name));
};

export const generateQuestion = (players: Player[]): Question => {
  // Initialize if not done yet
  if (availablePlayers.length === 0) {
    initializeGame(players);
  }
  
  // Filter out already used players
  const unusedPlayers = availablePlayers.filter(player => !usedPlayerIds.has(player.id));
  
  console.log('Available unused players:', unusedPlayers.map(p => p.name));
  console.log('Used player IDs:', Array.from(usedPlayerIds));
  
  // If no unused players left, reset (shouldn't happen with proper game flow)
  if (unusedPlayers.length === 0) {
    console.warn('No unused players available, resetting...');
    usedPlayerIds.clear();
    return generateQuestion(players);
  }
  
  // Select a random unused player
  const randomIndex = Math.floor(Math.random() * unusedPlayers.length);
  const selectedPlayer = unusedPlayers[randomIndex];
  
  // Mark this player as used
  usedPlayerIds.add(selectedPlayer.id);
  
  console.log('Selected player:', selectedPlayer.name, 'Answer:', selectedPlayer.answer, 'Used players count:', usedPlayerIds.size);
  
  // Determine max value based on the question type and answer value
  // Ensure the correct answer is NOT in the middle of the range
  const getMaxValue = (question: string, answer: number): number => {
    const questionLower = question.toLowerCase();
    let baseMax: number;
    
    // For decimal answers (typically averages, rates, etc.), use smaller max values
    if (answer % 1 !== 0) { // Has decimal places
      if (questionLower.includes('average')) baseMax = Math.max(100, answer * 3);
      else if (questionLower.includes('strike rate')) baseMax = Math.max(200, answer * 2.5);
      else if (questionLower.includes('economy')) baseMax = Math.max(15, answer * 3);
      else if (questionLower.includes('rate')) baseMax = Math.max(50, answer * 3);
      else baseMax = Math.max(100, answer * 3);
    } else {
      // For integer values
      if (questionLower.includes('run')) baseMax = Math.max(30000, answer * 2.5);
      else if (questionLower.includes('wicket')) baseMax = Math.max(800, answer * 2.5);
      else if (questionLower.includes('match')) baseMax = Math.max(600, answer * 2.5);
      else if (questionLower.includes('centur')) baseMax = Math.max(100, answer * 2.5);
      else if (questionLower.includes('average')) baseMax = Math.max(100, answer * 2.5);
      else if (questionLower.includes('strike rate')) baseMax = Math.max(200, answer * 2.5);
      else if (questionLower.includes('economy')) baseMax = Math.max(15, answer * 2.5);
      else baseMax = Math.max(1000, answer * 2.5);
    }
    
    // Adjust the max value to ensure the correct answer is NOT exactly in the middle
    // We want to avoid answer being exactly at 50% of the range
    const targetPosition = baseMax / 2; // This would be the middle
    const tolerance = baseMax * 0.05; // 5% tolerance around the middle
    
    // If the answer is too close to the middle, adjust the max value
    if (Math.abs(answer - targetPosition) < tolerance) {
      // If answer is close to middle, shift the range
      if (answer < targetPosition) {
        // Answer is slightly below middle, increase max to push it further from center
        baseMax = Math.ceil(answer * 3.2);
      } else {
        // Answer is slightly above middle, decrease max to push it further from center
        baseMax = Math.ceil(answer * 1.8);
      }
    }
    
    // Ensure minimum reasonable range
    const minRange = answer % 1 !== 0 ? answer * 2 : answer * 1.5;
    return Math.max(baseMax, minRange);
  };

  return {
    player: selectedPlayer,
    statLabel: selectedPlayer.question,
    maxValue: getMaxValue(selectedPlayer.question, selectedPlayer.answer),
    unit: ''
  };
};

export const resetGameState = () => {
  usedPlayerIds.clear();
  availablePlayers = [];
  console.log('Game state reset');
};

export const calculateScore = (userAnswer: number, correctAnswer: number, maxValue: number): number => {
  if (correctAnswer === 0) return 0;
  
  const difference = Math.abs(userAnswer - correctAnswer);
  const percentageError = (difference / correctAnswer) * 100;
  
  // Base scoring system
  let score = 0;
  if (percentageError === 0) score = 100; // Exact match
  else if (percentageError <= 1) score = 95; // Within 1%
  else if (percentageError <= 2) score = 85; // Within 2%
  else if (percentageError <= 5) score = 75; // Within 5%
  else if (percentageError <= 10) score = 60; // Within 10%
  else if (percentageError <= 15) score = 45; // Within 15%
  else if (percentageError <= 25) score = 30; // Within 25%
  else if (percentageError <= 40) score = 15; // Within 40%
  else if (percentageError <= 60) score = 5;  // Within 60%
  else score = 0; // More than 60% off
  
  // Perfect guess bonus: Add 25 bonus points for exact matches!
  // For decimal values, consider "exact" as very close (within 0.01)
  const isExactMatch = correctAnswer % 1 !== 0 
    ? Math.abs(userAnswer - correctAnswer) < 0.01 
    : userAnswer === correctAnswer;
    
  if (isExactMatch) {
    score += 25;
  }
  
  return Math.max(0, score);
};

export const getAccuracyMessage = (points: number): string => {
  if (points >= 125) return "🎯 PERFECT + BONUS! Incredible!";
  if (points === 100) return "🎯 Perfect! Exactly right!";
  if (points >= 90) return "🔥 Incredible! Almost perfect!";
  if (points >= 75) return "⭐ Excellent guess!";
  if (points >= 60) return "👍 Good estimate!";
  if (points >= 45) return "👌 Not bad!";
  if (points >= 30) return "🤔 Getting warmer!";
  if (points >= 15) return "😅 Keep trying!";
  return "💪 Better luck next time!";
};