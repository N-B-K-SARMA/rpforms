import { EventManager } from './EventManager';
import { ConfigManager } from './ConfigManager';
import { FormManager } from './FormManager';
import { ApplicationManager } from './ApplicationManager';
import { ReviewManager } from './ReviewManager';
import { MariaDB } from '../database/MariaDB';
export class RPFormsClient {
    public database = new MariaDB();
    public events = new EventManager();
    public config = new ConfigManager();
    public forms = new FormManager();
    public applications = new ApplicationManager();
    public reviews = new ReviewManager();
    
    init() {
        this.forms.loadForms();
    }
}
export const RPForms = new RPFormsClient();