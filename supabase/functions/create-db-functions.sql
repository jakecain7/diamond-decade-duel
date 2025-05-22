
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

