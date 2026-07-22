
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demoSessionActive = localStorage.getItem('performai_demo_session') === 'active';
    if (demoSessionActive) {
      const demoUser = {
        id: 'performai-cavalcante',
        aud: 'authenticated',
        created_at: new Date(0).toISOString(),
        app_metadata: { provider: 'demo' },
        user_metadata: { full_name: 'Cavalcante', username: 'Cavalcante', role: 'leader' },
      } as User;
      setUser(demoUser);
      setSession(null);
      setLoading(false);
    }

    // Устанавливаем слушатель изменений авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        if (!demoSessionActive) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
        
        // При входе нового пользователя обновляем его профиль с ролью
        if (event === 'SIGNED_IN' && session?.user) {
          const role = session.user.user_metadata?.role;
          if (role) {
            console.log('User signed in with role:', role);
            
            // Небольшая задержка для завершения создания профиля
            setTimeout(async () => {
              try {
                const { error } = await supabase
                  .from('profiles')
                  .update({ role: role })
                  .eq('id', session.user.id);
                
                if (error) {
                  console.error('Error updating user role:', error);
                } else {
                  console.log('User role updated successfully:', role);
                }
              } catch (err) {
                console.error('Error in role update:', err);
              }
            }, 1000);
          }
        }
      }
    );

    // Проверяем текущую сессию
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!demoSessionActive) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('performai_demo_session');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
