
-- Create deploy_requests table for the dispatch/poll deployment pattern
CREATE TABLE public.deploy_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending',
  source_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  stage_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  key_delivery text NOT NULL DEFAULT 'databricks_secret',
  service_role_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- No RLS - table is only accessed via Service Role Key from edge functions
-- RLS is intentionally NOT enabled on this table

-- Reuse existing update_updated_at_column() function
CREATE TRIGGER update_deploy_requests_updated_at
  BEFORE UPDATE ON public.deploy_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
