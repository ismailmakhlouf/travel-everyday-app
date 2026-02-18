
-- Fix: introspect database functions (prosecdef not prosecdefiner)
CREATE OR REPLACE FUNCTION public.introspect_functions()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', p.proname,
    'language', l.lanname,
    'security', CASE WHEN p.prosecdef THEN 'DEFINER' ELSE 'INVOKER' END,
    'return_type', pg_catalog.pg_get_function_result(p.oid),
    'arguments', pg_catalog.pg_get_function_arguments(p.oid),
    'source', p.prosrc
  )), '[]'::jsonb)
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l ON l.oid = p.prolang
  WHERE n.nspname = 'public';
$$;
