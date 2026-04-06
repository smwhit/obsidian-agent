import { Type } from "@google/genai";

export const createDirFunctionDeclaration = ({
  name: "create_directory",
  description: "Create a directory in Obsidian. No parameters are needed.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The name of the directory",
        default: "New directory",
      },
      dirPath: {
        type: Type.STRING,
        description: "The path of the directory where is going to be placed",
        default: "",
      },
    },
    required: [],
  },
})
