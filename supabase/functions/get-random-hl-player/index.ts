
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Get environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Define CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface for the request body
interface GetRandomPlayerRequest {
  excludePlayerId?: string;
}

// Enhanced interface for the player response to include new fields
interface PlayerResponse {
  playerId: string;
  playerName: string;
  careerHR: number;
  debutYear: number | null;
  finalYear: number | null;
  teamsPlayedFor: string[];
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse request body to get excludePlayerId if provided
    const requestData: GetRandomPlayerRequest = await req.json().catch(() => ({}));
    const { excludePlayerId } = requestData;
    
    console.log(`Fetching random slugger. Excluding player: ${excludePlayerId || 'none'}`);
    
    // Call the updated SQL function which now returns more player information
    const { data: playerData, error } = await supabase
      .rpc('get_random_slugger', { exclude_id: excludePlayerId || null });
    
    if (error) {
      console.error('Error fetching random player:', error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch random player" }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Check if we found a suitable player
    if (!playerData || playerData.length === 0) {
      console.error('No suitable player found');
      return new Response(
        JSON.stringify({ error: "No suitable player found. Try adjusting criteria." }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Extract the player from the result
    const player = playerData[0];
    
    // Format the enhanced response with new fields
    const response: PlayerResponse = {
      playerId: player.id,
      playerName: `${player.name_first} ${player.name_last}`,
      careerHR: player.career_hr,
      debutYear: player.debut_year,
      finalYear: player.final_year,
      teamsPlayedFor: player.teams_played_for_names || []
    };
    
    console.log(`Found player: ${response.playerName} with ${response.careerHR} career HR`);
    
    // Return the response
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in get-random-hl-player function:', error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
