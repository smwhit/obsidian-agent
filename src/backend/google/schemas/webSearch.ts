import { Type } from '@google/genai';

export const webSearchFunctionDeclaration = {
  name: "web_search",
  description: "Search someting in the web",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "Query for the web search",
      },
    },
    required: ["query"],
  },
};
