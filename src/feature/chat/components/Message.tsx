import { useCallback, useState, useEffect, useRef } from "react";
import { Copy, Check, RefreshCcw } from "lucide-react";
import { MarkdownRenderer, Component } from "obsidian";

import { getApp } from "src/main";
import { handleCall } from "src/feature/chat/handlers/aiHandlers";
import Attachments from "src/feature/chat/ui/Attachments";
import ToolCalls from "src/feature/chat/ui/ToolCalls";
import ReasoningBlock from "src/feature/chat/ui/ReasoningBlock";
import ChatInput from "src/feature/chat/components/Input";
import type { MessageProps } from "src/types/chat";


export default function Message({
  index,
  message,
  conversation,
  setConversation,
  activeChat,
}: MessageProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const componentRef = useRef<Component | null>(null);

  const handleRegenerate = async () => {
    await handleCall({
      activeChat,
      conversation,
      message: conversation[index - 1].content!,
      messageIndex: index - 1,
      files: [],
      attachments: conversation[index - 1].attachments,
      isRegeneration: true,
      setConversation,
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  }

  // Handle Obsidian links
  const preprocess = useCallback((content: string): string => {
    // Convert [[link]] to obsidian://open?file=link
    return content.replace(".md]]", "]]").replace(/\[\[([^\]]+)\]\]/g, (_, p1) => {
      const encoded = encodeURIComponent(p1.trim());
      return `[${p1.trim()}](obsidian://open?file=${encoded})`;
    });
  }, []);
  
  useEffect(() => {
    const app = getApp();
    if (!contentRef.current || message.type === "user") return;

    // Render markdown via Obsidian after preprocessing    
    if (componentRef.current) {
      componentRef.current.unload();
      componentRef.current = null;
    }

    while (contentRef.current.firstChild) {
      contentRef.current.removeChild(contentRef.current.firstChild);
    }

    const container = document.createElement("div");
    contentRef.current.appendChild(container);
    
    const newComponent = new Component();
    componentRef.current = newComponent;
    
    const processed = preprocess(message.content || "");
    MarkdownRenderer.render(app, processed, container, '', newComponent);

    // Cleanup
    return () => {
      if (componentRef.current === newComponent) {
        newComponent.unload();
        componentRef.current = null;
      }
    };
  }, [message.content, message.type, preprocess]);

  if (message.type === "user") {
    if (isEditing) {
      return (
        <ChatInput
          activeChat={activeChat}
          initialValue={message.content}
          attachments={message.attachments}
          messageIndex={index}
          conversation={conversation}
          setConversation={setConversation}
          isRegeneration={true}
          setIsEditing={setIsEditing}
        />
      );
    }

    return (
      <div
        className={`obsidian-agent__chat-single-message__user-message-border
          ${message.processed === false ? "loading-border" : ""}
        `}
      >
        <div
          className="obsidian-agent__chat-single-message__user-message"
          onClick={() => setIsEditing(prev => !prev)}
        >
          {message.attachments && message.attachments.length > 0 && (
            <Attachments attachments={message.attachments}/>
          )}
          <div className="obsidian-agent__chat-single-message__user-message-content">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "reasoning") {
    return (
      <ReasoningBlock
        reasoning={message.content || ""} 
        isProcessed={message.processed || false}
      />
    );
  }

  if (message.type === "tool") {
    return (
      <ToolCalls toolCall={message} />
    );
  }

  return (
    <div className="obsidian-agent__chat-single-message__bot-message">      
      {/* Message content */}
      <div 
        ref={contentRef}
        className="obsidian-agent__chat-single-message__bot-message-content"
      >
        {message.content}
      </div>

      {/* Copy button and other actions */}
      {message.content && message.content.trim() && (
        <div>
          <button
            title="Copy"
            onClick={handleCopy} 
            className="obsidian-agent__button-icon"
          >
            {copied ? <Check size={16} className="obsidian-agent__animate__copy-check-animate" /> : <Copy size={16} />}
          </button>

          <button
            title="Regenerate"
            onClick={handleRegenerate}
            className="obsidian-agent__button-icon"
          >
            <RefreshCcw size={16}/>
          </button>
        </div>
      )}
    </div>
  );
}