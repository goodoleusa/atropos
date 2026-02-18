---
name: modularize-to-template
description: Modularize large React/TypeScript files into reusable template modules. Use when the user asks to break up large components, extract panels/sections into separate files, or prepare code for the templates/ starter kit system.
---

# Modularize to Template

Workflow for breaking large monolithic React files into modular, template-ready components that integrate with the Atropos starter kit system (`templates/manifest.json`).

## When to Use

- A single file exceeds ~500 lines with multiple inline components
- User asks to "modularize", "break up", "extract", or "template-ize" a large file
- Preparing admin panels, dashboards, or page sections for reuse in templates/modules/

## Step 1: Analyze the File

1. Run `wc -l` on the target file
2. Run `grep -n "^function \|^export.*function "` to list all inline components with line numbers
3. Calculate line ranges for each component
4. Identify shared state, props, constants, types, and config objects

```bash
wc -l client/src/pages/TARGET.tsx
grep -n "^function \|^export.*function " client/src/pages/TARGET.tsx
```

## Step 2: Classify Components by Size

| Size        | Lines   | Strategy                                    |
|-------------|---------|---------------------------------------------|
| Large       | >100    | Extract to own file                         |
| Medium      | 50-100  | Extract to own file or group related panels |
| Small       | <50     | Bundle into `UtilityPanels.tsx`             |

## Step 3: Extract Shared Config First

Before extracting components, centralize shared constants/types into config files:

- **Nav config** → `client/src/config/adminNav.ts` (NAV_GROUPS, NAV_ICONS, color maps, interfaces)
- **Theme constants** → Keep in existing `client/src/config/` files
- **Shared types** → Export interfaces from config or from `shared/schema.ts`

Pattern for config file:
```typescript
import { Activity, Server, Eye, ... } from "lucide-react";

export const NAV_GROUPS = [ ... ];
export const NAV_ICONS: Record<string, any> = { ... };
export const GROUP_COLORS: Record<string, string> = { ... };
export interface Clue { ... }
```

## Step 4: Extract Components

For each component being extracted:

1. **Create the file** in the appropriate directory:
   - Admin panels → `client/src/pages/admin/PanelName.tsx`
   - Builder subcomponents → `client/src/pages/builder/` or `client/src/components/campaign/`
   - Shared UI → `client/src/components/`

2. **Move the full function** with all its local state, hooks, and helpers

3. **Add necessary imports** — copy only the imports the component actually uses

4. **Export as named export** (not default) for consistency:
   ```typescript
   export function SitemapPanel() { ... }
   ```

5. **Handle props** — if the component received props from the parent:
   - Define a typed interface: `interface SitemapPanelProps { ... }`
   - Prefer minimal prop drilling — move queries/state into the extracted component when possible
   - For components that just need a navigate callback: `{ onNavigate: (path: string) => void }`

## Step 5: Refactor the Parent

1. **Remove** all extracted inline functions
2. **Add imports** from the new files:
   ```typescript
   import { SitemapPanel } from "@/pages/admin/SitemapPanel";
   import { SessionsPanel } from "@/pages/admin/SessionsPanel";
   ```
3. **Simplify the switch/routing** — it should now be a clean mapping of section IDs to imported components
4. **Move shared state to a hook** if many components need the same data (e.g., `useAdminDashboardState`)

## Step 6: Update Templates

After modularization, update the templates system:

1. **Update `templates/manifest.json`** — add new files to the appropriate module's `pages` or `components` arrays

2. **Create/update module.json** if adding a new template module:
   ```json
   {
     "id": "admin-dashboard",
     "name": "Admin Dashboard",
     "files": {
       "pages": ["client/src/pages/AdminDashboard.tsx"],
       "admin_panels": ["client/src/pages/admin/*.tsx"],
       "config": ["client/src/config/adminNav.ts"]
     }
   }
   ```

3. **Update `templates/setup.sh`** if the module needs injection points

## File Naming Conventions

| Type               | Pattern                        | Example                              |
|--------------------|--------------------------------|--------------------------------------|
| Admin panel        | `PascalCasePanel.tsx`          | `SessionsPanel.tsx`                  |
| Admin section      | `PascalCaseSection.tsx`        | `CurriculumSection.tsx`              |
| Config/registry    | `camelCase.ts`                 | `adminNav.ts`                        |
| Utility bundle     | `AdminUtilityPanels.tsx`       | Groups panels under 50 lines         |
| Builder component  | `BuilderPascalCase.tsx`        | `BuilderCanvas.tsx`                  |
| Types              | `PascalCaseTypes.ts`           | `CampaignTypes.ts`                   |

## Checklist Before Finishing

- [ ] No file exceeds ~500 lines (ideally under 300)
- [ ] Parent file is under 400 lines (just layout + routing + auth gate)
- [ ] All extracted components have their own imports (no leftover references)
- [ ] Shared config is centralized (not duplicated across files)
- [ ] `templates/manifest.json` updated with new file paths
- [ ] App compiles and runs without errors
- [ ] No inline components left in the parent file (except truly tiny helpers < 20 lines)

## Common Pitfalls

1. **Unstable default values** — `useQuery` with `= {}` creates new objects each render. Use module-level constants:
   ```typescript
   const EMPTY: Record<string, Config> = {};
   const { data = EMPTY } = useQuery(...);
   ```

2. **useEffect dependency loops** — When extracting, verify useEffect deps don't reference objects that change identity every render

3. **Import cycles** — Config files should not import from component files

4. **Lost context** — If a component used parent state (e.g., `renderTree`, `chaosEnabled`), either pass as props or move the state into the extracted component

5. **Lucide icon imports** — Each extracted file needs its own icon imports; don't assume they carry over

## Example: AdminDashboard Extraction

Before (2400+ lines, 12 inline components):
```
client/src/pages/AdminDashboard.tsx  (2411 lines)
```

After:
```
client/src/config/adminNav.ts           (~80 lines - nav groups, icons, colors, types)
client/src/pages/AdminDashboard.tsx     (~300 lines - layout, sidebar, auth gate, routing)
client/src/pages/admin/
  ActivityLogPanel.tsx                  (~140 lines)
  QuickAccessSection.tsx                (~130 lines)
  SitemapPanel.tsx                      (~360 lines)
  SessionsPanel.tsx                     (~145 lines)
  BehaviorAnalyticsPanel.tsx            (~270 lines)
  AgentConfigPanel.tsx                  (~150 lines)
  CampaignDesignerPanel.tsx             (~215 lines)
  ModmailPanel.tsx                      (~155 lines)
  AtroposScannerSection.tsx             (~47 lines)
  AdminUtilityPanels.tsx                (~200 lines - Messages, Terminal, Config, Campaigns, Graph)
```
