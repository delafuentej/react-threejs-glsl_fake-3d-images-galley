import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = path.join("public", "images", "jpg");
const outputDir = path.join("public", "images", "fake3d");

// Crear carpeta destino si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertImages() {
  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    if (path.extname(file).toLowerCase() === ".jpg") {
      const baseName = path.basename(file, ".jpg");
      const outputName = `${baseName}_fake3d.webp`;
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, outputName);

      try {
        await sharp(inputPath).webp({ quality: 90 }).toFile(outputPath);

        console.log(`✔ Convertida: ${file} → ${outputName}`);
      } catch (err) {
        console.error(`❌ Error al convertir ${file}:`, err);
      }
    }
  }
}

convertImages();
