export const readNoteFunctionDeclaration = {
  type: "function",
  function: {
    name: "read_note",
    description: "Reads the content of a note in Obsidian by name or by detecting the currently active note. The content itself is not needed as input.",
    parameters: {
      type: "object",
      required: [],
      properties: {
        fileName: {
          type: "string",
          description: "The name or path of the note to read",
          default: "",
        },
        activeNote: {
          type: "boolean",
          description: "If no filename provided set to true to read the active note",
          default: false,
        },
      },
    },
  },
};
