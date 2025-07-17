import { Player } from '../types/game';

// This will be populated with data from Google Sheets
let cricketPlayers: Player[] = [];

// Function to load players from Google Sheets
export const loadPlayersFromSheet = async (targetDate?: string): Promise<Player[]> => {
  try {
    const { fetchPlayersFromSheet } = await import('../utils/fetchData');
    const sheetPlayers = await fetchPlayersFromSheet(targetDate);
    
    if (sheetPlayers.length > 0) {
      const convertedPlayers: Player[] = sheetPlayers.map((player, index) => ({
        id: (index + 1).toString(),
        name: player.name,
        image: player.image || 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400',
        country: player.country,
        role: player.role,
        question: player.question,
        answer: player.answer
      }));
      
      cricketPlayers = convertedPlayers;
      return convertedPlayers;
    }
  } catch (error) {
    console.error('Failed to load players from sheet:', error);
  }
  
  return [];
};

export { cricketPlayers }