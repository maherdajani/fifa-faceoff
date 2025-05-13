
export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
  wins: number;
  losses: number;
  goalDifference: number;
  matchesPlayed: number;
  winRate: number;
}

export interface MatchResult {
  id: string;
  gameSessionId: string;
  gameSessionName: string;
  player1: Player;
  player2: Player;
  player1Score: number;
  player2Score: number;
  date: string;
  time: string;
  player1Confirmed: boolean;
  player2Confirmed: boolean;
  isLocked: boolean;
}

export interface GameSession {
  id: string;
  name: string;
  matches: string[]; // Changed from MatchResult[] to string[] to store match IDs
  lastPlayed: string;
}

export interface Notification {
  id: string;
  type: 'confirmation' | 'reminder' | 'system' | 'offline';
  title: string;
  message: string;
  matchId?: string;
  isRead: boolean;
  date: string;
}
