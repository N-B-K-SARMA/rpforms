"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
class ApplicationModel {
    static async createApplication(discordId) {
        return await RPForms_1.RPForms.database.insertApplication({ discordId });
    }
    static async getApplicationById(id) {
        return await RPForms_1.RPForms.database.getApplicationById(id);
    }
    static async getActiveApplication(discordId) {
        return await RPForms_1.RPForms.database.getActiveApplication(discordId);
    }
    static async updateStatus(id, status, staffChannelId = null) {
        await RPForms_1.RPForms.database.updateApplicationStatus(id, status, staffChannelId);
    }
}
exports.default = ApplicationModel;
