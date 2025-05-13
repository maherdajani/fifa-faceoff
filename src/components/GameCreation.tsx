
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from '@/context/GameContext';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const GameCreation: React.FC = () => {
  const [gameName, setGameName] = useState('');
  const { createGameSession } = useGame();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameName.trim()) return;
    
    createGameSession(gameName);
    navigate('/add-players');
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
        <h1 className="text-xl font-bold flex-1">New Game</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="fifa-card mb-6">
          <h2 className="text-lg font-medium mb-2">Enter Game Name</h2>
          <p className="text-sm text-muted-foreground mb-4">What FIFA game are you playing?</p>
          
          <Input
            placeholder="e.g., FIFA 2025"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="mb-6"
          />

          <Card className="bg-blue-50 border-blue-100 mb-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-fifa-blue flex items-center mb-2">
                <div className="w-5 h-5 rounded-full bg-fifa-blue flex items-center justify-center mr-2">
                  <Check className="h-3 w-3 text-white" />
                </div>
                Game Name Tip
              </h3>
              <p className="text-xs text-slate-600">This helps you identify different game sessions</p>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-fifa-blue mr-2"></div>
                  <p className="text-xs">FIFA 2025</p>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-fifa-blue mr-2"></div>
                  <p className="text-xs">Weekend Tournament</p>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-fifa-blue mr-2"></div>
                  <p className="text-xs">Friday Night FIFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button 
            type="submit"
            className="fifa-button w-full"
            disabled={!gameName.trim()}
          >
            Continue to Add Players <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GameCreation;
