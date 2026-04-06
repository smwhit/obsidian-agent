import { Type } from "@google/genai";

export const editNoteFunctionDeclaration = {
  name: "edit_note",
  description: "Write, replace and edit content of a note. Can use LLM or not, supports tags and context. Specify the note name or detect the active note if no name provided.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fileName: {
        type: Type.STRING,
        description: "The name or path of the note to edit. Without the markdown extension .md",
        default: "",
      },
      activeNote: {
        type: Type.BOOLEAN,
        description: "If no filename provided set to true to read the active note",
        default: false,
      },
      newContent: {
        type: Type.STRING,
        description: "New content or instructions to apply to the note",
      },
      useLlm: {
        type: Type.BOOLEAN,
        description: "Whether to use the LLM to generate content for the note",
        default: true,
      },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Tags to add in the note, do not make them up",
        default: [],
      },
      context: {
        type: Type.STRING,
        description: "Additional context for the LLM to use when editing",
        default: "",
      },
    },
    required: ["newContent"],
  },
}
