
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Fetching random forgotten uniform question...')

    // Get a random player with a forgotten stint
    const { data: forgottenStints, error: stintsError } = await supabase
      .from('player_forgotten_stints')
      .select('*')
      .order('random()') // Use database random for better performance
      .limit(1)

    if (stintsError) {
      console.error('Error fetching forgotten stints:', stintsError)
      throw stintsError
    }

    if (!forgottenStints || forgottenStints.length === 0) {
      throw new Error('No forgotten stints found')
    }

    const stint = forgottenStints[0]
    console.log(`Selected player: ${stint.player_name_first} ${stint.player_name_last}, forgotten team: ${stint.forgotten_team_name}`)

    // Generate 3 incorrect team options from teams the player never played for
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .not('id', 'in', `(${stint.all_teams_played_ids.join(',')})`)
      .order('random()')
      .limit(3)

    if (teamsError) {
      console.error('Error fetching decoy teams:', teamsError)
      throw teamsError
    }

    if (!allTeams || allTeams.length < 3) {
      throw new Error('Not enough decoy teams found')
    }

    // Create the answer choices (correct answer + 3 decoys)
    const choices = [
      {
        id: stint.forgotten_team_id,
        name: stint.forgotten_team_name,
        isCorrect: true
      },
      ...allTeams.map(team => ({
        id: team.id,
        name: team.name,
        isCorrect: false
      }))
    ]

    // Shuffle the choices so correct answer isn't always first
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    const question = {
      playerName: `${stint.player_name_first} ${stint.player_name_last}`,
      playerId: stint.player_id,
      forgottenTeamId: stint.forgotten_team_id,
      forgottenTeamName: stint.forgotten_team_name,
      primaryTeamId: stint.primary_team_id,
      stintSeasons: stint.forgotten_stint_seasons,
      stintYears: `${stint.forgotten_stint_first_year}${stint.forgotten_stint_seasons > 1 ? `-${stint.forgotten_stint_last_year}` : ''}`,
      choices: choices
    }

    console.log('Generated question successfully')

    return new Response(
      JSON.stringify(question),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in get-forgotten-uniforms-question:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
