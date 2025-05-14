
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player } from '@/types';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get all player matchups for the summary view
  const getPlayerMatchups = (): PlayerMatchup[] => {
    if (!players.length) return [];
    
    const matchups: PlayerMatchup[] = [];
    
    // If a specific player is selected, only show their matchups
    if (selectedPlayer && selectedPlayer !== "all") {
      const selectedPlayerObj = players.find(p => p.id === selectedPlayer);
      
      if (!selectedPlayerObj) return [];
      
      // Find all matchups for this player with every other player
      players.forEach(opponent => {
        if (opponent.id === selectedPlayer) return; // Skip self matchup
        
        // Find all matches between these two players
        const headToHeadMatches = matchResults.filter(match => 
          (match.player1.id === selectedPlayer && match.player2.id === opponent.id) ||
          (match.player1.id === opponent.id && match.player2.id === selectedPlayer)
        );
        
        if (headToHeadMatches.length === 0) return; // Skip if no matches
        
        let player1Wins = 0;
        let player2Wins = 0;
        let draws = 0;
        
        headToHeadMatches.forEach(match => {
          if (match.player1.id === selectedPlayer) {
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
          player1: selectedPlayerObj,
          player2: opponent,
          player1Wins,
          player2Wins,
          draws,
          totalMatches: headToHeadMatches.length
        });
      });
      
      // Sort by total matches
      return matchups.sort((a, b) => b.totalMatches - a.totalMatches);
    }
    
    // Otherwise, create all possible player combinations
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

  // Get recent game sessions
  const getRecentSessions = () => {
    return [...gameSessions].sort((a, b) => {
      return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
    }).slice(0, 3);
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
      
      <Tabs defaultValue="summary">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="summary" className="flex-1">Player Summary</TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1">Recent Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="fifa-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Player vs Player Summary</h2>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="mb-4">
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All players</SelectItem>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>{player.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPlayer && selectedPlayer !== "all" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedPlayer("all")}
                className="mb-4"
              >
                Clear Filter
              </Button>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Players</TableHead>
                  <TableHead className="text-center">Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPlayerMatchups().map((matchup, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-between">
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
                        <span className="text-sm text-muted-foreground mx-2">vs</span>
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
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      ({matchup.player1Wins} - {matchup.player2Wins})
                      {matchup.draws > 0 && <span className="text-sm text-muted-foreground ml-1">{matchup.draws} draws</span>}
                    </TableCell>
                  </TableRow>
                ))}
                
                {getPlayerMatchups().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6">
                      <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium mb-1">No Matchups Found</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPlayer && selectedPlayer !== "all" ? "No matches found for this player" : "Start playing to see player matchups"}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
        </TabsContent>
        
        <TabsContent value="sessions">
          <div className="space-y-6">
            {getRecentSessions().map((session) => {
              const sessionMatches = matchResults.filter(match => match.gameSessionId === session.id);
              const matchCount = sessionMatches.length;
              if (matchCount === 0) return null;
              
              return (
                <Card key={session.id} className="bg-white">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium">{session.name}</h2>
                      <div className="text-sm text-muted-foreground">{matchCount} matches</div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last played: {formatDate(session.lastPlayed)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Separator className="my-2" />
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center"
                      onClick={() => navigate(`/session/${session.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}

            {getRecentSessions().filter(session => 
              matchResults.filter(match => match.gameSessionId === session.id).length > 0
            ).length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium mb-2">No Games Yet</h3>
                <p className="text-muted-foreground mb-4">Start playing to see your match history here</p>
                <Button onClick={() => navigate('/match-setup')}>
                  Record a Match
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PastGamesView;
