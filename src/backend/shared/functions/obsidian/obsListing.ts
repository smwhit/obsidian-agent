import { findMatchingFolder } from 'src/utils/notes/searching'
import { getFolderStructure } from 'src/utils/vault/vaultStructure';


export async function listFiles(
  dirPath: string, 
  limit: number = 10,
) {
  // Find the matching folder if the path is not absolute    
  const matchingFolder = findMatchingFolder(dirPath);
  if (!matchingFolder) {
    return { success: false, response: `Directory ${dirPath} not found` };
  }

  // Get the folder structure in a tree form
  const tree = {
    type: 'folder',
    path: matchingFolder.path,
    childrens: getFolderStructure(matchingFolder, limit)
  };

  return {
    success: true,
    response: tree
  };
}
