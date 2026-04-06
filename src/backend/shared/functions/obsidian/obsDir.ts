import { getApp } from "src/main";
import { getNextAvailableFolderName } from 'src/utils/notes/renaming';


export async function createDir(
  name: string = "New directory",
  dirPath: string = "",
) {
  // Declaring the app and inputs
  const app = getApp();
  
  // Sanitize the path
  dirPath = dirPath.replace(/(\.\.\/|\/{2,})/g, '/').replace(/^\/+|\/+$/g, ''); // remove '..', double slashes, and leading and trailing slashes
  let fullPath = dirPath + '/' + name;
  if (!dirPath || dirPath === '/') fullPath = name;

  // Create the directory
  try {
    // Check if the directory already exists
    // Append a number to the name if it already exists
    if (app.vault.getFolderByPath(fullPath)) {
      const newName = getNextAvailableFolderName(name, dirPath);
        
      fullPath = dirPath + '/' + newName;
      if (!dirPath || dirPath === '/') fullPath = newName;
    }

    await app.vault.createFolder(fullPath);

    return {
      success: true,
      response: fullPath
    };
  } catch (err) {
    return { success: false, response: err instanceof Error ? err.message : 'Unknown error' };
  }
}