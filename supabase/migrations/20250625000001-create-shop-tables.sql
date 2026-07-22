-- Create shop items tables
-- Single shop items (purchased with points)
CREATE TABLE IF NOT EXISTS public.single_shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🛍️',
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group shop items (purchased with team treasury_balance)
CREATE TABLE IF NOT EXISTS public.group_shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🛍️',
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gem shop items (Secret Shop - purchased with crystalls)
CREATE TABLE IF NOT EXISTS public.gem_shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  avatar TEXT NOT NULL DEFAULT '💎',
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group shop purchases
CREATE TABLE IF NOT EXISTS public.group_shop_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.group_shop_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_cost INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gem shop purchases
CREATE TABLE IF NOT EXISTS public.gem_shop_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.gem_shop_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_cost INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all shop tables
ALTER TABLE public.single_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gem_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_shop_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gem_shop_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for single_shop_items (public read, team leaders can insert/update)
CREATE POLICY "Anyone can view single shop items" 
  ON public.single_shop_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Team leaders can manage single shop items" 
  ON public.single_shop_items 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.team_members tm ON p.team_id = tm.team_id AND tm.user_id = p.id
      LEFT JOIN public.teams t ON p.team_id = t.id
      WHERE p.id = auth.uid() 
      AND (tm.role = 'leader' OR t.created_by = auth.uid())
    )
  );

-- RLS Policies for group_shop_items (team members can view, leaders can manage)
CREATE POLICY "Team members can view group shop items" 
  ON public.group_shop_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Team leaders can manage group shop items" 
  ON public.group_shop_items 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.team_members tm ON p.team_id = tm.team_id AND tm.user_id = p.id
      LEFT JOIN public.teams t ON p.team_id = t.id
      WHERE p.id = auth.uid() 
      AND (tm.role = 'leader' OR t.created_by = auth.uid())
    )
  );

-- RLS Policies for gem_shop_items (public read, team leaders can manage)
CREATE POLICY "Anyone can view gem shop items" 
  ON public.gem_shop_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Team leaders can manage gem shop items" 
  ON public.gem_shop_items 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.team_members tm ON p.team_id = tm.team_id AND tm.user_id = p.id
      LEFT JOIN public.teams t ON p.team_id = t.id
      WHERE p.id = auth.uid() 
      AND (tm.role = 'leader' OR t.created_by = auth.uid())
    )
  );

-- RLS Policies for group_shop_purchases (users can view their own purchases)
CREATE POLICY "Users can view their own group shop purchases" 
  ON public.group_shop_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own group shop purchases" 
  ON public.group_shop_purchases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for gem_shop_purchases (users can view their own purchases)
CREATE POLICY "Users can view their own gem shop purchases" 
  ON public.gem_shop_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gem shop purchases" 
  ON public.gem_shop_purchases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_shop_purchases_user_id ON public.group_shop_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_group_shop_purchases_item_id ON public.group_shop_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_gem_shop_purchases_user_id ON public.gem_shop_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gem_shop_purchases_item_id ON public.gem_shop_purchases(item_id);
