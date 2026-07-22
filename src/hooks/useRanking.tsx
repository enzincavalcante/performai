import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

// GTA стиль аватарки
const avatars = [
  "👨‍💼",
  "👩‍💼",
  "🕴️",
  "👨‍🔧",
  "👩‍🔧",
  "👨‍🚀",
  "👩‍🚀",
  "👨‍💻",
  "👩‍💻",
  "🦹‍♂️",
  "🦹‍♀️",
  "🥷",
];

export const useRanking = () => {
  const { user } = useAuth();

  const { data: rankings, isLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("points", { ascending: false })
        .order("created_at", { ascending: true });
      const userIds = data.map((member) => member.id);
      const { data: stagesData } = await supabase
        .from("player_stages")
        .select("*")
        .in("user_id", userIds);
      if (error) {
        console.error("Ошибка загрузки рейтинга:", error);
        throw error;
      }

      // Добавляем информацию о ранге и аватаре
      return data.map((profile, index) => ({
        ...profile,
        rank: index + 1,
        avatar: getAvatarForUser(profile.avatar_id),
        isCurrentUser: profile.id === user?.id,
        completedDeals: profile.total_deals,
        trend: getTrendForPlayer(profile, index),
        stages: stagesData.filter((stage) => stage.user_id === profile.id)
          .length, // Добавляем функцию для определения тренда
      }));
    },
    enabled: !!user,
  });

  return {
    rankings: rankings || [],
    isLoading,
  };
};

// Функция для генерации аватара на основе avatar_id
const getAvatarForUser = (avatarId: number | null): string => {
  if (!avatarId) return avatars[0];
  const index = (avatarId - 1) % avatars.length;
  return avatars[index];
};

// Функция для определения тренда игрока (пока возвращает случайные значения)
const getTrendForPlayer = (
  profile: Profile,
  index: number
): "up" | "down" | "same" => {
  // Простая логика для демонстрации - можно улучшить позже
  const trendValue = (profile.points + index) % 3;
  if (trendValue === 0) return "up";
  if (trendValue === 1) return "down";
  return "same";
};
