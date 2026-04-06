import { Content, Part } from "@google/genai";

import { getSettings } from "src/main";
import { imageToBase64 } from "src/utils/parsing/imageBase64";

import type { Message } from "src/types/ai";


// Function that prepare the prompt into inputs for the agent
export async function prepareModelInputs(
  prompt: string,
  files: File[],
  attachments: string[],
): Promise<Part[]> {
  // Add note paths (attachments) to the prompt
  let text = prompt;
  if (attachments.length > 0) {
    text += "\n###\nAttached Obsidian notes: ";
    for (const attachment of attachments) text += attachment + "\n";
    text += "\n###\n";
  };

  // Add files to the parts
  const parts: Part[] = [{ text }];

  for (const file of files) {
    const base64 = await imageToBase64(file);

    parts.push({
      inlineData: {
        mimeType: file.type,
        data: base64.replace(/^data:.*;base64,/, ""), // Remove the data URL prefix
      },
    });
  };

  return parts;
}


// Function that builds the chat history
export async function buildChatHistory(
  conversation: Message[],
): Promise<Content[]> {
  const settings = getSettings();
  const maxHistoryTurns = settings.maxHistoryTurns;

  if (maxHistoryTurns === 0) return [];

  const chatHistory: Content[] = [];
  let selectedMessages: Message[] = conversation.slice(-maxHistoryTurns*2);
  // Reverse to process the messages in the order they were sent
  selectedMessages = selectedMessages.reverse(); 

  for (const message of selectedMessages) {
    if (message.type === "error") continue;

    // We need to include, per tool call, the function response (user) and the function call (model)
    if (message.type === "tool") {
        const modelFunctionCall: Part[] = [{
          functionCall: {
            name: message.tool_name,
            args: message.tool_arguments,
          }
        }];
        chatHistory.push({
          role: "model",
          parts: modelFunctionCall,
        });

        const userFunctionResponse: Part[] = [{
          functionResponse: {
            name: message.tool_name,
            response: message.tool_response
          }
        }]
        chatHistory.push({
          role: "user",
          parts: userFunctionResponse,
        });

      if (message.content && message.content.trim().length > 0) {
        const modelFinalAnswer: Part[] = [{
          text: message.content,
        }]
        chatHistory.push({
          role: "model",
          parts: modelFinalAnswer,
        });
      }
    } else {
      let role = "model";
      if (message.type === "user") role = "user";

      const parts: Part[] = await prepareModelInputs(message.content || "", [], message.attachments || []);
      chatHistory.push({ role, parts });
    }
  };
  
  // Reverse back to original order
  chatHistory.reverse();
  
  return chatHistory;
}
