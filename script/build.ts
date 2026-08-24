import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, copyFile, writeFile } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
const execAsync = promisify(exec);

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAtropos(): Promise<boolean> {
  try {
    const atroposDir = path.join(process.cwd(), "tools", "atropos");
    const distBinDir = path.join(process.cwd(), "dist", "bin");
    const distBinary = path.join(distBinDir, "atropos");
    const cachedBinary = path.join(atroposDir, "target", "release", "atropos");
    const cacheLockFile = path.join(atroposDir, ".build-cache");
    
    // Ensure dist/bin directory exists
    await mkdir(distBinDir, { recursive: true });
    
    // Strategy 1: Check if binary already exists in dist/bin (fastest)
    try {
      await readFile(distBinary);
      console.log("✓ Using cached atropos binary from dist/bin");
      return true;
    } catch {
      // Binary not in dist, continue to other strategies
    }
    
    // Strategy 2: Check if we have a cached build from previous compile
    try {
      const cachedStat = await readFile(cachedBinary);
      console.log("✓ Found cached atropos binary from previous build");
      await copyFile(cachedBinary, distBinary);
      await execAsync(`chmod +x "${distBinary}"`);
      console.log("✓ Cached atropos binary copied to dist/bin");
      return true;
    } catch {
      // No cached binary, need to build
    }
    
    // Strategy 3: Check environment variable to force skip
    if (process.env.SKIP_ATROPOS_BUILD === '1') {
      console.log("⚠ Atropos build skipped (SKIP_ATROPOS_BUILD=1)");
      return false;
    }
    
    // Strategy 4: Build from source (only if explicitly enabled or in development)
    const shouldBuild = process.env.ENABLE_ATROPOS_BUILD === '1' || process.env.NODE_ENV === 'development';
    
    if (!shouldBuild) {
      console.log("⚠ Atropos build disabled (set ENABLE_ATROPOS_BUILD=1 to build from source)");
      console.log("💡 Tip: Build once with 'ENABLE_ATROPOS_BUILD=1 npm run build' then the binary is cached");
      return false;
    }
    
    // Check if cargo is available
    try {
      await Promise.race([
        execAsync("cargo --version"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))
      ]);
    } catch {
      console.log("⚠ cargo not found - install Rust from https://rustup.rs");
      return false;
    }
    
    // Check if source exists
    try {
      await readFile(path.join(atroposDir, "Cargo.toml"));
    } catch {
      console.log("⚠ Atropos source not found at tools/atropos");
      return false;
    }
    
    console.log("🔨 Building atropos from source (this takes 2-3 minutes first time)...");
    console.log("   Subsequent builds will use the cached binary");
    
    // Build with progress indication
    const buildProcess = execAsync("cargo build --release", { cwd: atroposDir });
    
    // Show progress dots
    const progressInterval = setInterval(() => {
      process.stdout.write(".");
    }, 2000);
    
    try {
      await Promise.race([
        buildProcess,
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 300000))
      ]);
      clearInterval(progressInterval);
      console.log("\n✓ Atropos compiled successfully");
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
    
    // Copy to dist
    await copyFile(cachedBinary, distBinary);
    await execAsync(`chmod +x "${distBinary}"`);
    
    // Create cache marker with timestamp
    await writeFile(cacheLockFile, JSON.stringify({
      builtAt: new Date().toISOString(),
      version: "0.1.0",
      path: cachedBinary
    }));
    
    console.log("✓ Atropos binary cached for future builds");
    return true;
  } catch (error: any) {
    if (error.message?.includes("timeout")) {
      console.log("⚠ Atropos build timed out (5 min limit)");
    } else {
      console.warn("⚠ Failed to build atropos:", error.message);
    }
    return false;
  }
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
  
  // Build atropos (optional, only if cargo is available)
  await buildAtropos();
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
