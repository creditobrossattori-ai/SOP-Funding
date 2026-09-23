/**
 * Utility to strip raw markdown symbols (hashes, asterisks, stray code markers)
 * and format chat text into clean, human-readable text.
 */
export function cleanChatPunctuation(text: string): string {
  if (!text) return '';

  return text
    // Remove markdown headers: e.g. "### Title", "## Title", "# Title"
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markdown asterisks: e.g. "**word**", "*word*", "***word***"
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove any remaining stray asterisks
    .replace(/\*/g, '')
    // Remove markdown bullet asterisks at the beginning of lines and convert to clean dash
    .replace(/^\s*\*\s+/gm, '- ')
    // Remove markdown blockquote characters: e.g. "> "
    .replace(/^>\s*/gm, '')
    // Remove markdown underscores for bold/italic: e.g. "__word__" or "_word_"
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    // Remove markdown horizontal rules: e.g. "---", "___"
    .replace(/^[-_]{3,}\s*$/gm, '')
    // Clean multiple consecutive blank lines to a maximum of two
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
