-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum for organization roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member');

-- Create task_status enum
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');

-- Create task_priority enum
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');

-- Create column_type enum for tracker
CREATE TYPE public.column_type AS ENUM ('text', 'number', 'select', 'checkbox', 'date');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members table with roles
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES public.profiles(id),
  status public.task_status DEFAULT 'todo',
  priority public.task_priority DEFAULT 'medium',
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracker tables (for custom project tracker)
CREATE TABLE public.tracker_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Project Tracker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracker columns
CREATE TABLE public.tracker_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracker_table_id UUID REFERENCES public.tracker_tables(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  column_type public.column_type NOT NULL DEFAULT 'text',
  options JSONB, -- For select type columns
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracker rows
CREATE TABLE public.tracker_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracker_table_id UUID REFERENCES public.tracker_tables(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracker cells
CREATE TABLE public.tracker_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracker_row_id UUID REFERENCES public.tracker_rows(id) ON DELETE CASCADE NOT NULL,
  tracker_column_id UUID REFERENCES public.tracker_columns(id) ON DELETE CASCADE NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tracker_row_id, tracker_column_id)
);

-- Activity feed
CREATE TABLE public.project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for organizations
CREATE POLICY "Organization members can view their organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Organization owners/admins can update" ON public.organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization owners can delete" ON public.organizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- RLS Policies for organization_members
CREATE POLICY "Organization members can view members" ON public.organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners/admins can insert members" ON public.organization_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organization_members.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR NOT EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organization_members.organization_id
    )
  );

CREATE POLICY "Organization owners/admins can update members" ON public.organization_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization owners/admins can delete members" ON public.organization_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for projects
CREATE POLICY "Organization members can view projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = projects.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create projects" ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = projects.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = projects.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners/admins can delete projects" ON public.projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = projects.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Organization members can view tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = tasks.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = tasks.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update tasks" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = tasks.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can delete tasks" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = tasks.project_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for milestones (similar to tasks)
CREATE POLICY "Organization members can view milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = milestones.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create milestones" ON public.milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = milestones.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update milestones" ON public.milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = milestones.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can delete milestones" ON public.milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = milestones.project_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for tracker_tables
CREATE POLICY "Organization members can view tracker tables" ON public.tracker_tables
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = tracker_tables.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create tracker tables" ON public.tracker_tables
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = tracker_tables.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update tracker tables" ON public.tracker_tables
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = tracker_tables.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can delete tracker tables" ON public.tracker_tables
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = tracker_tables.project_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for tracker_columns
CREATE POLICY "Organization members can view tracker columns" ON public.tracker_columns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tracker_tables tt
      JOIN public.projects p ON p.id = tt.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE tt.id = tracker_columns.tracker_table_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage tracker columns" ON public.tracker_columns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tracker_tables tt
      JOIN public.projects p ON p.id = tt.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE tt.id = tracker_columns.tracker_table_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for tracker_rows
CREATE POLICY "Organization members can view tracker rows" ON public.tracker_rows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tracker_tables tt
      JOIN public.projects p ON p.id = tt.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE tt.id = tracker_rows.tracker_table_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage tracker rows" ON public.tracker_rows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tracker_tables tt
      JOIN public.projects p ON p.id = tt.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE tt.id = tracker_rows.tracker_table_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for tracker_cells
CREATE POLICY "Organization members can view tracker cells" ON public.tracker_cells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tracker_rows tr
      JOIN public.tracker_tables tt ON tt.id = tr.tracker_table_id
      JOIN public.projects p ON p.id = tt.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE tr.id = tracker_cells.tracker_row_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage tracker cells" ON public.tracker_cells
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tracker_rows tr
      JOIN public.tracker_tables tt ON tt.id = tr.tracker_table_id
      JOIN public.projects p ON p.id = tt.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE tr.id = tracker_cells.tracker_row_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for project_activity
CREATE POLICY "Organization members can view activity" ON public.project_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_activity.project_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create activity" ON public.project_activity
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_activity.project_id
      AND om.user_id = auth.uid()
    )
  );

-- Triggers for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracker_tables_updated_at BEFORE UPDATE ON public.tracker_tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracker_columns_updated_at BEFORE UPDATE ON public.tracker_columns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracker_rows_updated_at BEFORE UPDATE ON public.tracker_rows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracker_cells_updated_at BEFORE UPDATE ON public.tracker_cells
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracker_cells;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_activity;