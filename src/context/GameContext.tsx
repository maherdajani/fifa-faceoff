import React, { createContext, useContext, useState, useEffect } from "react";
import { Player, MatchResult, GameSession, Notification } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface GameContextType {
  players: Player[];
  gameSessions: GameSession[];
  matchResults: MatchResult[];
  notifications: Notification[];
  currentGameSession: GameSession | null;
  addPlayer: (player: Omit<Player, "id" | "wins" | "losses" | "goalDifference" | "matchesPlayed" | "winRate">) => Promise<Player>;
  setCurrentGameSession: (session: GameSession | null) => void;
  createGameSession: (name: string) => GameSession;
  addMatchResult: (result: Omit<MatchResult, "id" | "isLocked">) => MatchResult;
  confirmMatchResult: (matchId: string, playerId: string) => void;
  getPlayer: (id: string) => Player | undefined;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "date" | "isRead">) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentGameSession, setCurrentGameSession] = useState<GameSession | null>(null);
  const { toast } = useToast();

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadedPlayers = localStorage.getItem("players");
    const loadedGameSessions = localStorage.getItem("gameSessions");
    const loadedMatchResults = localStorage.getItem("matchResults");
    const loadedNotifications = localStorage.getItem("notifications");

    if (loadedPlayers) setPlayers(JSON.parse(loadedPlayers));
    if (loadedGameSessions) setGameSessions(JSON.parse(loadedGameSessions));
    if (loadedMatchResults) setMatchResults(JSON.parse(loadedMatchResults));
    if (loadedNotifications) setNotifications(JSON.parse(loadedNotifications));

    // Add some sample data if none exists
    if (!loadedPlayers) {
      const samplePlayers: Player[] = [
        { 
          id: "1", 
          name: "John", 
          photoUrl: undefined, 
          wins: 5, 
          losses: 2,
          goalDifference: 8,
          matchesPlayed: 7,
          winRate: 0.71
        },
        { 
          id: "2", 
          name: "Sarah", 
          photoUrl: undefined, 
          wins: 3, 
          losses: 4,
          goalDifference: -2,
          matchesPlayed: 7,
          winRate: 0.43
        },
        { 
          id: "3", 
          name: "Alex", 
          photoUrl: undefined, 
          wins: 6, 
          losses: 3,
          goalDifference: 5,
          matchesPlayed: 9,
          winRate: 0.67
        },
        { 
          id: "4", 
          name: "Michael", 
          photoUrl: undefined, 
          wins: 8, 
          losses: 1,
          goalDifference: 12,
          matchesPlayed: 9,
          winRate: 0.89
        }
      ];
      setPlayers(samplePlayers);
      localStorage.setItem("players", JSON.stringify(samplePlayers));

      const sampleSession: GameSession = {
        id: "1",
        name: "FIFA 2025",
        matches: [],
        lastPlayed: new Date().toISOString()
      };
      setGameSessions([sampleSession]);
      localStorage.setItem("gameSessions", JSON.stringify([sampleSession]));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("gameSessions", JSON.stringify(gameSessions));
  }, [gameSessions]);

  useEffect(() => {
    localStorage.setItem("matchResults", JSON.stringify(matchResults));
  }, [matchResults]);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addPlayer = async (player: Omit<Player, "id" | "wins" | "losses" | "goalDifference" | "matchesPlayed" | "winRate">): Promise<Player> => {
    // Check if player name already exists
    const nameExists = players.some(p => p.name.toLowerCase() === player.name.toLowerCase());
    if (nameExists) {
      toast({
        title: "Player Already Exists",
        description: "This player name is already registered. Please choose a different name.",
        variant: "destructive"
      });
      throw new Error("Player name already exists");
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: player.name,
      photoUrl: player.photoUrl,
      wins: 0,
      losses: 0,
      goalDifference: 0,
      matchesPlayed: 0,
      winRate: 0
    };

    setPlayers(prev => [...prev, newPlayer]);
    toast({
      title: "Player Added",
      description: `${player.name} has been added successfully.`
    });
    
    return newPlayer;
  };

  const createGameSession = (name: string): GameSession => {
    const newSession: GameSession = {
      id: Date.now().toString(),
      name,
      matches: [], // This is correctly typed as string[]
      lastPlayed: new Date().toISOString()
    };

    setGameSessions(prev => [...prev, newSession]);
    setCurrentGameSession(newSession);
    
    return newSession;
  };

  const addMatchResult = (result: Omit<MatchResult, "id" | "isLocked">): MatchResult => {
    const newResult: MatchResult = {
      ...result,
      id: Date.now().toString(),
      isLocked: false
    };

    setMatchResults(prev => [...prev, newResult]);

    // Add notification for match confirmation
    addNotification({
      type: 'confirmation',
      title: 'Score Confirmation',
      message: `Please confirm the score for your match against ${result.player2.name} (${result.player1Score}-${result.player2Score}).`,
      matchId: newResult.id
    });

    addNotification({
      type: 'confirmation',
      title: 'Score Confirmation',
      message: `Please confirm the score for your match against ${result.player1.name} (${result.player2Score}-${result.player1Score}).`,
      matchId: newResult.id
    });

    // Update game session with new match ID
    setGameSessions(prev => 
      prev.map(session => 
        session.id === result.gameSessionId 
          ? { 
              ...session, 
              matches: [...session.matches, newResult.id], // Push match ID instead of the entire match object
              lastPlayed: new Date().toISOString()
            } 
          : session
      )
    );

    return newResult;
  };

  const confirmMatchResult = (matchId: string, playerId: string) => {
    const updatedResults = matchResults.map(match => {
      if (match.id === matchId) {
        const isPlayer1 = match.player1.id === playerId;
        const updatedMatch = {
          ...match,
          player1Confirmed: isPlayer1 ? true : match.player1Confirmed,
          player2Confirmed: !isPlayer1 ? true : match.player2Confirmed,
        };

        // If both players confirmed, lock the result and update player stats
        if (updatedMatch.player1Confirmed && updatedMatch.player2Confirmed) {
          updatedMatch.isLocked = true;
          
          // Update player stats
          const player1Won = updatedMatch.player1Score > updatedMatch.player2Score;
          const player2Won = updatedMatch.player2Score > updatedMatch.player1Score;
          const goalDifference = updatedMatch.player1Score - updatedMatch.player2Score;
          
          setPlayers(prev => prev.map(player => {
            if (player.id === match.player1.id) {
              const wins = player1Won ? player.wins + 1 : player.wins;
              const losses = player2Won ? player.losses + 1 : player.losses;
              const matchesPlayed = player.matchesPlayed + 1;
              return {
                ...player,
                wins,
                losses,
                goalDifference: player.goalDifference + goalDifference,
                matchesPlayed,
                winRate: wins / matchesPlayed
              };
            } else if (player.id === match.player2.id) {
              const wins = player2Won ? player.wins + 1 : player.wins;
              const losses = player1Won ? player.losses + 1 : player.losses;
              const matchesPlayed = player.matchesPlayed + 1;
              return {
                ...player,
                wins,
                losses,
                goalDifference: player.goalDifference - goalDifference,
                matchesPlayed,
                winRate: wins / matchesPlayed
              };
            }
            return player;
          }));

          // Add notification that match is confirmed
          addNotification({
            type: 'system',
            title: 'Match Confirmed',
            message: `The match result between ${match.player1.name} and ${match.player2.name} has been confirmed and added to the leaderboard.`,
            matchId: match.id
          });
        }

        return updatedMatch;
      }
      return match;
    });

    setMatchResults(updatedResults);
  };

  const getPlayer = (id: string) => {
    return players.find(player => player.id === id);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const addNotification = (notification: Omit<Notification, "id" | "date" | "isRead">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast for new notification
    toast({
      title: notification.title,
      description: notification.message
    });
  };

  return (
    <GameContext.Provider value={{
      players,
      gameSessions,
      matchResults,
      notifications,
      currentGameSession,
      addPlayer,
      setCurrentGameSession,
      createGameSession,
      addMatchResult,
      confirmMatchResult,
      getPlayer,
      markNotificationAsRead,
      addNotification
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
