
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import BadWordsFilter from 'https://esm.sh/bad-words@3.0.4';

interface ValidateNameRequest {
  displayName: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { displayName } = await req.json() as ValidateNameRequest;
    
    // Basic validation
    if (!displayName || typeof displayName !== 'string') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Display name is required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Check if display name is too short or too long
    if (displayName.trim().length < 3) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Display name must be at least 3 characters" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    if (displayName.trim().length > 20) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Display name must be less than 20 characters" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Initialize profanity filter
    const filter = new BadWordsFilter();
    
    // Check if display name contains profanity
    if (filter.isProfane(displayName)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Display name contains inappropriate language. Please choose another." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // If we got here, the name is valid
    return new Response(
      JSON.stringify({ valid: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error validating display name:", error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: "An error occurred while validating the display name" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
