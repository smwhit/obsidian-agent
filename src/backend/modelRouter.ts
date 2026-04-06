import { Notice } from "obsidian";

import { getSettings } from "src/main";
import { callGoogle, generateGoogleResponse } from "src/backend/google/call";
import { callOllama, generateOllamaResponse } from "src/backend/ollama/call";
import type { CallParams } from "src/types/ai";

export async function call({
  prompt,
  files = [],
  attachments = [],
  conversation = [],
  addMessage,
}: CallParams): Promise<string | void> {
  const settings = getSettings();

  const provider = settings.provider;
  const model = settings.model;

  // Make the call depending on the provider
  switch (provider) {
    case "google":
      if (addMessage) {
        await callGoogle({ model, prompt, files, attachments, conversation, addMessage });
      } else {
        const response = await generateGoogleResponse({ model, prompt, files, attachments });
        return response;
      }
      break;
    
    case "ollama":
      if (addMessage) {
        await callOllama({ model, prompt, files, attachments, conversation, addMessage });
      } else {
        const response = await generateOllamaResponse({ model, prompt, files, attachments });
        return response;
      }
      break;
    
    default:
      new Notice(`Unsupported provider: ${provider}`, 5000);
      if (settings.debug) console.error(`Unsupported provider: ${provider}`);
      return;
    }
  return;
}