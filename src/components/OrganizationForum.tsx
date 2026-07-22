import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Clock,
  User,
  MessageCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { ForumTopicView } from "./ForumTopicView";

interface OrganizationForumProps {
  teamId: string;
  canCreateTopics: boolean;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
  reply_count?: number;
}

export const OrganizationForum = ({
  teamId,
  canCreateTopics,
}: OrganizationForumProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: topics, isLoading } = useQuery({
    queryKey: ["forum-topics", teamId],
    queryFn: async (): Promise<ForumTopic[]> => {
      const { data, error } = await supabase
        .from("organization_forum_topics")
        .select(
          `
          id,
          title,
          content,
          created_at,
          created_by,
          updated_at
        `
        )
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Получаем профили отдельно
      if (!data || data.length === 0) return [];

      const userIds = data.map((topic) => topic.created_by);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);

      // Получаем количество комментариев для каждой темы
      const topicIds = data.map((topic) => topic.id);
      const { data: replyCounts } = await supabase
        .from("organization_forum_replies")
        .select("topic_id")
        .in("topic_id", topicIds);

      // Подсчитываем комментарии
      const replyCountMap =
        replyCounts?.reduce((acc, reply) => {
          acc[reply.topic_id] = (acc[reply.topic_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      // Объединяем данные
      const result = data.map((topic) => ({
        ...topic,
        profiles:
          profiles?.find((profile) => profile.id === topic.created_by) ||
          undefined,
        reply_count: replyCountMap[topic.id] || 0,
      }));

      return result;
    },
    enabled: !!teamId,
  });

  const createTopicMutation = useMutation({
    mutationFn: async ({
      title,
      content,
    }: {
      title: string;
      content: string;
    }) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");

      const { error } = await supabase
        .from("organization_forum_topics")
        .insert({
          team_id: teamId,
          created_by: user.id,
          title,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-topics", teamId] });
      setTitle("");
      setContent("");
      setIsCreateDialogOpen(false);
      toast({
        title: "УСПЕХ",
        description: "ТЕМА ФОРУМА СОЗДАНА",
      });
    },
    onError: (error) => {
      console.error("Ошибка создания темы:", error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ СОЗДАТЬ ТЕМУ",
        variant: "destructive",
      });
    },
  });

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createTopicMutation.mutate({ title, content });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Если выбрана конкретная тема, показываем её просмотр
  if (selectedTopicId) {
    return (
      <ForumTopicView
        topicId={selectedTopicId}
        teamId={teamId}
        canCreateTopics={canCreateTopics}
        onBack={() => setSelectedTopicId(null)}
      />
    );
  }

  return (
    <div className="vice-card p-8 relative border-2 border-green-500/50 bg-gradient-to-br from-gray-900/90 to-green-900/90">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-lg"></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
          <div className="relative mr-4">
            <MessageSquare className="text-green-400 w-10 h-10 filter drop-shadow-lg" />
            <div className="absolute inset-0 text-green-400 opacity-30 animate-pulse">
              <MessageSquare className="w-10 h-10" />
            </div>
          </div>
          ФОРУМ ОРГАНИЗАЦИИ
        </h2>
        {canCreateTopics && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <button className="bg-gradient-to-r from-green-600 to-green-800 border-2 border-green-400 text-white py-3 px-6 rounded-lg font-mono font-bold text-sm tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 flex items-center space-x-2">
                <Plus size={20} />
                <span>СОЗДАТЬ ТЕМУ</span>
              </button>
            </DialogTrigger>
            <DialogContent className="vice-card border border-green-500/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                  СОЗДАТЬ НОВУЮ ТЕМУ
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTopic} className="space-y-6">
                <div>
                  <label className="block text-sm font-mono font-bold mb-3 text-cyan-300 tracking-wider">
                    ЗАГОЛОВОК ТЕМЫ
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите заголовок темы"
                    className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono font-bold mb-3 text-cyan-300 tracking-wider">
                    СОДЕРЖАНИЕ
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Введите содержание темы"
                    className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono focus:border-green-500 focus:ring-green-500 min-h-32"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-purple-400 text-purple-400 font-mono tracking-wider hover:bg-purple-400/10"
                  >
                    ОТМЕНА
                  </Button>
                  <button
                    type="submit"
                    disabled={createTopicMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-green-800 border border-green-400 text-white py-2 px-6 rounded font-mono font-bold tracking-wider disabled:opacity-50"
                  >
                    {createTopicMutation.isPending ? "СОЗДАНИЕ..." : "СОЗДАТЬ"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative z-10">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="vice-card p-6 border border-green-400/30 bg-gray-800/50"
              >
                <Skeleton className="h-6 w-64 mb-3 bg-green-500/20" />
                <Skeleton className="h-4 w-full mb-2 bg-cyan-400/20" />
                <Skeleton className="h-4 w-32 bg-purple-400/20" />
              </div>
            ))}
          </div>
        ) : !topics || topics.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-cyan-300 font-mono text-xl tracking-wider">
              ПОКА НЕТ ТЕМ В ФОРУМЕ
            </p>
            {canCreateTopics && (
              <p className="text-gray-400 font-mono text-sm mt-2">
                СОЗДАЙТЕ ПЕРВУЮ ТЕМУ ДЛЯ ОБСУЖДЕНИЯ
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="vice-card p-6 border border-green-400/30 bg-gray-800/50 hover:border-green-400/60 transition-all duration-300 hover:bg-gray-800/70 cursor-pointer"
                onClick={() => setSelectedTopicId(topic.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold font-mono text-transparent bg-clip-text vice-gradient tracking-wider flex-1 pr-4">
                    {topic.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 font-mono flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{topic.reply_count}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(topic.created_at)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-cyan-300 font-mono mb-4 leading-relaxed line-clamp-3">
                  {topic.content.length > 200
                    ? `${topic.content.substring(0, 200)}...`
                    : topic.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-300 font-mono">
                      {topic.profiles?.full_name ||
                        topic.profiles?.username ||
                        "Неизвестный автор"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-cyan-400 font-mono">
                    <Eye className="h-4 w-4" />
                    <span>ЧИТАТЬ ПОЛНОСТЬЮ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
