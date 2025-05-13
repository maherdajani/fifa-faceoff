
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Trophy, Clock } from "lucide-react";

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="fifa-card mb-8">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 rounded-full bg-fifa-blue flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-fifa-dark">FIFA Score Tracker</h1>
          <p className="text-muted-foreground mt-2">Track your FIFA challenges globally</p>
        </div>

        <div className="fifa-card bg-white p-6 my-4">
          <h2 className="text-xl font-bold mb-4 text-center">Welcome to FIFA Score Tracker!</h2>
          <p className="text-center text-muted-foreground mb-4">Let's get you started with a quick tour</p>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fifa-blue flex items-center justify-center text-white">1</div>
              <div>
                <p className="font-medium">Start a new game and add players to track your FIFA matches</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fifa-blue flex items-center justify-center text-white">2</div>
              <div>
                <p className="font-medium">Both players must confirm scores to ensure fair play</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fifa-blue flex items-center justify-center text-white">3</div>
              <div>
                <p className="font-medium">Track your progress on the global leaderboard</p>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full mt-6 fifa-button"
            onClick={() => navigate('/new-game')}
          >
            Get Started
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-fifa-blue" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">See who's on top of the global rankings</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/leaderboard')}
            >
              View Leaderboard
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-fifa-blue" />
              Past Games
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">Review your previous match results</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/past-games')}
            >
              View Past Games
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <div className="rounded-lg border p-3 text-sm flex items-center gap-2 bg-blue-50 text-blue-700">
          <Check className="h-4 w-4" />
          <p>Scores are confirmed by both players and locked in the global leaderboard</p>
        </div>
      </div>
      
      <footer className="mt-10 text-center text-xs text-muted-foreground">
        <p>Created by The King Maheroosh</p>
      </footer>
    </div>
  );
};

export default HomeScreen;
