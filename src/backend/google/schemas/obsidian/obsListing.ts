import { Type } from "@google/genai";

export const listFilesFunctionDeclaration = {
  name: "list_files",
  description: "List files and directories of a directory.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      dirPath: {
        type: Type.STRING,
        description: "The path of the directory to list files from",
      },
      limit: {
        type: Type.INTEGER,
        description: "The maximum number of files and directories to list",
        default: 10,
      },
    },
    required: ["dirPath"],
  },
};
