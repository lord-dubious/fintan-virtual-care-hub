const fs = require('fs');
const path = require('path');

const iconMappings = {
  'CheckCircle': 'CheckCircle2',
  'XCircle': 'X',
  'AlertCircle': 'AlertTriangle',
  'Loader2': 'Loader',
  'WifiOff': 'Wifi',
  'RefreshCw': 'RotateCcw',
  'Print': 'Printer',
  'User': 'User2',
  'CalendarIcon': 'Calendar',
  'MicOff': 'MicOff',
  'Mic': 'Mic',
  'Pause': 'Pause',
  'Play': 'Play',
  'Trash2': 'Trash2',
  'Video': 'Video',
  'VideoOff': 'VideoOff',
  'ScreenShare': 'Share',
  'PhoneOff': 'PhoneOff',
  'Shield': 'Shield',
  'Bug': 'Bug',
  'Home': 'Home',
  'Database': 'Database',
  'Users': 'Users',
  'CreditCard': 'CreditCard',
  'Wallet': 'Wallet',
  'Download': 'Download',
  'FileText': 'FileText'
};

function fixIconsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Find all icon usage and fix imports
    for (const [oldIcon, newIcon] of Object.entries(iconMappings)) {
      if (content.includes(oldIcon) && !content.includes(`import.*${newIcon}`)) {
        // Add import if missing
        const importRegex = /import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/;
        const match = content.match(importRegex);
        
        if (match) {
          const imports = match[1].split(',').map(i => i.trim()).filter(i => i);
          if (!imports.includes(newIcon)) {
            imports.push(newIcon);
            const newImport = `import { ${imports.join(', ')} } from 'lucide-react'`;
            content = content.replace(importRegex, newImport);
            modified = true;
          }
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed icons in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Process all TypeScript files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixIconsInFile(filePath);
    }
  }
}

processDirectory('src');
