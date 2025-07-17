// Google Analytics 4 event tracking utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// GA4 Game Events using cricket-specific naming convention
export const trackGameStart = (playerCount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'GAME.CRICKET.GUESS.level_start', {
      level_name: 'cricket_stats_game',
      character: 'player',
      custom_player_count: playerCount
    });
  }
};

export const trackQuestionAnswered = (
  questionNumber: number,
  playerName: string,
  userAnswer: number,
  correctAnswer: number,
  points: number,
  isPerfect: boolean
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const accuracy = Math.round((1 - Math.abs(userAnswer - correctAnswer) / correctAnswer) * 100);
    
    // Main question answered event
    window.gtag('event', 'GAME.CRICKET.GUESS.post_score', {
      score: points,
      level: questionNumber,
      character: playerName,
      custom_user_answer: userAnswer,
      custom_correct_answer: correctAnswer,
      custom_accuracy: accuracy,
      custom_is_perfect: isPerfect
    });

    // Per-question event with question number in event name
    window.gtag('event', `GAME.CRICKET.GUESS.question_${questionNumber}`, {
      score: points,
      character: playerName,
      custom_user_answer: userAnswer,
      custom_correct_answer: correctAnswer,
      custom_accuracy: accuracy,
      custom_is_perfect: isPerfect
    });

    // Track perfect answers as achievements
    if (isPerfect) {
      window.gtag('event', 'GAME.CRICKET.GUESS.unlock_achievement', {
        achievement_id: 'perfect_answer',
        character: playerName,
        level: questionNumber
      });
    }
  }
};

export const trackGameComplete = (
  totalScore: number,
  averageScore: number,
  perfectAnswers: number,
  totalQuestions: number,
  accuracyPercentage: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Game completion event
    window.gtag('event', 'GAME.CRICKET.GUESS.level_end', {
      level_name: 'cricket_stats_game',
      success: true,
      score: totalScore,
      custom_average_score: averageScore,
      custom_perfect_answers: perfectAnswers,
      custom_total_questions: totalQuestions,
      custom_accuracy: accuracyPercentage
    });

    // Track performance level as achievement
    let achievementId = 'beginner';
    if (averageScore >= 80) achievementId = 'cricket_legend';
    else if (averageScore >= 65) achievementId = 'cricket_expert';
    else if (averageScore >= 50) achievementId = 'cricket_fan';
    else if (averageScore >= 35) achievementId = 'cricket_enthusiast';

    window.gtag('event', 'GAME.CRICKET.GUESS.unlock_achievement', {
      achievement_id: achievementId,
      score: totalScore
    });

    // Track high scores (80+ average)
    if (averageScore >= 80) {
      window.gtag('event', 'GAME.CRICKET.GUESS.earn_virtual_currency', {
        virtual_currency_name: 'cricket_points',
        value: totalScore
      });
    }
  }
};

export const trackGameRestart = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'GAME.CRICKET.GUESS.level_restart', {
      level_name: 'cricket_stats_game_restart',
      character: 'returning_player'
    });
  }
};

export const trackShare = (score: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'GAME.CRICKET.GUESS.share', {
      method: 'native_share',
      content_type: 'game_score',
      content_id: 'cricket_stats_game',
      custom_score: score
    });
  }
};

export const trackPlayerLoad = (playerCount: number, source: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'GAME.CRICKET.GUESS.select_content', {
      content_type: 'game_data',
      content_id: 'cricket_players',
      custom_player_count: playerCount,
      custom_source: source
    });
  }
};

export const trackError = (errorType: string, errorMessage: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'GAME.CRICKET.GUESS.exception', {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      custom_error_type: errorType
    });
  }
};

// User Engagement Events
export const trackTimeSpentOnQuestion = (questionNumber: number, timeInSeconds: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'GAME.CRICKET.GUESS.timing_complete', {
      name: 'question_duration',
      value: timeInSeconds * 1000, // GA4 expects milliseconds
      custom_question_number: questionNumber
    });
  }
};

// Additional GA4 recommended events
export const trackEngagement = (engagementTime: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'GAME.CRICKET.GUESS.user_engagement', {
      engagement_time_msec: engagementTime
    });
  }
};

export const trackPageView = (pageName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'GAME.CRICKET.GUESS.page_view', {
      page_title: pageName,
      page_location: window.location.href
    });
  }
};