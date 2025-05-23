
-- Create the SQL function for getting game leaderboards
CREATE OR REPLACE FUNCTION public.get_game_leaderboard(p_game_id UUID, p_limit INTEGER DEFAULT 10, p_timespan TEXT DEFAULT 'all_time')
RETURNS TABLE(
  high_score INTEGER,
  player_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    AND (
      p_timespan = 'all_time' 
      OR 
      (p_timespan = 'today' AND DATE(ugs.last_played_at AT TIME ZONE 'UTC') = DATE(NOW() AT TIME ZONE 'UTC'))
    )
  ORDER BY
    ugs.high_score DESC
  LIMIT p_limit;
END;
$$;
