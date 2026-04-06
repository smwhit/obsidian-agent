import { ChangeObject, diffLines } from "diff";
import { App, TFile } from 'obsidian';
import { getApp, getSettings } from "src/main";
import { findClosestFile } from 'src/utils/notes/searching';
import { formatTags } from 'src/utils/notes/tags';
import { writingSystemPrompt } from 'src/backend/shared/prompts';
//import { generateGoogleResponse } from 'src/backend/google/call';
import { DiffReviewModal } from "src/feature/modals/DiffReviewModal";


export async function editNote(
  fileName: string = "",
  activeNote: boolean = false,
  newContent: string,
  useLlm: boolean = true,
  tags: string[] = [],
  context: string = "",
) {
  const app = getApp();
  const settings = getSettings();
    
  let matchedFile: TFile | null;

  if (activeNote) {
    // Detect the current note
    matchedFile = app.workspace.getActiveFile()
    if (!matchedFile) {
      const errorMsg = "It seems like there is not an active note, and you haven't opened any recently."
      if (settings.debug) console.error(errorMsg);
      
      return { success: false, response: errorMsg}
    }
  } else if (fileName && !activeNote) {
    // Find the closest file
    matchedFile = findClosestFile(fileName);
    if (!matchedFile) {
      const errorMsg = `Could not find any note with the exact name or similar to "${fileName}".`
      if (settings.debug) console.error(errorMsg);
      
      return { success: false, response: errorMsg };
    }
  } else {
    const errorMsg = "No file name provided and 'active note' is not set as true.";
    if (settings.debug) console.error(errorMsg);
    
    return { success: false, response: errorMsg };
  }

  // Read the file
  let oldContent = await app.vault.read(matchedFile);
  let updatedContent = '';

  // If the user do not want to generate content replace directly
  if (!useLlm && (newContent || tags.length > 0)) {
    updatedContent = newContent || oldContent;
    if (tags.length > 0) updatedContent = formatTags(tags) + '\n' + updatedContent;

  } else if (useLlm) {
    let sysPrompt = writingSystemPrompt;
    if (context) sysPrompt += `\nYou can use the following context to edit the note: ${context}`;

    const humanPrompt = `Update the following markdown note:\n###\n${oldContent}\n###` +
      (newContent ? `Apply the following update or topic: "${newContent}".\n`: '') +
      `Return the full updated markdown note. Do not remove any existing content unless specified (including links and paths).`;

    try {
      //const response = await generateGoogleResponse(settings.model, humanPrompt, sysPrompt);
      //if (typeof response !== "string") throw new Error("Invalid response from LLM");
      //updatedContent = response;

      if (tags.length > 0) updatedContent = formatTags(tags) + '\n' + updatedContent;

    } catch (error) {
      const errorMsg = 'Error invoking LLM: ' + error;  
      if (settings.debug) console.error(errorMsg);
      
      return { success: false, response: errorMsg };
    }
  } else {
    const errorMsg = 'No new content, tags, or topic provided to update the note.';  
    if (settings.debug) console.error(errorMsg);
    
    return { success: false, response: errorMsg };
  }

  // Clean updated content
  updatedContent = updatedContent.trim();
  if (updatedContent.startsWith("\n")) {
    // Remove the leading new line
    updatedContent = updatedContent.slice(1);
  }

  if (updatedContent === oldContent) return { success: true, response: "No changes made" };

  let finalContent, finalDiff;
  if (settings.reviewChanges) {
    ({ finalContent, finalDiff } = await initReview(app, oldContent, updatedContent));
  } else {
    finalContent = updatedContent;
    finalDiff = diffLines(oldContent, updatedContent);  
  }

  // Save the updated content
  await app.vault.modify(matchedFile, finalContent);

  return { 
    success: true, 
    response: {
      diff: finalDiff, 
      tags,
    }
  };
}


async function initReview(
  app: App,
  oldContent: string,
  newContent: string,
): Promise<{ finalContent: string, finalDiff: ChangeObject<string>[] }> {
  
  return new Promise<{ finalContent: string, finalDiff: ChangeObject<string>[] }>((resolve) => {
    const modal = new DiffReviewModal(
      app,
      (finalContent: string, finalDiff: ChangeObject<string>[]) => {
        resolve({ finalContent, finalDiff });
      },
      (finalContent: string, finalDiff: ChangeObject<string>[]) => { 
        resolve({ finalContent, finalDiff }) 
      },
      oldContent,
      newContent
    );
    modal.open();
  });
}
