#!/bin/bash
BINARY_PATH="dist/bin/atropos"
SOURCE_PATH="tools/atropos"

if [ -f "$BINARY_PATH" ]; then
  echo "[atropos] Binary found at $BINARY_PATH"
  exit 0
fi

echo "[atropos] Binary not found, building..."
mkdir -p dist/bin

if [ -d "$SOURCE_PATH" ]; then
  cd "$SOURCE_PATH"
  cargo build --release
  if [ -f "target/release/atropos" ]; then
    cp target/release/atropos "../../$BINARY_PATH"
    echo "[atropos] Binary built and copied to $BINARY_PATH"
  else
    echo "[atropos] Build failed - binary not found"
    exit 1
  fi
else
  echo "[atropos] Source not found at $SOURCE_PATH"
  exit 1
fi
