import { findClosestFile, findMatchingFolder } from "src/utils/notes/searching";


export async function vaultSearch(
  name: string, 
  isNote: boolean = true,
) {
  if (isNote) {
    // Search for the note
    const matchedFile = findClosestFile(name);
    if (!matchedFile) {
      const errorMsg = `Could not find any note with the exact name or similar to "${name}".`;
      return { success: false, response: errorMsg };
    }

    // Return the note path
    return {
      success: true,
      response: { 
        type: "note",
        path: matchedFile.path,
      },
    };
  } else {
    // Search for the directory
    const matchedFolder = findMatchingFolder(name);
    if (!matchedFolder) {
      const errorMsg = `Could not find any directory with the name or similar to "${name}".`;
      return { success: false, response: errorMsg };
    }
        
    // Return the directory path
    return {
      success: true,
      response: { 
        type: "folder",
        path: matchedFolder.path,
      },
    };
  }
};
