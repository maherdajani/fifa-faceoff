
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MatchResult, GameSession } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const SessionView: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { gameSessions, matchResults, getPlayer } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<GameSession | null>(null);
  const [sessionMatches, setSessionMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    if (sessionId) {
      const foundSession = gameSessions.find(s => s.id === sessionId);
      
      if (foundSession) {
        setSession(foundSession);
        const matches = matchResults.filter(match => match.gameSessionId === sessionId);
        setSessionMatches(matches);
      } else {
        toast({
          title: "Session Not Found",
          description: "The game session you're looking for doesn't exist.",
          variant: "destructive"
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/past-games');
        }, 1500);
      }
    }
  }, [sessionId, gameSessions, matchResults, navigate, toast]);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!session) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate('/past-games')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-bold flex-1">Session Details</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <p>Loading session details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate('/past-games')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold flex-1">Session Details</h1>
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <Badge variant="outline" className="text-lg">{session.name}</Badge>
        <p className="text-sm text-muted-foreground">Last played: {formatDate(session.lastPlayed)}</p>
      </div>
      
      <div className="space-y-6">
        {sessionMatches.length > 0 ? (
          sessionMatches.map((match) => {
            const winner = match.player1Score > match.player2Score ? match.player1 : 
                          match.player2Score > match.player1Score ? match.player2 : null;
            
            return (
              <Card key={match.id} className="bg-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">{match.date} • {match.time}</p>
                    {winner && <Badge>{winner.name} won</Badge>}
                    {!winner && <Badge variant="outline">Draw</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-12 w-12 mb-2">
                        {match.player1?.photoUrl ? (
                          <img src={match.player1.photoUrl} alt={match.player1.name} />
                        ) : (
                          <AvatarFallback className="bg-fifa-blue text-white">
                            {getInitials(match.player1?.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm">{match.player1?.name}</span>
                      <span className="text-xl font-bold mt-1">{match.player1Score}</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      VS
                    </div>

                    <div className="flex flex-col items-center">
                      <Avatar className="h-12 w-12 mb-2">
                        {match.player2?.photoUrl ? (
                          <img src={match.player2.photoUrl} alt={match.player2.name} />
                        ) : (
                          <AvatarFallback className="bg-fifa-blue text-white">
                            {getInitials(match.player2?.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm">{match.player2?.name}</span>
                      <span className="text-xl font-bold mt-1">{match.player2Score}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => navigate('/match-result', { state: { matchId: match.id } })}
                  >
                    View Full Details
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="fifa-card text-center py-8">
            <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
            <p className="text-muted-foreground">This session doesn't have any recorded matches</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionView;
