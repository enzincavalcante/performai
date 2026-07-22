
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, 
  Send, 
  ArrowLeft, 
  MessageCircle,
  MailOpen,
  User
} from 'lucide-react';
import { usePrivateMessages } from '@/hooks/usePrivateMessages';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipientId?: string;
  initialRecipientUsername?: string;
}

// GTA стиль аватарки
const avatars = [
  '👨‍💼', '👩‍💼', '🕴️', '👨‍🔧', '👩‍🔧', '👨‍🚀',
  '👩‍🚀', '👨‍💻', '👩‍💻', '🦹‍♂️', '🦹‍♀️', '🥷'
];

export const MessagesDialog: React.FC<MessagesDialogProps> = ({
  isOpen,
  onClose,
  initialRecipientId,
  initialRecipientUsername
}) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');

  const {
    conversations,
    conversationsLoading,
    sendMessage,
    markAsRead,
    isSending
  } = usePrivateMessages();

  const getAvatar = (avatarId: number) => {
    const avatarIndex = (avatarId || 1) - 1;
    return avatars[avatarIndex] || avatars[0];
  };

  // Real-time обновления для выбранного диалога
  useEffect(() => {
    if (!user?.id || !selectedConversation) return;

    const channel = supabase
      .channel('private-messages-dialog')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${selectedConversation.partnerId}),and(sender_id.eq.${selectedConversation.partnerId},recipient_id.eq.${user.id}))`
        },
        (payload) => {
          console.log('New message received:', payload);
          // Обновляем выбранный диалог с новым сообщением
          const newMessage = {
            ...payload.new,
            sender: payload.new.sender_id === user.id ? null : selectedConversation.partner,
            recipient: payload.new.recipient_id === user.id ? null : selectedConversation.partner
          };
          
          setSelectedConversation(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedConversation?.partnerId]);

  // Если передан начальный получатель, создаем новый диалог
  useEffect(() => {
    if (initialRecipientId && initialRecipientUsername && isOpen) {
      setSelectedConversation({
        partnerId: initialRecipientId,
        partner: { username: initialRecipientUsername },
        messages: []
      });
    }
  }, [initialRecipientId, initialRecipientUsername, isOpen]);

  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
    
    // Отмечаем непрочитанные сообщения как прочитанные
    const unreadMessages = conversation.messages
      .filter((msg: any) => !msg.is_read && msg.recipient_id === user?.id)
      .map((msg: any) => msg.id);
    
    if (unreadMessages.length > 0) {
      await markAsRead(unreadMessages);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        recipientId: selectedConversation.partnerId,
        message: newMessage.trim()
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setNewMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] bg-gray-900 border-cyan-400/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
            {selectedConversation ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mr-2 text-cyan-400 hover:text-cyan-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <MessageCircle className="mr-2 text-cyan-400" />
                {selectedConversation.partner.full_name || selectedConversation.partner.username}
              </>
            ) : (
              <>
                <Mail className="mr-2 text-cyan-400" />
                СООБЩЕНИЯ
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {!selectedConversation ? (
          // Список диалогов
          <div className="space-y-3">
            <ScrollArea className="h-96">
              {conversationsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 vice-card mb-3">
                    <Skeleton className="w-12 h-12 rounded-full bg-cyan-400/20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-gray-400/20" />
                      <Skeleton className="h-3 w-48 bg-gray-400/20" />
                    </div>
                  </div>
                ))
              ) : conversations?.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-mono">
                  У вас пока нет сообщений
                </div>
              ) : (
                conversations?.map((conversation) => (
                  <div
                    key={conversation.partnerId}
                    onClick={() => handleSelectConversation(conversation)}
                    className="flex items-center justify-between p-3 vice-card border border-cyan-400/20 hover:border-cyan-400/40 transition-all cursor-pointer mb-3"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 vice-gradient rounded-full flex items-center justify-center text-2xl border border-pink-500/50">
                        {conversation.partner.avatar_id ? 
                          getAvatar(conversation.partner.avatar_id) : 
                          <User className="h-6 w-6 text-pink-400" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="font-bold font-mono text-cyan-300 flex items-center">
                          {conversation.partner.full_name || conversation.partner.username}
                          {conversation.unreadCount > 0 && (
                            <Badge className="ml-2 bg-red-500 text-white">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 font-mono truncate">
                          {conversation.lastMessage.message}
                        </div>
                        <div className="text-xs text-purple-300 font-mono">
                          {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                            addSuffix: true,
                            locale: ru
                          })}
                        </div>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <MailOpen className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        ) : (
          // Диалог с сообщениями
          <div className="flex flex-col h-96">
            {/* Сообщения */}
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-3">
                {selectedConversation.messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-mono">
                    Начните переписку!
                  </div>
                ) : (
                  selectedConversation.messages
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((message: any) => {
                      const isOutgoing = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg font-mono ${
                              isOutgoing
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-700 text-gray-100'
                            }`}
                          >
                            <div className="text-sm">{message.message}</div>
                            <div className={`text-xs mt-1 ${
                              isOutgoing ? 'text-cyan-200' : 'text-gray-400'
                            }`}>
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                                locale: ru
                              })}
                              {!message.is_read && !isOutgoing && (
                                <span className="ml-2 text-yellow-400">●</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </ScrollArea>

            {/* Форма отправки */}
            <div className="space-y-3 border-t border-gray-700 pt-4">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-gray-800 border-cyan-400/30 text-white font-mono resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="vice-button font-mono tracking-wider"
                >
                  {isSending ? (
                    'ОТПРАВКА...'
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Ctrl+Enter для отправки
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
