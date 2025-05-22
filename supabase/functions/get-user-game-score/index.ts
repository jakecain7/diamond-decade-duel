
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers for browser clients
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'You must be logged in to view your score' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get gameSlug from query parameters or body
    const url = new URL(req.url);
    let gameSlug = url.searchParams.get('gameSlug');
    
    // If gameSlug not in query params, try to get from request body
    if (!gameSlug && req.headers.get('content-type')?.includes('application/json')) {
      const requestData = await req.json();
      gameSlug = requestData.gameSlug;
    }

    if (!gameSlug) {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'gameSlug is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // First, get the game_id for the given gameSlug
    const { data: gameData, error: gameError } = await supabaseClient
      .from('games')
      .select('id')
      .eq('slug', gameSlug)
      .single();

    if (gameError || !gameData) {
      return new Response(
        JSON.stringify({ error: 'Not Found', message: 'Game not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Now get the user's high score for this game
    const { data: scoreData, error: scoreError } = await supabaseClient
      .from('user_game_scores')
      .select('high_score')
      .eq('user_id', user.id)
      .eq('game_id', gameData.id)
      .single();

    // If no error but no data, it means the user has no score yet
    if (scoreError && scoreError.code !== 'PGRST116') { // PGRST116 is "not found" error
      return new Response(
        JSON.stringify({ error: 'Database Error', message: scoreError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return the high score, or 0 if no score exists
    const highScore = scoreData?.high_score || 0;
    
    return new Response(
      JSON.stringify({ highScore }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-user-game-score function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
