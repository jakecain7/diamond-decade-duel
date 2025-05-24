
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type Game = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
};

const Dashboard = () => {
  const { user, loading, profile } = useAuth();
  
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
  
  // Show empty state if no games are available from the database
  if (!gamesLoading && (!games || games.length === 0)) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] p-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#1d3557] mb-4">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}!
          </h1>
          <div className="bg-white p-10 rounded-lg shadow-sm border border-[#1d3557]/10">
            <Gamepad2 className="h-16 w-16 text-[#e76f51]/40 mx-auto mb-4" />
            <p className="text-xl text-[#1d3557]/80">
              No games available yet. Check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1d3557]">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}!
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
            {games?.map((game) => (
              <Card key={game.id} className={`bg-white border-[#1d3557]/10 shadow-sm hover:shadow transition-shadow ${!['higher-lower-hr', 'midsummer-duel', 'bag-n-bomb-battle'].includes(game.slug) ? 'opacity-90' : ''}`}>
                <AspectRatio ratio={16/9} className="rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-[#e76f51]/10 flex items-center justify-center">
                    {game.slug === "higher-lower-hr" && (
                      <img 
                        src="/lovable-uploads/0db4250d-fe29-4220-adf2-6f7a9f5f0044.png" 
                        alt="Dinger Duel"
                        className="w-full h-auto max-h-full object-contain" 
                      />
                    )}
                    {game.slug === "midsummer-duel" && (
                      <img 
                        src="/lovable-uploads/ec3533b3-68ac-46fc-9168-ed0611c2c7b2.png" 
                        alt="Midsummer Duel"
                        className="w-full h-auto max-h-full object-contain" 
                      />
                    )}
                    {game.slug === "bag-n-bomb-battle" && (
                      <img 
                        src="/lovable-uploads/b63d544e-4e14-4a3a-999a-41d36b08c8e6.png" 
                        alt="Bag'n Bomb Battle"
                        className="w-full h-auto max-h-full object-contain" 
                      />
                    )}
                    {!['higher-lower-hr', 'midsummer-duel', 'bag-n-bomb-battle'].includes(game.slug) && (game.thumbnail_url ? (
                      <img 
                        src={game.thumbnail_url} 
                        alt={game.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Gamepad2 className="h-16 w-16 text-[#e76f51]/40" />
                    ))}
                  </div>
                </AspectRatio>
                <CardHeader>
                  <CardTitle>
                    {game.slug === "higher-lower-hr" ? "Dinger Duel" : game.name}
                  </CardTitle>
                  {!['higher-lower-hr', 'midsummer-duel', 'bag-n-bomb-battle'].includes(game.slug) && (
                    <CardDescription className="text-[#1d3557]/60">
                      Coming Soon
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#1d3557]/80">
                    {game.slug === "higher-lower-hr" 
                      ? "Guess if players have more or fewer career home runs. How many can you get right in a row?" 
                      : game.slug === "midsummer-duel"
                      ? "Guess if players have more or fewer career All-Star selections. Test your knowledge of baseball's elite!"
                      : game.slug === "bag-n-bomb-battle"
                      ? "Higher or Lower: Career HR + SB. Who's the ultimate power-speed threat?"
                      : (game.description || "Experience the excitement of this fantastic game!")}
                  </p>
                  {['higher-lower-hr', 'midsummer-duel', 'bag-n-bomb-battle'].includes(game.slug) && (
                    <p className="text-xs text-[#1d3557]/60 mt-2 italic">
                      *Stats updated through 2023
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  {['higher-lower-hr', 'midsummer-duel', 'bag-n-bomb-battle'].includes(game.slug) ? (
                    <Button 
                      className="w-full bg-[#e76f51] hover:bg-[#e76f51]/90 text-white"
                      onClick={() => {
                        window.location.href = `/games/${game.slug}`;
                      }}
                    >
                      Play Now
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-gray-300 text-gray-700 cursor-not-allowed flex items-center justify-center gap-2"
                      disabled
                    >
                      <Clock size={18} /> Coming Soon
                    </Button>
                  )}
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
