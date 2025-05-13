
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useGame } from '@/context/GameContext';
import { ArrowLeft, Trophy, Star, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LeaderboardView: React.FC = () => {
  const { players } = useGame();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'wins' | 'winRate' | 'matches'>('wins');

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'wins') return b.wins - a.wins;
    if (sortBy === 'winRate') return b.winRate - a.winRate;
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
        }}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="most-wins">Most Wins</TabsTrigger>
            <TabsTrigger value="best-rate">Best Win Rate</TabsTrigger>
            <TabsTrigger value="most-matches">Most Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="most-wins" className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center p-3 bg-white rounded-lg border border-slate-100">
                <div className={`w-8 h-8 ${getMedalColor(index)} rounded-full flex items-center justify-center text-white font-bold mr-3`}>
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10 mr-3">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} />
                  ) : (
                    <AvatarFallback className="text-sm bg-fifa-blue text-white">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{player.name}</div>
                  <div className="text-xs text-muted-foreground">{player.matchesPlayed} matches</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{player.wins} wins</div>
                  <div className="text-xs text-green-600">{Math.round(player.winRate * 100)}% win rate</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="best-rate" className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center p-3 bg-white rounded-lg border border-slate-100">
                <div className={`w-8 h-8 ${getMedalColor(index)} rounded-full flex items-center justify-center text-white font-bold mr-3`}>
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10 mr-3">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} />
                  ) : (
                    <AvatarFallback className="text-sm bg-fifa-blue text-white">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{player.name}</div>
                  <div className="text-xs text-muted-foreground">{player.matchesPlayed} matches</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{Math.round(player.winRate * 100)}%</div>
                  <div className="text-xs">{player.wins} wins</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="most-matches" className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center p-3 bg-white rounded-lg border border-slate-100">
                <div className={`w-8 h-8 ${getMedalColor(index)} rounded-full flex items-center justify-center text-white font-bold mr-3`}>
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10 mr-3">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} />
                  ) : (
                    <AvatarFallback className="text-sm bg-fifa-blue text-white">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{player.name}</div>
                  <div className="text-xs text-green-600">{Math.round(player.winRate * 100)}% win rate</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{player.matchesPlayed} matches</div>
                  <div className="text-xs">{player.wins} wins</div>
                </div>
              </div>
            ))}
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
