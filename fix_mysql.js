const fs = require('fs');

function regexReplace(file, regex, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replace);
  fs.writeFileSync(file, content);
}

const f1 = './src/commands/application.ts';
regexReplace(f1, /const \[rows\]/g, "const [rows]: any");
regexReplace(f1, /const \[existingApp\]/g, "const [existingApp]: any");
regexReplace(f1, /const \[questions\]/g, "const [questions]: any");

const f2 = './src/models/Application.ts';
regexReplace(f2, /const \[result\]/g, "const [result]: any");

const f3 = './src/services/ApplicationService.ts';
regexReplace(f3, /const \[answers\]/g, "const [answers]: any");

const f4 = './src/services/StaffReviewService.ts';
regexReplace(f4, /const \[answers\]/g, "const [answers]: any");

console.log('Fixed mysql type errors');
