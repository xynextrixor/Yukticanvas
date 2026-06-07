-- YuktiCanvas Collaboration Database Schema Migration
-- Run this in your Supabase SQL Editor

-- 1. Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 2. Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invitation', 'access_request', 'mention', 'collaboration')),
  content JSONB NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to automatically add the project creator as 'owner' in project_members
CREATE OR REPLACE FUNCTION add_project_owner() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION add_project_owner();

-- Seed existing projects to have the owner in project_members
INSERT INTO public.project_members (project_id, user_id, role)
SELECT id, owner_id, 'owner'
FROM public.projects p
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = p.owner_id
);

-- 5. Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Drop any existing generic policies on projects
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;

-- Projects: Users can view projects they are a member of
CREATE POLICY "Users can view assigned projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- Projects: Only owners/editors can update
CREATE POLICY "Editors and owners can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Projects: Only owners can delete projects
CREATE POLICY "Owners can delete projects" ON public.projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid() AND role = 'owner'
    )
  );

-- Projects: Authenticated users can insert
CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Project Members: Users can view members of projects they have access to
CREATE POLICY "Users can view members of assigned projects" ON public.project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
    )
  );

-- Project Members: Only owners can manage members
CREATE POLICY "Owners can manage members" ON public.project_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid() AND pm.role = 'owner'
    )
  );

-- Invitations:
CREATE POLICY "Users can manage invitations for owned projects" ON public.invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = invitations.project_id AND pm.user_id = auth.uid() AND pm.role = 'owner'
    )
  );

CREATE POLICY "Users can view their own invitations by email" ON public.invitations
  FOR SELECT USING (email = auth.jwt()->>'email');

CREATE POLICY "Users can update their own invitations by email" ON public.invitations
  FOR UPDATE USING (email = auth.jwt()->>'email');

-- Notifications: Users can only see/update their own notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- Activities: Users can view activities for assigned projects
CREATE POLICY "Users can view activities of assigned projects" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = activities.project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activities for assigned projects" ON public.activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = activities.project_id AND pm.user_id = auth.uid() AND pm.role IN ('owner', 'editor')
    )
  );
