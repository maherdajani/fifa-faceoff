
import React, { createContext, useContext, useState, useEffect } from "react";
import { Player, MatchResult, GameSession, Notification } from "@/types";
import { useToast } from "@/hooks/use-toast";

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
    if (loadedGameSessions) {
      const parsedSessions = JSON.parse(loadedGameSessions);
      setGameSessions(parsedSessions);
      
      // Set current game session to FIFA session
      const fifaSession = parsedSessions.find((s: GameSession) => s.name === "FIFA");
      if (fifaSession) {
        setCurrentGameSession(fifaSession);
      }
    }
    if (loadedMatchResults) setMatchResults(JSON.parse(loadedMatchResults));
    if (loadedNotifications) setNotifications(JSON.parse(loadedNotifications));

    // Create a default FIFA game session if none exists
    if (!loadedGameSessions || JSON.parse(loadedGameSessions).length === 0) {
      const defaultSession: GameSession = {
        id: "1",
        name: "FIFA",
        matches: [],
        lastPlayed: new Date().toISOString()
      };
      setGameSessions([defaultSession]);
      setCurrentGameSession(defaultSession);
      localStorage.setItem("gameSessions", JSON.stringify([defaultSession]));
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
      matches: [],
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
      isLocked: true // Set to true by default since we're removing confirmation
    };

    setMatchResults(prev => [...prev, newResult]);

    // Update game session with new match ID
    setGameSessions(prev => 
      prev.map(session => 
        session.id === result.gameSessionId 
          ? { 
              ...session, 
              matches: [...session.matches, newResult.id],
              lastPlayed: new Date().toISOString()
            } 
          : session
      )
    );

    // Update player stats immediately since we're removing confirmation
    const player1Won = newResult.player1Score > newResult.player2Score;
    const player2Won = newResult.player2Score > newResult.player1Score;
    const goalDifference = newResult.player1Score - newResult.player2Score;
    
    setPlayers(prev => prev.map(player => {
      if (player.id === result.player1.id) {
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
      } else if (player.id === result.player2.id) {
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

    // Add notification for match result
    addNotification({
      type: 'system',
      title: 'Match Result Added',
      message: `Match result between ${result.player1.name} and ${result.player2.name} has been added to the leaderboard.`,
      matchId: newResult.id
    });

    return newResult;
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
