
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
interface CheckAnswerRequest {
  playerName: string;
  rowCategoryType: string; // e.g., "team", "league", "award"
  rowCategoryValue: string; // e.g., team ID like "NYA" for Yankees
  columnDecade: number; // e.g., 1970, 1980, 1990
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse request body
    const requestBody: CheckAnswerRequest = await req.json();
    const { playerName, rowCategoryType, rowCategoryValue, columnDecade } = requestBody;
    
    console.log(`Checking answer: ${playerName} for ${rowCategoryType}=${rowCategoryValue} in ${columnDecade}s`);
    
    // Validate required fields
    if (!playerName || !rowCategoryType || !rowCategoryValue || !columnDecade) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          reason: "Missing required fields in request" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Normalize player name for search
    // Split the input name to handle different formats (First Last, Last First, etc.)
    const nameParts = playerName.trim().split(/\s+/);
    
    // We'll search for the player using different combinations of the name parts
    let player = null;
    
    if (nameParts.length === 1) {
      // If only one name part, search in both first and last name
      const { data } = await supabase
        .from('players')
        .select('*')
        .or(`name_last.ilike.${nameParts[0]}%,name_first.ilike.${nameParts[0]}%`)
        .limit(1);
      
      player = data && data.length > 0 ? data[0] : null;
    } else if (nameParts.length >= 2) {
      // Try firstName lastName format
      let { data } = await supabase
        .from('players')
        .select('*')
        .ilike('name_first', `${nameParts[0]}%`)
        .ilike('name_last', `${nameParts[nameParts.length - 1]}%`)
        .limit(1);
      
      if (data && data.length > 0) {
        player = data[0];
      } else {
        // Try lastName firstName format
        const { data } = await supabase
          .from('players')
          .select('*')
          .ilike('name_first', `${nameParts[nameParts.length - 1]}%`)
          .ilike('name_last', `${nameParts[0]}%`)
          .limit(1);
        
        player = data && data.length > 0 ? data[0] : null;
      }
    }
    
    // If player not found
    if (!player) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          reason: "Player not found" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Found player: ${player.name_first} ${player.name_last} (${player.id})`);
    
    // For now, focusing on team validation
    if (rowCategoryType === "team") {
      // Calculate decade range (e.g., 1970-1979 for 1970s)
      const decadeStart = columnDecade;
      const decadeEnd = columnDecade + 9;
      
      // Check if the player played for the team in the specified decade
      const { data: appearances, error } = await supabase
        .from('appearances')
        .select('*, teams:team_id(name)')
        .eq('player_id', player.id)
        .eq('team_id', rowCategoryValue)
        .gte('year', decadeStart)
        .lte('year', decadeEnd)
        .limit(1);
      
      if (error) {
        console.error('Error checking appearances:', error);
        return new Response(
          JSON.stringify({ 
            isValid: false, 
            reason: "Database error while validating player" 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // If appearances exist, the player did play for this team in this decade
      if (appearances && appearances.length > 0) {
        // Get team name for the response
        const teamName = appearances[0].teams?.name || rowCategoryValue;
        
        return new Response(
          JSON.stringify({ 
            isValid: true, 
            playerId: player.id,
            playerFullName: `${player.name_first} ${player.name_last}`,
            teamName,
            year: appearances[0].year
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        // Get team name for better error message
        const { data: team } = await supabase
          .from('teams')
          .select('name')
          .eq('id', rowCategoryValue)
          .single();
        
        const teamName = team?.name || rowCategoryValue;
        const decade = `${columnDecade}s`;
        
        return new Response(
          JSON.stringify({ 
            isValid: false, 
            reason: `${player.name_first} ${player.name_last} did not play for ${teamName} in the ${decade}` 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      // For future expansion to support other category types (league, award, etc.)
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          reason: `Validation for ${rowCategoryType} category is not implemented yet` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
  } catch (error) {
    console.error('Error in check-answer function:', error);
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        reason: `Server error: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
