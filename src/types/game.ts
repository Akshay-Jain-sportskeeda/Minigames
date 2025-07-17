export interface Player {
  id: string;
  name: string;
  image: string;
  country: string;
  role: string;
  question: string;
  answer: number;
}

export interface Question {
  player: Player;
  statLabel: string;
  maxValue: number;
  unit?: string;
}

export interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  answers: Array<{
    question: Question;
    userAnswer: number;
    correctAnswer: number;
    points: number;
  }>;
}