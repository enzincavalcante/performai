-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create private_messages table
CREATE TABLE IF NOT EXISTS public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (sender_id != recipient_id)
);

-- Create organization_forum_topics table
CREATE TABLE IF NOT EXISTS public.organization_forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization_forum_replies table
CREATE TABLE IF NOT EXISTS public.organization_forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.organization_forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_notification_settings table
CREATE TABLE IF NOT EXISTS public.team_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  notify_stage_completion BOOLEAN NOT NULL DEFAULT true,
  notify_purchases BOOLEAN NOT NULL DEFAULT true,
  notify_new_members BOOLEAN NOT NULL DEFAULT true,
  notify_rank_changes BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships" 
  ON public.friendships 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" 
  ON public.friendships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships" 
  ON public.friendships 
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships" 
  ON public.friendships 
  FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for private_messages
CREATE POLICY "Users can view messages they sent or received" 
  ON public.private_messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
  ON public.private_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received" 
  ON public.private_messages 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- RLS Policies for organization_forum_topics
CREATE POLICY "Team members can view forum topics" 
  ON public.organization_forum_topics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = organization_forum_topics.team_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create forum topics" 
  ON public.organization_forum_topics 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = organization_forum_topics.team_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Topic creators can update their topics" 
  ON public.organization_forum_topics 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Topic creators can delete their topics" 
  ON public.organization_forum_topics 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- RLS Policies for organization_forum_replies
CREATE POLICY "Team members can view forum replies" 
  ON public.organization_forum_replies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_forum_topics oft
      JOIN public.team_members tm ON oft.team_id = tm.team_id
      WHERE oft.id = organization_forum_replies.topic_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create forum replies" 
  ON public.organization_forum_replies 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.organization_forum_topics oft
      JOIN public.team_members tm ON oft.team_id = tm.team_id
      WHERE oft.id = organization_forum_replies.topic_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Reply creators can update their replies" 
  ON public.organization_forum_replies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Reply creators can delete their replies" 
  ON public.organization_forum_replies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for team_notification_settings
CREATE POLICY "Team members can view notification settings" 
  ON public.team_notification_settings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_notification_settings.team_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team leaders can manage notification settings" 
  ON public.team_notification_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_notification_settings.team_id 
      AND t.created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_private_messages_sender_id ON public.private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_recipient_id ON public.private_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON public.private_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_organization_forum_topics_team_id ON public.organization_forum_topics(team_id);
CREATE INDEX IF NOT EXISTS idx_organization_forum_topics_created_by ON public.organization_forum_topics(created_by);
CREATE INDEX IF NOT EXISTS idx_organization_forum_replies_topic_id ON public.organization_forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_organization_forum_replies_user_id ON public.organization_forum_replies(user_id);
