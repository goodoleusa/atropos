# Lotus → Atropos Integration Status

**Branch**: `feature/lotus-integration`  
**Last Updated**: 2026-02-02  
**Status**: Phase 1-2 Complete ✅

---

## ✅ Completed

### Phase 1: Repository Setup
- [x] Created `feature/lotus-integration` branch
- [x] Added lotus as git remote
- [x] Integrated lotus as git subtree in `tools/lotus/`
- [x] Verified repository structure

### Phase 2: Atropos Tool Integration
- [x] Created `AtroposService` wrapper (`server/services/atropos.ts`)
  - Binary detection and validation
  - Script execution via CLI
  - Script listing and management
  - Tool call logging integration
- [x] Created Express routes (`server/routes/atropos.ts`)
  - `GET /api/atropos/health` - Health check
  - `GET /api/atropos/scripts` - List available scripts
  - `GET /api/atropos/scripts/:scriptId` - Get script content
  - `POST /api/atropos/scan` - Execute scan
  - `GET /api/atropos/scans/:sessionToken` - Get scan history
- [x] Registered routes in `server/routes.ts`
- [x] Updated build script (`script/build.ts`)
  - Builds Atropos Rust binary during build
  - Copies binary to `dist/bin/atropos`
  - Gracefully handles missing Rust toolchain
- [x] Updated database schema (`shared/schema.ts`)
  - Added `atroposScans` table
  - Added `atroposScripts` table
  - Added TypeScript types

---

## 🔄 In Progress

### Phase 3: Frontend Integration
- [ ] Create `AtroposPanel` component
- [ ] Integrate with Investigation Workspace
- [ ] Add scan execution UI
- [ ] Results display component

### Phase 4: NEXUS Integration
- [ ] Enable NEXUS to suggest Atropos scans
- [ ] Add scan trigger capability to AgentChat
- [ ] Results analysis and presentation

---

## 📋 Next Steps

### Immediate (Phase 3)
1. Create `client/src/components/AtroposPanel.tsx`
   - Script selector dropdown
   - Target input field
   - Scan execution button
   - Progress indicator
   - Results viewer

2. Integrate into Investigation Workspace
   - Add "Atropos Scans" tab
   - Link scans to investigations
   - Display scan history

### Short-term (Phase 4)
3. NEXUS Agent Integration
   - Update `AgentChat.tsx` to recognize scan requests
   - Add scan suggestion logic
   - Feed results back to NEXUS for analysis

4. Database Migration
   - Run `npm run db:push` to create new tables
   - Verify schema updates

### Testing
5. Build and Test
   - Build Atropos binary: `cd tools/lotus && cargo build --release`
   - Test API endpoints
   - Test frontend components
   - Test NEXUS integration

---

## 📁 Files Created/Modified

### New Files
- `server/services/atropos.ts` - Atropos service wrapper
- `server/routes/atropos.ts` - Express API routes
- `tools/lotus/` - Lotus repository (subtree)

### Modified Files
- `server/routes.ts` - Added atropos routes registration
- `script/build.ts` - Added Atropos build step
- `shared/schema.ts` - Added atropos tables

---

## 🔧 Configuration

### Environment Variables
```bash
# Atropos Configuration (optional, has defaults)
ATROPOS_BINARY_PATH=./dist/bin/atropos
ATROPOS_SCRIPTS_DIR=./tools/lotus/examples
```

### Build Requirements
- **Rust toolchain** (optional): Required to build Atropos binary
  - If not available, build will skip Atropos (graceful degradation)
  - Binary can be built separately: `cd tools/lotus && cargo build --release`

---

## 🧪 Testing Checklist

- [ ] Build succeeds (with and without Rust)
- [ ] API health check works: `GET /api/atropos/health`
- [ ] Script listing works: `GET /api/atropos/scripts`
- [ ] Scan execution works: `POST /api/atropos/scan`
- [ ] Results stored correctly
- [ ] Frontend components render
- [ ] NEXUS can trigger scans
- [ ] Results appear in Investigation Workspace

---

## 📝 Notes

- **Lotus is already branded as "Atropos"** in Cargo.toml - no rebranding needed!
- Using existing `osintToolCalls` table for logging (toolKey='atropos')
- Atropos scans integrate with existing investigation system
- Build script gracefully handles missing Rust toolchain

---

## 🚀 Quick Start

### Build Atropos Binary
```bash
cd tools/lotus
cargo build --release
# Binary will be at: tools/lotus/target/release/atropos
```

### Test API
```bash
# Health check
curl http://localhost:5000/api/atropos/health

# List scripts
curl http://localhost:5000/api/atropos/scripts

# Execute scan
curl -X POST http://localhost:5000/api/atropos/scan \
  -H "Content-Type: application/json" \
  -d '{
    "scriptPath": "bbot_scanner.lua",
    "target": "example.com",
    "sessionToken": "test123"
  }'
```

---

*See `ARCHITECTURE.md` for full integration plan*
