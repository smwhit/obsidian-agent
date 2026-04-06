import { TFile } from 'obsidian';
import { getApp, getSettings } from "src/main";
import { findClosestFile } from 'src/utils/notes/searching';
import { getEmbeds } from 'src/utils/parsing/getEmbeds';
import { removeImagesFromNote, extractImagesFromNote } from "src/utils/parsing/imageParse";
//import { callModel } from 'src/backend/google/managers/modelRunner';


export async function readNote(
  fileName: string = "",
  activeNote: boolean = false,
) {
  const app = getApp();
  const settings = getSettings();
  let matchedFile: TFile | null;

  if (!fileName && activeNote) {
    // Detect the current note
    matchedFile = app.workspace.getActiveFile()
    if (!matchedFile) {
      const errorMsg = "It seems like there is not an active note, and you haven't opened any recently."
      if (settings.debug) console.error(errorMsg);
      
      return { success: false, response: errorMsg }
    }
  
  } else if (fileName) {
    // Find the closest file
    matchedFile = findClosestFile(fileName);
    if (!matchedFile) {
      const errorMsg = `Could not find any note with the name or similar to "${fileName}".`;
      if (settings.debug) console.error(errorMsg);

      return { success: false, response: `Could not find any note similar to "${fileName}".`};
    }
  
  } else {
    const errorMsg = "No file name provided and 'active note' is not set as true.";
    if (settings.debug) console.error(errorMsg);
    
    return { success: false, response: errorMsg };
  }

  // Read the file
  let content = await app.vault.read(matchedFile);
  
  try {
    // Extract base64 images, from embeds and from content
    let images: File[] = []
    if (settings.readImages) {
      // Extract base64 images from embeds
      const embeds = getEmbeds(matchedFile);
      if (embeds.length > 0) {
        images.push(...embeds);
      }

      // Extract base64 images from the note content
      const base64ToFiles = await extractImagesFromNote(content);
      if (base64ToFiles && base64ToFiles.length > 0) {
        images.push(...base64ToFiles);
      }
      
      // if (images && images.length > 0) {
      //   const imageDescriptions = await callModel(
      //     "", 
      //     "Return a list of captions for the following image(s):",
      //     images, // TODO: Handle this error
      //   );
      //   if (typeof imageDescriptions !== "string") throw new Error("Invalid response from LLM");  
        
      //   // Remove images from the content
      //   content = await removeImagesFromNote(content);
        
      //   return { 
      //     success: true, 
      //     response: {
      //       content: "\n" + content, 
      //       imageDescriptions,
      //     }
      //   };

      // } else {
      //   content = await removeImagesFromNote(content);
      // }
    
    } else {
      content = await removeImagesFromNote(content);
    }
  } catch (error) {
    const errorMsg = 'Error processing images in the note: ' + error;
    if (settings.debug) console.error(errorMsg);
    
    return { success: false, response: errorMsg };
  }    

  return { 
    success: true, 
    response: {
      content: "\n" + content,
    },
  };
}