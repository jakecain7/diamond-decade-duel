
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { excludePlayerId, currentComboTotal } = await req.json();

    console.log(`Fetching random combo player. Excluding player: ${excludePlayerId || 'none'}, Current combo total: ${currentComboTotal || 'none'}`);

    // Build the query with filters
    let query = supabaseClient
      .from('combo_totals')
      .select('player_id, name_first, name_last, debut_year, final_year, career_hr, career_sb, combo_total');

    // Apply exclusion filters
    if (excludePlayerId) {
      query = query.neq('player_id', excludePlayerId);
    }

    if (currentComboTotal !== undefined && currentComboTotal !== null) {
      query = query.neq('combo_total', currentComboTotal);
    }

    // Get a random player
    const { data: players, error: playersError } = await query;

    if (playersError) {
      console.error('Error fetching combo players:', playersError);
      throw playersError;
    }

    if (!players || players.length === 0) {
      console.log('No combo players found matching criteria');
      return new Response(
        JSON.stringify({ error: 'No players found matching criteria' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Select a random player from the results
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[randomIndex];

    console.log(`Found combo player: ${selectedPlayer.name_first} ${selectedPlayer.name_last} with ${selectedPlayer.combo_total} combo total (${selectedPlayer.career_hr} HR + ${selectedPlayer.career_sb} SB)`);

    // Fetch teams the player played for
    const { data: appearances, error: appearancesError } = await supabaseClient
      .from('appearances')
      .select(`
        teams (
          name
        )
      `)
      .eq('player_id', selectedPlayer.player_id);

    if (appearancesError) {
      console.error('Error fetching player teams:', appearancesError);
      // Continue without teams data rather than failing entirely
    }

    // Extract unique team names
    const teamsPlayedFor = appearances
      ? [...new Set(appearances.map(app => app.teams?.name).filter(Boolean))]
      : [];

    // Prepare response
    const response = {
      playerId: selectedPlayer.player_id,
      playerName: `${selectedPlayer.name_first} ${selectedPlayer.name_last}`,
      careerHR: selectedPlayer.career_hr,
      careerSB: selectedPlayer.career_sb,
      comboTotal: selectedPlayer.combo_total,
      debutYear: selectedPlayer.debut_year,
      finalYear: selectedPlayer.final_year,
      teamsPlayedFor: teamsPlayedFor
    };

    console.log(`Returning combo player data for: ${response.playerName}`);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-random-combo-player function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
