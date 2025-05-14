
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy, Star, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const LeaderboardView: React.FC = () => {
  const { players, matchResults } = useGame();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'wins' | 'winRate' | 'matches' | 'goalsScored'>('wins');

  // Calculate additional stats for each player
  const playersWithStats = players.map(player => {
    const playerMatches = matchResults.filter(match => 
      match.player1.id === player.id || match.player2.id === player.id
    );
    
    let goalsScored = 0;
    let goalsConceded = 0;
    
    playerMatches.forEach(match => {
      if (match.player1.id === player.id) {
        goalsScored += match.player1Score;
        goalsConceded += match.player2Score;
      } else {
        goalsScored += match.player2Score;
        goalsConceded += match.player1Score;
      }
    });
    
    return {
      ...player,
      goalsScored,
      goalsConceded
    };
  });

  const sortedPlayers = [...playersWithStats].sort((a, b) => {
    if (sortBy === 'wins') return b.wins - a.wins;
    if (sortBy === 'winRate') return b.winRate - a.winRate;
    if (sortBy === 'goalsScored') return b.goalsScored - a.goalsScored;
    return b.matchesPlayed - a.matchesPlayed;
  });

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return "bg-yellow-500";
    if (index === 1) return "bg-slate-400";
    if (index === 2) return "bg-amber-700";
    return "bg-slate-200";
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
        <h1 className="text-xl font-bold flex-1">Global Leaderboard</h1>
      </div>
      
      <div className="fifa-card mb-6">
        <Tabs defaultValue="most-wins" onValueChange={(value) => {
          if (value === 'most-wins') setSortBy('wins');
          if (value === 'best-rate') setSortBy('winRate');
          if (value === 'most-matches') setSortBy('matches');
          if (value === 'goals-scored') setSortBy('goalsScored');
        }}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="most-wins">Wins</TabsTrigger>
            <TabsTrigger value="best-rate">Win Rate</TabsTrigger>
            <TabsTrigger value="goals-scored">Goals</TabsTrigger>
            <TabsTrigger value="most-matches">Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="most-wins">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">W</TableHead>
                  <TableHead className="text-right">L</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className={`w-8 h-8 ${getMedalColor(index)} rounded-full flex items-center justify-center text-white font-bold`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt={player.name} />
                        ) : (
                          <AvatarFallback className="text-sm bg-fifa-blue text-white">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{player.name}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold">{player.wins}</TableCell>
                    <TableCell className="text-right">{player.losses}</TableCell>
                    <TableCell className="text-right">{Math.round(player.winRate * 100)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="best-rate">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                  <TableHead className="text-right">W</TableHead>
                  <TableHead className="text-right">L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className={`w-8 h-8 ${getMedalColor(index)} rounded-full flex items-center justify-center text-white font-bold`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt={player.name} />
                        ) : (
                          <AvatarFallback className="text-sm bg-fifa-blue text-white">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{player.name}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold">{Math.round(player.winRate * 100)}%</TableCell>
                    <TableCell className="text-right">{player.wins}</TableCell>
                    <TableCell className="text-right">{player.losses}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="goals-scored">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">GF</TableHead>
                  <TableHead className="text-right">GA</TableHead>
                  <TableHead className="text-right">GD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className={`w-8 h-8 ${getMedalColor(index)} rounded-full flex items-center justify-center text-white font-bold`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt={player.name} />
                        ) : (
                          <AvatarFallback className="text-sm bg-fifa-blue text-white">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{player.name}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold">{player.goalsScored}</TableCell>
                    <TableCell className="text-right">{player.goalsConceded}</TableCell>
                    <TableCell className="text-right">{player.goalDifference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="most-matches">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Matches</TableHead>
                  <TableHead className="text-right">W</TableHead>
                  <TableHead className="text-right">L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className={`w-8 h-8 ${getMedalColor(index)} rounded-full flex items-center justify-center text-white font-bold`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt={player.name} />
                        ) : (
                          <AvatarFallback className="text-sm bg-fifa-blue text-white">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{player.name}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold">{player.matchesPlayed}</TableCell>
                    <TableCell className="text-right">{player.wins}</TableCell>
                    <TableCell className="text-right">{player.losses}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-center">
          <Badge className="bg-blue-50 border-blue-100 text-fifa-blue">
            <Check className="h-3 w-3 mr-1" /> Verified Results Only
          </Badge>
        </div>
        
        <p className="text-xs text-center mt-3 text-muted-foreground">
          All scores shown have been confirmed by both players and cannot be modified.
        </p>
      </div>
    </div>
  );
};

export default LeaderboardView;
