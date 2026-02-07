# HeliBoard Custom Layouts for Coding

Custom HeliBoard layouts: bigger spacebar (comma removed, period kept with @ long press) and a coding-optimized symbols page.

## Files

- **`functional_keys_bigspace.json`** - Functional key layout (bigger spacebar)
- **`symbols_coding.txt`** - Symbols layout reorganized for coding

## Functional Keys: Big Spacebar

Removes the comma key, keeps the period (with `@` on long press). The spacebar expands to fill the freed space.

**Default bottom row:**
```
[?123] [,] [lang] [emoji] [   space   ] [.] [enter]
```

**This layout:**
```
[?123] [lang] [emoji] [     space     ] [.] [enter]
```

### Install

1. Go to **Settings** > **Advanced** > **Secondary Layouts**
2. Find **Functional keys** and tap the **+** button
3. Choose **copy existing layout**, then replace the contents with `functional_keys_bigspace.json`
4. Save

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
