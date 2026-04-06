import type { Provider, Model } from "src/types/ai";

export const allAvailableModels: Record<Provider, Model[]> = {
  google: [
    { 
      name: "gemini-2.0-flash",
      capabilities: ["vision", "websearch", "reasoning"],
    },
    {
      name: "gemini-2.5-flash",
      capabilities: ["vision", "websearch", "reasoning"],
    },
    {
      name: "gemini-2.5-flash-lite",
      capabilities: ["vision", "websearch", "reasoning"],
    },
    {
      name: "gemini-2.5-pro",
      capabilities: ["vision", "websearch", "reasoning"],
    },
    {
      name: "gemini-3-flash-preview",
      capabilities: ["vision", "websearch", "reasoning"],
    },
    {
      name: "gemini-3.1-flash-lite-preview",
      capabilities: ["vision", "websearch", "reasoning"],
    },
    {
      name: "gemini-3.1-pro-preview",
      capabilities: ["vision", "websearch", "reasoning"],
    },
  ],
  ollama: [
    {
      name: "llama3.1:8b",
      capabilities: ["vision", "websearch", "reasoning"],
    },
  ],
};