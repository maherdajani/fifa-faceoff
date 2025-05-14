import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from '@/context/GameContext';
import { Check, ArrowLeft, ArrowRight, User, Camera } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Player } from '@/types';
import { useToast } from "@/hooks/use-toast";

const PlayerManagement: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const { players, addPlayer, currentGameSession } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;
    
    try {
      const newPlayer = await addPlayer({ 
        name: playerName,
        photoUrl: playerPhoto || undefined
      });
      setSelectedPlayers([...selectedPlayers, newPlayer]);
      setPlayerName('');
      setPlayerPhoto(null);
      toast({
        title: "Player Added",
        description: `${playerName} has been added successfully.`
      });
    } catch (error) {
      console.error("Failed to add player:", error);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    // Only add player if they're not already selected
    if (!selectedPlayers.some(p => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target?.result) {
          setPlayerPhoto(event.target.result as string);
        }
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
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
        <h1 className="text-xl font-bold flex-1">Select Players</h1>
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

        <div className="space-y-4">
          {playerPhoto && (
            <div className="flex justify-center mb-2">
              <Avatar className="h-20 w-20">
                <img src={playerPhoto} alt="Player preview" />
              </Avatar>
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
        </div>

        {/* Existing players list */}
        {players.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Saved Players</h3>
            <div className="grid grid-cols-3 gap-2">
              {players.map((player) => (
                <div 
                  key={player.id}
                  className={`flex flex-col items-center p-2 rounded-md cursor-pointer ${
                    selectedPlayers.some(p => p.id === player.id) ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
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
                  <span className="text-xs text-center">{player.name}</span>
                  {selectedPlayers.some(p => p.id === player.id) && (
                    <Check className="h-4 w-4 text-green-500 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              type="button"
            >
              <User className="h-3 w-3 mr-1" /> Upload Photo
            </Button>
          </label>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              type="button"
            >
              <Camera className="h-3 w-3 mr-1" /> Take Photo
            </Button>
          </label>
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
