import { Type } from '@google/genai';

export const createNoteFunctionDeclaration = {
  name: "create_note",
  description: "Create a note. Content can be generated with a topic or provided manually. If no name provided a default one will be used.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description: 'The topic of the note, what is going to be written about',
        default: "",
      },
      name: {
        type: Type.STRING,
        description: 'The note name the user provided with markdown file extension .md',
        default: "Generated note.md",
      },
      tags: {
        type: Type.ARRAY,
        description: 'The tags the user wants to add to the note, do not make them up',
        items: { type: Type.STRING },
        default: [],
      },
      context: {
        type: Type.STRING,
        description: 'Context the user provided to write the note',
        default: "",
      },
      dirPath: {
        type: Type.STRING,
        description: 'The path of the directory where the note is going to be stored',
        default: "",
      },
      content: {
        type: Type.STRING,
        description: 'Custom markdown content to use instead of generating',
        default: "",
      },
      useLlm: {
        type: Type.BOOLEAN,
        description: 'Whether to use the LLM to generate the content.',
        default: true,
      },
    },
    required: [],
  }
}
