export const listFilesFunctionDeclaration = {
  type: "function",
  function: {
    name: "list_files",
    description: "List files and directories of a directory.",
    parameters: {
      type: "object",
      required: ["dirPath"],
      properties: {
        dirPath: {
          type: "string",
          description: "The path of the directory to list files from",
        },
        limit: {
          type: "integer",
          description: "The maximum number of files and directories to list",
          default: 10,
        },
      },
    },
  },
};
