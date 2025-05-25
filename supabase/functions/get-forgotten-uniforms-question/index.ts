
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

    console.log('Starting forgotten uniforms question generation...')

    // Get a random player with a forgotten stint from the materialized view
    console.log('Fetching random forgotten stint from player_forgotten_stints table...')
    const { data: forgottenStints, error: stintsError } = await supabase
      .from('player_forgotten_stints')
      .select('*')
      .limit(100) // Get multiple records first

    if (stintsError) {
      console.error('Error fetching forgotten stints:', stintsError)
      throw stintsError
    }

    if (!forgottenStints || forgottenStints.length === 0) {
      console.error('No forgotten stints found in player_forgotten_stints table')
      throw new Error('No forgotten stints found')
    }

    console.log(`Found ${forgottenStints.length} forgotten stints, selecting random one...`)
    
    // Select a random stint from the fetched records
    const randomIndex = Math.floor(Math.random() * forgottenStints.length)
    const stint = forgottenStints[randomIndex]
    
    console.log(`Selected player: ${stint.player_name_first} ${stint.player_name_last}`)
    console.log(`Forgotten team: ${stint.forgotten_team_name} (ID: ${stint.forgotten_team_id})`)
    console.log(`All teams played for IDs: ${stint.all_teams_played_ids}`)

    // Generate 3 incorrect team options from teams the player never played for
    console.log('Fetching decoy teams...')
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')

    if (teamsError) {
      console.error('Error fetching all teams:', teamsError)
      throw teamsError
    }

    if (!allTeams || allTeams.length === 0) {
      console.error('No teams found in teams table')
      throw new Error('No teams found')
    }

    console.log(`Found ${allTeams.length} total teams`)

    // Filter out teams the player has played for
    const teamsPlayerNeverPlayedFor = allTeams.filter(team => 
      !stint.all_teams_played_ids.includes(team.id)
    )

    console.log(`Player never played for ${teamsPlayerNeverPlayedFor.length} teams`)

    if (teamsPlayerNeverPlayedFor.length < 3) {
      console.error(`Not enough decoy teams available. Need 3, found ${teamsPlayerNeverPlayedFor.length}`)
      throw new Error('Not enough decoy teams found')
    }

    // Randomly select 3 decoy teams
    const shuffledDecoys = [...teamsPlayerNeverPlayedFor].sort(() => Math.random() - 0.5)
    const selectedDecoys = shuffledDecoys.slice(0, 3)

    console.log('Selected decoy teams:', selectedDecoys.map(t => t.name).join(', '))

    // Create the answer choices (correct answer + 3 decoys)
    const choices = [
      {
        id: stint.forgotten_team_id,
        name: stint.forgotten_team_name,
        isCorrect: true
      },
      ...selectedDecoys.map(team => ({
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

    console.log('Generated question successfully for player:', question.playerName)
    console.log('Question choices:', choices.map(c => `${c.name} (${c.isCorrect ? 'CORRECT' : 'wrong'})`).join(', '))

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
