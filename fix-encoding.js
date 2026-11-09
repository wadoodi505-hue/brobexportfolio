import fs from 'fs';
import path from 'path';

const targetExtensions = ['.html', '.js', '.jsx', '.ts', '.tsx', '.css', '.md', '.json'];

// Uses explicit Unicode escape sequences to prevent terminal encoding corruption
const replacements = [
    { bad: /\u00E2\u0080\u00A6|\u00C3\u00A2\u00E2\u20AC\u2122\u00C2\u00A6/g, good: '…' }, // Ellipsis
    { bad: /\u00E2\u0080\u0099|\u00C3\u00A2\u00E2\u20AC\u2122\u00C2\u0099/g, good: '’' }, // Right single quote / apostrophe
    { bad: /\u00E2\u0080\u009C|\u00C3\u00A2\u00E2\u20AC\u2122\u00C2\u009C/g, good: '“' }, // Left double quote
    { bad: /\u00E2\u0080\u009D|\u00C3\u00A2\u00E2\u20AC\u2122\u00C2\u009D/g, good: '”' }, // Right double quote
    { bad: /\u00E2\u0080\u0093|\u00C3\u00A2\u00E2\u20AC\u2122\u00C2\u0093/g, good: '–' }, // En dash
    { bad: /\u00E2\u0080\u0094|\u00C3\u00A2\u00E2\u20AC\u2122\u00C2\u0094/g, good: '—' }, // Em dash
    { bad: /\u00C2\u00B0/g, good: '°' }                                                // Degree symbol
];

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', '.next', 'dist', 'original-backup'].includes(file)) {
                walkDir(fullPath, callback);
            }
        } else if (targetExtensions.includes(path.extname(fullPath))) {
            callback(fullPath);
        }
    });
}

walkDir('.', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const { bad, good } of replacements) {
        if (bad.test(content)) {
            console.log(`Fixed bad encoding in: ${filePath}`);
            content = content.replace(bad, good);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Finished checking and repairing files.');