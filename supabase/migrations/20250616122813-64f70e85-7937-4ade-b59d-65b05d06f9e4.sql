
-- Включаем RLS для существующих таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS для таблицы profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Создаем политики RLS для таблицы point_transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.point_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.point_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Создаем политики RLS для таблицы shop_purchases
CREATE POLICY "Users can view their own purchases" 
  ON public.shop_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" 
  ON public.shop_purchases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Создаем политику для публичного просмотра рейтинга (все могут видеть профили для рейтинга)
CREATE POLICY "Public can view profiles for ranking" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Создаем триггер для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  RETURN new;
END;
$$;

-- Создаем триггер на создание пользователя
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
