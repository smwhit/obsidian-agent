import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { MessageSquareOff } from "lucide-react";
import { TFile } from "obsidian";

import { ensureActiveChat } from "src/feature/chat/handlers/chatHandlers";
import { importConversation } from "src/utils/chat/chatHistory";
import Form from "src/feature/chat/components/Form";
import Input from "src/feature/chat/components/Input";
import ChatMessage from "src/feature/chat/components/Message";
import type { Message } from "src/types/ai";


export interface ChatRef {
  getActiveChat: () => TFile | null;
  getUpdateConversation: () => (value: Message[] | ((prev: Message[]) => Message[])) => void;
  setActiveChat: (chat: TFile | null) => void;
}

export const Chat = forwardRef<ChatRef>((props, ref) => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<TFile | null>(null);
  const [availableChats, setAvailableChats] = useState<TFile[]>([]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getActiveChat: () => activeChat,
    getUpdateConversation: () => setConversation,
    setActiveChat: (chat: TFile | null) => setActiveChat(chat),
  }));

  // Executed when loading the component
  useEffect(() => {
    const fetchData = async () => {
      const { activeChat: chat, availableChats } = await ensureActiveChat();
      setActiveChat(chat);
      setAvailableChats(availableChats);
    };
    fetchData();
  }, []);

  // Executed when the active chat file changes
  useEffect(() => {
    if (!activeChat) return;
    const loadConversation = async () => {
      const messages = await importConversation(activeChat);
      setConversation(messages);
    };
    loadConversation();
  }, [activeChat]);
  

  return (
    <div className="obsidian-agent__chat-main__container">
      <Form
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        availableChats={availableChats}
        setAvailableChats={setAvailableChats}
      />

      <hr className="obsidian-agent__hr"/>

      {conversation.length > 0 ? (
        <div className="obsidian-agent__chat-messages">
          {conversation.map((message, index) => (
            <ChatMessage
              key={index}
              index={index}
              message={message}
              conversation={conversation}
              setConversation={setConversation}
              activeChat={activeChat}
            />
          ))}
        </div>
      ) : (
        <div className="obsidian-agent__empty-chat">
          <MessageSquareOff size={40}/>
          <p>No messages have been sent. Send one to start the conversation.</p>
        </div>
      )}

      <hr className="obsidian-agent__hr"/>
      
      <Input
        activeChat={activeChat}
        conversation={conversation}
        setConversation={setConversation}
      />
    </div>
  );
});
