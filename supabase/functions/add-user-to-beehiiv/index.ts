
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// Set up CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY') || '';
    const PUBLICATION_ID = 'pub_fa90dbc7-fd6b-4dc3-a09b-f39d70d80c38';
    const AUTOMATION_ID = '243b8a2f-1ca5-469c-912a-bc1c9c367e65';
    
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse the request body to get the email
    const requestBody = await req.json();
    const email = requestBody.email;
    
    console.log(`Received request to add user with email: ${email}`);
    
    if (!email) {
      console.error("Email is missing from the request body");
      return new Response(
        JSON.stringify({ success: false, error: "Email is missing from the request body" }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400,
        }
      );
    }

    console.log(`Adding user with email: ${email} to Beehiiv`);
    
    // Prepare the request to Beehiiv API
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          send_welcome_email: false,
          automation_ids: [AUTOMATION_ID]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error from Beehiiv API: ${response.status}`, errorData);
      throw new Error(`Beehiiv API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Successfully added user to Beehiiv:', data);
    
    return new Response(
      JSON.stringify({ success: true, message: 'User added to Beehiiv successfully' }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in add-user-to-beehiiv function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400,
      }
    );
  }
})
