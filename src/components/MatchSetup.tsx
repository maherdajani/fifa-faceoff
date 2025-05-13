
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGame } from '@/context/GameContext';
import { Check, ArrowLeft, RefreshCw, Shuffle, Search, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MatchSetup: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { selectedPlayers = [] } = location.state || { selectedPlayers: [] };
  
  // Default Player object
  const defaultPlayer: Player = {
    id: '',
    name: 'Player',
    wins: 0,
    losses: 0,
    goalDifference: 0,
    matchesPlayed: 0,
    winRate: 0
  };
  
  const [player1, setPlayer1] = useState<Player>(selectedPlayers[0] || defaultPlayer);
  const [player2, setPlayer2] = useState<Player>(selectedPlayers[1] || defaultPlayer);
  const [player1Score, setPlayer1Score] = useState<string>('');
  const [player2Score, setPlayer2Score] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const { currentGameSession, addMatchResult, players } = useGame();
  const navigate = useNavigate();

  // Filter players based on search query
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle player selection
  const handlePlayer1Change = (playerId: string) => {
    const selectedPlayer = players.find(p => p.id === playerId);
    if (selectedPlayer) {
      setPlayer1(selectedPlayer);
      // If both players are the same, reset player 2
      if (selectedPlayer.id === player2.id) {
        setPlayer2(defaultPlayer);
      }
    }
  };

  const handlePlayer2Change = (playerId: string) => {
    const selectedPlayer = players.find(p => p.id === playerId);
    if (selectedPlayer) {
      setPlayer2(selectedPlayer);
      // If both players are the same, reset player 1
      if (selectedPlayer.id === player1.id) {
        setPlayer1(defaultPlayer);
      }
    }
  };

  // Check if we have any players at the beginning
  useEffect(() => {
    if (players.length < 2) {
      toast({
        title: "Not enough players",
        description: "Please add at least 2 players before setting up a match.",
        variant: "destructive"
      });
      navigate('/add-players');
    }
  }, [players, navigate, toast]);

  const handleRematch = () => {
    // Just reset the scores
    setPlayer1Score('');
    setPlayer2Score('');
  };

  const handleRandomMatch = () => {
    if (players.length < 2) {
      toast({
        title: "Not enough players",
        description: "Please select at least 2 players for a random match.",
        variant: "destructive"
      });
      return;
    }
    
    // Shuffle and pick 2 players
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setPlayer1(shuffled[0]);
    setPlayer2(shuffled[1]);
    setPlayer1Score('');
    setPlayer2Score('');
  };

  const handleSubmit = () => {
    if (!player1?.id || !player2?.id || !player1Score || !player2Score || !currentGameSession) {
      toast({
        title: "Missing information",
        description: "Please make sure all fields are filled correctly.",
        variant: "destructive"
      });
      return;
    }

    const score1 = parseInt(player1Score);
    const score2 = parseInt(player2Score);

    if (isNaN(score1) || isNaN(score2)) {
      toast({
        title: "Invalid scores",
        description: "Please enter valid numeric scores.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const matchResult = addMatchResult({
        gameSessionId: currentGameSession.id,
        gameSessionName: currentGameSession.name,
        player1,
        player2,
        player1Score: score1,
        player2Score: score2,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        player1Confirmed: false,
        player2Confirmed: false,
      });
      
      navigate('/match-result', { state: { matchId: matchResult.id } });
    } catch (error) {
      console.error("Error adding match result:", error);
      toast({
        title: "Error",
        description: "Something went wrong when saving the match. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || 'P';
  };

  const canSubmit = player1?.id && player2?.id && player1Score !== '' && player2Score !== '';

  // If we don't have enough players, show a loading state or redirect
  if (players.length < 2) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8 text-center">
        <h2>Not enough players available</h2>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/add-players')}
          className="mt-4"
        >
          Go to Player Selection
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate('/add-players')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold flex-1">Match Setup</h1>
      </div>

      {currentGameSession && (
        <Badge variant="outline" className="mb-4">
          {currentGameSession.name}
        </Badge>
      )}
      
      <div className="fifa-card mb-6">
        <h2 className="text-lg font-medium mb-4">Quick Match Setup</h2>
        
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Recent Players</p>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 overflow-x-auto py-2">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.slice(0, 6).map(player => (
                <div 
                  key={player.id}
                  className="flex flex-col items-center min-w-[4rem]"
                >
                  <Avatar className="h-12 w-12 mb-1">
                    {player.photoUrl ? (
                      <img src={player.photoUrl} alt={player.name} />
                    ) : (
                      <AvatarFallback className="bg-fifa-blue text-white">
                        {getInitials(player.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-xs">{player.name}</span>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-2 text-sm text-muted-foreground">
                No players found
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <Button 
            variant="outline"
            className="flex-1 text-xs h-9"
            onClick={handleRematch}
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Rematch Last
          </Button>
          <Button 
            variant="outline"
            className="flex-1 text-xs h-9"
            onClick={handleRandomMatch}
          >
            <Shuffle className="h-3 w-3 mr-1" /> Random Match
          </Button>
        </div>
      </div>

      <div className="fifa-card mb-6">
        <h2 className="text-lg font-medium mb-4">Select Players</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Player 1</label>
            <Select
              value={player1?.id || ""}
              onValueChange={handlePlayer1Change}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Player 1" />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem 
                    key={player.id} 
                    value={player.id}
                    disabled={player.id === player2?.id}
                  >
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Player 2</label>
            <Select
              value={player2?.id || ""}
              onValueChange={handlePlayer2Change}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Player 2" />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem 
                    key={player.id} 
                    value={player.id}
                    disabled={player.id === player1?.id}
                  >
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center">
            {player1?.id ? (
              <>
                <Avatar className="h-20 w-20 mb-2">
                  {player1?.photoUrl ? (
                    <img src={player1.photoUrl} alt={player1.name} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-fifa-blue text-white">
                      {getInitials(player1.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm">{player1.name}</span>
              </>
            ) : (
              <div className="h-20 w-20 mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                Select
              </div>
            )}
          </div>

          <div className="vs-badge">
            vs
          </div>

          <div className="flex flex-col items-center">
            {player2?.id ? (
              <>
                <Avatar className="h-20 w-20 mb-2">
                  {player2?.photoUrl ? (
                    <img src={player2.photoUrl} alt={player2.name} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-fifa-blue text-white">
                      {getInitials(player2.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm">{player2.name}</span>
              </>
            ) : (
              <div className="h-20 w-20 mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                Select
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {player1?.id ? `${player1.name}'s Score` : "Player 1 Score"}
            </label>
            <Input
              type="number"
              min="0"
              value={player1Score}
              onChange={(e) => setPlayer1Score(e.target.value)}
              className="text-center text-lg"
              disabled={!player1?.id}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {player2?.id ? `${player2.name}'s Score` : "Player 2 Score"}
            </label>
            <Input
              type="number"
              min="0"
              value={player2Score}
              onChange={(e) => setPlayer2Score(e.target.value)}
              className="text-center text-lg"
              disabled={!player2?.id}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="auto-save-badge inline-flex">
            <Check className="h-3 w-3" /> Progress auto-saved
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleSubmit}
          className="fifa-button w-full"
          disabled={!canSubmit}
        >
          Save Match Result <Check className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MatchSetup;
