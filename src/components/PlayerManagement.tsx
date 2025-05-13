
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from '@/context/GameContext';
import { Check, ArrowLeft, ArrowRight, Search, User, Camera } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types';

const PlayerManagement: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { players, addPlayer, currentGameSession } = useGame();
  const navigate = useNavigate();

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedPlayers.some(p => p.id === player.id)
  );

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;
    
    try {
      const newPlayer = await addPlayer({ name: playerName });
      setSelectedPlayers([...selectedPlayers, newPlayer]);
      setPlayerName('');
    } catch (error) {
      console.error("Failed to add player:", error);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayers([...selectedPlayers, player]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleContinue = () => {
    if (selectedPlayers.length < 2) {
      return;
    }
    navigate('/match-setup', { state: { selectedPlayers } });
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate('/new-game')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold flex-1">Add Players</h1>
      </div>

      {currentGameSession && (
        <Badge variant="outline" className="mb-4">
          {currentGameSession.name}
        </Badge>
      )}
      
      <div className="fifa-card mb-6">
        <h2 className="text-lg font-medium mb-2">Quick Add</h2>
        
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="border rounded-md bg-slate-50">
          <div className="flex overflow-x-auto py-4 px-2 gap-3">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.slice(0, 6).map((player) => (
                <div 
                  key={player.id}
                  className="flex flex-col items-center min-w-[4rem] cursor-pointer"
                  onClick={() => handleSelectPlayer(player)}
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
              <div className="w-full text-center py-3 text-sm text-muted-foreground">
                No players found
              </div>
            )}
          </div>
          
          <div className="flex border-t px-3 py-2 justify-around">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
            >
              Contacts
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
            >
              Email
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
            >
              Share
            </Button>
          </div>
        </div>
      </div>
      
      <div className="fifa-card mb-6">
        <h2 className="text-lg font-medium mb-4">Players</h2>
        
        {selectedPlayers.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">
              {selectedPlayers.length} added
            </div>
            <div className="space-y-2">
              {selectedPlayers.map(player => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                >
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
                    <span className="text-sm">{player.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemovePlayer(player.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Enter player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleAddPlayer}
            disabled={!playerName.trim()}
          >
            Add
          </Button>
        </div>

        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
          >
            <User className="h-3 w-3 mr-1" /> Upload Photo
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
          >
            <Camera className="h-3 w-3 mr-1" /> Take Photo
          </Button>
        </div>

        <div className="mt-4">
          <div className="auto-save-badge inline-flex">
            <Check className="h-3 w-3" /> Progress auto-saved
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleContinue}
          className="fifa-button w-full"
          disabled={selectedPlayers.length < 2}
        >
          Continue to Match Setup <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlayerManagement;
