
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGame } from '@/context/GameContext';
import { Check, ArrowLeft, RefreshCw, Shuffle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player } from '@/types';

const MatchSetup: React.FC = () => {
  const location = useLocation();
  const { selectedPlayers } = location.state || { selectedPlayers: [] };
  
  const [player1, setPlayer1] = useState<Player>(selectedPlayers[0]);
  const [player2, setPlayer2] = useState<Player>(selectedPlayers[1]);
  const [player1Score, setPlayer1Score] = useState<string>('');
  const [player2Score, setPlayer2Score] = useState<string>('');
  
  const { currentGameSession, addMatchResult } = useGame();
  const navigate = useNavigate();

  const handleRematch = () => {
    // Just reset the scores
    setPlayer1Score('');
    setPlayer2Score('');
  };

  const handleRandomMatch = () => {
    if (selectedPlayers.length < 2) return;
    
    // Shuffle and pick 2 players
    const shuffled = [...selectedPlayers].sort(() => 0.5 - Math.random());
    setPlayer1(shuffled[0]);
    setPlayer2(shuffled[1]);
    setPlayer1Score('');
    setPlayer2Score('');
  };

  const handleSubmit = () => {
    if (!player1 || !player2 || !player1Score || !player2Score || !currentGameSession) {
      return;
    }

    const score1 = parseInt(player1Score);
    const score2 = parseInt(player2Score);

    if (isNaN(score1) || isNaN(score2)) {
      return;
    }
    
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
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const canSubmit = player1 && player2 && player1Score !== '' && player2Score !== '';

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
          <p className="text-sm text-muted-foreground mb-3">Recent Opponents</p>
          <div className="flex gap-3 overflow-x-auto py-2">
            {selectedPlayers.map(player => (
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
            ))}
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

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 mb-2">
              {player1.photoUrl ? (
                <img src={player1.photoUrl} alt={player1.name} />
              ) : (
                <AvatarFallback className="text-2xl bg-fifa-blue text-white">
                  {getInitials(player1.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm">{player1.name}</span>
          </div>

          <div className="vs-badge">
            vs
          </div>

          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 mb-2">
              {player2.photoUrl ? (
                <img src={player2.photoUrl} alt={player2.name} />
              ) : (
                <AvatarFallback className="text-2xl bg-fifa-blue text-white">
                  {getInitials(player2.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm">{player2.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {player1.name}'s Score
            </label>
            <Input
              type="number"
              min="0"
              value={player1Score}
              onChange={(e) => setPlayer1Score(e.target.value)}
              className="text-center text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {player2.name}'s Score
            </label>
            <Input
              type="number"
              min="0"
              value={player2Score}
              onChange={(e) => setPlayer2Score(e.target.value)}
              className="text-center text-lg"
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
