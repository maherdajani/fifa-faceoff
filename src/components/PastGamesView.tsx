
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GameSession } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PastGamesView: React.FC = () => {
  const { gameSessions, matchResults, players } = useGame();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getSortedSessions = () => {
    return [...gameSessions].sort((a, b) => {
      return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
    });
  };

  const getMatchesForSession = (session: GameSession) => {
    return matchResults.filter(match => match.gameSessionId === session.id);
  };

  const getPlayerStats = (sessionId: string, playerId: string) => {
    const sessionMatches = matchResults.filter(match => match.gameSessionId === sessionId);
    const playerMatches = sessionMatches.filter(match => 
      match.player1.id === playerId || match.player2.id === playerId
    );
    
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let goalDifference = 0;
    
    playerMatches.forEach(match => {
      const isPlayer1 = match.player1.id === playerId;
      const playerScore = isPlayer1 ? match.player1Score : match.player2Score;
      const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
      
      if (playerScore > opponentScore) wins++;
      else if (playerScore < opponentScore) losses++;
      else draws++;
      
      goalDifference += isPlayer1 
        ? (match.player1Score - match.player2Score)
        : (match.player2Score - match.player1Score);
    });
    
    return { wins, losses, draws, goalDifference };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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
        <h1 className="text-xl font-bold flex-1">Past Games</h1>
      </div>
      
      <div className="space-y-6">
        {getSortedSessions().map((session) => {
          const sessionMatches = getMatchesForSession(session);
          const matchCount = sessionMatches.length;
          if (matchCount === 0) return null;
          
          // Find all unique players in this session
          const playerIds = new Set<string>();
          sessionMatches.forEach(match => {
            playerIds.add(match.player1.id);
            playerIds.add(match.player2.id);
          });
          
          return (
            <Card key={session.id} className="bg-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">{session.name}</h2>
                  <Badge variant="outline">{matchCount} matches</Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> Last played: {formatDate(session.lastPlayed)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(playerIds).slice(0, 2).map(playerId => {
                    const player = players.find(p => p.id === playerId);
                    if (!player) return null;
                    
                    const stats = getPlayerStats(session.id, playerId);
                    
                    return (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            {player.photoUrl ? (
                              <img src={player.photoUrl} alt={player.name} />
                            ) : (
                              <AvatarFallback className="bg-fifa-blue text-white">
                                {getInitials(player.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>{player.name}</span>
                        </div>
                        <div className="text-sm">
                          W: {stats.wins} | L: {stats.losses} | GD: {stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Separator className="my-4" />
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  View Details <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {getSortedSessions().filter(session => getMatchesForSession(session).length > 0).length === 0 && (
          <div className="fifa-card text-center py-10">
            <h3 className="text-lg font-medium mb-2">No Games Yet</h3>
            <p className="text-muted-foreground mb-4">Start playing to see your match history here</p>
            <Button onClick={() => navigate('/new-game')}>
              Start a New Game
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-4">Overall Statistics</h2>
        
        <div className="grid gap-4 grid-cols-2">
          {players.slice(0, 4).map(player => {
            return (
              <Card key={player.id} className="bg-white">
                <CardContent className="pt-4">
                  <div className="flex items-center mb-3">
                    <Avatar className="h-8 w-8 mr-2">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} />
                      ) : (
                        <AvatarFallback className="bg-fifa-blue text-white">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>{player.name}</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">{player.wins} wins</div>
                  <div className="text-sm text-muted-foreground">
                    {player.matchesPlayed} games played
                  </div>
                  <div className="text-sm mt-1">
                    GD: {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PastGamesView;
