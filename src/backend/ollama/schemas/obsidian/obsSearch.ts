export const vaultSearchFunctionDeclaration = {
  type: "function",
  function: {
    name: "vault_search",
    description: "Searches for notes and folders in Obsidian's user vault.",
    parameters: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
          description: "The path or name to search for.",
        },
        isNote: {
          type: "boolean",
          description: "Whether is a note (True) or a folder (False)",
          default: true,
        },
      },
    },
  },
};
