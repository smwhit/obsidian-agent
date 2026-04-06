import { Type } from '@google/genai';

export const noteFilteringFunctionDeclaration = {
  name: "filter_notes",
  description: `
Return a list of note paths that fall inside a date range.
dateRange formats supported:
  1) Relative strings: "<int><unit>" where unit is: s (seconds), m (minutes), h (hours), d (days), w (weeks).
     Examples: "1h", "48m", "2w", "3d".

  2) Explicit range object: { "start": <ms|ISO|YYYY-MM-DD>, "end": <ms|ISO|YYYY-MM-DD> }.
     - If start/end are "YYYY-MM-DD" the day bounds are used (start=00:00, end=23:59:59.999 local).
     - start/end can also be unix ms (number) or full ISO datetime string.
  `,
  parameters: {
    type: Type.OBJECT,
    properties: {
      field: {
        type: Type.STRING,
        description: "The field to filter notes by, either creation or modification date.",
        enum: ['creation', 'modification'],
        default: 'modification',
      },
      dateRange: {
        type: Type.TYPE_UNSPECIFIED,
        description: `
Date range to filter notes.
Supported formats:
  1) Relative strings: "1h", "48m", "2w", "3d", "1d", etc.
  2) Explicit objects: { "start": <ms|ISO|YYYY-MM-DD>, "end": <ms|ISO|YYYY-MM-DD> }.
If YYYY-MM-DD is provided, day bounds are applied (start=00:00, end=23:59:59.999 local time).
        `
      },
      limit: {
        type: Type.INTEGER,
        description: "Maximum number of notes to return.",
        default: 10,
      },
      sortOrder: {
        type: Type.STRING,
        description: "Sort by date ascending or descending.",
        enum: ['asc', 'desc'],
        default: 'desc',
      },
    },
    required: ["dateRange"],
  },
}
