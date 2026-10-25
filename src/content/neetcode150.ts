export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Topic {
  slug: string;
  name: string;
  prereqs: string[];
  summary: string;
  template: string;
}

export interface Problem {
  slug: string; // LeetCode slug, also the progress key
  title: string;
  topic: string;
  difficulty: Difficulty;
  url: string;
  hint: string; // level-1 nudge (no spoilers)
  time: string; // optimal time complexity
  space: string; // optimal space complexity
}

export const TOPICS: Topic[] = [
  { slug: 'arrays-hashing', name: 'Arrays & Hashing', prereqs: [],
    summary: 'Trade memory for speed: a dict/set turns repeated lookups into O(1).',
    template: 'seen = {}\nfor i, x in enumerate(a):\n    if target - x in seen: ...\n    seen[x] = i' },
  { slug: 'two-pointers', name: 'Two Pointers', prereqs: ['arrays-hashing'],
    summary: 'Sorted input or pair/palindrome checks: move two indices toward each other.',
    template: 'l, r = 0, len(a) - 1\nwhile l < r:\n    if cond: l += 1\n    else: r -= 1' },
  { slug: 'sliding-window', name: 'Sliding Window', prereqs: ['two-pointers'],
    summary: 'Contiguous subarray/substring: grow the right end, shrink the left when invalid.',
    template: 'l = 0\nfor r in range(len(s)):\n    add(s[r])\n    while invalid(): remove(s[l]); l += 1\n    best = max(best, r - l + 1)' },
  { slug: 'stack', name: 'Stack', prereqs: ['arrays-hashing'],
    summary: 'Last-in-first-out: matching pairs, nearest greater/smaller element (monotonic stack).',
    template: 'st = []\nfor x in a:\n    while st and st[-1] < x: pop_and_resolve()\n    st.append(x)' },
  { slug: 'binary-search', name: 'Binary Search', prereqs: ['two-pointers'],
    summary: 'Sorted data or a monotonic yes/no answer: halve the search space each step.',
    template: 'l, r = 0, len(a) - 1\nwhile l <= r:\n    m = (l + r) // 2\n    if a[m] < t: l = m + 1\n    else: r = m - 1' },
  { slug: 'linked-list', name: 'Linked List', prereqs: ['two-pointers'],
    summary: 'Pointer rewiring; use a dummy head and fast/slow pointers.',
    template: 'dummy = cur = ListNode()\nslow = fast = head\nwhile fast and fast.next:\n    slow, fast = slow.next, fast.next.next' },
  { slug: 'trees', name: 'Trees', prereqs: ['linked-list', 'binary-search'],
    summary: 'Recurse on children and combine results; BFS with a queue for levels.',
    template: 'def dfs(node):\n    if not node: return base\n    l, r = dfs(node.left), dfs(node.right)\n    return combine(l, r)' },
  { slug: 'heap', name: 'Heap / Priority Queue', prereqs: ['trees'],
    summary: 'Repeatedly need the min/max or the top-k: a heap gives O(log n) per step.',
    template: 'import heapq\nh = []\nfor x in a:\n    heapq.heappush(h, x)\n    if len(h) > k: heapq.heappop(h)' },
  { slug: 'backtracking', name: 'Backtracking', prereqs: ['trees'],
    summary: 'Build all candidates step by step: choose, recurse, undo.',
    template: 'def bt(i, path):\n    if done: res.append(path[:]); return\n    for c in choices:\n        path.append(c); bt(i + 1, path); path.pop()' },
  { slug: 'tries', name: 'Tries', prereqs: ['trees'],
    summary: 'Prefix lookups: a tree where each edge is one character.',
    template: 'node = root\nfor ch in word:\n    node = node.children.setdefault(ch, TrieNode())\nnode.end = True' },
  { slug: 'graphs', name: 'Graphs', prereqs: ['backtracking'],
    summary: 'Grids and connections: DFS/BFS with a visited set, topological sort, union-find.',
    template: 'def dfs(r, c):\n    if out_of_bounds or (r, c) in seen: return\n    seen.add((r, c))\n    for dr, dc in DIRS: dfs(r + dr, c + dc)' },
  { slug: 'advanced-graphs', name: 'Advanced Graphs', prereqs: ['graphs', 'heap'],
    summary: 'Weighted edges: Dijkstra, minimum spanning tree, Bellman-Ford.',
    template: 'h = [(0, src)]\nwhile h:\n    d, u = heapq.heappop(h)\n    if u in done: continue\n    done.add(u)\n    for v, w in adj[u]: heapq.heappush(h, (d + w, v))' },
  { slug: '1d-dp', name: '1-D Dynamic Programming', prereqs: ['backtracking'],
    summary: 'Overlapping subproblems: define dp[i], find the recurrence, fill in order.',
    template: 'dp = [0] * (n + 1)\ndp[0] = base\nfor i in range(1, n + 1):\n    dp[i] = f(dp[i - 1], dp[i - 2])' },
  { slug: '2d-dp', name: '2-D Dynamic Programming', prereqs: ['1d-dp'],
    summary: 'Two sequences or a grid: dp[i][j] depends on neighbours.',
    template: 'dp = [[0] * (m + 1) for _ in range(n + 1)]\nfor i in range(1, n + 1):\n    for j in range(1, m + 1):\n        dp[i][j] = ...' },
  { slug: 'greedy', name: 'Greedy', prereqs: ['heap'],
    summary: 'Make the locally best choice each step; prove it never hurts later.',
    template: 'a.sort()  # often sort first\nfor x in a:\n    if can_take(x): take(x)' },
  { slug: 'intervals', name: 'Intervals', prereqs: ['heap'],
    summary: 'Sort by start, then sweep and merge/compare with the previous interval.',
    template: 'intervals.sort()\nres = [intervals[0]]\nfor s, e in intervals[1:]:\n    if s <= res[-1][1]: res[-1][1] = max(res[-1][1], e)\n    else: res.append([s, e])' },
  { slug: 'math-geometry', name: 'Math & Geometry', prereqs: ['arrays-hashing'],
    summary: 'Matrix manipulation and number tricks; watch indices and overflow.',
    template: 'top, bot, left, right = 0, n - 1, 0, m - 1\nwhile top <= bot and left <= right: ...' },
  { slug: 'bit-manipulation', name: 'Bit Manipulation', prereqs: ['arrays-hashing'],
    summary: 'XOR cancels pairs; n & (n - 1) clears the lowest set bit; shifts multiply/divide by 2.',
    template: 'res = 0\nfor x in a: res ^= x\nwhile n: n &= n - 1; count += 1' },
];

// [leetcode-slug, title, difficulty, hint, time, space, optional url override]
type Row = [string, string, 'E' | 'M' | 'H', string, string, string, string?];

const D = { E: 'Easy', M: 'Medium', H: 'Hard' } as const;

const ROWS: Record<string, Row[]> = {
  'arrays-hashing': [
    ['contains-duplicate', 'Contains Duplicate', 'E', 'What data structure answers "have I seen this before?" in O(1)?', 'O(n)', 'O(n)'],
    ['valid-anagram', 'Valid Anagram', 'E', 'Two strings are anagrams if their character counts match.', 'O(n)', 'O(1)'],
    ['two-sum', 'Two Sum', 'E', 'For each x, what value would complete the pair? Look it up instead of searching.', 'O(n)', 'O(n)'],
    ['group-anagrams', 'Group Anagrams', 'M', 'Find a key that is identical for all anagrams of a word.', 'O(n·k)', 'O(n·k)'],
    ['top-k-frequent-elements', 'Top K Frequent Elements', 'M', 'Count first. Then think bucket sort by frequency instead of a full sort.', 'O(n)', 'O(n)'],
    ['encode-and-decode-strings', 'Encode and Decode Strings', 'M', 'How can the decoder know where each word ends, even if words contain your delimiter?', 'O(n)', 'O(n)', 'https://neetcode.io/problems/string-encode-and-decode'],
    ['product-of-array-except-self', 'Product of Array Except Self', 'M', 'Answer[i] = product of everything left of i × everything right of i.', 'O(n)', 'O(1)'],
    ['valid-sudoku', 'Valid Sudoku', 'M', 'Track a set per row, column and 3×3 box. Which box does (r, c) belong to?', 'O(1)', 'O(1)'],
    ['longest-consecutive-sequence', 'Longest Consecutive Sequence', 'M', 'Only start counting from numbers that have no predecessor (x - 1) in the set.', 'O(n)', 'O(n)'],
  ],
  'two-pointers': [
    ['valid-palindrome', 'Valid Palindrome', 'E', 'Compare from both ends, skipping non-alphanumeric characters.', 'O(n)', 'O(1)'],
    ['two-sum-ii-input-array-is-sorted', 'Two Sum II – Input Array Is Sorted', 'M', 'Sorted: if the sum is too big, which pointer should move?', 'O(n)', 'O(1)'],
    ['3sum', '3Sum', 'M', 'Sort, fix one number, then it becomes Two Sum II. Skip duplicates.', 'O(n²)', 'O(1)'],
    ['container-with-most-water', 'Container With Most Water', 'M', 'Area is limited by the shorter wall, so which pointer is pointless to keep?', 'O(n)', 'O(1)'],
    ['trapping-rain-water', 'Trapping Rain Water', 'H', 'Water above i = min(max-left, max-right) - height[i]. Can two pointers track those maxes?', 'O(n)', 'O(1)'],
  ],
  'sliding-window': [
    ['best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'E', 'Track the lowest price so far; what is the profit if you sell today?', 'O(n)', 'O(1)'],
    ['longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'M', 'When a repeat enters the window, how far must the left edge move?', 'O(n)', 'O(min(n, m))'],
    ['longest-repeating-character-replacement', 'Longest Repeating Character Replacement', 'M', 'Window is valid if length - (count of most frequent char) <= k.', 'O(n)', 'O(1)'],
    ['permutation-in-string', 'Permutation in String', 'M', 'A permutation is a fixed-size window with the same character counts.', 'O(n)', 'O(1)'],
    ['minimum-window-substring', 'Minimum Window Substring', 'H', 'Expand until valid, then shrink as far as it stays valid. Track how many needed chars are satisfied.', 'O(n)', 'O(m)'],
    ['sliding-window-maximum', 'Sliding Window Maximum', 'H', 'Keep a deque of indices whose values are in decreasing order.', 'O(n)', 'O(k)'],
  ],
  stack: [
    ['valid-parentheses', 'Valid Parentheses', 'E', 'The most recent opener must be closed first.', 'O(n)', 'O(n)'],
    ['min-stack', 'Min Stack', 'M', 'Store the current minimum alongside each pushed value.', 'O(1)', 'O(n)'],
    ['evaluate-reverse-polish-notation', 'Evaluate Reverse Polish Notation', 'M', 'On an operator, pop two operands. Mind the order for - and /.', 'O(n)', 'O(n)'],
    ['generate-parentheses', 'Generate Parentheses', 'M', 'You can add "(" while open < n, and ")" while close < open.', 'O(4ⁿ/√n)', 'O(n)'],
    ['daily-temperatures', 'Daily Temperatures', 'M', 'Keep a stack of days still waiting for a warmer day.', 'O(n)', 'O(n)'],
    ['car-fleet', 'Car Fleet', 'M', 'Sort by position; compute arrival times from the closest-to-target car backwards.', 'O(n log n)', 'O(n)'],
    ['largest-rectangle-in-histogram', 'Largest Rectangle in Histogram', 'H', 'A monotonic increasing stack: popping a bar tells you how far it could extend left.', 'O(n)', 'O(n)'],
  ],
  'binary-search': [
    ['binary-search', 'Binary Search', 'E', 'Pick a loop invariant: the target, if present, is within [l, r].', 'O(log n)', 'O(1)'],
    ['search-a-2d-matrix', 'Search a 2D Matrix', 'M', 'Treat the matrix as one sorted array of length rows × cols.', 'O(log(m·n))', 'O(1)'],
    ['koko-eating-bananas', 'Koko Eating Bananas', 'M', 'Binary search on the answer (speed). Is a given speed fast enough?', 'O(n log m)', 'O(1)'],
    ['find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array', 'M', 'Compare mid with the right end to decide which half holds the pivot.', 'O(log n)', 'O(1)'],
    ['search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'M', 'One half of the split is always sorted. Is the target inside it?', 'O(log n)', 'O(1)'],
    ['time-based-key-value-store', 'Time Based Key-Value Store', 'M', 'Per key, timestamps arrive in increasing order. Binary search for the latest one ≤ t.', 'O(log n)', 'O(n)'],
    ['median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'H', 'Binary search how many elements to take from the smaller array for the left half.', 'O(log(min(m, n)))', 'O(1)'],
  ],
  'linked-list': [
    ['reverse-linked-list', 'Reverse Linked List', 'E', 'Keep prev and cur; flip cur.next before moving on.', 'O(n)', 'O(1)'],
    ['merge-two-sorted-lists', 'Merge Two Sorted Lists', 'E', 'A dummy head avoids special-casing the first node.', 'O(n + m)', 'O(1)'],
    ['reorder-list', 'Reorder List', 'M', 'Find the middle, reverse the second half, then interleave.', 'O(n)', 'O(1)'],
    ['remove-nth-node-from-end-of-list', 'Remove Nth Node From End of List', 'M', 'Start the second pointer n steps ahead of the first.', 'O(n)', 'O(1)'],
    ['copy-list-with-random-pointer', 'Copy List with Random Pointer', 'M', 'Map each old node to its copy, then wire next/random in a second pass.', 'O(n)', 'O(n)'],
    ['add-two-numbers', 'Add Two Numbers', 'M', 'Digit-by-digit addition with a carry; the lists can differ in length.', 'O(max(n, m))', 'O(1)'],
    ['linked-list-cycle', 'Linked List Cycle', 'E', 'If a fast and slow pointer ever meet, there is a cycle.', 'O(n)', 'O(1)'],
    ['find-the-duplicate-number', 'Find the Duplicate Number', 'M', 'Treat values as "next" pointers: a duplicate creates a cycle. Where does it start?', 'O(n)', 'O(1)'],
    ['lru-cache', 'LRU Cache', 'M', 'Hash map for lookup + doubly linked list for recency order.', 'O(1)', 'O(capacity)'],
    ['merge-k-sorted-lists', 'Merge k Sorted Lists', 'H', 'Always need the smallest head among k lists: heap, or merge in pairs.', 'O(n log k)', 'O(k)'],
    ['reverse-nodes-in-k-group', 'Reverse Nodes in k-Group', 'H', 'Check k nodes exist, reverse that chunk, reconnect it to the previous tail.', 'O(n)', 'O(1)'],
  ],
  trees: [
    ['invert-binary-tree', 'Invert Binary Tree', 'E', 'Swap the children, then recurse into both.', 'O(n)', 'O(h)'],
    ['maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'E', 'depth = 1 + max(depth(left), depth(right)).', 'O(n)', 'O(h)'],
    ['diameter-of-binary-tree', 'Diameter of Binary Tree', 'E', 'At each node, the best path through it is left height + right height.', 'O(n)', 'O(h)'],
    ['balanced-binary-tree', 'Balanced Binary Tree', 'E', 'Return height from recursion; use -1 (or a flag) to signal "unbalanced".', 'O(n)', 'O(h)'],
    ['same-tree', 'Same Tree', 'E', 'Both null → equal. One null or values differ → not equal. Otherwise recurse.', 'O(n)', 'O(h)'],
    ['subtree-of-another-tree', 'Subtree of Another Tree', 'E', 'At every node of the big tree, ask "is this Same Tree as the subtree?"', 'O(n·m)', 'O(h)'],
    ['lowest-common-ancestor-of-a-binary-search-tree', 'Lowest Common Ancestor of a BST', 'M', 'Use the BST ordering: where do p and q diverge?', 'O(h)', 'O(1)'],
    ['binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'M', 'BFS; process exactly len(queue) nodes per level.', 'O(n)', 'O(n)'],
    ['binary-tree-right-side-view', 'Binary Tree Right Side View', 'M', 'BFS and keep the last node of each level.', 'O(n)', 'O(n)'],
    ['count-good-nodes-in-binary-tree', 'Count Good Nodes in Binary Tree', 'M', 'Pass the max value seen on the path down as a parameter.', 'O(n)', 'O(h)'],
    ['validate-binary-search-tree', 'Validate Binary Search Tree', 'M', 'Each node must lie within a (low, high) range inherited from its ancestors.', 'O(n)', 'O(h)'],
    ['kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST', 'M', 'In-order traversal visits nodes in sorted order. Stop at the k-th.', 'O(h + k)', 'O(h)'],
    ['construct-binary-tree-from-preorder-and-inorder-traversal', 'Construct Binary Tree from Preorder and Inorder', 'M', 'Preorder gives the root; its index in inorder splits left and right subtrees.', 'O(n)', 'O(n)'],
    ['binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'H', 'Return the best downward path to the parent, but update a global with the best "bent" path.', 'O(n)', 'O(h)'],
    ['serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree', 'H', 'Preorder with explicit null markers is enough to rebuild uniquely.', 'O(n)', 'O(n)'],
  ],
  heap: [
    ['kth-largest-element-in-a-stream', 'Kth Largest Element in a Stream', 'E', 'A min-heap of size k: its root is the k-th largest.', 'O(log k)', 'O(k)'],
    ['last-stone-weight', 'Last Stone Weight', 'E', 'You always need the two largest stones: a max-heap.', 'O(n log n)', 'O(n)'],
    ['k-closest-points-to-origin', 'K Closest Points to Origin', 'M', 'Keep a max-heap of size k by distance (no sqrt needed).', 'O(n log k)', 'O(k)'],
    ['kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'M', 'Min-heap of size k, or quickselect for O(n) average.', 'O(n log k)', 'O(k)'],
    ['task-scheduler', 'Task Scheduler', 'M', 'Most frequent task decides the frame; the rest fill in the idle gaps.', 'O(n)', 'O(1)'],
    ['design-twitter', 'Design Twitter', 'M', 'Per-user tweet lists + merge the latest 10 across followees with a heap.', 'O(n log n)', 'O(n)'],
    ['find-median-from-data-stream', 'Find Median from Data Stream', 'H', 'Max-heap for the lower half, min-heap for the upper half, keep sizes balanced.', 'O(log n)', 'O(n)'],
  ],
  backtracking: [
    ['subsets', 'Subsets', 'M', 'For each element: include it or not.', 'O(n·2ⁿ)', 'O(n)'],
    ['combination-sum', 'Combination Sum', 'M', 'You may reuse a number, so recurse on the same index; stop when the sum exceeds target.', 'O(2ᵗ)', 'O(t)'],
    ['permutations', 'Permutations', 'M', 'At each position, try every unused element.', 'O(n·n!)', 'O(n)'],
    ['subsets-ii', 'Subsets II', 'M', 'Sort, then skip a value equal to the previous one at the same recursion depth.', 'O(n·2ⁿ)', 'O(n)'],
    ['combination-sum-ii', 'Combination Sum II', 'M', 'Sort and skip duplicates at the same depth; each element is used at most once.', 'O(2ⁿ)', 'O(n)'],
    ['word-search', 'Word Search', 'M', 'DFS from each cell; mark visited, and unmark when backtracking.', 'O(m·n·4ᴸ)', 'O(L)'],
    ['palindrome-partitioning', 'Palindrome Partitioning', 'M', 'Choose the next cut; only continue if the prefix is a palindrome.', 'O(n·2ⁿ)', 'O(n)'],
    ['letter-combinations-of-a-phone-number', 'Letter Combinations of a Phone Number', 'M', 'One recursion level per digit, loop over that digit\'s letters.', 'O(4ⁿ)', 'O(n)'],
    ['n-queens', 'N-Queens', 'H', 'Place one queen per row; track used columns and both diagonals (r + c, r - c) in sets.', 'O(n!)', 'O(n)'],
  ],
  tries: [
    ['implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)', 'M', 'Each node holds a dict of children and an end-of-word flag.', 'O(L)', 'O(total chars)'],
    ['design-add-and-search-words-data-structure', 'Design Add and Search Words', 'M', 'On ".", branch into every child with DFS.', 'O(26ᴸ) worst', 'O(total chars)'],
    ['word-search-ii', 'Word Search II', 'H', 'Build a trie of the words, then DFS the grid once, pruning dead prefixes.', 'O(m·n·4ᴸ)', 'O(total chars)'],
  ],
  graphs: [
    ['number-of-islands', 'Number of Islands', 'M', 'Each time you find unvisited land, flood-fill it and count one.', 'O(m·n)', 'O(m·n)'],
    ['max-area-of-island', 'Max Area of Island', 'M', 'Same flood-fill; return the size of each region.', 'O(m·n)', 'O(m·n)'],
    ['clone-graph', 'Clone Graph', 'M', 'Map old node → new node so cycles don\'t loop forever.', 'O(V + E)', 'O(V)'],
    ['walls-and-gates', 'Walls and Gates', 'M', 'Multi-source BFS starting from all gates at once.', 'O(m·n)', 'O(m·n)', 'https://neetcode.io/problems/islands-and-treasure'],
    ['rotting-oranges', 'Rotting Oranges', 'M', 'Multi-source BFS; each BFS layer is one minute.', 'O(m·n)', 'O(m·n)'],
    ['pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'M', 'Reverse the flow: search uphill from each ocean\'s border, then intersect.', 'O(m·n)', 'O(m·n)'],
    ['surrounded-regions', 'Surrounded Regions', 'M', 'Mark the O\'s connected to the border first; flip all the others.', 'O(m·n)', 'O(m·n)'],
    ['course-schedule', 'Course Schedule', 'M', 'Is there a cycle in the prerequisite graph? (DFS states or Kahn\'s algorithm)', 'O(V + E)', 'O(V + E)'],
    ['course-schedule-ii', 'Course Schedule II', 'M', 'Topological order: repeatedly take courses with in-degree 0.', 'O(V + E)', 'O(V + E)'],
    ['graph-valid-tree', 'Graph Valid Tree', 'M', 'A tree has exactly n - 1 edges and is fully connected (or: no cycle via union-find).', 'O(V + E)', 'O(V)', 'https://neetcode.io/problems/valid-tree'],
    ['number-of-connected-components-in-an-undirected-graph', 'Number of Connected Components', 'M', 'Union-find: every successful union reduces the component count by one.', 'O(V + E)', 'O(V)', 'https://neetcode.io/problems/count-connected-components'],
    ['redundant-connection', 'Redundant Connection', 'M', 'The first edge whose endpoints are already connected (union-find) closes the cycle.', 'O(n·α(n))', 'O(n)'],
    ['word-ladder', 'Word Ladder', 'H', 'Shortest path = BFS. Link words via wildcard patterns like "h*t".', 'O(n·L²)', 'O(n·L²)'],
  ],
  'advanced-graphs': [
    ['reconstruct-itinerary', 'Reconstruct Itinerary', 'H', 'Hierholzer\'s algorithm: DFS using smallest-lexical edges, append airport on the way back.', 'O(E log E)', 'O(E)'],
    ['min-cost-to-connect-all-points', 'Min Cost to Connect All Points', 'M', 'Minimum spanning tree: Prim\'s with a heap or Kruskal\'s with union-find.', 'O(n² log n)', 'O(n²)'],
    ['network-delay-time', 'Network Delay Time', 'M', 'Single-source shortest path (Dijkstra); answer is the max distance.', 'O(E log V)', 'O(V + E)'],
    ['swim-in-rising-water', 'Swim in Rising Water', 'H', 'Dijkstra where the cost of a path is the max cell on it.', 'O(n² log n)', 'O(n²)'],
    ['alien-dictionary', 'Alien Dictionary', 'H', 'Adjacent words give letter-order edges; then topologically sort.', 'O(C)', 'O(1)', 'https://neetcode.io/problems/foreign-dictionary'],
    ['cheapest-flights-within-k-stops', 'Cheapest Flights Within K Stops', 'M', 'Bellman-Ford limited to k + 1 relaxation rounds (use a copy each round).', 'O(k·E)', 'O(V)'],
  ],
  '1d-dp': [
    ['climbing-stairs', 'Climbing Stairs', 'E', 'ways(n) = ways(n-1) + ways(n-2). Only the last two values matter.', 'O(n)', 'O(1)'],
    ['min-cost-climbing-stairs', 'Min Cost Climbing Stairs', 'E', 'cost to reach step i = min of coming from i-1 or i-2.', 'O(n)', 'O(1)'],
    ['house-robber', 'House Robber', 'M', 'At each house: skip it, or rob it plus the best from two houses back.', 'O(n)', 'O(1)'],
    ['house-robber-ii', 'House Robber II', 'M', 'The ring means first and last conflict: solve twice, excluding one of them.', 'O(n)', 'O(1)'],
    ['longest-palindromic-substring', 'Longest Palindromic Substring', 'M', 'Expand around each of the 2n - 1 possible centres.', 'O(n²)', 'O(1)'],
    ['palindromic-substrings', 'Palindromic Substrings', 'M', 'Same expand-around-centre; count every successful expansion.', 'O(n²)', 'O(1)'],
    ['decode-ways', 'Decode Ways', 'M', 'dp[i] adds dp[i-1] if one digit is valid, and dp[i-2] if two digits are valid.', 'O(n)', 'O(1)'],
    ['coin-change', 'Coin Change', 'M', 'dp[a] = 1 + min(dp[a - coin]) over all coins.', 'O(n·amount)', 'O(amount)'],
    ['maximum-product-subarray', 'Maximum Product Subarray', 'M', 'Track both max and min ending here; a negative flips them.', 'O(n)', 'O(1)'],
    ['word-break', 'Word Break', 'M', 'dp[i] = true if some word ends at i and dp[i - len(word)] is true.', 'O(n·m·k)', 'O(n)'],
    ['longest-increasing-subsequence', 'Longest Increasing Subsequence', 'M', 'dp[i] = 1 + max(dp[j]) for j < i with a[j] < a[i]. Then think binary search for O(n log n).', 'O(n log n)', 'O(n)'],
    ['partition-equal-subset-sum', 'Partition Equal Subset Sum', 'M', 'Is a subset summing to total / 2 reachable? Keep a set of reachable sums.', 'O(n·sum)', 'O(sum)'],
  ],
  '2d-dp': [
    ['unique-paths', 'Unique Paths', 'M', 'paths(r, c) = paths(r-1, c) + paths(r, c-1).', 'O(m·n)', 'O(n)'],
    ['longest-common-subsequence', 'Longest Common Subsequence', 'M', 'Characters match → 1 + diagonal; otherwise max of up and left.', 'O(m·n)', 'O(m·n)'],
    ['best-time-to-buy-and-sell-stock-with-cooldown', 'Best Time to Buy and Sell Stock with Cooldown', 'M', 'States: holding, sold (cooldown), resting. Define the transitions.', 'O(n)', 'O(1)'],
    ['coin-change-ii', 'Coin Change II', 'M', 'Count combinations (not orderings): loop coins outermost.', 'O(n·amount)', 'O(amount)'],
    ['target-sum', 'Target Sum', 'M', 'Per element choose + or -. Memoize on (index, running total).', 'O(n·sum)', 'O(n·sum)'],
    ['interleaving-string', 'Interleaving String', 'M', 'dp[i][j]: can s1[:i] and s2[:j] form s3[:i+j]?', 'O(m·n)', 'O(n)'],
    ['longest-increasing-path-in-a-matrix', 'Longest Increasing Path in a Matrix', 'H', 'DFS from each cell with memoization; a strictly increasing path can\'t cycle.', 'O(m·n)', 'O(m·n)'],
    ['distinct-subsequences', 'Distinct Subsequences', 'H', 'On a match you may use it (diagonal) or skip it (left).', 'O(m·n)', 'O(n)'],
    ['edit-distance', 'Edit Distance', 'M', 'On mismatch take 1 + min(insert, delete, replace).', 'O(m·n)', 'O(n)'],
    ['burst-balloons', 'Burst Balloons', 'H', 'Think about which balloon is burst LAST in a range [l, r].', 'O(n³)', 'O(n²)'],
    ['regular-expression-matching', 'Regular Expression Matching', 'H', 'Handle "*" as: skip the pair (zero uses) or consume one char and stay.', 'O(m·n)', 'O(m·n)'],
  ],
  greedy: [
    ['maximum-subarray', 'Maximum Subarray', 'M', 'If the running sum goes negative, drop it and start fresh.', 'O(n)', 'O(1)'],
    ['jump-game', 'Jump Game', 'M', 'Track the furthest index you can reach so far.', 'O(n)', 'O(1)'],
    ['jump-game-ii', 'Jump Game II', 'M', 'BFS by "jump levels": the window of indices reachable with k jumps.', 'O(n)', 'O(1)'],
    ['gas-station', 'Gas Station', 'M', 'If the tank goes negative at i, no start in between can work. Restart at i + 1.', 'O(n)', 'O(1)'],
    ['hand-of-straights', 'Hand of Straights', 'M', 'Always start a group from the smallest remaining card.', 'O(n log n)', 'O(n)'],
    ['merge-triplets-to-form-target-triplet', 'Merge Triplets to Form Target Triplet', 'M', 'Ignore any triplet that exceeds the target in any position.', 'O(n)', 'O(1)'],
    ['partition-labels', 'Partition Labels', 'M', 'Record each letter\'s last index; extend the current part to cover them.', 'O(n)', 'O(1)'],
    ['valid-parenthesis-string', 'Valid Parenthesis String', 'M', 'Track the range [lo, hi] of possible open counts; "*" widens it.', 'O(n)', 'O(1)'],
  ],
  intervals: [
    ['insert-interval', 'Insert Interval', 'M', 'Three phases: before overlap, merge the overlap, after overlap.', 'O(n)', 'O(n)'],
    ['merge-intervals', 'Merge Intervals', 'M', 'Sort by start; extend the last result when the next start ≤ its end.', 'O(n log n)', 'O(n)'],
    ['non-overlapping-intervals', 'Non-overlapping Intervals', 'M', 'Sort by end; on overlap, remove the one that ends later.', 'O(n log n)', 'O(1)'],
    ['meeting-rooms', 'Meeting Rooms', 'E', 'Sort by start; any overlap with the previous one means False.', 'O(n log n)', 'O(1)', 'https://neetcode.io/problems/meeting-schedule'],
    ['meeting-rooms-ii', 'Meeting Rooms II', 'M', 'Sort starts and ends separately, or use a min-heap of end times.', 'O(n log n)', 'O(n)', 'https://neetcode.io/problems/meeting-schedule-ii'],
    ['minimum-interval-to-include-each-query', 'Minimum Interval to Include Each Query', 'H', 'Process queries in sorted order; keep a min-heap of (size, end) for candidate intervals.', 'O((n + q) log n)', 'O(n + q)'],
  ],
  'math-geometry': [
    ['rotate-image', 'Rotate Image', 'M', 'Rotate = transpose, then reverse each row.', 'O(n²)', 'O(1)'],
    ['spiral-matrix', 'Spiral Matrix', 'M', 'Maintain four boundaries and shrink them after each side.', 'O(m·n)', 'O(1)'],
    ['set-matrix-zeroes', 'Set Matrix Zeroes', 'M', 'Use the first row and column as the marker storage.', 'O(m·n)', 'O(1)'],
    ['happy-number', 'Happy Number', 'E', 'It either reaches 1 or loops forever. How do you detect a loop?', 'O(log n)', 'O(1)'],
    ['plus-one', 'Plus One', 'E', 'Walk from the end; 9s become 0 and carry on.', 'O(n)', 'O(1)'],
    ['powx-n', 'Pow(x, n)', 'M', 'Square the base and halve the exponent (fast exponentiation). Handle negative n.', 'O(log n)', 'O(1)'],
    ['multiply-strings', 'Multiply Strings', 'M', 'digit i × digit j contributes to position i + j and i + j + 1.', 'O(m·n)', 'O(m + n)'],
    ['detect-squares', 'Detect Squares', 'M', 'Count points in a dict; for each diagonal point, look up the two other corners.', 'O(n)', 'O(n)'],
  ],
  'bit-manipulation': [
    ['single-number', 'Single Number', 'E', 'x ^ x = 0 and x ^ 0 = x.', 'O(n)', 'O(1)'],
    ['number-of-1-bits', 'Number of 1 Bits', 'E', 'n & (n - 1) removes the lowest set bit.', 'O(1)', 'O(1)'],
    ['counting-bits', 'Counting Bits', 'E', 'bits(i) = bits(i >> 1) + (i & 1).', 'O(n)', 'O(n)'],
    ['reverse-bits', 'Reverse Bits', 'E', 'Take the lowest bit, push it onto the result from the left; repeat 32 times.', 'O(1)', 'O(1)'],
    ['missing-number', 'Missing Number', 'E', 'XOR all indices with all values, or use the sum formula.', 'O(n)', 'O(1)'],
    ['sum-of-two-integers', 'Sum of Two Integers', 'M', 'XOR is the sum without carry; AND << 1 is the carry. Repeat. (Mask for Python.)', 'O(1)', 'O(1)'],
    ['reverse-integer', 'Reverse Integer', 'M', 'Pop digits with % 10 and push them. Check 32-bit overflow before pushing.', 'O(log n)', 'O(1)'],
  ],
};

export const PROBLEMS: Problem[] = TOPICS.flatMap((t) =>
  (ROWS[t.slug] ?? []).map(([slug, title, d, hint, time, space, url]) => ({
    slug,
    title,
    topic: t.slug,
    difficulty: D[d],
    url: url ?? `https://leetcode.com/problems/${slug}/`,
    hint,
    time,
    space,
  }))
);

export const PROBLEM_BY_SLUG = new Map(PROBLEMS.map((p) => [p.slug, p]));
export const TOPIC_BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));
export const problemsOf = (topic: string) => PROBLEMS.filter((p) => p.topic === topic);
