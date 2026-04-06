export type Provider = "google" | "ollama";

export interface Model {
  name: string,
  capabilities: Array<"vision" | "reasoning" | "websearch">,
};

// Outputs
export interface Message {
  id?: string;
  type: "user" | "bot" | "error" | "tool" | "reasoning";
  content?: string;
  tool_name?: string;
  tool_arguments?: Record<string, any>;
  tool_response?: Record<string, unknown>;
  attachments?: string[];
  processed?: boolean;
}

// Function parameters
export type CallHandlerParams = {
  activeChat: TFile,
  conversation: Message[],
  message: string,
  messageIndex?: number,
  files?: File[],
  attachments?: string[],
  isRegeneration?: boolean,
  setConversation: (value: Message[] | ((prev: Message[]) => Message[])) => void,
};

export interface CallParams {
  prompt: string,
  files?: File[],
  attachments?: string[],
  conversation?: Message[],
  addMessage?: (message: Message) => void,
};

export interface ModelCallParams extends CallParams {
  addMessage: (message: Message) => void,
  model: string
};

export interface ModelGenerationParams {
  model: string,
  prompt: string,
  files?: File[],
  attachments?: string[],
};