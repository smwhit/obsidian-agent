export interface AgentSettings {
  provider: string;
  model: string;
  
  // Google config
  googleApiKey: string;
  googleBaseUrl: string;
  
  // Model config
  temperature: string;
  thinkingLevel: string;
  maxOutputTokens: string;
  
  // Agent config
  rules: string;
  maxHistoryTurns: number;
  
  // Chat storage
  chatsFolder: string;
  
  // Addons
  generateChatName: boolean;
  readImages: boolean;
  
  // Control
  reviewChanges: boolean;
  
  // Developers
  debug: boolean;
}

// Default settings for the plugin
export const DEFAULT_SETTINGS: AgentSettings = {
  provider: "google",
  model: "gemini-2.5-flash",

  googleApiKey: "",
  googleBaseUrl: "",
  
  temperature: "Default",
  thinkingLevel: "Default",
  maxOutputTokens: "Default",
  
  rules: "",
  maxHistoryTurns: 3,

  chatsFolder: "Chats",
  
  generateChatName: true,
  readImages: true,
  
  reviewChanges: true,
  
  debug: false,
};