
-- Create the SQL function for getting game leaderboards
CREATE OR REPLACE FUNCTION public.get_game_leaderboard(p_game_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  high_score INTEGER,
  player_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ugs.high_score,
    p.display_name AS player_name
  FROM
    public.user_game_scores ugs
  LEFT JOIN
    public.profiles p ON ugs.user_id = p.id
  WHERE
    ugs.game_id = p_game_id
  ORDER BY
    ugs.high_score DESC
  LIMIT p_limit;
END;
$$;
