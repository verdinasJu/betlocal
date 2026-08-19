/**
 * Genera los PNG de la PWA a partir de public/icons/icon.svg.
 * Ejecutar tras cambiar el SVG:  node scripts/generate-icons.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const svg = await readFile(resolve(root, "public/icons/icon.svg"));

const targets = [
  { path: "public/icons/icon-192.png", size: 192 },
  { path: "public/icons/icon-512.png", size: 512 },
  { path: "public/icons/apple-touch-icon.png", size: 180 },
  { path: "src/app/icon.png", size: 512 },
  { path: "src/app/apple-icon.png", size: 180 },
];

for (const { path, size } of targets) {
  const out = resolve(root, path);
  await mkdir(dirname(out), { recursive: true });
  const png = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "cover" })
    .png()
    .toBuffer();
  await writeFile(out, png);
  console.log(`${path}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} kB`);
}
