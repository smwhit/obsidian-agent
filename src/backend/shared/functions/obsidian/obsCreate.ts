import { getApp, getSettings } from "src/main";
import { findMatchingFolder } from 'src/utils/notes/searching';
import { getNextAvailableFileName } from "src/utils/notes/renaming";
import { formatTags } from 'src/utils/notes/tags';
import { writingSystemPrompt } from 'src/backend/shared/prompts';
//import { generateGoogleResponse } from 'src/backend/google/call';


export async function createNote(
  topic: string = "",
  name: string = "Generated note.md",
  tags: string[] = [],
  context: string = "",
  dirPath: string = "",
  content: string = "",
  useLlm: boolean = true,
) {
  const app = getApp();
  const settings = getSettings();

  // Find the closest folder
  const matchedFolder = findMatchingFolder(dirPath);
  if (!matchedFolder) {
    return { success: false, response: `Could not find any directory with the path ${dirPath}` }
  }
  dirPath = matchedFolder.path;
  

  if (!name.endsWith('.md')) name += '.md'; 
  let fullPath = dirPath + '/' + name; // -> ParentPath/Name.md
  if (!dirPath || dirPath === '/') fullPath = name; // -> Name.md
  
  // Content generation
  if (!content) {
    if (topic && useLlm) {
      let sysPrompt = writingSystemPrompt;
      if (context) sysPrompt += `\nUse the following context to write the note: ${context}.`;

      const humanPrompt = `Write a note following this topic/instruction: ${topic}.`;
      
      try {
        //const response = await generateGoogleResponse(settings.model, sysPrompt, humanPrompt);
        //content = response;

        if (tags.length > 0) content = formatTags(tags) + "\n" + content

      } catch (error) {
        return { success: false, response: String(error) };
      }
    } else if (tags.length > 0) {
      content = formatTags(tags);
    }
  }

  // Check if the note already exists
  // Append a number to the file name if it already exists
  if (app.vault.getAbstractFileByPath(fullPath)) {
    const newName = getNextAvailableFileName(name, dirPath);
    name = newName;

    fullPath = dirPath + '/' + name;
    if (!dirPath || dirPath === '/') fullPath = name; // -> Name.md
  }

  // Clean content
  content = content.trim();
  if (content.startsWith('\n')) content = content.slice(1);

  await app.vault.create(fullPath, content);
  return { 
    success: true,
    response: `Note created successfully at: ${fullPath}.`, 
  };
}
