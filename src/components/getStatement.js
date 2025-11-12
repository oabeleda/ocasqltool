export const getStatement = (text, position) => {
  // Strategy: Use semicolons as primary delimiters, fall back to blank lines if no semicolons

  // Find all statement boundaries (semicolons and blank lines)
  const lines = text.split('\n');
  let currentPos = 0;
  const boundaries = [0]; // Start of document is a boundary

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStart = currentPos;
    const lineEnd = currentPos + line.length;

    // Check for semicolons in this line
    let semicolonIndex = line.indexOf(';');
    while (semicolonIndex !== -1) {
      boundaries.push(lineStart + semicolonIndex + 1); // Position after semicolon
      semicolonIndex = line.indexOf(';', semicolonIndex + 1);
    }

    // Check for blank lines (only whitespace)
    if (line.trim() === '' && i > 0) {
      boundaries.push(lineStart);
    }

    currentPos = lineEnd + 1; // +1 for the newline character
  }

  boundaries.push(text.length); // End of document is a boundary

  // Remove duplicates and sort
  const uniqueBoundaries = [...new Set(boundaries)].sort((a, b) => a - b);

  // Find the statement containing the cursor position
  for (let i = 0; i < uniqueBoundaries.length - 1; i++) {
    const start = uniqueBoundaries[i];
    const end = uniqueBoundaries[i + 1];

    if (position >= start && position <= end) {
      // Extract and trim the statement
      let statement = text.substring(start, end).trim();

      // Remove trailing semicolon if present
      if (statement.endsWith(';')) {
        statement = statement.slice(0, -1).trim();
      }

      return statement;
    }
  }

  // Fallback: return trimmed text if no boundaries found
  return text.trim();
};
