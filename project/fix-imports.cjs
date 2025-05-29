const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/components/components/ui');

// Read all files in the directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter for .tsx files
  const tsxFiles = files.filter(file => file.endsWith('.tsx'));

  // Process each file
  tsxFiles.forEach(file => {
    const filePath = path.join(directoryPath, file);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      // Replace problematic import patterns
      let updatedContent = data;
      
      // Replace @/lib/utils import
      updatedContent = updatedContent.replace(
        /import\s+{\s*cn\s*}\s+from\s+["']@\/lib\/utils["']/g,
        `import { cn } from "../../../components/lib/utils"`
      );
      
      // Replace components/lib/utils import
      updatedContent = updatedContent.replace(
        /import\s+{\s*cn\s*}\s+from\s+["']components\/lib\/utils["']/g,
        `import { cn } from "../../../components/lib/utils"`
      );
      
      // Write the updated content back to the file
      fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${file}:`, err);
          return;
        }
        console.log(`Fixed imports in ${file}`);
      });
    });
  });
}); 