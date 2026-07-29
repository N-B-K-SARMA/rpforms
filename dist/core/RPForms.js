"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPForms = exports.RPFormsClient = void 0;
const EventManager_1 = require("./EventManager");
const ConfigManager_1 = require("./ConfigManager");
const FormManager_1 = require("./FormManager");
const ApplicationManager_1 = require("./ApplicationManager");
const ReviewManager_1 = require("./ReviewManager");
const MariaDB_1 = require("../database/MariaDB");
class RPFormsClient {
    database = new MariaDB_1.MariaDB();
    events = new EventManager_1.EventManager();
    config = new ConfigManager_1.ConfigManager();
    forms = new FormManager_1.FormManager();
    applications = new ApplicationManager_1.ApplicationManager();
    reviews = new ReviewManager_1.ReviewManager();
    init() {
        this.forms.loadForms();
    }
}
exports.RPFormsClient = RPFormsClient;
exports.RPForms = new RPFormsClient();
