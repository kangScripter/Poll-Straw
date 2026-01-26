import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, '..', 'src', 'public');
const destDir = join(__dirname, '..', 'dist', 'public');

try {
  // Check if source directory exists
  if (!existsSync(srcDir)) {
    console.warn('⚠️ Source public directory does not exist:', srcDir);
    console.log('Creating empty public directory...');
    mkdirSync(destDir, { recursive: true });
    process.exit(0);
  }

  // Create destination directory if it doesn't exist
  mkdirSync(destDir, { recursive: true });

  // Copy all files from src/public to dist/public
  const files = readdirSync(srcDir);
  
  if (files.length === 0) {
    console.warn('⚠️ No files found in public directory');
    process.exit(0);
  }

  files.forEach((file) => {
    const srcPath = join(srcDir, file);
    const destPath = join(destDir, file);
    
    if (statSync(srcPath).isFile()) {
      copyFileSync(srcPath, destPath);
      console.log(`✅ Copied: ${file}`);
    }
  });

  console.log('✅ Public files copied successfully');
} catch (error: any) {
  console.error('❌ Error copying public files:', error.message);
  // Don't exit with error - allow build to continue
  // The app will handle missing files gracefully
  console.log('⚠️ Continuing build without public files...');
}
