import {
  GoogleGenAI,
  GenerateContentConfig,
  GenerateContentResponse,
  Chat,
  Content,
  Part,
  ApiError,
} from "@google/genai";

import { createModel } from "src/backend/google/client";
import { buildChatHistory, prepareModelInputs } from "src/backend/google/input";
import { executeFunction } from "src/backend/google/function";
import type { ModelCallParams, ModelGenerationParams, Message } from "src/types/ai";

// Synchronous call to the Google model, return a string response
export async function generateGoogleResponse({
  model,
  prompt,
  files = [],
  attachments = [],
}: ModelGenerationParams): Promise<string> {
  const { ai, generationConfig } = await createModel();

  // Prepare model inputs
  const input: Part[] = await prepareModelInputs(prompt, files, attachments);

  // Generate synchronous response
  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: input }],
    config: generationConfig,
  });
  return response.text || "";
}

// Asynchronous and streaming call to the Google model, return nothing and instead adds messages to the conversation
export async function callGoogle({
  model,
  prompt,
  files = [],
  attachments = [],
  conversation = [],
  addMessage,
 }: ModelCallParams): Promise<void> {
  const { ai, generationConfig } = await createModel();

  // Create chat history
  const chatHistory = conversation.length > 0 ? await buildChatHistory(conversation) : [];
  const chat: Chat = ai.chats.create({
    model,
    history: chatHistory,
    config: generationConfig,
  });

  // Prepare model inputs
  const input: Part[] = await prepareModelInputs(prompt, files, attachments);

  // Generate stream response that add messages to the conersation
  await sendMessageToChat(
    1, 
    ai,
    model,
    generationConfig,
    chat, 
    chatHistory,
    input, 
    addMessage, 
    new Set(),
  );
}

// Sends the message to the chat history and process the response
async function sendMessageToChat(
  turn: number,
  ai: GoogleGenAI,
  model: string,
  generationConfig: GenerateContentConfig,
  chat: Chat,
  originalHistory: Content[],
  input: Part[], 
  addMessage: (message: Message) => void,
  executedFunctionIds: Set<string>,
): Promise<void> {
  if (turn > 10) {
    throw new Error("Maximum tool execution depth reached. This maximum number of turns is set to avoid infinite loops.");
  }

  try {
    const stream = await chat.sendMessageStream({ message: input });

    for await (const chunk of stream) {
      // Handle function calls before text to avoid emitting empty messages
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        await manageFunctionCall(turn, ai, model, generationConfig, originalHistory, input, chunk, addMessage, executedFunctionIds);
        continue;
      }

      if (chunk.candidates) {
        for (const candidate of chunk.candidates) {
          const parts = candidate.content?.parts || [];
          const isFinished = !!candidate.finishReason;

          for (const part of parts) {
            if (part.thought && part.text) {
              addMessage({
                type: "reasoning",
                content: part.text,
                processed: isFinished,
              });
            } else if (part.text) {
              addMessage({
                type: "bot",
                content: part.text,
                processed: isFinished,
              });
            }
          }
        }
      } else {
        addMessage({
          type: "error",
          content: "The model did not return any response.",
          processed: true,
        });
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) throw new Error("API key not set, or isn't valid.")
      if (error.status === 429) throw new Error("API quota exceeded. Please check your Google Cloud account.");
      if (error.status === 503) throw new Error("API service overloaded. Please try again later.");
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error(`Unexpected Error: ${String(error)}`);
  }
}


// Execute the function with the provided arguments and return the responses to the agent
async function manageFunctionCall(
  turn: number,
  ai: GoogleGenAI,
  model: string,
  generationConfig: GenerateContentConfig,
  originalHistory: Content[],
  userInput: Part[],
  chunk: GenerateContentResponse,
  addMessage: (message: Message) => void,
  executedFunctionIds: Set<string>,
): Promise<void> {
  if (!chunk.candidates || chunk.candidates.length === 0) return;
  const cand = chunk.candidates[0];
  if (!cand) return;
    
  // Extract function call
  const parts: Part[] = cand.content?.parts || [];
  const fcParts = parts.filter(p => !!p.functionCall);
  if (fcParts.length === 0) return;

  // One function execution at a time
  const fcPartCandidate = fcParts[0];
  const funcCall = fcPartCandidate.functionCall!;
  if (!funcCall || !funcCall.name) return;

  // Add executed function data to avoid double executions (this calls do not have id property)
  const fId = funcCall.name + JSON.stringify(funcCall.args || {});
  if (executedFunctionIds.has(fId)) return;
  executedFunctionIds.add(fId);
    
  const response = await executeFunction(funcCall);

  // Add the function response to the conversation
  addMessage({
    id: funcCall.id,
    type: "tool",
    tool_name: funcCall.name,
    tool_arguments: funcCall.args,
    tool_response: response,
    processed: true,
  });

  // Create the function response part to update the chat history
  const functionResponsePart: Part = {
    functionResponse: {
      name: funcCall.name,
      response: response,
    }
  };

  // The model function call Content
  const modelContent: Content = cand.content!;
  const userContent: Content = {
    role: "user",
    parts: userInput,
  };

  const newHistory = [...originalHistory, userContent, modelContent];

  // Create a new chat with the updated chat history
  const newChat: Chat = ai.chats.create({
    model: model,
    history: newHistory,
    config: generationConfig,
  })

  const nextInput: Part[] = [ functionResponsePart ]

  // Call again the agent with the newHistory
  await sendMessageToChat(
    turn+1, 
    ai, 
    model, 
    generationConfig, 
    newChat, 
    newHistory, 
    nextInput, 
    addMessage, 
    executedFunctionIds
  );
}
