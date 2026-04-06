import { Notice, TFile } from "obsidian";

import { getApp, getSettings } from "src/main";
import { call } from "src/backend/modelRouter";
import { exportMessage, removeMessagesAfterIndexN } from "src/utils/chat/chatHistory";

import type { CallHandlerParams, Message } from "src/types/ai";


export const handleCall = async ({
  activeChat,
  conversation,
  message,
  messageIndex,
  files = [],
  attachments = [],
  isRegeneration = false,
  setConversation,
}: CallHandlerParams) => {
  const settings = getSettings();

  // If regenerating, remove the messages after the regenerated message
  // Rewrites the chat file from messages from 0 to n. If n is 0 empties the chat file
  if (isRegeneration && messageIndex) {
    await removeMessagesAfterIndexN(activeChat, messageIndex);
    setConversation((prev) => prev.slice(0, messageIndex));
  }

  // If it is the first message, generate a name for the chat file
  if (settings.generateChatName && !isRegeneration && conversation.length === 0) {
    // Show in the chat a message 
    activeChat = await generateChatFileName(message, files, attachments, activeChat);
  }

  // Add the user message to the conversation
  const userMessage: Message = {
    type: "user",
    content: message,
    attachments,
    processed: true,
  };
  setConversation((prev: Message[]) => [...prev, userMessage]);
  exportMessage(userMessage, activeChat);

  // Track messages added by the model for later export
  const addedMessages: Message[] = [];

  const addMessage = (message: Message) => {
    // Synchronous tracking for export
    const lastTracked = addedMessages.at(-1);
    if (lastTracked && !lastTracked.processed && lastTracked.type === message.type) {
      lastTracked.content = (lastTracked.content || "") + (message.content || "");
      if (message.processed) lastTracked.processed = true;
    } else {
      if (lastTracked && !lastTracked.processed) {
        lastTracked.processed = true;
      }
      addedMessages.push({ ...message });
    }

    // Update React state using prev to avoid stale closure
    setConversation((prev: Message[]) => {
      const last = prev.at(-1);

      // Same type and unprocessed: append content
      if (last && !last.processed && last.type === message.type) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          content: (last.content || "") + (message.content || ""),
          processed: message.processed ?? false,
        };
        return updated;
      }

      // Previous is unprocessed but different type: finalize it, then add new
      if (last && !last.processed) {
        const updated = [...prev];
        updated[updated.length - 1] = { ...last, processed: true };
        return [...updated, { ...message }];
      }

      // Otherwise (last is processed, or is user/error): add as new message
      return [...prev, { ...message }];
    });
  };

  let callError: string = "";
  try {
    await call({ prompt: message, files, attachments, conversation, addMessage });
  } catch (error) {
    callError = String(error);
  }

  // Add error message if the call failed
  if (callError) {
    if (settings.debug) console.error(callError);
    new Notice(callError, 5000);

    const errorMessage: Message = {
      type: "error",
      content: "*Something went wrong while processing the request.*",
      processed: true,
    };

    setConversation((prev: Message[]) => {
      const updated = [...prev];
      const last = updated.at(-1);
      if (last && !last.processed) {
        updated[updated.length - 1] = errorMessage;
      } else {
        updated.push(errorMessage);
      }
      return updated;
    });
    exportMessage(errorMessage, activeChat);
    return;
  }

  // Finalize any remaining unprocessed message
  const lastTracked = addedMessages.at(-1);
  if (lastTracked && !lastTracked.processed) {
    lastTracked.processed = true;
  }
  setConversation((prev: Message[]) => {
    const last = prev.at(-1);
    if (last && !last.processed) {
      const updated = [...prev];
      updated[updated.length - 1] = { ...last, processed: true };
      return updated;
    }
    return prev;
  });

  // Export all model messages to the chat file
  for (const msg of addedMessages) {
    exportMessage(msg, activeChat);
  }
};


// Function that generates a name for a chat file
async function generateChatFileName(prompt: string, files: File[], attachments: string[], activeChat: TFile): Promise<TFile> {
  const app = getApp();
  
  prompt = "Generate a name for a chat file, no more than 4 words, based on the following prompt: \n" + prompt;
  let generatedName = await call({ prompt, files, attachments });
  if (!generatedName) generatedName = "Unable to generate name";

  const newName = generatedName.replace(/[*"\\/<>:|?]/g, "").trim();
  
  const newPath = activeChat.parent?.path + "/" + newName + ".md";

  await app.vault.rename(activeChat, newPath);
  return app.vault.getFileByPath(newPath)!;
}
