import { TFile } from "obsidian";
import { Message } from "src/types/ai";

// Input
export interface InputProps {
  activeChat: TFile | null;
  initialValue?: string;
  attachments?: string[];
  messageIndex?: number;
  isRegeneration?: boolean;
  setIsEditing?: ((s: boolean) => void);
  conversation: Message[];
  setConversation: (value: Message[] | ((prev: Message[]) => Message[])) => void;
}

// Chat form
export interface FormProps {
  activeChat: TFile | null;
  setActiveChat: (c: TFile | null) => void
  availableChats: TFile[];
  setAvailableChats: (c: TFile[]) => void;
}

// Messages
export interface MessageProps {
  index: number;
  message: Message;
  conversation: Message[];
  setConversation: (value: Message[] | ((prev: Message[]) => Message[])) => void;
  activeChat: TFile | null;
}

// Tools
export interface ToolCall {
  name: string;
  args?: Record<string, any>;
  response?: Record<string, any>;
}

export interface ToolCallsProps {
  toolCall: Message;
}

// Reasoning Block
export interface ReasoningBlock {
  title: string;
  content: string;
}

export interface ReasoningProps {
  reasoning: string;
  isProcessed: boolean;
}

export interface AttachmentsProps {
  attachments: string[];
}
