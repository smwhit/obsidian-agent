import ollama from "ollama";
import { ChatRequest, Message as OllamaMessage, ToolCall } from "ollama";

import { getSettings } from "src/main";
import { callableFunctionDeclarations } from "src/backend/ollama/function";
import { buildChatHistory, prepareModelInputs } from "src/backend/ollama/input";
import { executeFunction } from "src/backend/ollama/function";
import type { ModelCallParams, ModelGenerationParams, Message } from "src/types/ai";

// Synchronous call to the Google model, return a string response
export async function generateOllamaResponse({
  model,
  prompt,
  files = [],
  attachments = [],
}: ModelGenerationParams): Promise<string> {
  const messages = await prepareModelInputs(prompt, files, attachments)
  const modelConfig: ChatRequest = {
    model,
    messages,
    think: true,
    tools: callableFunctionDeclarations,
  };

  const response = await ollama.chat({ ...modelConfig, stream: false });
  return response.message.content;
}


// Asynchronous and streaming call to the Ollama model, return nothing and instead adds messages to the conversation
export async function callOllama({
  model,
  prompt,
  files = [],
  attachments = [],
  conversation = [],
  addMessage,
}: ModelCallParams): Promise<void> {
  const incomingMessages = await prepareModelInputs(prompt, files, attachments);
  const chatHistory = await buildChatHistory(conversation);

  // Send message to chat with turn tracking
  await sendMessageToChat(
    1,
    model,
    chatHistory,
    incomingMessages,
    addMessage,
    new Set(),
  );
}

// Sends the message to the chat history and process the response
async function sendMessageToChat(
  turn: number,
  model: string,
  chatHistory: OllamaMessage[],
  incomingMessages: OllamaMessage[],
  addMessage: (message: Message) => void,
  executedFunctionIds: Set<string>,
): Promise<void> {
  const settings = getSettings();
  const maxTurns = settings.maxHistoryTurns * 2; // Each user+bot exchange = 2 turns, so multiply by 2 for tool calls
  
  if (turn > maxTurns) {
    throw new Error(`Maximum tool execution depth reached (${maxTurns} turns). This limit is set to avoid infinite loops.`);
  }

  const messages = [...chatHistory, ...incomingMessages];
  const modelConfig: ChatRequest = {
    model,
    messages,
    think: true,
    tools: callableFunctionDeclarations,
  };

  try {
    const response = await ollama.chat({ ...modelConfig, stream: true });
    
    for await (const chunk of response) {
      if (chunk.message.thinking) {
        addMessage({
          type: "reasoning",
          content: chunk.message.thinking || "",
          processed: false,
        });
      }

      if (chunk.message.content) {
        addMessage({
          type: "bot",
          content: chunk.message.content || "",
          processed: false,
        });
      }

      if (chunk.message.tool_calls) {
        await manageFunctionCall(
          turn,
          model,
          chatHistory,
          incomingMessages,
          chunk,
          addMessage,
          executedFunctionIds,
        );
      }
    }
  } catch (error) {
    throw new Error(`Ollama Error: ${String(error)}`);
  }
}

// Execute the function with the provided arguments and return the responses to the agent
async function manageFunctionCall(
  turn: number,
  model: string,
  chatHistory: OllamaMessage[],
  userMessages: OllamaMessage[],
  chunk: any,
  addMessage: (message: Message) => void,
  executedFunctionIds: Set<string>,
): Promise<void> {
  if (!chunk.message.tool_calls) return;

  const toolCalls = chunk.message.tool_calls as ToolCall[];
  const toolResponses: OllamaMessage[] = [];

  for (const tool of toolCalls) {
    // Add executed function data to avoid double executions
    const fId = tool.function.name + JSON.stringify(tool.function.arguments || {});
    if (executedFunctionIds.has(fId)) continue;
    executedFunctionIds.add(fId);

    const output = await executeFunction(chunk, tool);
    
    // Add the function response to the conversation UI
    addMessage({
      type: "tool",
      tool_name: tool.function.name,
      tool_arguments: tool.function.arguments,
      tool_response: output,
      processed: true,
    });

    // Create tool response message for Ollama
    toolResponses.push({
      role: 'tool',
      content: output.toString(),
      tool_name: tool.function.name,
    });
  }

  // If we have tool responses, send them back to the model
  if (toolResponses.length > 0) {
    // Build the new message history
    const newHistory = [
      ...chatHistory,
      ...userMessages,
      chunk.message,
      ...toolResponses,
    ];

    // Recursively call with the updated history
    await sendMessageToChat(
      turn + 1,
      model,
      newHistory,
      [],
      addMessage,
      executedFunctionIds,
    );
  }
}