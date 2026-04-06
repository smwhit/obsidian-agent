import { Type } from '@google/genai';

export const readNoteFunctionDeclaration = {
  name: "read_note",
  description: "Reads the content of a note in Obsidian by name or by detecting the currently active note. The content itself is not needed as input.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fileName: {
        type: Type.STRING,
        description: "The name or path of the note to read",
        default: "",
      },
      activeNote: {
        type: Type.BOOLEAN,
        description: "If no filename provided set to true to read the active note",
        default: false,
      },
    },
    required: [],
  },
}
