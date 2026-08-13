
CREATE TYPE public.app_role AS ENUM ('citizen','admin');
CREATE TYPE public.issue_status AS ENUM ('reported','ai_analyzed','assigned','in_progress','resolved','verified','reopened');
CREATE TYPE public.issue_priority AS ENUM ('low','medium','high','critical');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  ward TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'citizen',
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "profiles readable by self and admins" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles insert self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles update self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "roles readable by self and admins" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name',''), COALESCE(NEW.email,''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,'citizen') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments readable" ON public.departments FOR SELECT USING (true);
CREATE POLICY "departments admin write" ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE SEQUENCE public.complaint_seq START 1024;
GRANT USAGE ON SEQUENCE public.complaint_seq TO authenticated;

CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number TEXT NOT NULL UNIQUE DEFAULT ('CIV-' || nextval('public.complaint_seq')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  priority public.issue_priority NOT NULL DEFAULT 'medium',
  ai_confidence NUMERIC,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  assigned_officer TEXT,
  status public.issue_status NOT NULL DEFAULT 'reported',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.issues TO authenticated;
GRANT ALL ON public.issues TO service_role;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issues select own or admin" ON public.issues FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "issues insert own" ON public.issues FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "issues update own or admin" ON public.issues FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "issues delete admin" ON public.issues FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER issues_touch BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.issue_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.issue_status,
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.issue_updates TO authenticated;
GRANT ALL ON public.issue_updates TO service_role;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "updates select visible" ON public.issue_updates FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = issue_id AND (i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "updates insert visible" ON public.issue_updates FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = issue_id AND (i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE TABLE public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  detected_category TEXT NOT NULL DEFAULT 'Other',
  confidence NUMERIC NOT NULL DEFAULT 0,
  severity public.issue_priority NOT NULL DEFAULT 'medium',
  recommended_department TEXT,
  duplicate_probability NUMERIC NOT NULL DEFAULT 0,
  explanation TEXT NOT NULL DEFAULT '',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ai_analysis TO authenticated;
GRANT ALL ON public.ai_analysis TO service_role;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analysis select visible" ON public.ai_analysis FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = issue_id AND (i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "analysis insert visible" ON public.ai_analysis FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = issue_id AND (i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE TABLE public.duplicate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  related_issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  similarity_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (issue_id, related_issue_id)
);
GRANT SELECT, INSERT, DELETE ON public.duplicate_links TO authenticated;
GRANT ALL ON public.duplicate_links TO service_role;
ALTER TABLE public.duplicate_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dupes select visible" ON public.duplicate_links FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = issue_id AND (i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "dupes insert visible" ON public.duplicate_links FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.issues i WHERE i.id = issue_id AND (i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

INSERT INTO public.departments (name, description) VALUES
  ('Roads & Infrastructure','Potholes, road damage, footpaths and public infrastructure'),
  ('Waste Management','Garbage collection, illegal dumping and street cleaning'),
  ('Water Supply','Pipeline leakage, supply interruptions and water quality'),
  ('Electrical Maintenance','Streetlights, poles and public electrical assets'),
  ('Drainage & Sanitation','Drain blockage, waterlogging and sanitation'),
  ('Parks & Environment','Fallen trees, parks, greenery and environment'),
  ('Public Works','Public buildings and civic construction works'),
  ('General Municipal Services','Any other municipal service request');

CREATE POLICY "issue images auth read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'issue-images');
CREATE POLICY "issue images auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-images');
