const fs = require('fs');

function replaceConfig(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('import config from ')) {
        if (!content.includes('import { RPForms }')) {
            content = "import { RPForms } from '../core/RPForms';\n" + content;
        }
        content = content.replace(/import config from '.*config\/config';?\n?/g, '');
        content = content.replace(/config\./g, 'RPForms.config.getAll().');
        fs.writeFileSync(filePath, content);
    }
}

replaceConfig('src/commands/allowlist-panel.ts');
replaceConfig('src/commands/application.ts');
replaceConfig('src/services/ApplicationService.ts');
replaceConfig('src/services/StaffReviewService.ts');
