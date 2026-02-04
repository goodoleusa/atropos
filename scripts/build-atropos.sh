#!/bin/bash
set -e

TIMEOUT_SECONDS=${1:-300}
ATROPOS_DIR="tools/atropos"
OUTPUT_DIR="dist/bin"

echo "Building Atropos scanner with ${TIMEOUT_SECONDS}s timeout..."

if [ ! -d "$ATROPOS_DIR" ]; then
  echo "Error: Atropos directory not found at $ATROPOS_DIR"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

if [ -f "$OUTPUT_DIR/atropos" ]; then
  echo "Atropos binary already exists. Use 'force' flag to rebuild."
  if [ "$2" != "force" ]; then
    echo "Skipping build. Binary location: $OUTPUT_DIR/atropos"
    exit 0
  fi
  echo "Force rebuild requested..."
fi

cd "$ATROPOS_DIR"

if ! command -v cargo &> /dev/null; then
  echo "Error: Rust/Cargo not installed. Install from https://rustup.rs/"
  exit 1
fi

echo "Starting cargo build (timeout: ${TIMEOUT_SECONDS}s)..."

timeout "${TIMEOUT_SECONDS}" cargo build --release 2>&1 || {
  EXIT_CODE=$?
  if [ $EXIT_CODE -eq 124 ]; then
    echo "Error: Build timed out after ${TIMEOUT_SECONDS} seconds"
    echo "Try increasing timeout or check for issues with: cargo build --release"
  else
    echo "Error: Build failed with exit code $EXIT_CODE"
  fi
  exit $EXIT_CODE
}

cd - > /dev/null

if [ -f "$ATROPOS_DIR/target/release/atropos" ]; then
  cp "$ATROPOS_DIR/target/release/atropos" "$OUTPUT_DIR/atropos"
  chmod +x "$OUTPUT_DIR/atropos"
  echo "Build successful! Binary: $OUTPUT_DIR/atropos"
  "$OUTPUT_DIR/atropos" --version
else
  echo "Error: Build completed but binary not found"
  exit 1
fi
