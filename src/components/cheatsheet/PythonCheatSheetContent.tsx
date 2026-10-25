'use client';

import { useState } from 'react';
import { Search, X, Check, Copy, BookOpen, Table2, Cpu, Sparkles } from 'lucide-react';

export type CheatCategory = 'python' | 'pandas' | 'dsa';

export interface CheatRow {
  code: string;
  desc: string;
  note?: string;
}

export interface CheatGroup {
  subtitle?: string;
  rows: CheatRow[];
}

export interface CheatSection {
  id: string;
  category: CheatCategory;
  number: string;
  title: string;
  subtitle: string;
  tip?: string;
  groups: CheatGroup[];
}

export const CHEAT_SHEET_SECTIONS: CheatSection[] = [
  // ==========================================
  // PYTHON CORE CHEAT SHEET (1 - 6)
  // ==========================================
  {
    id: 'py-strings',
    category: 'python',
    number: '1',
    title: 'Strings (Immutable)',
    subtitle: 'Text manipulation methods. Because strings cannot be changed in-place, modifying methods always return a brand-new string.',
    groups: [
      {
        subtitle: 'Change Case',
        rows: [
          { code: 's.lower() / s.upper()', desc: 'Convert all characters to lowercase or uppercase.' },
          { code: 's.capitalize()', desc: 'Uppercase the very first character, lowercase the rest.' },
          { code: 's.title()', desc: 'Uppercase the first letter of every word (e.g. "hello world" → "Hello World").' },
          { code: 's.swapcase()', desc: 'Flip uppercase to lowercase and vice versa.' },
        ],
      },
      {
        subtitle: 'Find & Check Substrings',
        rows: [
          { code: "'sub' in s", desc: 'Quickest check if substring exists (returns True or False).' },
          { code: "s.find('sub')", desc: 'Returns start index of first match, or -1 if not found (safe, no error).' },
          { code: "s.index('sub')", desc: 'Same as find(), but raises ValueError if not found.' },
          { code: "s.count('sub')", desc: 'Count non-overlapping occurrences of a substring.' },
          { code: "s.startswith('pre') / s.endswith('suf')", desc: 'Returns True if string starts or ends with the given text.' },
        ],
      },
      {
        subtitle: 'Character Type Checks (Returns Bool)',
        rows: [
          { code: 's.isalnum()', desc: 'True if all characters are letters or numbers (alphanumeric) and not empty.' },
          { code: 's.isalpha()', desc: 'True if all characters are alphabetic letters only.' },
          { code: 's.isdigit()', desc: 'True if all characters are numeric digits (0–9).' },
          { code: 's.islower() / s.isupper()', desc: 'True if all cased characters are lowercase / uppercase.' },
          { code: 's.isspace()', desc: 'True if string contains only whitespace (spaces, tabs, newlines).' },
        ],
      },
      {
        subtitle: 'Modify & Clean (Returns New String)',
        rows: [
          { code: 's.strip()', desc: 'Remove whitespace from both left and right ends.' },
          { code: 's.lstrip() / s.rstrip()', desc: 'Remove whitespace from only the left end or right end.' },
          { code: "s.strip('chars')", desc: 'Remove any of the specified characters from both ends.' },
          { code: "s.replace('old', 'new', count=-1)", desc: 'Replace occurrences of "old" with "new" (all by default, or first count).' },
        ],
      },
      {
        subtitle: 'Split, Join & Formatting',
        rows: [
          { code: 's.split(sep=None)', desc: 'Split string into a list of words (defaults to splitting on any whitespace).' },
          { code: 's.splitlines()', desc: 'Split string into a list of lines at line breaks (\\n, \\r\\n).' },
          { code: "'sep'.join(list_of_strings)", desc: 'Combine a list of strings into a single string with "sep" between items.' },
          { code: "f'Hello, {name}. Value: {val*2}'", desc: 'f-string (Python 3.6+ preferred): embed variables and expressions directly.' },
          { code: "'Hello, {}'.format(name)", desc: 'Older .format() string interpolation style.' },
        ],
      },
    ],
  },
  {
    id: 'py-lists',
    category: 'python',
    number: '2',
    title: 'Lists (Mutable, Ordered)',
    subtitle: 'Dynamic arrays that hold ordered items of any type and can be modified in-place.',
    groups: [
      {
        subtitle: 'Create, Access & Modify',
        rows: [
          { code: "my_list = [1, 'a', 2.0]", desc: 'Create a list with mixed or uniform data types.' },
          { code: 'my_list[0] / my_list[-1]', desc: 'Access first element (0) or last element (-1) in O(1) time.' },
          { code: 'my_list[1:3]', desc: 'Slice from index 1 up to (but excluding) 3 → returns [2nd, 3rd elements].' },
          { code: "my_list[0] = 'new'", desc: 'Reassign value at a specific index in-place.' },
          { code: 'len(my_list)', desc: 'Get total number of items in the list.' },
        ],
      },
      {
        subtitle: 'Add Elements',
        rows: [
          { code: 'my_list.append(item)', desc: 'Add a single item to the very end of the list (fast O(1)).' },
          { code: 'my_list.extend(iterable)', desc: 'Append all elements from another list/iterable to the end.' },
          { code: 'my_list.insert(index, item)', desc: 'Insert item at specific position (shifts later items right, O(n)).' },
          { code: 'list1 + list2', desc: 'Concatenate two lists and return a brand-new combined list.' },
        ],
      },
      {
        subtitle: 'Remove Elements',
        rows: [
          { code: 'item = my_list.pop(index=-1)', desc: 'Remove and return item at index (defaults to last item in O(1)). Raises IndexError if empty/invalid.' },
          { code: 'my_list.remove(value)', desc: 'Remove first occurrence of value (raises ValueError if not found).' },
          { code: 'my_list.clear()', desc: 'Remove all items, leaving an empty list [].' },
          { code: 'del my_list[idx] / del my_list[a:b]', desc: 'Delete an element by index or delete an entire slice in-place.' },
        ],
      },
      {
        subtitle: 'Search, Count & Order',
        rows: [
          { code: 'value in my_list', desc: 'Check if value exists in list (returns bool, scans list in O(n)).' },
          { code: 'my_list.index(value)', desc: 'Get index of first occurrence of value (raises ValueError if missing).' },
          { code: 'my_list.count(value)', desc: 'Count how many times value appears in the list.' },
          { code: 'my_list.sort(key=..., reverse=False)', desc: 'Sort the list in-place (returns None). Use reverse=True for descending.' },
          { code: 'new_list = sorted(my_list, key=..., reverse=...)', desc: 'Return a new sorted list without modifying the original.' },
          { code: 'my_list.reverse()', desc: 'Reverse the elements of the list in-place.' },
        ],
      },
      {
        subtitle: 'Copying Lists',
        rows: [
          { code: 'shallow = my_list.copy()  # or my_list[:]', desc: 'Shallow copy: duplicates top-level list, but nested lists still share references.' },
          { code: 'import copy; deep = copy.deepcopy(my_list)', desc: 'Deep copy: recursively clones all nested lists/objects so nothing is shared.' },
        ],
      },
    ],
  },
  {
    id: 'py-dicts',
    category: 'python',
    number: '3',
    title: 'Dictionaries (Mutable Key-Value Pairs)',
    subtitle: 'Hash maps that store key → value mappings with instant O(1) average lookup, insert, and delete.',
    groups: [
      {
        subtitle: 'Create, Lookup & Check',
        rows: [
          { code: "d = {'name': 'Alice', 'age': 25}", desc: 'Create a dictionary with key-value pairs (keys must be immutable/hashable).' },
          { code: "d['name']", desc: 'Get value for key (raises KeyError if the key is missing).' },
          { code: "d.get('score', 0)", desc: 'Safe lookup: returns value if key exists, otherwise returns default (0 or None).' },
          { code: "'name' in d", desc: 'Fast O(1) check if a key exists in the dictionary.' },
        ],
      },
      {
        subtitle: 'Add, Update & Remove',
        rows: [
          { code: "d['role'] = 'Engineer'", desc: 'Add a new key-value pair or overwrite an existing key.' },
          { code: "d.update({'age': 26, 'city': 'NYC'})", desc: 'Merge another dict into d, overwriting any matching keys.' },
          { code: "d.setdefault('tags', []).append('py')", desc: 'If key is missing, set it to default ([]) and return the value.' },
          { code: "val = d.pop('age', None)", desc: 'Remove key and return its value (returns default None instead of KeyError if missing).' },
          { code: "del d['name']  /  d.clear()", desc: 'Delete a specific key or empty the entire dictionary.' },
        ],
      },
      {
        subtitle: 'Looping & Views',
        rows: [
          { code: 'for k, v in d.items():', desc: 'Iterate over both keys and values simultaneously (most common loop).' },
          { code: 'd.keys()  /  d.values()', desc: 'Get dynamic view of all dictionary keys or all values.' },
        ],
      },
    ],
  },
  {
    id: 'py-sets-tuples',
    category: 'python',
    number: '4',
    title: 'Sets & Tuples (Unique Items & Immutable Sequences)',
    subtitle: 'Use Tuples for fixed records/coordinates and Sets for instant deduplication and membership checks.',
    groups: [
      {
        subtitle: 'Tuples (Immutable, Ordered, Hashable)',
        rows: [
          { code: 'point = (10, 20)  /  single = (10,)', desc: 'Create a tuple (note the trailing comma required for a 1-item tuple).' },
          { code: 'x, y = point', desc: 'Tuple unpacking: assign elements directly into separate variables.' },
          { code: 'visited = {(r, c): True}', desc: 'Because tuples are immutable, they can be used as dict keys or set elements (lists cannot!).' },
        ],
      },
      {
        subtitle: 'Sets (Mutable, Unordered, Unique Only)',
        rows: [
          { code: 's = set([1, 2, 2, 3])  # -> {1, 2, 3}', desc: 'Create a set (note: empty set must be written set(), because {} creates an empty dict).' },
          { code: 's.add(x)', desc: 'Add an item to the set in O(1) time (ignored if already present).' },
          { code: 's.discard(x)  vs  s.remove(x)', desc: 'discard(x) removes x safely with no error if missing; remove(x) raises KeyError if missing.' },
          { code: 'x in s', desc: 'Instant O(1) membership check (much faster than x in list).' },
        ],
      },
      {
        subtitle: 'Set Math Operations',
        rows: [
          { code: 'a | b   # or a.union(b)', desc: 'Union: all unique items from both set a and set b.' },
          { code: 'a & b   # or a.intersection(b)', desc: 'Intersection: only items present in BOTH sets.' },
          { code: 'a - b   # or a.difference(b)', desc: 'Difference: items in set a that are NOT in set b.' },
          { code: 'a ^ b   # or a.symmetric_difference(b)', desc: 'Symmetric difference: items in either a or b, but not both.' },
        ],
      },
    ],
  },
  {
    id: 'py-builtins',
    category: 'python',
    number: '5',
    title: 'Loops, Built-ins & Comprehensions',
    subtitle: 'Pythonic idioms for clean iteration, one-line collection building, and custom sorting.',
    groups: [
      {
        subtitle: 'Iteration Helpers',
        rows: [
          { code: 'for i, val in enumerate(arr, start=0):', desc: 'Loop over a list while getting both the index (i) and value (val).' },
          { code: 'for a, b in zip(list1, list2):', desc: 'Loop over two or more sequences in parallel (stops at shortest).' },
          { code: 'range(start, stop, step)', desc: 'Generate numbers from start up to (excluding) stop. Use range(n - 1, -1, -1) to count backwards.' },
          { code: 'reversed(seq)', desc: 'Iterate over a sequence in reverse order without copying it.' },
        ],
      },
      {
        subtitle: 'Comprehensions (1-Line Collection Builders)',
        rows: [
          { code: '[x * 2 for x in nums if x > 0]', desc: 'List comprehension: transform and filter items in one clean line.' },
          { code: '{k: v for k, v in pairs}', desc: 'Dictionary comprehension: build a dict from key-value pairs.' },
          { code: '{x.lower() for x in words}', desc: 'Set comprehension: build a deduplicated set.' },
        ],
      },
      {
        subtitle: 'Math, Logic & Lambda Sorting',
        rows: [
          { code: 'sum(arr) / min(arr) / max(arr)', desc: 'Compute total sum, smallest item, or largest item of any iterable.' },
          { code: 'any(conds)  /  all(conds)', desc: 'any() is True if at least one item is True; all() is True only if every item is True.' },
          { code: 'abs(x)  /  round(x, 2)  /  divmod(a, b)', desc: 'Absolute value, round to n decimals, or get (a // b, a % b) tuple at once.' },
          { code: 'sorted(items, key=lambda x: (x[1], -x[0]))', desc: 'Sort using an inline lambda function (e.g. by 2nd element ascending, then 1st descending).' },
        ],
      },
    ],
  },
  {
    id: 'py-exceptions-io',
    category: 'python',
    number: '6',
    title: 'Exceptions & File I/O',
    subtitle: 'Safely handle runtime errors and read/write files using context managers.',
    groups: [
      {
        subtitle: 'Error Handling (try / except)',
        rows: [
          {
            code: 'try: ... except ValueError as e: ...',
            desc: 'Catch specific errors without crashing the program.',
          },
          {
            code: 'else: ... finally: ...',
            desc: 'else runs only if NO exception occurred; finally ALWAYS runs (for cleanup).',
          },
          {
            code: "raise ValueError('Invalid input')",
            desc: 'Manually trigger an exception with a custom message.',
          },
        ],
      },
      {
        subtitle: 'File Reading & Writing (with open)',
        rows: [
          {
            code: "with open('file.txt', 'r', encoding='utf-8') as f:",
            desc: "Open file safely (auto-closes when block exits). Modes: 'r' (read), 'w' (overwrite), 'a' (append).",
          },
          {
            code: 'text = f.read()  /  lines = f.readlines()',
            desc: 'Read entire file into a single string, or into a list of line strings.',
          },
          {
            code: "f.write('Hello\\n')",
            desc: 'Write string to file (note: write() does not add a newline automatically).',
          },
        ],
      },
    ],
  },

  // ==========================================
  // PANDAS CHEAT SHEET (1 - 11)
  // ==========================================
  {
    id: 'pd-structures',
    category: 'pandas',
    number: '1',
    title: 'Core Data Structures',
    subtitle: 'The two building blocks of Pandas: 1D Series (single column) and 2D DataFrames (table).',
    groups: [
      {
        rows: [
          {
            code: 'pd.Series(data, index=...)',
            desc: '1D labeled array (like a single spreadsheet column). data can be a list, NumPy ndarray, or dict.',
          },
          {
            code: 'pd.DataFrame(data, index=..., columns=...)',
            desc: "2D labeled table (like a spreadsheet or SQL table). data is commonly a dict of lists {'col': [1, 2]} or list of dicts [{'col': 1}, {'col': 2}].",
          },
        ],
      },
    ],
  },
  {
    id: 'pd-io',
    category: 'pandas',
    number: '2',
    title: 'Data Loading & Saving (Common)',
    subtitle: 'Read from and export to CSV, Excel, JSON, and SQL databases.',
    groups: [
      {
        subtitle: 'CSV Files',
        rows: [
          { code: "df = pd.read_csv('file.csv')", desc: 'Load a CSV file into a DataFrame.' },
          { code: "df.to_csv('output.csv', index=False)", desc: 'Save to CSV. index=False prevents writing row numbers as an unnamed column.' },
        ],
      },
      {
        subtitle: 'Excel Files (Requires openpyxl)',
        rows: [
          { code: "df = pd.read_excel('file.xlsx', sheet_name='Sheet1')", desc: 'Read a specific worksheet from an Excel file.' },
          { code: "df.to_excel('output.xlsx', index=False, sheet_name='MyData')", desc: 'Write DataFrame to an Excel sheet without the row index.' },
        ],
      },
      {
        subtitle: 'JSON Files',
        rows: [
          { code: "df = pd.read_json('file.json', orient='records')", desc: 'Read JSON. orient="records" expects a list of row dicts [{col: val}, ...].' },
          { code: "df.to_json('output.json', orient='records', indent=4)", desc: 'Save as pretty-printed JSON list of records.' },
        ],
      },
      {
        subtitle: 'SQL Databases (Requires SQLAlchemy + DB Driver)',
        rows: [
          { code: "engine = create_engine('db_connection_string')", desc: 'Create SQLAlchemy database connection engine.' },
          { code: "df = pd.read_sql_query('SELECT * FROM tbl WHERE ...', engine)", desc: 'Run a raw SQL SELECT query and load results into a DataFrame.' },
          { code: "df = pd.read_sql_table('table_name', engine)", desc: 'Load an entire database table directly into a DataFrame.' },
          { code: "df.to_sql('table_name', engine, if_exists='replace', index=False)", desc: "Write DataFrame to SQL table. if_exists can be 'fail', 'replace', or 'append'." },
        ],
      },
    ],
  },
  {
    id: 'pd-inspect',
    category: 'pandas',
    number: '3',
    title: 'Data Inspection & Exploration',
    subtitle: 'Run these first on any new dataset to understand its shape, types, and summary statistics.',
    groups: [
      {
        rows: [
          { code: 'df.head(n=5) / df.tail(n=5)', desc: 'View the first n rows or last n rows of the DataFrame.' },
          { code: 'df.info()', desc: 'Crucial first step! Shows row count, column names, non-null counts, dtypes, and memory usage.' },
          { code: 'df.describe()', desc: 'Summary stats for numeric columns (count, mean, std, min, 25%, 50%, 75%, max).' },
          { code: "df.describe(include='all')", desc: 'Summary stats for all columns (adds unique, top, and freq for text/categorical columns).' },
          { code: 'df.shape', desc: 'Tuple of (num_rows, num_cols) — no parentheses!' },
          { code: 'df.dtypes', desc: 'Series showing the data type (int64, float64, object, bool, etc.) of each column.' },
          { code: 'df.columns / list(df.columns)', desc: 'Get column labels (Index object, or wrap in list() for a standard Python list).' },
          { code: 'df.index', desc: 'Get the row index labels.' },
          { code: "df['col'].value_counts()", desc: 'Count unique values in a column, sorted most-to-least frequent (great for categoricals).' },
          { code: "df['col'].nunique() / df['col'].unique()", desc: 'Get count of unique values (nunique) or array of distinct values (unique).' },
        ],
      },
    ],
  },
  {
    id: 'pd-selection',
    category: 'pandas',
    number: '4',
    title: 'Selection & Indexing',
    subtitle: 'Pick columns, slice rows by label (.loc) or integer position (.iloc), and filter with conditions.',
    groups: [
      {
        subtitle: 'Select Columns',
        rows: [
          { code: "df['col_name']", desc: 'Select a single column → returns a 1D Series.' },
          { code: "df[['col1', 'col2']]", desc: 'Select multiple columns (note double brackets) → returns a 2D DataFrame.' },
        ],
      },
      {
        subtitle: 'Label-Based Selection: .loc[row_labels, col_labels]',
        rows: [
          { code: 'df.loc[label]', desc: 'Select single row by its index label (returns Series).' },
          { code: 'df.loc[[label1, label2]]', desc: 'Select multiple rows by label (returns DataFrame).' },
          { code: "df.loc['start':'end']", desc: 'Row slice by label — INCLUSIVE of both start and end!' },
          { code: "df.loc[:, ['col1', 'col3']]", desc: 'Select all rows (:) and only specific named columns.' },
          { code: "df.loc[label1, 'col1']", desc: 'Get or set a single cell value by row label and column name.' },
        ],
      },
      {
        subtitle: 'Integer Position-Based Selection: .iloc[row_pos, col_pos]',
        rows: [
          { code: 'df.iloc[0]', desc: 'Select the very first row by position (0-indexed).' },
          { code: 'df.iloc[[0, 2, 4]]', desc: 'Select specific rows by integer positions.' },
          { code: 'df.iloc[1:5]', desc: 'Row slice by position — EXCLUSIVE of end (returns rows 1, 2, 3, 4).' },
          { code: 'df.iloc[:, 0:2]', desc: 'All rows, first two columns (positions 0 and 1).' },
          { code: 'df.iloc[0, 0]', desc: 'Specific cell value at top-left (row 0, col 0).' },
        ],
      },
      {
        subtitle: 'Boolean Indexing (Filtering Rows)',
        rows: [
          { code: "condition = df['col'] > 10", desc: 'Creates a True/False Series for every row.' },
          { code: "df[condition]  # or df[df['col'] > 10]", desc: 'Keep only rows where the condition is True.' },
          { code: "df[(df['col1'] > 10) & (df['col2'] == 'A')]", desc: 'Multiple conditions: use & for AND, | for OR, ~ for NOT, and wrap each check in parentheses ()!' },
          { code: "df[df['col'].isin(['A', 'B', 'C'])]", desc: 'Filter rows where column value matches any item in a list (cleaner than multiple | checks).' },
          { code: "df.loc[condition, ['colA', 'colB']]", desc: 'Filter rows by condition AND pick specific columns in one step.' },
        ],
      },
    ],
  },
  {
    id: 'pd-axis',
    category: 'pandas',
    number: '5',
    title: 'The axis Parameter (Mental Shortcut)',
    subtitle: 'Never confuse axis=0 and axis=1 again.',
    tip: 'Memory Trick: 0 looks like R-O-w / Index, 1 looks like a vertical C-olumn!',
    groups: [
      {
        rows: [
          {
            code: "axis=0  (or axis='index')",
            desc: 'Operate DOWNWARDS along rows. Collapses rows (e.g., df.sum(axis=0) gives total per column; df.dropna(axis=0) drops rows).',
          },
          {
            code: "axis=1  (or axis='columns')",
            desc: 'Operate ACROSS columns. Collapses columns (e.g., df.sum(axis=1) gives total per row; df.drop(col, axis=1) drops a column).',
          },
        ],
      },
    ],
  },
  {
    id: 'pd-cleaning',
    category: 'pandas',
    number: '6',
    title: 'Data Cleaning',
    subtitle: 'Handle missing values (NaN), remove duplicate records, rename columns, and fix data types.',
    groups: [
      {
        subtitle: 'Missing Values (NaN)',
        rows: [
          { code: 'df.isnull().sum()', desc: 'Count how many missing (NaN) values exist in each column.' },
          { code: "df.dropna(axis=0, how='any', thresh=N)", desc: "Drop rows (axis=0) or cols (axis=1) with NaNs. how='any' drops if any NaN; how='all' only if all are NaN." },
          { code: "df.fillna(value) / df.ffill() / df.bfill()", desc: "Replace NaNs with a constant, column mean, or forward/backward fill ('ffill' / 'bfill')." },
          { code: "df['col'] = df['col'].fillna(df['col'].mean())", desc: 'Fill missing values in a specific column with that column’s average.' },
        ],
      },
      {
        subtitle: 'Duplicates & Renaming',
        rows: [
          { code: "df.duplicated(subset=['col1', 'col2'], keep='first')", desc: "Returns boolean Series marking duplicate rows. keep can be 'first', 'last', or False (marks all)." },
          { code: 'df.drop_duplicates(subset=..., keep=..., inplace=True)', desc: 'Remove duplicate rows from the DataFrame.' },
          { code: "df.rename(columns={'old_name': 'new_name'}, inplace=True)", desc: 'Rename specific columns using a dictionary.' },
        ],
      },
      {
        subtitle: 'Data Types Conversion',
        rows: [
          { code: "df['col'] = df['col'].astype(int)", desc: 'Convert column to a new type (int, float, str, bool). Note: handle NaNs before converting to int!' },
          { code: "pd.to_numeric(df['col'], errors='coerce')", desc: 'Safely parse strings to numbers — turns invalid/corrupt strings into NaN instead of crashing.' },
        ],
      },
    ],
  },
  {
    id: 'pd-transform',
    category: 'pandas',
    number: '7',
    title: 'Data Manipulation & Transformation',
    subtitle: 'Add/remove columns, apply custom functions, sort rows, and group-aggregate data.',
    groups: [
      {
        subtitle: 'Add, Modify & Remove Columns',
        rows: [
          { code: "df['new_col'] = df['price'] * df['qty']", desc: 'Create a new column or overwrite an existing one using vectorized math or a single value.' },
          { code: "df.drop('col_name', axis=1)", desc: "Remove a column (or pass a list ['c1', 'c2'] to drop multiple columns)." },
          { code: "del df['col']", desc: 'Delete a single column in-place immediately.' },
        ],
      },
      {
        subtitle: 'Apply & Map Functions',
        rows: [
          { code: "df['col'].apply(func)", desc: 'Run a function element-by-element on every value in a Series.' },
          { code: "df['col'].map(dict_or_func)", desc: "Transform values in a Series using a lookup dictionary {'M': 'Male'} or function." },
          { code: 'df.apply(func, axis=1)', desc: 'Run a function across each row (axis=1) or down each column (axis=0).' },
        ],
      },
      {
        subtitle: 'Sorting',
        rows: [
          { code: "df.sort_values(by='col_name', ascending=True)", desc: 'Sort rows by a column (set ascending=False for highest-to-lowest).' },
          { code: "df.sort_values(by=['col1', 'col2'], ascending=[True, False])", desc: 'Sort by multiple columns with independent sort directions.' },
          { code: 'df.sort_index(ascending=True)', desc: 'Sort rows by their index labels.' },
        ],
      },
      {
        subtitle: 'Grouping & Aggregation: groupby() (Split → Apply → Combine)',
        rows: [
          { code: "grouped = df.groupby('grouping_col')", desc: 'Split DataFrame into groups based on unique values in grouping_col.' },
          { code: 'grouped.sum() / .mean() / .min() / .max()', desc: 'Compute aggregate math for each group.' },
          { code: 'grouped.size() / grouped.count()', desc: 'size() counts total rows per group (including NaN); count() counts non-null values.' },
          { code: "df.groupby('dept')['salary'].mean()", desc: 'Group by one column and aggregate a specific target column.' },
          { code: "df.groupby(['c1', 'c2']).agg({'colA': ['sum', 'mean'], 'colB': 'count'})", desc: 'Run multiple different aggregations across columns at once.' },
          { code: 'grouped_df.reset_index()', desc: 'Turn the grouped index keys back into regular flat DataFrame columns.' },
        ],
      },
    ],
  },
  {
    id: 'pd-combine',
    category: 'pandas',
    number: '8',
    title: 'Combining DataFrames',
    subtitle: 'Stack tables vertically/horizontally with concat, or join on keys like SQL with merge & join.',
    groups: [
      {
        subtitle: 'Concatenate (Stacking Tables)',
        rows: [
          { code: 'pd.concat([df1, df2], axis=0, ignore_index=True)', desc: 'Stack rows vertically (one table below the other). ignore_index=True resets row numbering 0..N.' },
          { code: 'pd.concat([df1, df2], axis=1)', desc: 'Stack columns side-by-side horizontally (aligns rows by index).' },
        ],
      },
      {
        subtitle: 'Database-Style Joins: pd.merge() & .join()',
        rows: [
          { code: "pd.merge(left_df, right_df, on='key_col', how='inner')", desc: "SQL join on a shared column. how: 'inner' (both), 'left' (all left), 'right' (all right), 'outer' (all)." },
          { code: "pd.merge(df1, df2, left_on='id', right_on='user_id')", desc: 'Join when the key column has different names in the two DataFrames.' },
          { code: 'pd.merge(df1, df2, left_index=True, right_index=True)', desc: 'Join using the row indexes of both DataFrames instead of columns.' },
          { code: "df1.join(df2, on='key_col', how='left')", desc: "Convenient shortcut for index-based joins (defaults to left join onto df2's index)." },
        ],
      },
    ],
  },
  {
    id: 'pd-str-dt',
    category: 'pandas',
    number: '9',
    title: 'Text & Date/Time Columns (.str & .dt Accessors)',
    subtitle: 'Vectorized string cleaning and date/time extraction across an entire column at once.',
    groups: [
      {
        subtitle: 'String Accessor (.str)',
        rows: [
          { code: "df['name'].str.strip().str.lower()", desc: 'Chain string methods across a whole column (strip spaces, lowercase, uppercase, title).' },
          { code: "df['email'].str.contains('gmail', na=False)", desc: 'Filter rows containing a substring or regex (na=False treats NaN as False instead of crashing).' },
          { code: "df['phone'].str.replace('-', '', regex=False)", desc: 'Replace characters or substrings across every row in a column.' },
          { code: "df['full_name'].str.split(' ', expand=True)", desc: 'Split string column and expand into multiple separate DataFrame columns.' },
        ],
      },
      {
        subtitle: 'Date/Time Accessor (.dt)',
        rows: [
          { code: "df['date'] = pd.to_datetime(df['date'], errors='coerce')", desc: 'Convert text strings into proper Pandas datetime objects.' },
          { code: "df['date'].dt.year / .dt.month / .dt.day", desc: 'Extract year, month (1–12), or day of month as a numeric column.' },
          { code: "df['date'].dt.day_name() / .dt.dayofweek", desc: 'Get weekday name ("Monday") or weekday number (0=Mon, 6=Sun).' },
          { code: "(df['end_date'] - df['start_date']).dt.days", desc: 'Calculate exact number of days between two date columns.' },
        ],
      },
    ],
  },
  {
    id: 'pd-reshape',
    category: 'pandas',
    number: '10',
    title: 'Reshaping & Conditional Logic (pivot_table, melt, np.where)',
    subtitle: 'Create conditional if/else columns and reshape tables between wide and long formats.',
    groups: [
      {
        subtitle: 'Conditional Columns (Vectorized If / Else)',
        rows: [
          { code: "df['tier'] = np.where(df['sales'] >= 100, 'High', 'Low')", desc: 'Fast vectorized if/else (requires import numpy as np).' },
          { code: "pd.cut(df['age'], bins=[0, 18, 65, 100], labels=['Kid', 'Adult', 'Senior'])", desc: 'Bucket continuous numbers into labeled intervals/bins.' },
        ],
      },
      {
        subtitle: 'Pivot Tables & Melting (Wide ↔ Long)',
        rows: [
          {
            code: "df.pivot_table(index='region', columns='year', values='sales', aggfunc='sum')",
            desc: 'Excel-style Pivot Table: summarizes values by row categories (index) and column headers (columns).',
          },
          {
            code: "pd.crosstab(df['gender'], df['purchased'])",
            desc: 'Quick frequency table counting occurrences across two categorical columns.',
          },
          {
            code: "pd.melt(df, id_vars=['id'], value_vars=['2024', '2025'])",
            desc: 'Unpivot a wide table into a tall/long table (turns column headers into row values).',
          },
        ],
      },
    ],
  },
  {
    id: 'pd-window',
    category: 'pandas',
    number: '11',
    title: 'Window Functions & Ranking (Rolling, Lag, Top-N)',
    subtitle: 'Moving averages, cumulative sums, row-to-row comparisons, and top/bottom rankings.',
    groups: [
      {
        subtitle: 'Rolling, Cumulative & Shift (Time Series)',
        rows: [
          { code: "df['sales'].rolling(window=7).mean()", desc: '7-row moving average (also supports .sum(), .min(), .max(), .std()).' },
          { code: "df['sales'].cumsum() / df['sales'].cummax()", desc: 'Running cumulative total or running maximum down the column.' },
          { code: "df['prev_day'] = df['sales'].shift(1)", desc: 'Lag values down by 1 row to compare with previous row (use shift(-1) for next row).' },
          { code: "df['sales'].diff()  /  df['sales'].pct_change()", desc: 'Compute row-over-row absolute difference or percentage change.' },
        ],
      },
      {
        subtitle: 'Top-N & Ranking',
        rows: [
          { code: "df.nlargest(5, 'salary')  /  df.nsmallest(5, 'salary')", desc: 'Fastest way to grab the top 5 highest or lowest rows without sorting the whole table.' },
          { code: "df['rank'] = df['score'].rank(ascending=False, method='dense')", desc: 'Assign rank numbers (1, 2, 3...) to rows based on column values.' },
        ],
      },
    ],
  },

  // ==========================================
  // DSA & BIG-O QUICK REFERENCE (1 - 3)
  // ==========================================
  {
    id: 'dsa-structures',
    category: 'dsa',
    number: '1',
    title: 'Collections & Heaps (Counter, defaultdict, deque, heapq)',
    subtitle: 'Built-in Python data structures for O(1) frequency maps, graphs, BFS queues, and Top-K heaps.',
    groups: [
      {
        subtitle: 'Frequency & Graph Maps (Counter, defaultdict)',
        rows: [
          { code: 'from collections import Counter; counts = Counter(nums)', desc: 'Build frequency map in O(n). Missing keys return 0. Use counts.most_common(k) for top k.' },
          { code: 'from collections import defaultdict; g = defaultdict(list)', desc: 'Auto-initializes missing keys (e.g. g[u].append(v) for graphs, or defaultdict(int) for counts).' },
        ],
      },
      {
        subtitle: 'Double-Ended Queue (deque) — O(1) BFS Queue',
        rows: [
          { code: 'from collections import deque; q = deque([start])', desc: 'Create a queue. Use len(q) inside a while q: loop to process level-by-level in BFS.' },
          { code: 'q.popleft()  /  q.append(x)', desc: 'Pop from front in O(1) and push to back in O(1). Never use list.pop(0) which is slow O(n)!' },
        ],
      },
      {
        subtitle: 'Priority Queue / Min-Heap (heapq)',
        rows: [
          { code: 'import heapq; heapq.heapify(nums)', desc: 'Transform a list into a Min-Heap in-place in O(n) time. Smallest element is always nums[0].' },
          { code: 'heapq.heappush(h, x)  /  heapq.heappop(h)', desc: 'Insert or pop smallest element in O(log n) time.' },
          { code: 'heapq.heappush(max_h, -x)  ;  val = -heapq.heappop(max_h)', desc: 'Max-Heap trick: Python only has a Min-Heap, so negate numbers (-x) on push and pop!' },
        ],
      },
    ],
  },
  {
    id: 'dsa-patterns',
    category: 'dsa',
    number: '2',
    title: 'Binary Search, DP Memoization & Interview Traps',
    subtitle: 'Must-know standard library shortcuts and classic Python pitfalls to avoid in coding interviews.',
    groups: [
      {
        subtitle: 'Binary Search & Top-Down DP',
        rows: [
          { code: 'from bisect import bisect_left, bisect_right', desc: 'Binary search on a sorted list in O(log n): bisect_left finds first index >= target; bisect_right finds first index > target.' },
          { code: 'from functools import cache\n@cache\ndef dp(i, rem): ...', desc: 'Automatically memoizes recursive function calls by arguments (replaces manual memo = {} dicts).' },
          { code: "ord(ch) - ord('a')   /   math.inf", desc: "Map 'a'..'z' to 0..25 for character arrays; use float('inf') or math.inf for unbounded min/max." },
        ],
      },
      {
        subtitle: 'Classic Python Traps to Avoid',
        rows: [
          { code: 'grid = [[0] * cols for _ in range(rows)]', desc: 'SAFE 2D matrix initialization. NEVER write [[0] * cols] * rows because all rows share the same list reference!' },
          { code: ' "".join(chars)   # instead of s += ch in loop', desc: 'Accumulate characters in a list and join once in O(n) to avoid O(n²) string concatenation.' },
        ],
      },
    ],
  },
  {
    id: 'dsa-bigo',
    category: 'dsa',
    number: '3',
    title: 'Big-O Complexity Mental Rules',
    subtitle: '4 simple mental rules to derive Time & Space complexity in seconds.',
    groups: [
      {
        rows: [
          { code: 'Rule 1: Sequential Steps ADD → O(A + B)', desc: 'If Step A takes O(n) and Step B takes O(n log n), keep only the dominant term: O(n log n).' },
          { code: 'Rule 2: Nested Loops MULTIPLY → O(N × M)', desc: 'A loop of N inside a loop of M runs N × M times. Exception: Two-Pointers / Sliding Window is O(n) because the inner pointer never resets!' },
          { code: 'Rule 3: Halving Search Space → O(log n)', desc: 'Binary Search, balanced BSTs, and heap push/pop cut the problem space in half each step.' },
          { code: 'Rule 4: Space = Peak Containers + Call Stack', desc: 'Count the largest auxiliary array/dict/set allocated + maximum recursion tree depth.' },
        ],
      },
    ],
  },
];

const CATEGORY_TABS: { id: 'all' | CheatCategory; label: string; icon: typeof BookOpen; count: number }[] = [
  { id: 'all', label: 'All Topics', icon: Sparkles, count: CHEAT_SHEET_SECTIONS.length },
  {
    id: 'pandas',
    label: 'Pandas (1–11)',
    icon: Table2,
    count: CHEAT_SHEET_SECTIONS.filter((s) => s.category === 'pandas').length,
  },
  {
    id: 'python',
    label: 'Python Core (1–6)',
    icon: BookOpen,
    count: CHEAT_SHEET_SECTIONS.filter((s) => s.category === 'python').length,
  },
  {
    id: 'dsa',
    label: 'DSA & Big-O (1–3)',
    icon: Cpu,
    count: CHEAT_SHEET_SECTIONS.filter((s) => s.category === 'dsa').length,
  },
];

const CATEGORY_BADGE: Record<CheatCategory, { label: string; className: string }> = {
  pandas: {
    label: 'Pandas',
    className: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  python: {
    label: 'Python Core',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  dsa: {
    label: 'DSA & Big-O',
    className: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
};

export function PythonCheatSheetContent({ compact = false }: { compact?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<'all' | CheatCategory>('all');
  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleCopy(code: string, key: string) {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  const isSearching = search.trim().length > 0;
  const q = search.trim().toLowerCase();

  // Sections matching category filter
  const categorySections = CHEAT_SHEET_SECTIONS.filter((sec) =>
    activeCategory === 'all' ? true : sec.category === activeCategory
  );

  // Sections to display after search or single-section selection
  const displayedSections = CHEAT_SHEET_SECTIONS.filter((sec) => {
    if (isSearching) return true;
    if (activeCategory !== 'all' && sec.category !== activeCategory) return false;
    if (activeSectionId !== 'all' && sec.id !== activeSectionId) return false;
    return true;
  })
    .map((sec) => {
      if (!isSearching) return sec;
      const sectionMatches =
        sec.title.toLowerCase().includes(q) || sec.subtitle.toLowerCase().includes(q);
      if (sectionMatches) return sec;

      const filteredGroups = sec.groups
        .map((g) => ({
          ...g,
          rows: g.rows.filter(
            (r) =>
              r.code.toLowerCase().includes(q) ||
              r.desc.toLowerCase().includes(q) ||
              (g.subtitle || '').toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.rows.length > 0);

      return { ...sec, groups: filteredGroups };
    })
    .filter((sec) => sec.groups.length > 0);

  return (
    <div className="space-y-5">
      {/* Top Controls: Search + Track Switcher */}
      <div className="space-y-3 rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-3.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any command or topic (e.g. read_csv, loc, groupby, pivot_table, dict, bisect)..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-2.5 rounded p-0.5 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Track Tabs */}
        {!isSearching && (
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setActiveSectionId('all');
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                        : 'bg-zinc-950/90 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section Jump Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-800/70">
              <span className="text-[11px] font-medium text-zinc-400 mr-1">Jump to:</span>
              <button
                type="button"
                onClick={() => setActiveSectionId('all')}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                  activeSectionId === 'all'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Show All ({categorySections.length})
              </button>
              {categorySections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                    activeSectionId === sec.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  {sec.number}. {sec.title.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty Search State */}
      {displayedSections.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-2">
          <p className="text-sm text-zinc-300">No commands found matching &ldquo;{search}&rdquo;</p>
          <button
            type="button"
            onClick={() => setSearch('')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Clear search filter
          </button>
        </div>
      )}

      {/* Easy-to-Read Sections List */}
      <div className="space-y-6">
        {displayedSections.map((section) => {
          const badge = CATEGORY_BADGE[section.category];
          return (
            <section
              key={section.id}
              className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/30"
            >
              {/* Section Header */}
              <div className="border-b border-zinc-800/90 bg-zinc-900/80 px-4 py-3.5 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      {section.number}
                    </span>
                    <h2 className="text-base font-bold text-white">{section.title}</h2>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{section.subtitle}</p>
                {section.tip && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200">
                    <span>💡</span>
                    <span>{section.tip}</span>
                  </div>
                )}
              </div>

              {/* Section Sub-Groups & Clean Reference Rows */}
              <div className="divide-y divide-zinc-800/70">
                {section.groups.map((group, gIdx) => (
                  <div key={gIdx} className="p-3.5 sm:p-4 space-y-2.5">
                    {group.subtitle && (
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                        {group.subtitle}
                      </h3>
                    )}

                    <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800/80 bg-zinc-950/60">
                      {group.rows.map((row, rIdx) => {
                        const rowKey = `${section.id}-${gIdx}-${rIdx}`;
                        return (
                          <div
                            key={rowKey}
                            className={`flex flex-col ${
                              compact ? ' gap-1.5' : 'md:flex-row md:items-center gap-2 md:gap-4'
                            } p-2.5 sm:px-3.5 hover:bg-zinc-900/50 transition`}
                          >
                            {/* Left: Code Syntax + Copy button */}
                            <div
                              className={`flex items-center justify-between gap-2 rounded-lg border border-zinc-800/90 bg-zinc-950 px-2.5 py-1.5 ${
                                compact ? 'w-full' : 'md:w-[46%] shrink-0'
                              }`}
                            >
                              <code className="font-mono text-xs text-emerald-300 break-all whitespace-pre-wrap leading-relaxed">
                                {row.code}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopy(row.code, rowKey)}
                                aria-label={`Copy ${row.code}`}
                                title="Copy syntax"
                                className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition"
                              >
                                {copiedKey === rowKey ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Right: Plain-English Explanation */}
                            <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed flex-1">
                              {row.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
