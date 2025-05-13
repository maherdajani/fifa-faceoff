
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Home } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const MatchResult: React.FC = () => {
  const location = useLocation();
  const { matchId } = location.state || { matchId: null };
  const { matchResults } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();

  const match = matchResults.find(m => m.id === matchId);

  useEffect(() => {
    // Validate that we have a valid match
    if (!matchId || !match) {
      toast({
        title: "Match Not Found",
        description: "The match you're looking for doesn't exist or has been removed.",
        variant: "destructive"
      });
      
      // Small delay to ensure toast is seen before redirecting
      const timer = setTimeout(() => {
        navigate('/');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [matchId, match, navigate, toast]);

  if (!match) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="fifa-card">
          <h2 className="text-lg font-medium mb-4">Match Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The match you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || '';
  };

  const winner = match.player1Score > match.player2Score ? match.player1 : 
                match.player2Score > match.player1Score ? match.player2 : null;
  
  const goalDifference = Math.abs(match.player1Score - match.player2Score);

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold flex-1">Match Result</h1>
      </div>

      <Badge variant="outline" className="mb-4">
        {match.gameSessionName}
      </Badge>
      
      <div className="fifa-card mb-6">
        {winner && (
          <div className="bg-fifa-blue text-white p-3 rounded-md mb-4 text-center">
            {winner.name} wins by {goalDifference} goal{goalDifference !== 1 ? 's' : ''}!
          </div>
        )}
        {!winner && (
          <div className="bg-fifa-blue text-white p-3 rounded-md mb-4 text-center">
            It's a draw!
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center">
            <Avatar className="h-16 w-16 mb-2">
              {match.player1?.photoUrl ? (
                <img src={match.player1.photoUrl} alt={match.player1.name} />
              ) : (
                <AvatarFallback className="text-xl bg-fifa-blue text-white">
                  {getInitials(match.player1?.name || '')}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm">{match.player1?.name}</span>
            <span className="text-3xl font-bold mt-2">{match.player1Score}</span>
          </div>

          <div className="vs-badge">
            vs
          </div>

          <div className="flex flex-col items-center">
            <Avatar className="h-16 w-16 mb-2">
              {match.player2?.photoUrl ? (
                <img src={match.player2.photoUrl} alt={match.player2.name} />
              ) : (
                <AvatarFallback className="text-xl bg-fifa-blue text-white">
                  {getInitials(match.player2?.name || '')}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm">{match.player2?.name}</span>
            <span className="text-3xl font-bold mt-2">{match.player2Score}</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-4">
          <h3 className="font-medium mb-1">Match Status</h3>
          <p className="text-sm text-green-700">
            This match has been recorded and added to the leaderboard.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Match Date</p>
            <p className="font-medium">{match.date}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Match Time</p>
            <p className="font-medium">{match.time}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={() => navigate('/')}
          className="fifa-button-secondary"
        >
          <Home className="mr-2 h-4 w-4" /> Return to Home
        </Button>
      </div>
    </div>
  );
};

export default MatchResult;
