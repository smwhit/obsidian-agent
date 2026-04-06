export const createDirFunctionDeclaration = {
  type: "function",
  function: {
    name: "create_directory",
    description: "Create a directory in Obsidian. No parameters are needed.",
    parameters: {
      type: "object",
      required: [],
      properties: {
        name: {
          type: "string",
          description: "The name of the directory",
          default: "New directory",
        },
        dirPath: {
          type: "string",
          description: "The path of the directory where is going to be placed",
          default: "",
        },
      },
    },
  },
};
