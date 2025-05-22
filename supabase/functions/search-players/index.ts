
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the search term from the request body
    const { searchTerm } = await req.json();

    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.length < 2) {
      return new Response(
        JSON.stringify({ players: [] }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    console.log(`Searching for player: "${searchTerm}"`);
    
    // Improved search logic for multi-word searches
    let query = supabaseClient
      .from('players')
      .select('id, name_first, name_last, name_given, debut_year, final_year');
    
    // Split the search term into words for more precise matching
    const words = searchTerm.trim().split(/\s+/);
    
    if (words.length > 1) {
      // Multi-word search: try to match first word to first name and second word to last name
      const firstWord = words[0];
      const lastWord = words[words.length - 1]; // Use the last word if there are more than 2
      
      query = query.or(
        `name_first.ilike.${firstWord}%,name_last.ilike.${lastWord}%,` + 
        `name_given.ilike.${firstWord}%${lastWord}%,` +
        `name_first.ilike.%${firstWord}%,name_last.ilike.%${lastWord}%`
      );
    } else {
      // Single word search - match against first or last name
      query = query.or(`name_first.ilike.%${searchTerm}%,name_last.ilike.%${searchTerm}%`);
    }
    
    const { data: players, error } = await query
      .limit(10)
      .order('name_last', { ascending: true });

    if (error) {
      console.error('Error searching for players:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to search for players' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }

    // Format the player results
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name: `${player.name_first} ${player.name_last}`,
      fullInfo: player,
      years: player.debut_year && player.final_year ? 
        `${player.debut_year} - ${player.final_year}` : 
        player.debut_year ? `${player.debut_year} - ?` : '?'
    }));

    console.log(`Found ${formattedPlayers.length} players matching "${searchTerm}"`);

    return new Response(
      JSON.stringify({ players: formattedPlayers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    console.error('Unexpected error in search-players function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
