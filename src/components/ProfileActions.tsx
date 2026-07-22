import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, UserPlus, Settings } from "lucide-react";
import { FriendsDialog } from "./FriendsDialog";
import { MessagesDialog } from "./MessagesDialog";

export const ProfileActions = () => {
  const [isFriendsDialogOpen, setIsFriendsDialogOpen] = useState(false);
  const [isMessagesDialogOpen, setIsMessagesDialogOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Управление друзьями */}
        <div className="vice-card p-6 relative">
          <div className="absolute inset-0 border border-cyan-400/30 rounded-lg pointer-events-none"></div>

          <h3 className="text-2xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-4 flex items-center">
            <Users className="mr-3 text-cyan-400 w-6 h-6" />
            ДРУЗЬЯ
          </h3>

          <p className="text-gray-300 font-mono mb-4">
            Управляйте своим списком друзей и заявками
          </p>

          <Button
            onClick={() => setIsFriendsDialogOpen(true)}
            className="vice-button font-mono tracking-wider w-full"
          >
            <Users className="mr-2 w-4 h-4" />
            УПРАВЛЕНИЕ ДРУЗЬЯМИ
          </Button>
        </div>

        {/* Сообщения */}
        {/* <div className="vice-card p-6 relative">
          <div className="absolute inset-0 border border-pink-400/30 rounded-lg pointer-events-none"></div>
          
          <h3 className="text-2xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-4 flex items-center">
            <MessageCircle className="mr-3 text-pink-400 w-6 h-6" />
            СООБЩЕНИЯ
          </h3>
          
          <p className="text-gray-300 font-mono mb-4">
            Личные сообщения и переписки
          </p>
          
          <Button
            onClick={() => setIsMessagesDialogOpen(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white font-mono tracking-wider w-full"
          >
            <MessageCircle className="mr-2 w-4 h-4" />
            ОТКРЫТЬ СООБЩЕНИЯ
          </Button>
        </div> */}
      </div>

      {/* Диалоги */}
      <FriendsDialog
        isOpen={isFriendsDialogOpen}
        onClose={() => setIsFriendsDialogOpen(false)}
      />

      <MessagesDialog
        isOpen={isMessagesDialogOpen}
        onClose={() => setIsMessagesDialogOpen(false)}
      />
    </>
  );
};
