
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle } from 'lucide-react';
import { usePrivateMessages } from '@/hooks/usePrivateMessages';

interface DirectMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUsername: string;
  recipientId: string;
}

export const DirectMessageDialog: React.FC<DirectMessageDialogProps> = ({
  isOpen,
  onClose,
  recipientUsername,
  recipientId
}) => {
  const [message, setMessage] = useState('');
  const { sendMessage, isSending } = usePrivateMessages();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage({
        recipientId,
        message: message.trim()
      });
      
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-cyan-400/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
            <MessageCircle className="mr-2 text-cyan-400" />
            ЛИЧНОЕ СООБЩЕНИЕ
          </DialogTitle>
          <p className="text-cyan-300 font-mono">
            Получатель: <span className="text-pink-400">{recipientUsername}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите ваше сообщение..."
              className="bg-gray-800 border-cyan-400/30 text-white font-mono resize-none"
              rows={6}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              ОТМЕНА
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              className="vice-button font-mono tracking-wider"
            >
              {isSending ? (
                'ОТПРАВКА...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  ОТПРАВИТЬ
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
