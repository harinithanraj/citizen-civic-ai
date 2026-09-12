-- 1. Private role-check helper (not exposed through the API schema)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Recreate policies to use the private helper
DROP POLICY IF EXISTS "profiles readable by self and admins" ON public.profiles;
CREATE POLICY "profiles readable by self and admins" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "roles readable by self and admins" ON public.user_roles;
CREATE POLICY "roles readable by self and admins" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "departments admin write" ON public.departments;
CREATE POLICY "departments admin write" ON public.departments FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "issues select own or admin" ON public.issues;
CREATE POLICY "issues select own or admin" ON public.issues FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "issues update own or admin" ON public.issues;
CREATE POLICY "issues update own or admin" ON public.issues FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "issues delete admin" ON public.issues;
CREATE POLICY "issues delete admin" ON public.issues FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "updates select visible" ON public.issue_updates;
CREATE POLICY "updates select visible" ON public.issue_updates FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = issue_updates.issue_id AND (i.user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

DROP POLICY IF EXISTS "updates insert visible" ON public.issue_updates;
CREATE POLICY "updates insert visible" ON public.issue_updates FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = issue_updates.issue_id AND (i.user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

DROP POLICY IF EXISTS "analysis select visible" ON public.ai_analysis;
CREATE POLICY "analysis select visible" ON public.ai_analysis FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = ai_analysis.issue_id AND (i.user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

DROP POLICY IF EXISTS "analysis insert visible" ON public.ai_analysis;
CREATE POLICY "analysis insert visible" ON public.ai_analysis FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = ai_analysis.issue_id AND (i.user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

DROP POLICY IF EXISTS "dupes select visible" ON public.duplicate_links;
CREATE POLICY "dupes select visible" ON public.duplicate_links FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = duplicate_links.issue_id AND (i.user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

DROP POLICY IF EXISTS "dupes insert visible" ON public.duplicate_links;
CREATE POLICY "dupes insert visible" ON public.duplicate_links FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = duplicate_links.issue_id AND (i.user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))));

-- 3. Remove the publicly callable SECURITY DEFINER function
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 4. Ownership-scoped storage policies for issue photos
DROP POLICY IF EXISTS "issue images auth read" ON storage.objects;
DROP POLICY IF EXISTS "issue images auth upload" ON storage.objects;

CREATE POLICY "issue images owner or admin read" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'issue-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR private.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "issue images owner upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'issue-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "issue images owner delete" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'issue-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR private.has_role(auth.uid(), 'admin')
  )
);