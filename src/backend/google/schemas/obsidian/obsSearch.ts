import { Type } from '@google/genai';

export const vaultSearchFunctionDeclaration = {
  name: "vault_search",
  description: "Searches for notes and folders in Obsidian's user vault.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The path or name to search for.",
      },
      isNote: {
        type: Type.BOOLEAN,
        description: "Whether is a note (True) or a folder (False)",
        default: true,
      },
    },
    required: ["name"],
  },
};
