export const createNoteFunctionDeclaration = {
  type: "function",
  function: {
    name: "create_note",
    description: "Create a note. Content can be generated with a topic or provided manually. If no name provided a default one will be used.",
    parameters: {
      type: "object",
      required: [],
      properties: {
        topic: {
          type: "string",
          description: 'The topic of the note, what is going to be written about',
          default: "",
        },
        name: {
          type: "string",
          description: 'The note name the user provided with markdown file extension .md',
          default: "Generated note.md",
        },
        tags: {
          type: "array",
          description: 'The tags the user wants to add to the note, do not make them up',
          items: { type: "string" },
          default: [],
        },
        context: {
          type: "string",
          description: 'Context the user provided to write the note',
          default: "",
        },
        dirPath: {
          type: "string",
          description: 'The path of the directory where the note is going to be stored',
          default: "",
        },
        content: {
          type: "string",
          description: 'Custom markdown content to use instead of generating',
          default: "",
        },
        useLlm: {
          type: "boolean",
          description: 'Whether to use the LLM to generate the content.',
          default: true,
        },
      },
    },
  },
};
