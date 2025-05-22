
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Game = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  
  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*");
      
      if (error) throw error;
      return data as Game[];
    }
  });
  
  // Redirect to home if not authenticated
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }
  
  // Show placeholder games if no games are available from the database yet
  const placeholderGames = [
    {
      id: "placeholder-1",
      name: "Double-Play Grid",
      description: "Baseball puzzle game with daily challenges",
      slug: "double-play-grid",
      thumbnail_url: null
    },
    {
      id: "placeholder-2",
      name: "Game 1: Coming Soon!",
      description: "Our next exciting game is currently in development",
      slug: "coming-soon-1",
      thumbnail_url: null
    },
    {
      id: "placeholder-3",
      name: "Placeholder Game",
      description: "Another amazing game experience we're working on",
      slug: "placeholder",
      thumbnail_url: null
    }
  ];
  
  const displayGames = games && games.length > 0 ? games : placeholderGames;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1d3557]">
            Welcome{user ? `, ${user.email?.split('@')[0]}` : ""}!
          </h1>
          <p className="mt-2 text-[#1d3557]/80">
            Choose a game to play from the options below.
          </p>
        </div>

        {gamesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-[#1d3557]/10 shadow-sm animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-12 bg-gray-100 rounded"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayGames.map((game) => (
              <Card key={game.id} className="bg-white border-[#1d3557]/10 shadow-sm hover:shadow transition-shadow">
                <div className="h-40 bg-[#e76f51]/10 flex items-center justify-center rounded-t-lg">
                  {game.thumbnail_url ? (
                    <img 
                      src={game.thumbnail_url} 
                      alt={game.name} 
                      className="h-full w-full object-cover rounded-t-lg" 
                    />
                  ) : (
                    <Gamepad2 className="h-16 w-16 text-[#e76f51]/40" />
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{game.name}</CardTitle>
                  <CardDescription className="text-[#1d3557]/60">
                    {game.slug === "double-play-grid" ? "Daily Puzzle" : "Coming Soon"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#1d3557]/80">
                    {game.description || "Experience the excitement of this fantastic game!"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-[#e76f51] hover:bg-[#e76f51]/90 text-white"
                    onClick={() => {
                      if (game.slug === "double-play-grid") {
                        window.location.href = "/grid/today";
                      }
                    }}
                  >
                    {game.slug === "double-play-grid" ? "Play Now" : "Coming Soon"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
