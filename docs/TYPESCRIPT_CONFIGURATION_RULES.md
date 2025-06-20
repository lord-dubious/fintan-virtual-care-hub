# TypeScript Configuration Rules - Dr. Fintan Virtual Care Hub

## 🚨 **CRITICAL: NEVER MODIFY THESE WORKING CONFIGURATIONS**

### **✅ WORKING tsconfig.json (DO NOT CHANGE)**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,                    // ← CRITICAL: Must be false
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,  // ← REQUIRED: For .tsx extensions
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",                  // ← CRITICAL: Enables React without imports
    "paths": {
      "@/*": ["./src/*"]                 // ← CRITICAL: Path mapping
    }
  },
  "include": ["src"]                     // ← CRITICAL: Only include src
}
```

### **✅ WORKING vite.config.ts (DO NOT CHANGE)**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.VITE_PORT || process.env.PORT || '10000', 10),
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

## 🔧 **TYPESCRIPT RULES THAT BROKE THE UI**

### **❌ FORBIDDEN CONFIGURATIONS**
```json
// NEVER ADD THESE TO tsconfig.json:
{
  "baseUrl": ".",                        // ← BREAKS: Conflicts with paths
  "exclude": ["node_modules", "dist"],   // ← BREAKS: Unnecessary exclusions
  "allowJs": true                        // ← BREAKS: Should be false
}
```

### **✅ REQUIRED IMPORT PATTERNS**
```typescript
// ALWAYS USE .tsx EXTENSIONS IN IMPORTS (REQUIRED):
import App from './App.tsx'              // ✅ REQUIRED
import Component from './Component.tsx'  // ✅ REQUIRED

// NEVER USE WITHOUT EXTENSIONS:
import App from './App'                  // ❌ BREAKS
import Component from './Component'      // ❌ BREAKS
```

### **❌ FORBIDDEN REACT IMPORTS**
```typescript
// NEVER IMPORT React WITH jsx: "react-jsx":
import React from 'react'                // ❌ UNNECESSARY
import React, { useState } from 'react'  // ❌ UNNECESSARY

// ALWAYS IMPORT ONLY WHAT YOU NEED:
import { useState } from 'react'         // ✅ CORRECT
import { useEffect } from 'react'        // ✅ CORRECT
```

## 📋 **STRICT TYPESCRIPT GUIDELINES**

### **Rule 1: Import Statements**
```typescript
// ✅ CORRECT PATTERNS:
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import Component from './Component.tsx'  // .tsx extension REQUIRED
import utils from '../utils.ts'         // .ts extension REQUIRED

// ❌ FORBIDDEN PATTERNS:
import React from 'react'               // Unnecessary with jsx: "react-jsx"
import Component from './Component'     // Extensions REQUIRED
import utils from '../utils'           // Extensions REQUIRED
```

### **Rule 2: Component Declarations**
```typescript
// ✅ CORRECT COMPONENT STRUCTURE:
import { useState } from 'react';

const MyComponent = () => {
  const [state, setState] = useState(false);
  
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

export default MyComponent;

// ❌ FORBIDDEN PATTERNS:
import React from 'react';              // Don't import React
const MyComponent: React.FC = () => {}  // Don't use React.FC
```

### **Rule 3: Path Aliases**
```typescript
// ✅ CORRECT PATH USAGE:
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

// ❌ FORBIDDEN PATTERNS:
import { Button } from '../../components/ui/button'  // Use @ alias
import { useAuth } from '../../../hooks/useAuth'     // Use @ alias
```

### **Rule 4: Type Definitions**
```typescript
// ✅ CORRECT TYPE PATTERNS:
interface Props {
  title: string;
  onClick: () => void;
}

type Status = 'pending' | 'completed' | 'failed';

// ❌ FORBIDDEN PATTERNS:
import { FC } from 'react';
const Component: FC<Props> = () => {}   // Don't use FC type
```

## 🚨 **CONFIGURATION VALIDATION CHECKLIST**

### **Before Making Any Changes:**
- [ ] Verify current UI is working at http://localhost:10000
- [ ] Check no TypeScript errors in terminal
- [ ] Confirm all pages load correctly
- [ ] Test navigation between pages

### **After Any Configuration Change:**
- [ ] Run `npm run dev` and check for errors
- [ ] Verify all pages still load
- [ ] Check browser console for errors
- [ ] Test hot reload functionality

### **If TypeScript Errors Appear:**
1. **STOP** - Do not modify more files
2. **REVERT** - Undo the last configuration change
3. **CHECK** - Verify the working configuration is restored
4. **TEST** - Confirm UI is working again

## 🔧 **TROUBLESHOOTING GUIDE**

### **Error: "Cannot use .tsx extension"**
```bash
# SOLUTION: Remove .tsx from imports
# Change: import App from './App.tsx'
# To:     import App from './App'
```

### **Error: "React is not defined"**
```bash
# SOLUTION: Remove React import, use jsx: "react-jsx"
# Change: import React, { useState } from 'react'
# To:     import { useState } from 'react'
```

### **Error: "Module not found @/..."**
```bash
# SOLUTION: Verify paths in tsconfig.json
# Ensure: "paths": { "@/*": ["./src/*"] }
```

### **Error: "allowImportingTsExtensions"**
```bash
# SOLUTION: Remove this option from tsconfig.json
# It's not needed and causes conflicts
```

## 📋 **ENVIRONMENT-SPECIFIC RULES**

### **Development Environment**
- Port: 10000 (configured in vite.config.ts)
- Hot reload: Enabled
- Source maps: Enabled
- Type checking: Strict mode

### **Build Environment**
- Target: ESNext
- Module: ESNext
- Output: dist/ directory
- Tree shaking: Enabled

### **IDE Configuration**
- TypeScript version: Use workspace version
- Auto-import: Prefer relative paths with @ alias
- Format on save: Enabled
- Lint on save: Enabled

## 🎯 **VALIDATION COMMANDS**

### **Check TypeScript Configuration**
```bash
# Verify TypeScript compilation
npx tsc --noEmit

# Check for type errors
npm run type-check

# Validate configuration
npx tsc --showConfig
```

### **Test Build Process**
```bash
# Test production build
npm run build

# Preview production build
npm run preview
```

## 🚨 **EMERGENCY RECOVERY**

### **If Configuration Breaks:**
1. **Restore Working tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

2. **Restart Development Server:**
```bash
npm run dev
```

3. **Verify UI Works:**
- Check http://localhost:10000
- Test all page navigation
- Verify no console errors

## 📞 **QUICK REFERENCE**

### **Working Configuration Hash:**
- tsconfig.json: 24 lines, jsx: "react-jsx", allowJs: false
- vite.config.ts: 23 lines, port 10000, @ alias configured
- No .tsx extensions in imports
- No React imports in components
- All pages working at localhost:10000

### **Emergency Contact:**
If TypeScript configuration breaks the UI, immediately revert to the working configuration above and restart the development server.
