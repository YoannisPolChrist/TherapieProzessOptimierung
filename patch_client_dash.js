const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(app)/index.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The QuickActionCard wrappers look like this:
// <View className="w-full md:flex-1" style={{ display: 'flex' }}>
//     <MotiView
//         from={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ type: 'timing', duration: 300, delay: 100 }}
//     >

const targetPattern = /<View className="w-full md:flex-1" style={{ display: 'flex' }}>\s*<MotiView\s+from=\{\{ opacity: 0, scale: 0.95 \}\}\s+animate=\{\{ opacity: 1, scale: 1 \}\}\s+transition=\{\{ type: 'timing', duration: 300, delay: \d+ \}\}\s*>/g;

content = content.replace(
    targetPattern,
    (match) => {
        // Add style={{ flex: 1 }} right before the closing > of MotiView
        return match.replace(/>$/, ' style={{ flex: 1 }}>');
    }
);

// We need to also add align-items stretch to the parent container View
const rowPattern = /<View className="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap">/;
content = content.replace(rowPattern, '<View className="mb-6 flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-stretch">');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched index.tsx for flex card layouts successfully');
