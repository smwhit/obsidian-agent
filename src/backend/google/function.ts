import { FunctionCall } from "@google/genai";

import { createNote } from "src/backend/shared/functions/obsidian/obsCreate";
import { editNote } from "src/backend/shared/functions/obsidian/obsEdit";
import { readNote } from "src/backend/shared/functions/obsidian/obsRead";
import { createDir } from "src/backend/shared/functions/obsidian/obsDir";
import { noteFiltering } from "src/backend/shared/functions/obsidian/obsFilter";
import { listFiles } from "src/backend/shared/functions/obsidian/obsListing";
import { vaultSearch } from "src/backend/shared/functions/obsidian/obsSearch";
import { webSearch } from "src/backend/shared/functions/webSearch";

import { createNoteFunctionDeclaration } from "src/backend/google/schemas/obsidian/obsCreate";
import { editNoteFunctionDeclaration } from "src/backend/google/schemas/obsidian/obsEdit";
import { readNoteFunctionDeclaration } from "src/backend/google/schemas/obsidian/obsRead";
import { createDirFunctionDeclaration } from "src/backend/google/schemas/obsidian/obsDir";
import { noteFilteringFunctionDeclaration } from "src/backend/google/schemas/obsidian/obsFilter";
import { listFilesFunctionDeclaration } from "src/backend/google/schemas/obsidian/obsListing";
import { vaultSearchFunctionDeclaration } from "src/backend/google/schemas/obsidian/obsSearch";
import { webSearchFunctionDeclaration } from "src/backend/google/schemas/webSearch";


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

export async function executeFunction(funcCall: FunctionCall) {
  let response;
  switch (funcCall.name) {
    case "web_search":
      response = await webSearch(
        funcCall.args!.query as string
      );
      break;

    case "create_note":
      response = await createNote(
        funcCall.args!.topic as string,
        funcCall.args!.name as string,
        funcCall.args!.tags as string[],
        funcCall.args!.context as string,
        funcCall.args!.dirPath as string,
        funcCall.args!.content as string,
        funcCall.args!.useLlm as boolean,
      );
      break;

    case "edit_note":
      response = await editNote(
        funcCall.args!.fileName as string,
        funcCall.args!.activeNote as boolean,
        funcCall.args!.newContent as string,
        funcCall.args!.useLlm as boolean,
        funcCall.args!.tags as string[],
        funcCall.args!.context as string,
      );
      break;

    case "read_note":
      response = await readNote(
        funcCall.args!.fileName as string,
        funcCall.args!.activeNote as boolean,
      );
      break;
    
    case "create_directory":
      response = await createDir(
        funcCall.args!.name as string,
        funcCall.args!.dirPath as string,
      );
      break;

    case "filter_notes":
      response = await noteFiltering(
        funcCall.args!.field as string,
        funcCall.args!.dateRange as string | { start: number, end: number },
        funcCall.args!.limit as number,
        funcCall.args!.sortOrder as string,
      );
      break;

    case "list_files":
      response = await listFiles(
        funcCall.args!.dirPath as string,
        funcCall.args!.limit as number,
      );
      break;

    case "vault_search":
      response = await vaultSearch(
        funcCall.args!.name as string,
        funcCall.args!.isNote as boolean,
      );
      break;

    default:
      response = { response: `Function ${funcCall.name} not implemented.` };
  };

  return response;
}
