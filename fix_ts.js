const fs = require("fs");

function replaceInFile(file, search, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(search).join(replacement);
  fs.writeFileSync(file, content);
}

function regexReplaceInFile(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

// pool.ts export issue
regexReplaceInFile('./src/database/pool.ts', /export default \{\s*getPool,\s*initPool\s*\};?/g, "export { getPool, initPool };");
regexReplaceInFile('./src/database/pool.ts', /export default \{\s*initPool,\s*getPool\s*\};?/g, "export { initPool, getPool };");
// Just in case it's something else:
regexReplaceInFile('./src/database/pool.ts', /export default getPool;/g, "export { getPool };");
let poolContent = fs.readFileSync('./src/database/pool.ts', 'utf8');
if (!poolContent.includes('export {') && poolContent.includes('export default')) {
   poolContent = poolContent.replace(/export default (\{.*?\});?/s, (match, p1) => {
       return `export ${p1};`.replace(/\{/g, '{ ').replace(/\}/g, ' }'); 
       // this might be dangerous if not matching perfectly, let's just do a hacky generic one:
   });
}
// Actually, let's just append exports if they don't exist:
if (poolContent.includes('module.exports')) {
    regexReplaceInFile('./src/database/pool.ts', /module\.exports\s*=\s*\{(.*?)\}/s, "export { $1 }");
}
// Fix QuestionService class properties
regexReplaceInFile('./src/services/QuestionService.ts', /class QuestionService \{/, "class QuestionService {\n  questions: any;\n  filePath: any;\n");

// Fix ColorResolvable
let filesWithColor = [
  './src/commands/allowlist-panel.ts',
  './src/commands/application.ts',
  './src/services/ApplicationService.ts',
  './src/services/StaffReviewService.ts'
];
filesWithColor.forEach(f => {
  regexReplaceInFile(f, /color: (.*?),/g, "color: $1 as any,");
  regexReplaceInFile(f, /\.setColor\((.*?)\)/g, ".setColor($1 as any)");
});

// Fix ActionRowBuilder<AnyComponentBuilder>
let filesWithActionRow = [
  './src/services/ApplicationService.ts',
  './src/services/StaffReviewService.ts'
];
filesWithActionRow.forEach(f => {
  regexReplaceInFile(f, /new ActionRowBuilder\(\)/g, "new ActionRowBuilder<any>()");
});

// Fix applicationCategory error
regexReplaceInFile('./src/services/StaffReviewService.ts', /config\.channels\.applicationCategory/g, "(config.channels as any).applicationCategory");

// Fix init.ts pool import
regexReplaceInFile('./src/database/init.ts', /import \{\s*initPool\s*\} from '\.\/pool';/g, "import { initPool } from './pool';"); // already correct? Wait, error was "import declaration can only be used at top level"
// Ah, it might have been inside a function!
let initContent = fs.readFileSync('./src/database/init.ts', 'utf8');
initContent = initContent.replace(/async function initDatabase\(\) \{\n\s*import \{ initPool \} from '\.\/pool';/g, "import { initPool } from './pool';\nasync function initDatabase() {");
fs.writeFileSync('./src/database/init.ts', initContent);

console.log("Fixes applied");
