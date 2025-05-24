
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
interface GetRandomASGPlayerRequest {
  excludePlayerId?: string;
  currentPlayerASG?: number;
}

// Interface for the player response
interface ASGPlayerResponse {
  playerId: string;
  playerName: string;
  totalASG: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse request body to get excludePlayerId and currentPlayerASG if provided
    const requestData: GetRandomASGPlayerRequest = await req.json().catch(() => ({}));
    const { excludePlayerId, currentPlayerASG } = requestData;
    
    console.log(`Fetching random ASG player. Excluding player: ${excludePlayerId || 'none'}, Current ASG: ${currentPlayerASG || 'none'}`);
    
    // Call the new database function with tie prevention
    const { data: asgData, error } = await supabase
      .rpc('get_random_asg_player', { 
        exclude_id: excludePlayerId || null,
        p_current_asg_value: currentPlayerASG || null
      });
    
    if (error) {
      console.error('Error fetching ASG players:', error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch ASG players" }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Check if we found suitable players
    if (!asgData || asgData.length === 0) {
      console.error('No suitable ASG players found');
      return new Response(
        JSON.stringify({ error: "No suitable ASG players found. Try adjusting criteria." }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Extract the player from the result
    const player = asgData[0];
    
    // Format the response
    const response: ASGPlayerResponse = {
      playerId: player.player_id,
      playerName: `${player.name_first} ${player.name_last}`,
      totalASG: player.total_asg_selections
    };
    
    console.log(`Found ASG player: ${response.playerName} with ${response.totalASG} All-Star selections`);
    
    // Return the response
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in get-random-asg-player function:', error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
