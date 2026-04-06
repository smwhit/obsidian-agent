export const editNoteFunctionDeclaration = {
  type: "function",
  function: {
    name: "edit_note",
    description: "Write, replace and edit content of a note. Can use LLM or not, supports tags and context. Specify the note name or detect the active note if no name provided.",
    parameters: {
      type: "object",
      required: ["newContent"],
      properties: {
        fileName: {
          type: "string",
          description: "The name or path of the note to edit. Without the markdown extension .md",
          default: "",
        },
        activeNote: {
          type: "boolean",
          description: "If no filename provided set to true to read the active note",
          default: false,
        },
        newContent: {
          type: "string",
          description: "New content or instructions to apply to the note",
        },
        useLlm: {
          type: "boolean",
          description: "Whether to use the LLM to generate content for the note",
          default: true,
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags to add in the note, do not make them up",
          default: [],
        },
        context: {
          type: "string",
          description: "Additional context for the LLM to use when editing",
          default: "",
        },
      },
    },
  },
};
