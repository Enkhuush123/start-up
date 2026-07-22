const fs = require('fs');
const path = require('path');

const replacements = {
    'bg-neutral-950': 'bg-neutral-50 dark:bg-neutral-950',
    'bg-neutral-900': 'bg-white dark:bg-neutral-900',
    'bg-neutral-800': 'bg-neutral-100 dark:bg-neutral-800',
    'text-white': 'text-neutral-900 dark:text-white',
    'text-neutral-400': 'text-neutral-500 dark:text-neutral-400',
    'text-neutral-300': 'text-neutral-600 dark:text-neutral-300',
    'border-neutral-800': 'border-neutral-200 dark:border-neutral-800',
    'border-white/10': 'border-black/10 dark:border-white/10',
    'border-white/20': 'border-black/20 dark:border-white/20',
    'bg-black/40': 'bg-white/40 dark:bg-black/40',
    'bg-black/50': 'bg-white/50 dark:bg-black/50',
    'bg-white/5': 'bg-black/5 dark:bg-white/5',
    'bg-white/10': 'bg-black/10 dark:bg-white/10',
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace with word boundaries to avoid partial matches
    Object.entries(replacements).forEach(([from, to]) => {
        // We only want to replace if it's not already prefixed with `dark:` or followed by something
        // Wait, the regex should just match the exact class surrounded by space/quotes
        const regex = new RegExp(`(?<!dark:)(?<![\\w\\-])(${from.replace(/\//g, '\\/')})(?![\\w\\-])`, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, to);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            walk(file);
        } else {
            if (file.endsWith('.tsx') && !file.includes('node_modules')) {
                processFile(file);
            }
        }
    });
}

walk('./app');
walk('./components');
