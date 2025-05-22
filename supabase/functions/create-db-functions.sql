
-- Create a function to find similar players using similarity
CREATE OR REPLACE FUNCTION public.find_similar_players(typed_name TEXT)
RETURNS TABLE(
  id TEXT,
  name_first TEXT,
  name_last TEXT,
  similarity FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.name_first, 
    p.name_last,
    similarity(p.name_first || ' ' || p.name_last, typed_name) AS similarity
  FROM 
    players p
  WHERE 
    similarity(p.name_first || ' ' || p.name_last, typed_name) > 0.3
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
  career_hr BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH career_stats AS (
    -- Calculate career stats for all players
    SELECT 
      bs.player_id,
      SUM(bs."AB") as career_ab,
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
      (cs.career_ab > 500 OR cs.career_hr > 20)
      -- Exclude specified player if provided
      AND (exclude_id IS NULL OR cs.player_id != exclude_id)
  )
  -- Join with players table to get names and return one random player
  SELECT 
    p.id,
    p.name_first,
    p.name_last,
    s.career_hr
  FROM 
    sluggers s
  JOIN 
    public.players p ON s.player_id = p.id
  ORDER BY 
    RANDOM()
  LIMIT 1;
END;
$$;
