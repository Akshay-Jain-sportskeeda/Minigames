export interface SheetPlayer {
  name: string;
  country: string;
  role: string;
  image: string;
  question: string;
  answer: number;
}

// Function to check if data is available for a specific date
export const checkDataAvailabilityForDate = async (targetDate: string): Promise<boolean> => {
  try {
    // Convert the Google Sheets URL to CSV format
    const sheetId = '1Z_DielXrLoUCa0DctJX1X0zV0_WhGUIdqjQ2ORrf0vE';
    const csvUrl = `/api/sheets/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    // Parse CSV data
    const lines = csvText.split('\n');
    
    // Check if any row has data for the target date
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      if (values.length >= 7) {
        const dateValue = values[0] || '';
        const sheetDate = parseDateFromSheet(dateValue);
        
        if (sheetDate === targetDate) {
          // Check if this row has valid data
          const playerName = values[1] || '';
          const answer = parseAnswerValue(values[6]);
          
          if (playerName && answer > 0) {
            return true; // Found at least one valid entry for this date
          }
        }
      }
    }
    
    return false; // No valid data found for this date
  } catch (error) {
    console.error('Error checking data availability for date:', targetDate, error);
    return false;
  }
};

export const fetchPlayersFromSheet = async (targetDate?: string): Promise<SheetPlayer[]> => {
  try {
    // Convert the Google Sheets URL to CSV format
    const sheetId = '1Z_DielXrLoUCa0DctJX1X0zV0_WhGUIdqjQ2ORrf0vE';
    const csvUrl = `/api/sheets/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    // Parse CSV data
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    
    console.log('Sheet headers:', headers); // Debug log
    
    // Use provided target date or default to today
    const dateToFind = targetDate || (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })();
    
    console.log('Looking for date:', dateToFind); // Debug log
    
    const players: SheetPlayer[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line handling quoted values
      const values = parseCSVLine(line);
      
      if (values.length >= 7) { // Expecting 7 columns: Date, playerName, playerImage, Country, Role, question, answer
        const dateValue = values[0] || ''; // Date column
        
        // Parse the date from the sheet (handle different date formats)
        const sheetDate = parseDateFromSheet(dateValue);
        
        console.log('Comparing dates:', { sheetDate, dateToFind, dateValue }); // Debug log
        
        // Only include rows where the date matches the target date
        if (sheetDate === dateToFind) {
          // Parse the answer value properly, handling commas and decimals
          const answerValue = parseAnswerValue(values[6]);
          
          const player: SheetPlayer = {
            name: values[1] || '', // playerName
            image: values[2] || 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400', // playerImage
            country: values[3] || '', // Country
            role: values[4] || '', // Role
            question: values[5] || '', // question
            answer: answerValue // answer (properly parsed)
          };
          
          if (player.name && player.question && player.answer > 0) {
            players.push(player);
            console.log('Added player for target date:', player.name, 'Answer:', player.answer); // Debug log
          }
        }
      }
    }
    
    console.log(`Loaded ${players.length} players for ${dateToFind}:`, players); // Debug log
    return players;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return [];
  }
};

// Helper function to properly parse answer values (handles commas, decimals)
const parseAnswerValue = (value: string): number => {
  if (!value) return 0;
  
  // Remove any quotes and trim whitespace
  const cleanValue = value.replace(/"/g, '').trim();
  
  // Remove commas (thousands separators) but keep decimal points
  const numericValue = cleanValue.replace(/,/g, '');
  
  // Parse as float to handle decimals
  const parsed = parseFloat(numericValue);
  
  // Return 0 if parsing failed, otherwise return the parsed value
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to parse date from sheet and convert to YYYY-MM-DD format
const parseDateFromSheet = (dateValue: string): string => {
  if (!dateValue) return '';
  
  try {
    // Handle different date formats that might come from Google Sheets
    let date: Date;
    
    // If it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // If it's in MM/DD/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
      const [month, day, year] = dateValue.split('/');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // If it's in DD/MM/YYYY format (European style)
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateValue)) {
      const [day, month, year] = dateValue.split('-');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try to parse as a general date
    else {
      date = new Date(dateValue);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateValue);
      return '';
    }
    
    // Convert to YYYY-MM-DD format using local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Error parsing date:', dateValue, error);
    return '';
  }
};

// Helper function to parse CSV line with quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(val => val.replace(/"/g, ''));
};