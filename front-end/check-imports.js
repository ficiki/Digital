const fs = require('fs');
const path = require('path');

function checkImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      checkImports(fullPath);
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('from "../../hooks/useAuth"') || 
          content.includes("from '../../hooks/useAuth'") ||
          content.includes('from "../../hooks/useAuth.js"')) {
        console.log(`❌ Found in: ${fullPath}`);
        
        // Show the import line
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('useAuth')) {
            console.log(`   Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });
}

console.log('🔍 Checking for useAuth imports from wrong path...');
checkImports('./src');