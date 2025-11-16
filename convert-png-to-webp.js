import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Para obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "public/images/png");
const outputDir = path.join(__dirname, "public/images/depth");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(inputDir, async (err, files) => {
  if (err) {
    console.error("Error leyendo el directorio:", err);
    return;
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".png") continue; // solo procesar PNG

    const baseName = path.basename(file, ext);
    let outputFile = path.join(outputDir, `${baseName}.webp`);

    // Manejar conflictos de nombres agregando *
    while (fs.existsSync(outputFile)) {
      outputFile = path.join(outputDir, `${baseName}*.webp`);
    }

    try {
      await sharp(path.join(inputDir, file)).webp().toFile(outputFile);
      console.log(`Convertido: ${file} → ${path.basename(outputFile)}`);
    } catch (error) {
      console.error(`Error convirtiendo ${file}:`, error);
    }
  }
});
