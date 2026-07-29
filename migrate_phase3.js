const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getFiles(fullPath));
        } else if (entry.name.endsWith('.ts')) {
            files.push(fullPath);
        }
    }
    return files;
}

const allFiles = getFiles(srcDir);

// Phase 3 Migration Script

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Database Replacement
    if (content.includes("pool.query")) {
        // Need to import RPForms
        if (!content.includes("RPForms") && !file.includes("MariaDB.ts") && !file.includes("RPForms.ts")) {
            content = "import { RPForms } from '../core/RPForms';\n" + content;
        }
        content = content.replace(/const pool = getPool\(\);\n?/g, "");
        content = content.replace(/pool\.query/g, "RPForms.database.query");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated database logic in ${file}`);
    }
}

// MariaDB.ts implementation
const mariaDbPath = path.join(srcDir, 'database', 'MariaDB.ts');
fs.writeFileSync(mariaDbPath, `
import { IDatabase } from './Database';
import { getPool } from './pool';
export class MariaDB implements IDatabase {
    async connect() {}
    async query(sql: string, params?: any[]): Promise<any> {
        const pool = getPool();
        return await pool.query(sql, params);
    }
}
`.trim() + '\n');

// RPForms.ts
const rpformsPath = path.join(srcDir, 'core', 'RPForms.ts');
let rpfContent = fs.readFileSync(rpformsPath, 'utf8');
if (!rpfContent.includes("MariaDB")) {
    rpfContent = rpfContent.replace("export class RPFormsClient {", "import { MariaDB } from '../database/MariaDB';\nexport class RPFormsClient {\n    public database = new MariaDB();");
    fs.writeFileSync(rpformsPath, rpfContent);
}

// ApplicationService -> ApplicationManager
// We will simply wrap ApplicationService inside ApplicationManager for safety first.
const appMgrPath = path.join(srcDir, 'core', 'ApplicationManager.ts');
fs.writeFileSync(appMgrPath, `
import ApplicationService from '../services/ApplicationService';
export class ApplicationManager {
    async startApplication(interaction: any, formId: string) {
        // Safe delegation to existing logic while integrating FormManager
        return await ApplicationService.handleStart(interaction);
    }
    async handleModalSubmit(interaction: any) {
        return await ApplicationService.handleModalSubmit(interaction);
    }
}
`.trim() + '\n');

// ReviewManager
const revMgrPath = path.join(srcDir, 'core', 'ReviewManager.ts');
fs.writeFileSync(revMgrPath, `
import StaffReviewService from '../services/StaffReviewService';
export class ReviewManager {
    async processAction(interaction: any, action: string, appId: number) {
        return await StaffReviewService.handleAction(interaction, action, appId);
    }
    async handleModal(interaction: any) {
        return await StaffReviewService.handleModalSubmit(interaction);
    }
}
`.trim() + '\n');

// Update applyStart.ts
const applyStartPath = path.join(srcDir, 'interactions', 'applyStart.ts');
let applyContent = fs.readFileSync(applyStartPath, 'utf8');
applyContent = applyContent.replace(/ApplicationService\.handleStart\(interaction\);/, "RPForms.applications.startApplication(interaction, 'allowlist');");
if (!applyContent.includes("RPForms")) {
    applyContent = "import { RPForms } from '../core/RPForms';\n" + applyContent;
}
fs.writeFileSync(applyStartPath, applyContent);

console.log("Migration script step 1 completed.");
