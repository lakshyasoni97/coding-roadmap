export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'bold-italic'; value: string };

export type ListItem = {
  ordered: boolean;
  marker: string;
  indent: number;
  text: string;
};

export type MarkdownBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code-block'; language: string; code: string }
  | { type: 'list'; items: ListItem[] };

const INLINE_PATTERN = /(`[^`\n]+`|\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*?\*)/g;

export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, idx) });
    }
    const raw = match[0];
    if (raw.startsWith('`') && raw.endsWith('`')) {
      tokens.push({ type: 'code', value: raw.slice(1, -1) });
    } else if (raw.startsWith('***') && raw.endsWith('***')) {
      tokens.push({ type: 'bold-italic', value: raw.slice(3, -3) });
    } else if (raw.startsWith('**') && raw.endsWith('**')) {
      tokens.push({ type: 'bold', value: raw.slice(2, -2) });
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      tokens.push({ type: 'italic', value: raw.slice(1, -1) });
    } else {
      tokens.push({ type: 'text', value: raw });
    }
    lastIndex = idx + raw.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}

const HEADING_RE = /^#{1,4}\s+(.+?)\s*$/;
const STANDALONE_BOLD_RE = /^\*\*([^*]+)\*\*\s*:?\s*$/;
const LIST_ITEM_RE = /^(\s*)(?:([*\-•])|(\d+)\.)(?:\s+(.*))?$/;

function parseProseSegment(segment: string): MarkdownBlock[] {
  const lines = segment.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: ListItem[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: paragraphLines.join(' ').replace(/\s+/g, ' ').trim(),
      });
      paragraphLines = [];
    }
  };

  const flushList = () => {
    const nonEmpty = listItems
      .map((item) => ({
        ...item,
        text: item.text.replace(/\s+/g, ' ').trim(),
      }))
      .filter((item) => item.text.length > 0);
    if (nonEmpty.length > 0) {
      blocks.push({ type: 'list', items: nonEmpty });
    }
    listItems = [];
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      // Keep active list open across blank lines only if the last item is still waiting for its text
      if (listItems.length > 0 && listItems[listItems.length - 1].text === '') {
        continue;
      }
      flushParagraph();
      continue;
    }

    const headingMatch = trimmed.match(HEADING_RE);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const cleaned = headingMatch[1]
        .replace(/^\*\*(.+)\*\*$/, '$1')
        .replace(/:$/, '')
        .trim();
      blocks.push({ type: 'heading', text: cleaned });
      continue;
    }

    const standaloneBoldMatch = trimmed.match(STANDALONE_BOLD_RE);
    if (standaloneBoldMatch && listItems.length === 0 && paragraphLines.length === 0) {
      flushList();
      blocks.push({
        type: 'heading',
        text: standaloneBoldMatch[1].replace(/:$/, '').trim(),
      });
      continue;
    }

    // Make sure `*bold*` or `**bold**` on a line isn't mistaken for an unordered list item
    const isBoldOrItalicStart = /^\*[^\s]/.test(trimmed);
    const listMatch = !isBoldOrItalicStart ? rawLine.match(LIST_ITEM_RE) : null;
    if (listMatch) {
      flushParagraph();
      const indent = listMatch[1].replace(/\t/g, '  ').length;
      const ordered = Boolean(listMatch[3]);
      const marker = listMatch[3] ? `${listMatch[3]}.` : '•';
      const content = (listMatch[4] ?? '').trim();
      listItems.push({
        ordered,
        marker,
        indent,
        text: content,
      });
      continue;
    }

    // Continuation of an active list item if:
    // - the last list item was an empty bullet/number marker waiting for its content, OR
    // - the last list item only has a short label ending in ':' (e.g. "Left Pass:" or "**Left Pass:**"), OR
    // - the current line is indented by at least 2 spaces
    const leadingSpaces = rawLine.match(/^(\s*)/)?.[1].replace(/\t/g, '  ').length ?? 0;
    if (listItems.length > 0) {
      const lastItem = listItems[listItems.length - 1];
      const isLabelOnly = /^(\*\*[^*]+\*\*:?|[^.:]{1,35}:)$/.test(lastItem.text);
      if (lastItem.text === '' || isLabelOnly || leadingSpaces >= 2) {
        lastItem.text = lastItem.text ? `${lastItem.text} ${trimmed}` : trimmed;
        continue;
      }
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function parseMarkdown(input: string): MarkdownBlock[] {
  const normalized = input.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const blocks: MarkdownBlock[] = [];
  const fenceRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;

  for (const match of normalized.matchAll(fenceRegex)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      blocks.push(...parseProseSegment(normalized.slice(lastIndex, idx)));
    }
    blocks.push({
      type: 'code-block',
      language: (match[1] || '').trim(),
      code: (match[2] || '').replace(/\n$/, ''),
    });
    lastIndex = idx + match[0].length;
  }

  if (lastIndex < normalized.length) {
    blocks.push(...parseProseSegment(normalized.slice(lastIndex)));
  }

  return blocks;
}
