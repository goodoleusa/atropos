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
  try {
    // Check if cargo is available
    await execAsync("cargo --version");
    
    console.log("building atropos tool...");
    const lotusDir = path.join(process.cwd(), "tools", "lotus");
    const targetDir = path.join(lotusDir, "target", "release", "atropos");
    const distBinDir = path.join(process.cwd(), "dist", "bin");
    
    // Build atropos
    await execAsync("cargo build --release", { cwd: lotusDir });
    
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
