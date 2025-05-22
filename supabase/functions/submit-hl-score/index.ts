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
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'Content-Type must be application/json' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the request body
    const { gameSlug, score } = await req.json();

    if (!gameSlug || typeof score !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'gameSlug and score are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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
        JSON.stringify({ error: 'Unauthorized', message: 'You must be logged in to submit a score' }),
        {
          status: 401,
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

    // Now check if the user already has a high score for this game
    const { data: existingScore, error: scoreError } = await supabaseClient
      .from('user_game_scores')
      .select('id, high_score')
      .eq('user_id', user.id)
      .eq('game_id', gameData.id)
      .single();

    let result;
    let updatedHighScore = score;
    let isNewHighScore = false;

    if (scoreError && scoreError.code === 'PGRST116') { // PGRST116 is "not found" error
      // No existing score, insert a new one
      const { data, error: insertError } = await supabaseClient
        .from('user_game_scores')
        .insert({
          user_id: user.id,
          game_id: gameData.id,
          high_score: score,
          last_played_at: new Date().toISOString()
        })
        .select('high_score')
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Database Error', message: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      result = data;
      isNewHighScore = true;
    } else if (!scoreError) {
      // Existing score found, update if new score is higher
      if (score > existingScore.high_score) {
        const { data, error: updateError } = await supabaseClient
          .from('user_game_scores')
          .update({
            high_score: score,
            last_played_at: new Date().toISOString()
          })
          .eq('id', existingScore.id)
          .select('high_score')
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Database Error', message: updateError.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        result = data;
        isNewHighScore = true;
        updatedHighScore = score;
      } else {
        // Just update last_played_at
        await supabaseClient
          .from('user_game_scores')
          .update({ last_played_at: new Date().toISOString() })
          .eq('id', existingScore.id);
          
        updatedHighScore = existingScore.high_score;
        result = existingScore;
      }
    } else {
      // Some other error occurred
      return new Response(
        JSON.stringify({ error: 'Database Error', message: scoreError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        highScore: updatedHighScore, 
        isNewHighScore 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in submit-hl-score function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
