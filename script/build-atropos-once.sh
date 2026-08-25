#!/bin/bash
# Build Atropos Once and Cache for Reuse
# This script builds the Atropos Rust binary once and caches it

set -e

ATROPOS_DIR="tools/atropos"
CACHE_DIR=".atropos-cache"
BINARY_NAME="atropos"

echo "🔍 Checking for cached Atropos binary..."

# Check if binary already cached
if [ -f "$CACHE_DIR/$BINARY_NAME" ]; then
    echo "✅ Found cached binary at $CACHE_DIR/$BINARY_NAME"
    echo "   Built: $(stat -c %y "$CACHE_DIR/$BINARY_NAME" 2>/dev/null || stat -f %Sm "$CACHE_DIR/$BINARY_NAME" 2>/dev/null)"
    
    # Copy to dist/bin if needed
    mkdir -p dist/bin
    cp "$CACHE_DIR/$BINARY_NAME" dist/bin/$BINARY_NAME
    chmod +x dist/bin/$BINARY_NAME
    
    echo "✅ Binary ready at dist/bin/$BINARY_NAME"
    echo "   No rebuild necessary!"
    exit 0
fi

# Check if already built in target directory
if [ -f "$ATROPOS_DIR/target/release/$BINARY_NAME" ]; then
    echo "✅ Found existing build at $ATROPOS_DIR/target/release/$BINARY_NAME"
    
    # Cache it
    mkdir -p "$CACHE_DIR"
    cp "$ATROPOS_DIR/target/release/$BINARY_NAME" "$CACHE_DIR/$BINARY_NAME"
    chmod +x "$CACHE_DIR/$BINARY_NAME"
    
    # Copy to dist/bin
    mkdir -p dist/bin
    cp "$CACHE_DIR/$BINARY_NAME" dist/bin/$BINARY_NAME
    chmod +x dist/bin/$BINARY_NAME
    
    echo "✅ Binary cached and ready!"
    echo "   Future builds will reuse this binary"
    exit 0
fi

# Need to build from source
echo "🔨 No cached binary found. Building from source..."
echo "   This will take 2-3 minutes but only happens once."

# Check for Rust/cargo
if ! command -v cargo &> /dev/null; then
    echo "❌ cargo not found. Install Rust from: https://rustup.rs"
    echo "   Or download pre-built binary from: https://github.com/blacklanternsecurity/atropos/releases"
    exit 1
fi

# Check if source exists
if [ ! -f "$ATROPOS_DIR/Cargo.toml" ]; then
    echo "❌ Atropos source not found at $ATROPOS_DIR"
    echo "   Run: git submodule update --init --recursive"
    exit 1
fi

# Build
cd "$ATROPOS_DIR"
echo "⏳ Building... (grab coffee, this takes a few minutes)"
cargo build --release

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

cd ../..

# Cache the built binary
mkdir -p "$CACHE_DIR"
cp "$ATROPOS_DIR/target/release/$BINARY_NAME" "$CACHE_DIR/$BINARY_NAME"
chmod +x "$CACHE_DIR/$BINARY_NAME"

# Copy to dist/bin
mkdir -p dist/bin
cp "$CACHE_DIR/$BINARY_NAME" dist/bin/$BINARY_NAME
chmod +x dist/bin/$BINARY_NAME

# Create metadata
cat > "$CACHE_DIR/build-info.json" << EOF
{
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "rustcVersion": "$(rustc --version)",
  "cargoVersion": "$(cargo --version)",
  "binaryPath": "$CACHE_DIR/$BINARY_NAME",
  "binarySize": "$(wc -c < "$CACHE_DIR/$BINARY_NAME")"
}
EOF

echo ""
echo "✅ Atropos built and cached successfully!"
echo "   Cached at: $CACHE_DIR/$BINARY_NAME"
echo "   Ready at: dist/bin/$BINARY_NAME"
echo ""
echo "💡 Future builds will reuse this binary automatically"
echo "   To rebuild: rm -rf $CACHE_DIR && run this script again"
