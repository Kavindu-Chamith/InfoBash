import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

async function convertFile(filePath, destPath, options = {}) {
  try {
    const statBefore = fs.statSync(filePath);
    let pipeline = sharp(filePath);

    if (options.maxWidth) {
      pipeline = pipeline.resize({ width: options.maxWidth, withoutEnlargement: true });
    }

    await pipeline
      .webp({
        quality: options.quality || 82,
        lossless: options.lossless || false,
        effort: 6,
      })
      .toFile(destPath);

    const statAfter = fs.statSync(destPath);
    const reduction = (((statBefore.size - statAfter.size) / statBefore.size) * 100).toFixed(1);
    console.log(
      `Converted: ${path.relative(publicDir, filePath)} -> ${path.relative(publicDir, destPath)} ` +
      `(${(statBefore.size / 1024).toFixed(1)} KB -> ${(statAfter.size / 1024).toFixed(1)} KB, -${reduction}%)`
    );
  } catch (err) {
    console.error(`Failed to convert ${filePath}:`, err);
  }
}

async function processDirectory(dirPath, options = {}) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath, options);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png"].includes(ext) || entry.name.endsWith(".JPG.jpeg")) {
        // Output webp filename
        let baseName = entry.name;
        if (baseName.endsWith(".JPG.jpeg")) {
          baseName = baseName.replace(/\.JPG\.jpeg$/, "");
        } else {
          baseName = baseName.substring(0, baseName.lastIndexOf("."));
        }
        const destPath = path.join(dirPath, `${baseName}.webp`);
        await convertFile(fullPath, destPath, options);
      }
    }
  }
}

async function run() {
  console.log("--- Converting Gallery Images ---");
  await processDirectory(path.join(publicDir, "gallery"), { maxWidth: 1600, quality: 80 });

  console.log("\n--- Converting Images folder ---");
  await processDirectory(path.join(publicDir, "images"), { quality: 85 });

  console.log("\n--- Converting root public images ---");
  const cricketJpg = path.join(publicDir, "cricket.jpg");
  if (fs.existsSync(cricketJpg)) {
    await convertFile(cricketJpg, path.join(publicDir, "cricket.webp"), { quality: 82 });
  }

  console.log("\nImage conversion completed successfully!");
}

run();
