import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Bot } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

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

const getAvatar = (avatarId: number | null | undefined) => {
  if (!avatarId) return "👤";
  const avatarIndex = (avatarId - 1) % avatars.length;
  return avatars[avatarIndex] || avatars[0];
};

interface ChatSectionProps {
  teamId?: string;
  title?: string;
}

export const ChatSection = ({ teamId, title }: ChatSectionProps = {}) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, isSending } = useChat(teamId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // // const scrollToBottom = () => {
  // //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ru,
    });
  };

  const isSystemMessage = (message: any) => {
    return message.user_id === null;
  };

  const chatTitle = title || (teamId ? "ЧАТ КОМАНДЫ" : "ОБЩИЙ ЧАТ");
  const chatDescription = teamId
    ? "ОБЩЕНИЕ УЧАСТНИКОВ КОМАНДЫ"
    : "ОБЩЕНИЕ С УЧАСТНИКАМИ СИСТЕМЫ";

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="vice-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-lg pointer-events-none"></div>

        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 vice-gradient rounded-full flex items-center justify-center border-2 border-cyan-400 neon-glow">
            <MessageCircle className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient neon-text">
              {chatTitle}
            </h2>
            <p className="text-cyan-300 font-mono tracking-wide">
              {chatDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Чат */}
      <Card className="vice-card border border-pink-500/30 h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
            <MessageCircle className="mr-2 text-cyan-400" />
            СООБЩЕНИЯ
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-scroll">
          {/* Область сообщений */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-cyan-400/20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-gray-400/20" />
                      <Skeleton className="h-16 w-full bg-gray-400/20" />
                    </div>
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="w-16 h-16 text-cyan-400/50 mb-4" />
                  <p className="text-cyan-300 font-mono text-lg tracking-wider mb-2">
                    ЧАТ ПУСТ
                  </p>
                  <p className="text-gray-400 font-mono text-sm">
                    Станьте первым, кто отправит сообщение!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      isSystemMessage(message) ? "justify-center" : ""
                    }`}
                  >
                    {isSystemMessage(message) ? (
                      // Системное сообщение
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-3 max-w-md">
                        <Bot className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <div className="text-sm text-purple-300 font-mono">
                          {message.message}
                        </div>
                      </div>
                    ) : (
                      // Обычное сообщение пользователя
                      <>
                        <Avatar className="w-10 h-10 border-2 border-cyan-400/50">
                          <AvatarFallback className="vice-gradient text-white font-mono text-lg">
                            {message.profiles ? "👤" : "👤"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-bold font-mono text-cyan-300 tracking-wider">
                              {message.profiles?.full_name ||
                                message.profiles?.username ||
                                "Аноним"}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              {formatTime(message.created_at)}
                            </span>
                          </div>

                          <div className="bg-gray-800 border border-cyan-400/20 rounded-lg p-3">
                            <p className="text-gray-100 font-mono text-sm leading-relaxed break-words">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Форма отправки */}
          {user && (
            <div className="border-t border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 bg-gray-800 border-cyan-400/30 text-white font-mono focus:border-cyan-400 focus:ring-cyan-400"
                  disabled={isSending}
                  maxLength={500}
                />
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="vice-button font-mono tracking-wider px-6"
                >
                  {isSending ? (
                    "ОТПРАВКА..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      ОТПРАВИТЬ
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
