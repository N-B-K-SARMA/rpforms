const fs = require('fs');
function regexReplace(file, regex, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replace);
  fs.writeFileSync(file, content);
}

const f1 = './src/commands/application.ts';
regexReplace(f1, /questions\.map/g, "(questions as any[]).map");
regexReplace(f1, /questions\.filter/g, "(questions as any[]).filter");

const f3 = './src/services/ApplicationService.ts';
regexReplace(f3, /answers\.find/g, "(answers as any[]).find");

const f4 = './src/services/StaffReviewService.ts';
regexReplace(f4, /answers\.find/g, "(answers as any[]).find");

console.log('Fixed array methods');
