
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGame } from '@/context/GameContext';
import { ArrowLeft, ArrowRight, Check, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Player } from '@/types';
import { useToast } from "@/hooks/use-toast";

const MatchSetup: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use state from location or default to empty array
  const { selectedPlayers = [] } = location.state || {};
  
  const [player1, setPlayer1] = useState<Player | null>(selectedPlayers[0] || null);
  const [player2, setPlayer2] = useState<Player | null>(selectedPlayers[1] || null);
  const [player1Score, setPlayer1Score] = useState<number | ''>('');
  const [player2Score, setPlayer2Score] = useState<number | ''>('');
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    player1Score?: string;
    player2Score?: string;
  }>({});

  const { currentGameSession, addMatchResult } = useGame();

  useEffect(() => {
    if (!currentGameSession) {
      navigate('/');
    }
  }, [currentGameSession, navigate]);

  const validateForm = (): boolean => {
    const errors: {
      player1Score?: string;
      player2Score?: string;
    } = {};
    
    let isValid = true;
    
    if (player1Score === '') {
      errors.player1Score = "Score is required";
      isValid = false;
    }
    
    if (player2Score === '') {
      errors.player2Score = "Score is required";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleToggleScoreForm = () => {
    if (player1 && player2) {
      setShowScoreForm(true);
    } else {
      toast({
        title: "Players Required",
        description: "Please select both players before proceeding.",
        variant: "destructive"
      });
    }
  };

  const handleSaveScore = () => {
    if (!validateForm() || !player1 || !player2 || !currentGameSession) return;
    
    const now = new Date();
    const matchResult = {
      gameSessionId: currentGameSession.id,
      gameSessionName: currentGameSession.name,
      player1,
      player2,
      player1Score: Number(player1Score),
      player2Score: Number(player2Score),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };
    
    const result = addMatchResult(matchResult);
    
    toast({
      title: "Match Result Saved",
      description: "The match has been recorded and added to the leaderboard."
    });
    
    navigate('/match-result', { state: { matchId: result.id } });
  };

  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || '';
  };

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
      
      {!showScoreForm ? (
        <div className="fifa-card mb-6">
          <h2 className="text-lg font-medium mb-4">Players</h2>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 mb-2">
                {player1?.photoUrl ? (
                  <img src={player1.photoUrl} alt={player1.name} />
                ) : (
                  <AvatarFallback className="text-xl bg-fifa-blue text-white">
                    {player1 ? getInitials(player1.name) : 'P1'}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm">{player1?.name || "Player 1"}</span>
            </div>

            <div className="vs-badge">
              vs
            </div>

            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 mb-2">
                {player2?.photoUrl ? (
                  <img src={player2.photoUrl} alt={player2.name} />
                ) : (
                  <AvatarFallback className="text-xl bg-fifa-blue text-white">
                    {player2 ? getInitials(player2.name) : 'P2'}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm">{player2?.name || "Player 2"}</span>
            </div>
          </div>

          <Button 
            onClick={handleToggleScoreForm}
            className="w-full"
          >
            Record Score <Trophy className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="fifa-card mb-6">
          <h2 className="text-lg font-medium mb-4">Final Score</h2>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 mb-2">
                {player1?.photoUrl ? (
                  <img src={player1.photoUrl} alt={player1.name} />
                ) : (
                  <AvatarFallback className="text-xl bg-fifa-blue text-white">
                    {getInitials(player1?.name || '')}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm">{player1?.name}</span>
              <div className="mt-2">
                <Input
                  type="number"
                  min="0"
                  className="w-16 text-center text-2xl h-12"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
                {formErrors.player1Score && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.player1Score}</p>
                )}
              </div>
            </div>

            <div className="vs-badge">
              vs
            </div>

            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 mb-2">
                {player2?.photoUrl ? (
                  <img src={player2.photoUrl} alt={player2.name} />
                ) : (
                  <AvatarFallback className="text-xl bg-fifa-blue text-white">
                    {getInitials(player2?.name || '')}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm">{player2?.name}</span>
              <div className="mt-2">
                <Input
                  type="number"
                  min="0"
                  className="w-16 text-center text-2xl h-12"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
                {formErrors.player2Score && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.player2Score}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="match-date">Match Date & Time</Label>
              <Input 
                id="match-date"
                type="text"
                value={new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()}
                disabled
                className="bg-slate-50"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
            <h3 className="font-medium mb-1">Results are Final</h3>
            <p className="text-sm text-blue-700">
              Once you save this match result, it will be permanently recorded and added to the leaderboard.
            </p>
          </div>

          <div className="mt-4">
            <div className="auto-save-badge inline-flex">
              <Check className="h-3 w-3" /> Data auto-saved
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        {showScoreForm ? (
          <Button 
            onClick={handleSaveScore}
            className="fifa-button"
          >
            Save Result <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate('/add-players')}
          >
            Change Players
          </Button>
        )}
      </div>
    </div>
  );
};

export default MatchSetup;
