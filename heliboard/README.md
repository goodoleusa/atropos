# HeliBoard Custom Layouts for Coding

Custom HeliBoard layouts: bigger spacebar (comma removed, period kept with @ long press) and a coding-optimized symbols page.

## Files

- **`qwerty_bigspace.txt`** - Main QWERTY layout with 2-key bottom row (defines comma/period popups)
- **`functional_keys_bigspace.json`** - Functional key layout (bigger spacebar, no left comma)
- **`symbols_coding.txt`** - Symbols layout reorganized for coding

## Functional Keys: Big Spacebar

Two files work together:

1. **`qwerty_bigspace.txt`** (main layout) - Standard QWERTY with a 2-key bottom row. When the bottom row has exactly 2 keys, they replace the comma and period keys in the functional layout. The first key replaces comma (groupId 1), the second replaces period (groupId 2). Popup keys defined here go into the "Layout" popup key group.

   - Key 1 (comma): `,` with `.` and `@` on long press
   - Key 2 (period): `.` with `,` `@` `!` `?` `;` `:` `-` on long press

2. **`functional_keys_bigspace.json`** (functional layout) - Removes the left comma key so the spacebar expands.

**Result:**
```
[?123] [lang] [emoji] [       space       ] [enter]
```
Plus the comma/period replacements from the main layout.

### Install

1. **Main layout**: Go to **Languages & Layouts** > tap your language > tap **+** next to Layouts > **Add custom layout** > paste `qwerty_bigspace.txt`
2. **Functional keys**: Go to **Settings** > **Advanced** > **Secondary Layouts** > **Functional keys** > tap **+** > paste `functional_keys_bigspace.json`

## Symbols: Coding-Optimized

Reorganizes the symbols page (`?123`) so all the characters you need for coding are on the first page, logically grouped.

### Row 1 - Brackets and delimiters
```
{  }  [  ]  (  )  ~  `  \  %
```
Long press popups: `{`->`<`, `}`->`>`, `[`->`‹≤«`, `]`->`›≥»`, `~`->`^`, `` ` ``->`´`, `\`->`|`, `%`->`‰℅`

### Row 2 - Operators and special chars
```
@  #  $  _  &  -  +  =  |  /
```
Long press popups: `_`->`—`, `&`->`§`, `-`->`–⁻·—`, `+`->`±⁺`, `=`->`≠⁼≈∞`, `|`->`¦`, `/`->`÷`

### Row 3 - Punctuation
```
*  "  '  :  ;  !  ?
```
Long press popups: `*`->`†‡★`, `"`->`'` `` ` `` `´`, `'`->`‚''`, `:`->`; `, `;`->`:`, `!`->`¡`, `?`->`¿`

### Install

1. Go to **Settings** > **Advanced** > **Secondary Layouts**
2. Find **Symbols** and tap the **+** button
3. Choose **copy existing layout**, then replace the contents with `symbols_coding.txt`
4. Save

## What Moved vs Default

| Character | Default Location | New Location |
|-----------|-----------------|--------------|
| `~`       | Page 2          | Page 1, Row 1 |
| `` ` ``   | Page 2          | Page 1, Row 1 |
| `{ }`     | Page 1, end of row | Page 1, start of row |
| `\ %`     | Page 1          | Page 1 (kept) |
| `< >`     | Page 1          | Long press on `{ }` |

## Compatibility

- Works with any main letter layout (QWERTY, AZERTY, Dvorak, Colemak, etc.)
- Compatible with HeliBoard v2.0+
- See the [official layout docs](https://github.com/Helium314/HeliBoard/blob/main/layouts.md) for format details
