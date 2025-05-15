import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Trophy, Clock } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const basePath = import.meta.env.MODE === 'development' ? '' : '/fifa-faceoff';

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="fifa-card mb-8">
        <div className="flex flex-col items-center justify-center py-6">
          <h1 className="text-3xl font-bold text-fifa-dark">FIFA Score Tracker</h1>
          <p className="text-muted-foreground mt-2">Track your FIFA challenges</p>
        </div>

        <div className="text-center my-4">
          <AspectRatio ratio={16/9} className="bg-black/5 rounded-md overflow-hidden mb-4">
            <img 
              src={`${basePath}/lovable-uploads/9935447e-9e1d-4a69-87da-5621e193119f.png`}
              alt="FIFA World Cup Trophy" 
              className="object-contain h-full w-full"
            />
          </AspectRatio>
        </div>

        <div className="flex justify-center my-6">
          <Button 
            className="w-full max-w-xs h-16 text-lg fifa-button"
            onClick={() => navigate('/add-players')}
          >
            <Trophy className="h-6 w-6 mr-2" /> Add Score
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
          <p>Scores are automatically added to the global leaderboard</p>
        </div>
      </div>
      
      <footer className="mt-10 text-center text-xs text-muted-foreground">
        <p>Created by The King Maheroosh</p>
      </footer>
    </div>
  );
};

export default HomeScreen;
