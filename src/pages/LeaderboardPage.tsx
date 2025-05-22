
import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
}

const LeaderboardPage = () => {
  const gameSlug = "higher-lower-hr";
  const limit = 25; // Show top 25 scores

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ["leaderboard", gameSlug, limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-game-leaderboard", {
        body: { gameSlug, limit },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      return data as LeaderboardEntry[];
    }
  });

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1d3557] text-center mb-2">
          Leaderboards
        </h1>

        <Card className="mt-6 bg-white shadow-md">
          <CardHeader className="border-b border-[#1d3557]/10 bg-[#1d3557]/5">
            <CardTitle className="text-xl text-[#1d3557] font-semibold">
              Dinger Duel - All-Time High Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#1d3557]" />
                <span className="ml-2 text-[#1d3557]">Loading leaderboard...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                Failed to load leaderboard data. Please try again later.
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map(entry => (
                    <TableRow key={entry.rank} className="hover:bg-[#1d3557]/5">
                      <TableCell className="font-medium text-center">
                        {entry.rank === 1 ? (
                          <span className="text-amber-500 font-bold">🏆 {entry.rank}</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-gray-500 font-bold">🥈 {entry.rank}</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-amber-700 font-bold">🥉 {entry.rank}</span>
                        ) : (
                          <span className="text-[#1d3557]">#{entry.rank}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{entry.playerName}</TableCell>
                      <TableCell className="text-right">{entry.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-[#1d3557]/70">
                No scores yet! Be the first to play and set a high score.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardPage;
