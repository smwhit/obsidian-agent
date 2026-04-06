import { ChatResponse, Message, ToolCall } from "ollama";

import { createNoteFunctionDeclaration } from "src/backend/ollama/schemas/obsidian/obsCreate";
import { editNoteFunctionDeclaration } from "src/backend/ollama/schemas/obsidian/obsEdit";
import { readNoteFunctionDeclaration } from "src/backend/ollama/schemas/obsidian/obsRead";
import { createDirFunctionDeclaration } from "src/backend/ollama/schemas/obsidian/obsDir";
import { noteFilteringFunctionDeclaration } from "src/backend/ollama/schemas/obsidian/obsFilter";
import { listFilesFunctionDeclaration } from "src/backend/ollama/schemas/obsidian/obsListing";
import { vaultSearchFunctionDeclaration } from "src/backend/ollama/schemas/obsidian/obsSearch";
import { webSearchFunctionDeclaration } from "src/backend/ollama/schemas/websearch";

import { createNote } from "src/backend/shared/functions/obsidian/obsCreate";
import { editNote } from "src/backend/shared/functions/obsidian/obsEdit";
import { readNote } from "src/backend/shared/functions/obsidian/obsRead";
import { createDir } from "src/backend/shared/functions/obsidian/obsDir";
import { noteFiltering } from "src/backend/shared/functions/obsidian/obsFilter";
import { listFiles } from "src/backend/shared/functions/obsidian/obsListing";
import { vaultSearch } from "src/backend/shared/functions/obsidian/obsSearch";
import { webSearch } from "src/backend/shared/functions/webSearch";

export const callableFunctionDeclarations = [
  createNoteFunctionDeclaration,
  editNoteFunctionDeclaration,
  readNoteFunctionDeclaration,
  createDirFunctionDeclaration,
  noteFilteringFunctionDeclaration,
  listFilesFunctionDeclaration,
  vaultSearchFunctionDeclaration,
  webSearchFunctionDeclaration,
]

const availableFunctions = {
  "create_note": createNote,
  "edit_note": editNote,
  "read_note": readNote,
  "create_dir": createDir,
  "note_filtering": noteFiltering,
  "list_files": listFiles,
  "vault_search": vaultSearch,
  "web_search": webSearch,
}

export async function executeFunction(chunk: ChatResponse, funcCall: ToolCall): Promise<Record<string, any>> {
  let output: Record<string, any> = {};
  const functionToCall = availableFunctions[funcCall.function.name];
  
  if (functionToCall) {
    output = await functionToCall(funcCall.function.arguments);
  } else {
    console.log('Function', funcCall.function.name, 'not found');
  }

  return output;
}