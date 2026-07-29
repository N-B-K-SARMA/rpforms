const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".ts")) results.push(file);
    }
  });
  return results;
}

const files = walk("./src");
files.push("index.ts");

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");

  content = content.replace(/const\s+\{\s*(.+?)\s*\}\s*=\s*require\((['"`])(.+?)\2\);?/g, "import { $1 } from '$3';");
  content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"`])(.+?)\2\);?/g, "import $1 from '$3';");
  content = content.replace(/require\((['"`])dotenv\1\)\.config\(\);?/g, "import dotenv from 'dotenv';\ndotenv.config();");
  content = content.replace(/module\.exports\s*=\s*/g, "export default ");
  
  // Implicit any bypass for client handlers.
  content = content.replace(/\(client\)\s*=>/g, "(client: any) =>");
  content = content.replace(/\(interaction\)\s*=>/g, "(interaction: any) =>");
  content = content.replace(/\(interaction, client\)\s*=>/g, "(interaction: any, client: any) =>");

  fs.writeFileSync(file, content);
});

console.log("Migration complete.");
