import { getApp } from 'src/main';
import { parseDateRange } from 'src/utils/formatting/dateFormat';


export async function noteFiltering(
  field: string = "modification",
  dateRange: string | { start: number; end: number },
  limit: number = 10,
  sortOrder: string = "desc",
) {
  const app = getApp();
  
  // Parse dateRange
  if (typeof dateRange !== "string" && typeof dateRange !== "object") {
    return { success: false, response: `Invalid 'dateRange' type, expected string or object, got ${typeof dateRange}.` };
  }
  const validDateRange = parseDateRange(dateRange);
  if (!validDateRange) return { success: false, response: `Invalid date range: "${dateRange}".` };
  // By now validDateRange is guaranteed to be a {start: number, end: number} object

  // Get notes based on the date range and field  
  const notes = app.vault.getMarkdownFiles().filter(file => {
    const fileTime = field === "creation" ? file.stat.ctime : file.stat.mtime;
    return fileTime >= validDateRange.start && fileTime <= validDateRange.end;
  });

  // Sort notes
  notes.sort((a, b) => {
    const timeA = field === "creation" ? a.stat.ctime : a.stat.mtime;
    const timeB = field === "creation" ? b.stat.ctime : b.stat.mtime;
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
  });

  // Limit notes
  const limitedNotes = notes.slice(0, limit);

  // Gather note paths
  const notePaths = limitedNotes.map(note => (note.path ));

  return { 
    success: true, 
    response: notePaths,
  };
}
