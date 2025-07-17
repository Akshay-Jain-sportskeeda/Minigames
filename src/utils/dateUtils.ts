import { checkDataAvailabilityForDate } from './fetchData';

// Utility functions for date handling and game availability checking

export interface GameDate {
  date: string; // YYYY-MM-DD format
  displayDate: string; // Human readable format
  isToday: boolean;
  dayOfWeek: string;
}

// Function to get available game dates (you can expand this to check actual data availability)
export const getAvailableGameDates = (): GameDate[] => {
  const dates: GameDate[] = [];
  const today = new Date();
  
  // Generate dates for the past 7 days and next 3 days as examples
  // In a real implementation, you'd check your data source for actual availability
  for (let i = -7; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateString = formatDateToString(date);
    const isToday = i === 0;
    
    dates.push({
      date: dateString,
      displayDate: formatDateForDisplay(date),
      isToday,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return dates;
};

// Function to format date to YYYY-MM-DD string
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to format date for display
export const formatDateForDisplay = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dateString = formatDateToString(date);
  const todayString = formatDateToString(today);
  const yesterdayString = formatDateToString(yesterday);
  const tomorrowString = formatDateToString(tomorrow);
  
  if (dateString === todayString) return 'Today';
  if (dateString === yesterdayString) return 'Yesterday';
  if (dateString === tomorrowString) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

// Function to check if a specific date has available data
export const checkDataAvailability = async (date: string): Promise<boolean> => {
  try {
    // Check actual data availability from Google Sheets
    return await checkDataAvailabilityForDate(date);
  } catch (error) {
    console.error('Error checking data availability:', error);
    return false;
  }
};

// Function to navigate to a specific date's game
export const navigateToDateGame = (date: string) => {
  // Create URL with date parameter
  const url = new URL(window.location.href);
  url.searchParams.set('date', date);
  window.location.href = url.toString();
};

// Function to get date from URL parameters
export const getDateFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('date');
};

// Function to get today's date string
export const getTodayString = (): string => {
  return formatDateToString(new Date());
};