
-- Create a function to find similar players using similarity
CREATE OR REPLACE FUNCTION public.find_similar_players(typed_name TEXT)
RETURNS TABLE(
  id TEXT,
  name_first TEXT,
  name_last TEXT,
  similarity FLOAT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.name_first, 
    p.name_last,
    extensions.similarity(p.name_first || ' ' || p.name_last, typed_name) AS similarity
  FROM 
    players p
  WHERE 
    extensions.similarity(p.name_first || ' ' || p.name_last, typed_name) > 0.3
  ORDER BY 
    similarity DESC
  LIMIT 3;
END;
$$;

-- Create a function to get a random slugger for the Higher-or-Lower game
CREATE OR REPLACE FUNCTION public.get_random_slugger(exclude_id TEXT DEFAULT NULL)
RETURNS TABLE(
  id TEXT,
  name_first TEXT,
  name_last TEXT,
  career_hr BIGINT,
  debut_year INTEGER,
  final_year INTEGER,
  teams_played_for_names TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  WITH career_stats AS (
    -- Calculate career stats for all players
    SELECT 
      bs.player_id,
      SUM(bs."HR") as career_hr
    FROM 
      public.batting_stats bs
    GROUP BY 
      bs.player_id
  ),
  sluggers AS (
    -- Filter for sluggers (significant AB or HR)
    SELECT 
      cs.player_id,
      cs.career_hr
    FROM 
      career_stats cs
    WHERE 
      (cs.career_hr >= 100)
      -- Exclude specified player if provided
      AND (exclude_id IS NULL OR cs.player_id != exclude_id)
  ),
  player_teams AS (
    -- Get all teams a player played for
    SELECT 
      a.player_id,
      ARRAY_AGG(DISTINCT t.name) AS teams_played_for
    FROM 
      appearances a
    JOIN 
      teams t ON a.team_id = t.id
    GROUP BY 
      a.player_id
  )
  -- Join with players table to get names and return one random player
  SELECT 
    p.id,
    p.name_first,
    p.name_last,
    s.career_hr,
    p.debut_year,
    p.final_year,
    COALESCE(pt.teams_played_for, ARRAY[]::TEXT[]) AS teams_played_for_names
  FROM 
    sluggers s
  JOIN 
    public.players p ON s.player_id = p.id
  LEFT JOIN
    player_teams pt ON p.id = pt.player_id
  ORDER BY 
    RANDOM()
  LIMIT 1;
END;
$$;
