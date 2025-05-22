
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

// Set up CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body
    const { gameSlug, limit = 10 } = await req.json();

    if (!gameSlug) {
      return new Response(
        JSON.stringify({ error: "Game slug is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Fetching leaderboard for game slug: ${gameSlug}, limit: ${limit}`);

    // First, get the game ID from the slug
    const { data: gameData, error: gameError } = await supabaseClient
      .from("games")
      .select("id")
      .eq("slug", gameSlug)
      .single();

    if (gameError || !gameData) {
      console.error("Game lookup error:", gameError);
      return new Response(
        JSON.stringify({ error: "Game not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const gameId = gameData.id;
    console.log(`Found game ID: ${gameId}`);

    // Query the top scores for this game
    const { data: leaderboardData, error: leaderboardError } = await supabaseClient
      .from("user_game_scores")
      .select(`
        high_score,
        profiles!inner(display_name)
      `)
      .eq("game_id", gameId)
      .order("high_score", { ascending: false })
      .limit(limit);

    if (leaderboardError) {
      console.error("Leaderboard query error:", leaderboardError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch leaderboard data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Format the response with rank, player name and score
    const formattedLeaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      playerName: entry.profiles.display_name || "Anonymous Player",
      score: entry.high_score,
    }));

    console.log(`Returning ${formattedLeaderboard.length} leaderboard entries`);

    // Return the leaderboard data
    return new Response(
      JSON.stringify(formattedLeaderboard),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
