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
    console.log('Starting submit-hl-score function');
    
    if (!req.headers.get('content-type')?.includes('application/json')) {
      console.error('Invalid content type:', req.headers.get('content-type'));
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'Content-Type must be application/json' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the request body
    let gameSlug, score;
    try {
      const body = await req.json();
      gameSlug = body.gameSlug;
      score = body.score;
      console.log('Request body parsed:', { gameSlug, score });
      
      if (!gameSlug || typeof score !== 'number') {
        console.error('Invalid request data:', { gameSlug, score });
        return new Response(
          JSON.stringify({ error: 'Bad Request', message: 'gameSlug and score are required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a Supabase client with the Auth context of the function
    let supabaseClient;
    try {
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: req.headers.get('Authorization')! },
          },
        }
      );
      console.log('Supabase client created');
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', message: 'Failed to initialize database client' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the current user
    let user;
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) {
        console.error('Error getting authenticated user:', error);
        return new Response(
          JSON.stringify({ error: 'Unauthorized', message: 'You must be logged in to submit a score' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      user = data.user;
      console.log('Authenticated user ID:', user.id);
    } catch (error) {
      console.error('Exception when getting authenticated user:', error);
      return new Response(
        JSON.stringify({ error: 'Authentication Error', message: 'Failed to authenticate user' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!user) {
      console.error('No authenticated user found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'You must be logged in to submit a score' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // First, get the game_id for the given gameSlug
    let gameId;
    try {
      console.log('Looking up game with slug:', gameSlug);
      const { data, error } = await supabaseClient
        .from('games')
        .select('id')
        .eq('slug', gameSlug)
        .single();

      if (error) {
        console.error('Error fetching game:', error);
        return new Response(
          JSON.stringify({ error: 'Not Found', message: 'Game not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      if (!data) {
        console.error('No game found with slug:', gameSlug);
        return new Response(
          JSON.stringify({ error: 'Not Found', message: 'Game not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      gameId = data.id;
      console.log('Found game ID:', gameId);
    } catch (error) {
      console.error('Exception when looking up game:', error);
      return new Response(
        JSON.stringify({ error: 'Database Error', message: 'Failed to look up game' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Now check if the user already has a high score for this game
    try {
      console.log('Checking existing score for user:', user.id, 'and game:', gameId);
      const { data: existingScore, error: scoreError } = await supabaseClient
        .from('user_game_scores')
        .select('id, high_score')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .single();

      let result;
      let updatedHighScore = score;
      let isNewHighScore = false;

      if (scoreError && scoreError.code === 'PGRST116') { // PGRST116 is "not found" error
        // No existing score, insert a new one
        console.log('No existing score found, inserting new record with score:', score);
        const { data, error: insertError } = await supabaseClient
          .from('user_game_scores')
          .insert({
            user_id: user.id,
            game_id: gameId,
            high_score: score,
            last_played_at: new Date().toISOString()
          })
          .select('high_score')
          .single();

        if (insertError) {
          console.error('Error inserting new score:', insertError);
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
        console.log('Successfully inserted new high score:', result);
      } else if (!scoreError) {
        // Existing score found, update if new score is higher
        console.log('Existing score found:', existingScore.high_score, 'New score:', score);
        if (score > existingScore.high_score) {
          console.log('New score is higher, updating record');
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
            console.error('Error updating high score:', updateError);
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
          console.log('Successfully updated high score to:', score);
        } else {
          // Just update last_played_at
          console.log('New score is not higher, just updating last_played_at');
          const { error: updateError } = await supabaseClient
            .from('user_game_scores')
            .update({ last_played_at: new Date().toISOString() })
            .eq('id', existingScore.id);
            
          if (updateError) {
            console.error('Error updating last played timestamp:', updateError);
            // Continue anyway since this is not critical
          }
            
          updatedHighScore = existingScore.high_score;
          result = existingScore;
          console.log('Kept existing high score:', updatedHighScore);
        }
      } else {
        // Some other error occurred
        console.error('Unexpected error checking for existing score:', scoreError);
        return new Response(
          JSON.stringify({ error: 'Database Error', message: scoreError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Function completed successfully:', { 
        highScore: updatedHighScore, 
        isNewHighScore 
      });
      
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
      console.error('Unexpected error in score update logic:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Top-level error in submit-hl-score function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
