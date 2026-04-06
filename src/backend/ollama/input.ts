import { Message as OllamaMessage } from "ollama";

import { agentSystemPrompt } from "src/backend/shared/prompts";
import type { Message } from "src/types/ai";

export async function prepareModelInputs(
  prompt: string,
  files: File[],
  attachments: string[],
): Promise<OllamaMessage[]> {
  const text = addAttachmentsToMessage(prompt, attachments);
  const unitArray = await getUnitArrayFromFile(files);

  const messages: OllamaMessage[] = [
    { role: "system", content: agentSystemPrompt },
    { role: "user", content: text, images: unitArray },
  ];

  return messages;
}


export async function buildChatHistory(
  conversation: Message[]
): Promise<OllamaMessage[]> {
  let messages: OllamaMessage[] = [];

  for (const message of conversation) {
    if (message.type === "user") {
      const text = addAttachmentsToMessage(message.content || "", message.attachments || []);
      messages.push({ role: "user", content: text });
    } else if (message.type === "bot" || message.type === "reasoning") {
      messages.push({ role: "assistant", content: message.content || "" });
    } else if (message.type === "tool") {
      messages.push({ role: "assistant", content: String(message.tool_response) || "", tool_calls: [
        { function: { name: message.tool_name || "", arguments: message.tool_arguments || {} }}
      ]});
    }
  }

  return messages;
}

export function addAttachmentsToMessage(prompt: string, attachments: string[]) {
  let text = prompt;
  if (attachments.length > 0) {
    text += "\n###\nAttached Obsidian notes: ";
    for (const attachment of attachments) text += attachment + "\n";
    text += "\n###\n";
  }
  return text;
}

export async function getUnitArrayFromFile(files: File[]) {
  const unitArray = await Promise.all(
    files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      return new Uint8Array(buffer);
    })
  );

  return unitArray;
}