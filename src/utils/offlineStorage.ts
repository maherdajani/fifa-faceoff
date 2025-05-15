// Keys for different types of data
const STORAGE_KEYS = {
  PLAYERS: 'players',
  MATCHES: 'matches',
  LEADERBOARD: 'leaderboard',
  SETTINGS: 'settings'
};

// Function to save data to localStorage
export const saveData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Register for background sync if available
    if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-localStorage');
      });
    }
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Function to load data from localStorage
export const loadData = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

// Function to handle offline actions
export const handleOfflineAction = (action: string, data: any) => {
  const offlineActions = loadData('offlineActions') || [];
  offlineActions.push({ action, data, timestamp: Date.now() });
  saveData('offlineActions', offlineActions);
};

// Function to sync offline actions when online
export const syncOfflineActions = async () => {
  const offlineActions = loadData('offlineActions') || [];
  if (offlineActions.length === 0) return;

  // Process each offline action
  for (const action of offlineActions) {
    switch (action.action) {
      case 'ADD_SCORE':
        // Update matches and leaderboard
        const matches = loadData(STORAGE_KEYS.MATCHES) || [];
        matches.push(action.data);
        saveData(STORAGE_KEYS.MATCHES, matches);
        updateLeaderboard(action.data);
        break;
      case 'ADD_PLAYER':
        const players = loadData(STORAGE_KEYS.PLAYERS) || [];
        players.push(action.data);
        saveData(STORAGE_KEYS.PLAYERS, players);
        break;
      // Add other cases as needed
    }
  }

  // Clear offline actions after processing
  saveData('offlineActions', []);
};

// Function to update leaderboard
const updateLeaderboard = (matchData: any) => {
  const leaderboard = loadData(STORAGE_KEYS.LEADERBOARD) || {};
  
  // Update player statistics
  const updatePlayerStats = (playerId: string, score: number, isWinner: boolean) => {
    if (!leaderboard[playerId]) {
      leaderboard[playerId] = {
        matches: 0,
        wins: 0,
        losses: 0,
        totalScore: 0
      };
    }
    
    leaderboard[playerId].matches++;
    leaderboard[playerId].totalScore += score;
    if (isWinner) {
      leaderboard[playerId].wins++;
    } else {
      leaderboard[playerId].losses++;
    }
  };

  // Update both players' statistics
  const player1Score = matchData.player1Score;
  const player2Score = matchData.player2Score;
  const player1IsWinner = player1Score > player2Score;

  updatePlayerStats(matchData.player1Id, player1Score, player1IsWinner);
  updatePlayerStats(matchData.player2Id, player2Score, !player1IsWinner);

  saveData(STORAGE_KEYS.LEADERBOARD, leaderboard);
};

export { STORAGE_KEYS }; 