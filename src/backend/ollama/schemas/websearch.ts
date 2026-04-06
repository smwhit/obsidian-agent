export const webSearchFunctionDeclaration = {
  type: "function",
  function: {
    name: "web_search",
    description: "Search someting in the web",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", description: "Query for the web search" },
      }
    }
  }
}