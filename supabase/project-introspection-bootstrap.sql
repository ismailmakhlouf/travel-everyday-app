-- =============================================================
-- project-introspection-bootstrap.sql
-- 
-- Drop this into ANY Lovable Cloud / Supabase project to enable
-- the project-export edge function. Run once, works forever.
-- =============================================================

-- 1. Introspect all public tables with columns, types, defaults, PKs
CREATE OR REPLACE FUNCTION public.introspect_tables()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_object_agg(t.table_name, jsonb_build_object(
    'columns', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', c.column_name,
        'type', c.udt_name,
        'nullable', c.is_nullable = 'YES',
        'default', c.column_default,
        'is_primary', EXISTS (
          SELECT 1 FROM information_schema.key_column_usage kcu
          JOIN information_schema.table_constraints tc
            ON kcu.constraint_name = tc.constraint_name
            AND tc.constraint_type = 'PRIMARY KEY'
          WHERE kcu.table_schema = 'public'
            AND kcu.table_name = t.table_name
            AND kcu.column_name = c.column_name
        )
      ) ORDER BY c.ordinal_position)
      FROM information_schema.columns c
      WHERE c.table_schema = 'public' AND c.table_name = t.table_name
    )
  )), '{}'::jsonb)
  FROM information_schema.tables t
  WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE';
$$;

-- 2. Introspect all RLS policies grouped by table
CREATE OR REPLACE FUNCTION public.introspect_rls_policies()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_object_agg(tablename, policies), '{}'::jsonb)
  FROM (
    SELECT tablename, jsonb_agg(jsonb_build_object(
      'name', policyname,
      'command', cmd,
      'permissive', permissive,
      'roles', roles,
      'using', qual,
      'with_check', with_check
    )) AS policies
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
  ) sub;
$$;

-- 3. Introspect RLS enabled/disabled status per table
CREATE OR REPLACE FUNCTION public.introspect_rls_status()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_object_agg(relname, relrowsecurity), '{}'::jsonb)
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r';
$$;

-- 4. Introspect all public database functions with source code
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

-- 5. Introspect all triggers on public tables
CREATE OR REPLACE FUNCTION public.introspect_triggers()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', trigger_name,
    'table', event_object_table,
    'event', event_manipulation,
    'timing', action_timing,
    'function', action_statement
  )), '[]'::jsonb)
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';
$$;
