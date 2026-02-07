# HeliBoard Big Spacebar Layout

A custom HeliBoard functional key layout that removes the `,` (comma) and `.` (period) keys from either side of the spacebar, giving you a much wider spacebar to reduce typos.

## What This Changes

The default HeliBoard bottom row looks like:

```
[?123] [,] [lang] [emoji] [    space    ] [.] [enter]
```

This custom layout changes it to:

```
[?123] [lang] [emoji] [        space        ] [enter]
```

The spacebar expands to fill all the space previously occupied by comma and period, since it uses `width: -1` (fill remaining space).

## File

- **`functional_keys_bigspace.json`** - Custom functional key layout (JSON format)

## Installation

### Method 1: Import via HeliBoard Settings

1. Open HeliBoard Settings
2. Go to **Preferences** > **Appearance & Layouts** > **Custom layout**
3. Tap the **+** button and choose **Functional keys**
4. Paste the contents of `functional_keys_bigspace.json` into the editor
5. Save and select the new layout

### Method 2: File Import

1. Copy `functional_keys_bigspace.json` to your device
2. In HeliBoard Settings, go to **Preferences** > **Appearance & Layouts** > **Custom layout**
3. Tap the **+** button, choose **Functional keys**, then use the file import option
4. Select the JSON file

## Accessing Comma and Period

Since comma and period are removed from the bottom row, you can still access them by:

- **Long-pressing the spacebar** (if configured in HeliBoard settings)
- **Switching to the symbols layout** (tap the `?123` key)
- **Using the period key popup** on any layout that still has it

## Compatibility

- Works with any main letter layout (QWERTY, AZERTY, Dvorak, Colemak, etc.)
- The main letter layout is independent of the functional keys layout
- Compatible with HeliBoard v2.0+

## Layout Format Reference

This uses the HeliBoard JSON functional key layout format. See the [official layout documentation](https://github.com/Helium314/HeliBoard/blob/main/layouts.md) for details.
