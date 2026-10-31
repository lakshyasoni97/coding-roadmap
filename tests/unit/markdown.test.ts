import { describe, expect, it } from 'vitest';
import { parseMarkdown, tokenizeInline } from '@/lib/markdown';

describe('parseMarkdown & tokenizeInline', () => {
  it('keeps inline bold and inline code within paragraphs without breaking lines', () => {
    const raw = `Hi! You're off to a great start. Your current approach is **O(n²)** in time because of the nested loop and \`remove()\` call, and it uses extra space for the list \`b\`.`;

    const blocks = parseMarkdown(raw);
    expect(blocks).toEqual([
      {
        type: 'paragraph',
        text: "Hi! You're off to a great start. Your current approach is **O(n²)** in time because of the nested loop and `remove()` call, and it uses extra space for the list `b`.",
      },
    ]);

    const tokens = tokenizeInline(blocks[0].type === 'paragraph' ? blocks[0].text : '');
    expect(tokens).toContainEqual({ type: 'bold', value: 'O(n²)' });
    expect(tokens).toContainEqual({ type: 'code', value: 'remove()' });
    expect(tokens).toContainEqual({ type: 'code', value: 'b' });
  });

  it('parses the full chatbot response with headings, bullets, nested numbered steps, and continuations', () => {
    const raw = `Hi! You're off to a great start. Your current approach is 
**O(n²)**
 in time because of the nested loop and \`remove()\` call, and it uses extra space for the list \`b\`.

### How to optimize:
To reach 
**O(n)**
 time and 
**O(1)**
 extra space (excluding the output array), you need to avoid recalculating the product from scratch for every index.

*   
**The Insight:**
 The product of all elements except \`nums[i]\` is simply:
    \`(Product of everything to the left of i) * (Product of everything to the right of i)\`.
*   
**The Strategy:**

    1.  Create your result array \`res\` initialized to 1s.
    2.  
**Left Pass:**
 Iterate forward, keeping a running product of all elements to the left of \`i\`. Store this in \`res[i]\`.
    3.  
**Right Pass:**
 Iterate backward, keeping a running product of all elements to the right of \`i\`, and multiply it into your existing \`res[i]\`.

Does that logic make sense for eliminating the need for \`self_product\`?`;

    const blocks = parseMarkdown(raw);
    expect(blocks).toHaveLength(5);
    expect(blocks[0]).toEqual({
      type: 'paragraph',
      text: "Hi! You're off to a great start. Your current approach is **O(n²)** in time because of the nested loop and `remove()` call, and it uses extra space for the list `b`.",
    });
    expect(blocks[1]).toEqual({
      type: 'heading',
      text: 'How to optimize',
    });
    expect(blocks[2]).toEqual({
      type: 'paragraph',
      text: 'To reach **O(n)** time and **O(1)** extra space (excluding the output array), you need to avoid recalculating the product from scratch for every index.',
    });
    expect(blocks[3]).toEqual({
      type: 'list',
      items: [
        {
          ordered: false,
          marker: '•',
          indent: 0,
          text: '**The Insight:** The product of all elements except `nums[i]` is simply: `(Product of everything to the left of i) * (Product of everything to the right of i)`.',
        },
        {
          ordered: false,
          marker: '•',
          indent: 0,
          text: '**The Strategy:**',
        },
        {
          ordered: true,
          marker: '1.',
          indent: 4,
          text: 'Create your result array `res` initialized to 1s.',
        },
        {
          ordered: true,
          marker: '2.',
          indent: 4,
          text: '**Left Pass:** Iterate forward, keeping a running product of all elements to the left of `i`. Store this in `res[i]`.',
        },
        {
          ordered: true,
          marker: '3.',
          indent: 4,
          text: '**Right Pass:** Iterate backward, keeping a running product of all elements to the right of `i`, and multiply it into your existing `res[i]`.',
        },
      ],
    });
    expect(blocks[4]).toEqual({
      type: 'paragraph',
      text: 'Does that logic make sense for eliminating the need for `self_product`?',
    });
  });

  it('parses standalone bold headings used by complexity analysis alongside code blocks', () => {
    const raw = `**Time: O(n)**
A single loop runs n times.

\`\`\`python
res = [1] * len(nums)
\`\`\``;

    const blocks = parseMarkdown(raw);
    expect(blocks).toEqual([
      { type: 'heading', text: 'Time: O(n)' },
      { type: 'paragraph', text: 'A single loop runs n times.' },
      { type: 'code-block', language: 'python', code: 'res = [1] * len(nums)' },
    ]);
  });
});
