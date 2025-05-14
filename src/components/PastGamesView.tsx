import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Calendar, Clock, ChevronRight, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GameSession, Player } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlayerMatchup {
  player1: Player;
  player2: Player;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  totalMatches: number;
}

const PastGamesView: React.FC = () => {
  const { gameSessions, matchResults, players } = useGame();
  const navigate = useNavigate();
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>("");
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>("");

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

  // Create a list of player matchups (player vs player records)
  const getPlayerMatchups = (): PlayerMatchup[] => {
    if (!players.length) return [];
    
    const matchups: PlayerMatchup[] = [];
    
    // If specific players are selected, only show their matchup
    if (selectedPlayer1 && selectedPlayer2) {
      const player1 = players.find(p => p.id === selectedPlayer1);
      const player2 = players.find(p => p.id === selectedPlayer2);
      
      if (!player1 || !player2) return [];
      
      // Find all matches between these two players
      const headToHeadMatches = matchResults.filter(match => 
        (match.player1.id === player1.id && match.player2.id === player2.id) ||
        (match.player1.id === player2.id && match.player2.id === player1.id)
      );
      
      let player1Wins = 0;
      let player2Wins = 0;
      let draws = 0;
      
      headToHeadMatches.forEach(match => {
        if (match.player1.id === player1.id) {
          if (match.player1Score > match.player2Score) player1Wins++;
          else if (match.player1Score < match.player2Score) player2Wins++;
          else draws++;
        } else {
          if (match.player2Score > match.player1Score) player1Wins++;
          else if (match.player2Score < match.player1Score) player2Wins++;
          else draws++;
        }
      });
      
      matchups.push({
        player1,
        player2,
        player1Wins,
        player2Wins,
        draws,
        totalMatches: headToHeadMatches.length
      });
      
      return matchups;
    }
    
    // Otherwise, show all matchups
    // Create all possible player combinations
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i];
        const player2 = players[j];
        
        // Find all matches between these two players
        const headToHeadMatches = matchResults.filter(match => 
          (match.player1.id === player1.id && match.player2.id === player2.id) ||
          (match.player1.id === player2.id && match.player2.id === player1.id)
        );
        
        if (headToHeadMatches.length === 0) continue;
        
        let player1Wins = 0;
        let player2Wins = 0;
        let draws = 0;
        
        headToHeadMatches.forEach(match => {
          if (match.player1.id === player1.id) {
            if (match.player1Score > match.player2Score) player1Wins++;
            else if (match.player1Score < match.player2Score) player2Wins++;
            else draws++;
          } else {
            if (match.player2Score > match.player1Score) player1Wins++;
            else if (match.player2Score < match.player1Score) player2Wins++;
            else draws++;
          }
        });
        
        matchups.push({
          player1,
          player2,
          player1Wins,
          player2Wins,
          draws,
          totalMatches: headToHeadMatches.length
        });
      }
    }
    
    // Sort by most matches played
    return matchups.sort((a, b) => b.totalMatches - a.totalMatches);
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
      
      <Tabs defaultValue="sessions">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="sessions" className="flex-1">Game Sessions</TabsTrigger>
          <TabsTrigger value="matchups" className="flex-1">Player Matchups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions">
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
        </TabsContent>
        
        <TabsContent value="matchups">
          <div className="fifa-card mb-6">
            <h2 className="text-lg font-medium mb-4">Player vs Player Stats</h2>
            
            <div className="flex flex-col space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Select value={selectedPlayer1} onValueChange={setSelectedPlayer1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player 1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All players</SelectItem>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={selectedPlayer2} onValueChange={setSelectedPlayer2} 
                     disabled={!selectedPlayer1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player 2" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All players</SelectItem>
                      {players
                        .filter(p => p.id !== selectedPlayer1)
                        .map(player => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedPlayer1 && !selectedPlayer2 && (
                <Button variant="outline" size="sm" onClick={() => setSelectedPlayer1("")}>
                  Clear Selection
                </Button>
              )}
              
              {selectedPlayer1 && selectedPlayer2 && (
                <Button variant="outline" size="sm" onClick={() => {
                  setSelectedPlayer1("");
                  setSelectedPlayer2("");
                }}>
                  Clear Both
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {getPlayerMatchups().map((matchup, index) => (
                <Card key={index} className="bg-white">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          {matchup.player1.photoUrl ? (
                            <img src={matchup.player1.photoUrl} alt={matchup.player1.name} />
                          ) : (
                            <AvatarFallback className="bg-fifa-blue text-white">
                              {getInitials(matchup.player1.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span>{matchup.player1.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span>vs</span>
                      </div>
                      <div className="flex items-center">
                        <span>{matchup.player2.name}</span>
                        <Avatar className="h-8 w-8 ml-2">
                          {matchup.player2.photoUrl ? (
                            <img src={matchup.player2.photoUrl} alt={matchup.player2.name} />
                          ) : (
                            <AvatarFallback className="bg-fifa-blue text-white">
                              {getInitials(matchup.player2.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-2">
                      <div className="font-bold">{matchup.player1Wins}</div>
                      <div className="text-muted-foreground">{matchup.draws} draws</div>
                      <div className="font-bold">{matchup.player2Wins}</div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-fifa-blue h-2.5 rounded-full" 
                        style={{ 
                          width: `${(matchup.player1Wins / matchup.totalMatches) * 100}%`,
                          marginLeft: `${(matchup.draws / matchup.totalMatches) * 100 / 2}%`
                        }}>
                      </div>
                    </div>
                    
                    <div className="text-xs text-center mt-2 text-muted-foreground">
                      {matchup.totalMatches} matches played
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {getPlayerMatchups().length === 0 && (
                <div className="text-center py-6">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">No Matchups Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlayer1 ? "Select a second player or clear the filter" : "Start playing to see player matchups"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
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
