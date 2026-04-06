import {
  GoogleGenAI,
  GoogleGenAIOptions,
  GenerateContentConfig,
  SafetySetting, 
  HarmCategory, 
  HarmBlockThreshold,
  ThinkingLevel,
} from "@google/genai";

import { getSettings } from "src/main";
import { agentSystemPrompt } from "src/backend/shared/prompts";  
import { callableFunctionDeclarations } from "src/backend/google/function";
import { DEFAULT_SETTINGS } from "src/settings/settings";

export async function createModel() {
  const settings = getSettings();

  // Initialize model and its configuration
  let baseUrl = settings.googleBaseUrl.trim();
  if (!baseUrl) baseUrl = "https://generativelanguage.googleapis.com";
  
  const config: GoogleGenAIOptions = { 
    apiKey: settings.googleApiKey, 
    apiVersion: "v1beta", 
    httpOptions: { baseUrl: baseUrl }
  };
  const ai = new GoogleGenAI(config);

  const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  const generationConfig: GenerateContentConfig = {
    systemInstruction: agentSystemPrompt,
    safetySettings: safetySettings,
    tools: [{ functionDeclarations: callableFunctionDeclarations }],
    thinkingConfig: {
      includeThoughts: true,
    },
  };

  // Special settings for Gemini 3 models
  if (settings.model.includes("3") && settings.thinkingLevel !== DEFAULT_SETTINGS.thinkingLevel) {
    generationConfig.thinkingConfig!.thinkingLevel = settings.thinkingLevel === "Low" 
      ? ThinkingLevel.LOW 
      : ThinkingLevel.HIGH;
  }
  if (settings.temperature !== DEFAULT_SETTINGS.temperature) {
    generationConfig.temperature = Number(settings.temperature);
  }
  if (settings.maxOutputTokens !== DEFAULT_SETTINGS.maxOutputTokens) {
    generationConfig.maxOutputTokens = Number(settings.maxOutputTokens);
  }

  return { ai, generationConfig };
}