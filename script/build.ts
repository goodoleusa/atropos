import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, copyFile } from "fs/promises";
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
  // DISABLED: Atropos is an optional Rust tool that requires cargo
  // Skip during deployment to prevent build hangs
  // To enable: set ENABLE_ATROPOS_BUILD=1 environment variable
  if (!process.env.ENABLE_ATROPOS_BUILD) {
    console.log("⚠ Atropos build skipped (optional Rust tool - set ENABLE_ATROPOS_BUILD=1 to enable)");
    return false;
  }
  
  try {
    // Check if cargo is available with timeout
    await Promise.race([
      execAsync("cargo --version"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("cargo check timeout")), 5000))
    ]);
    
    // Check if atropos source exists
    const atroposDir = path.join(process.cwd(), "tools", "atropos");
    try {
      await readFile(path.join(atroposDir, "Cargo.toml"));
    } catch {
      console.log("⚠ Atropos source not found at tools/atropos, skipping build");
      return false;
    }
    
    console.log("building atropos tool...");
    const targetDir = path.join(atroposDir, "target", "release", "atropos");
    const distBinDir = path.join(process.cwd(), "dist", "bin");
    
    // Build atropos with timeout (5 minutes max)
    await Promise.race([
      execAsync("cargo build --release", { cwd: atroposDir }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Atropos build timeout (5 min)")), 300000))
    ]);
    
    // Ensure dist/bin directory exists
    await mkdir(distBinDir, { recursive: true });
    
    // Copy binary to dist/bin
    const distBinary = path.join(distBinDir, "atropos");
    await copyFile(targetDir, distBinary);
    
    // Make binary executable
    await execAsync(`chmod +x "${distBinary}"`);
    
    console.log("✓ atropos binary built successfully");
    return true;
  } catch (error: any) {
    if (error.message?.includes("cargo: command not found") || error.code === "ENOENT") {
      console.log("⚠ cargo not found, skipping atropos build (install Rust to build)");
      return false;
    }
    if (error.message?.includes("timeout")) {
      console.log("⚠ Atropos build timed out, skipping");
      return false;
    }
    console.warn("⚠ Failed to build atropos:", error.message);
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
