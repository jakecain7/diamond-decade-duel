
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
interface SuggestPlayerCorrectionRequest {
  typedName: string;
}

// Interface for the response
interface PlayerSuggestion {
  id: string;
  name: string;
  similarity: number;
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
    const requestBody: SuggestPlayerCorrectionRequest = await req.json();
    const { typedName } = requestBody;
    
    console.log(`Suggesting corrections for: "${typedName}"`);
    
    // Validate required fields
    if (!typedName) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          error: "Missing required field: typedName" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Query the database using similarity function
    const { data, error } = await supabase.rpc('find_similar_players', {
      typed_name: typedName
    });
    
    if (error) {
      console.error('Error querying players:', error);
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          error: "Database error while finding similar players" 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Format the results
    const suggestions: PlayerSuggestion[] = data.map((player: any) => ({
      id: player.id,
      name: `${player.name_first} ${player.name_last}`,
      similarity: player.similarity
    }));
    
    console.log(`Found ${suggestions.length} suggestions`);
    
    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in suggest-player-correction function:', error);
    return new Response(
      JSON.stringify({ 
        suggestions: [],
        error: `Server error: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
