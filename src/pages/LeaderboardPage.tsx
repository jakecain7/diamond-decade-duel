
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Timespan = "all_time" | "today";
type GameSlug = "higher-lower-hr" | "midsummer-duel" | "bag-n-bomb-battle" | "forgotten-uniforms";

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
}

interface Game {
  slug: GameSlug;
  name: string;
  displayTitle: string;
}

const AVAILABLE_GAMES: Game[] = [
  {
    slug: "higher-lower-hr",
    name: "Dinger Duel",
    displayTitle: "Dinger Duel"
  },
  {
    slug: "midsummer-duel", 
    name: "Midsummer Duel",
    displayTitle: "Midsummer Duel"
  },
  {
    slug: "bag-n-bomb-battle",
    name: "Bag 'n Bomb Battle",
    displayTitle: "Bag 'n Bomb Battle"
  },
  {
    slug: "forgotten-uniforms",
    name: "Forgotten Uniforms",
    displayTitle: "Forgotten Uniforms"
  }
];

const LeaderboardPage = () => {
  const limit = 25; // Show top 25 scores
  const [selectedGame, setSelectedGame] = useState<GameSlug>("higher-lower-hr");
  const [timespan, setTimespan] = useState<Timespan>("all_time");

  const currentGame = AVAILABLE_GAMES.find(game => game.slug === selectedGame);

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ["leaderboard", selectedGame, limit, timespan],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-game-leaderboard", {
        body: { gameSlug: selectedGame, limit, timespan },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      return data as LeaderboardEntry[];
    }
  });

  // Map timespans to display titles
  const timespanTitles = {
    all_time: "All-Time High Scores",
    today: "Today's High Scores"
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-baseball-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-baseball-green text-center mb-6">
          <Trophy className="inline-block mr-2 h-8 w-8 text-baseball-red" />
          Game Leaderboards
        </h1>

        {/* Game Selector */}
        <div className="mb-6">
          <Tabs 
            value={selectedGame} 
            onValueChange={(value) => setSelectedGame(value as GameSlug)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-baseball-green/10 h-12">
              {AVAILABLE_GAMES.map((game) => (
                <TabsTrigger 
                  key={game.slug}
                  value={game.slug}
                  className="data-[state=active]:bg-baseball-green data-[state=active]:text-white data-[state=inactive]:text-baseball-green font-semibold text-xs sm:text-sm"
                >
                  {game.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Card className="bg-white shadow-md">
          <CardHeader className="border-b border-baseball-green/10 bg-baseball-green/5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <CardTitle className="text-xl text-baseball-green font-semibold">
                {currentGame?.displayTitle} - {timespanTitles[timespan]}
              </CardTitle>
              
              {/* Timespan Selector */}
              <Tabs 
                value={timespan} 
                onValueChange={(value) => setTimespan(value as Timespan)}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2 sm:w-[200px] bg-baseball-green/10">
                  <TabsTrigger 
                    value="all_time"
                    className="data-[state=active]:bg-baseball-green data-[state=active]:text-white data-[state=inactive]:text-baseball-green"
                  >
                    All-Time
                  </TabsTrigger>
                  <TabsTrigger 
                    value="today"
                    className="data-[state=active]:bg-baseball-green data-[state=active]:text-white data-[state=inactive]:text-baseball-green"
                  >
                    Today
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-baseball-green" />
                <span className="ml-2 text-baseball-green">Loading leaderboard...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-baseball-red">
                Failed to load leaderboard data. Please try again later.
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-baseball-green/5 hover:bg-baseball-green/5">
                    <TableHead className="w-16 text-center font-bold text-baseball-green">Rank</TableHead>
                    <TableHead className="font-bold text-baseball-green">Player</TableHead>
                    <TableHead className="text-right font-bold text-baseball-green">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map(entry => (
                    <TableRow key={entry.rank} className="hover:bg-baseball-green/5">
                      <TableCell className="font-medium text-center">
                        {entry.rank === 1 ? (
                          <span className="text-baseball-tan font-bold">🏆 {entry.rank}</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-gray-500 font-bold">🥈 {entry.rank}</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-amber-700 font-bold">🥉 {entry.rank}</span>
                        ) : (
                          <span className="text-baseball-green">#{entry.rank}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-baseball-green">{entry.playerName}</TableCell>
                      <TableCell className="text-right font-medium text-baseball-green">{entry.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-baseball-green/70">
                No scores yet for {currentGame?.name} {timespan === 'all_time' ? 'all time' : 'today'}! Be the first to play and set a high score.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardPage;
