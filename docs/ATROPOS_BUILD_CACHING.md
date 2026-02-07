# Atropos Build Caching Strategy

## Problem
Atropos is a Rust-based OSINT scanner that takes 2-3 minutes to compile. Rebuilding on every deployment wastes time and resources.

## Solution: Smart Caching

### How It Works

The build system now has 4-tier caching:

**Tier 1**: Check `dist/bin/atropos` (fastest)
- If binary exists in dist, use it immediately
- No build time: 0ms

**Tier 2**: Check `tools/atropos/target/release/atropos` (fast)
- If binary exists from previous build, copy it
- No build time: ~100ms (copy operation)

**Tier 3**: Check `.atropos-cache/atropos` (fallback cache)
- Persistent cache outside dist folder
- Survives `rm -rf dist` operations
- No build time: ~100ms (copy operation)

**Tier 4**: Build from source (slow, only when necessary)
- Compiles Rust code with cargo
- Build time: 2-3 minutes (first time only)
- Caches result for future use

### Usage

#### Quick Start (Recommended)
```bash
# Build once and cache
chmod +x script/build-atropos-once.sh
./script/build-atropos-once.sh

# Now regular builds are fast
npm run build  # Uses cached binary, no recompile
```

#### Manual Build with Caching
```bash
# Enable build, compile once
ENABLE_ATROPOS_BUILD=1 npm run build

# Future builds are fast
npm run build  # Reuses cached binary
```

#### Force Rebuild (rarely needed)
```bash
# Clear cache and rebuild
rm -rf .atropos-cache tools/atropos/target
ENABLE_ATROPOS_BUILD=1 npm run build
```

#### Skip Atropos Entirely
```bash
# If you don't need the Rust scanner
SKIP_ATROPOS_BUILD=1 npm run build
```

### For Development

**First time setup**:
```bash
# 1. Build once (takes 2-3 min)
./script/build-atropos-once.sh

# 2. Regular development
npm run dev  # Fast, uses cached binary
```

**Daily workflow**:
```bash
npm run dev  # Binary already cached, starts immediately
```

### For Production Deployment

**Option A: Cache Binary in Repo** (fastest deploys)
```bash
# Commit the cached binary (not recommended for git, but fastest)
git add .atropos-cache/
git commit -m "cache: add pre-built atropos binary"

# Deployments now skip build entirely
```

**Option B: Build Once, Persist** (recommended)
```bash
# Build in CI/CD once
ENABLE_ATROPOS_BUILD=1 npm run build

# Cache dist/bin/ or .atropos-cache/ in deployment artifact
# Future deployments reuse this artifact
```

**Option C**: Download Pre-Built Binary
```bash
# Download from releases
wget https://github.com/blacklanternsecurity/atropos/releases/download/v0.1.0/atropos-linux-x64
mv atropos-linux-x64 .atropos-cache/atropos
chmod +x .atropos-cache/atropos

# Now cached, no build needed
npm run build
```

### Environment Variables

| Variable | Effect | Use Case |
|----------|--------|----------|
| `ENABLE_ATROPOS_BUILD=1` | Force build from source | First time setup, updates |
| `SKIP_ATROPOS_BUILD=1` | Skip entirely | Don't need Rust scanner |
| (none) | Use cache if available | Normal operation (recommended) |

### Cache Locations

```
.atropos-cache/              # Persistent cache (add to .gitignore)
├── atropos                  # Cached binary
└── build-info.json          # Build metadata

dist/bin/                    # Runtime location
└── atropos                  # Active binary

tools/atropos/target/release/ # Cargo build output
└── atropos                  # Original build location
```

### Verification

Check if Atropos is available:
```bash
# Check cache exists
ls -lh .atropos-cache/atropos

# Check dist binary
ls -lh dist/bin/atropos

# Test execution
./dist/bin/atropos --version
```

### Integration with npm Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "build": "tsx script/build.ts",
    "build:atropos": "./script/build-atropos-once.sh",
    "build:force-atropos": "ENABLE_ATROPOS_BUILD=1 npm run build",
    "clean:atropos": "rm -rf .atropos-cache tools/atropos/target"
  }
}
```

### Troubleshooting

**Binary not found**:
```bash
# Rebuild cache
./script/build-atropos-once.sh
```

**Build hangs**:
```bash
# Skip for now
SKIP_ATROPOS_BUILD=1 npm run build
```

**Wrong architecture** (e.g., built on Intel, running on ARM):
```bash
# Rebuild for current architecture
rm -rf .atropos-cache
./script/build-atropos-once.sh
```

**Cargo not found**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Then build
./script/build-atropos-once.sh
```

### CI/CD Setup

**GitHub Actions Example**:
```yaml
- name: Cache Atropos Binary
  uses: actions/cache@v3
  with:
    path: .atropos-cache
    key: atropos-${{ runner.os }}-${{ hashFiles('tools/atropos/Cargo.lock') }}

- name: Build Atropos (if not cached)
  run: |
    if [ ! -f .atropos-cache/atropos ]; then
      ENABLE_ATROPOS_BUILD=1 npm run build
    else
      echo "Using cached Atropos binary"
    fi
```

**Replit Deployment**:
```bash
# .replit file
run = "npm run dev"

[nix]
# Rust included in replit.nix

# Build once on first deploy
onBoot = "./script/build-atropos-once.sh || true"
```

### Performance Impact

| Scenario | Build Time | Notes |
|----------|------------|-------|
| **First build** (no cache) | 2-3 minutes | One-time cost |
| **Cached build** | ~100ms | Instant copy |
| **Without Atropos** | 4s | Skip entirely |
| **With pre-built binary** | 0ms | Download once |

### Recommendation

**For development**: Run `./script/build-atropos-once.sh` once, then forget about it.

**For production**: Cache binary in deployment artifact or download pre-built.

**For CI/CD**: Use actions/cache to persist binary between runs.

---

**Summary**: Build once, cache forever. Atropos rebuilds only when you explicitly request it or cache is cleared.
