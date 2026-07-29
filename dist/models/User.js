"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
class UserModel {
    static async ensureUser(discordId) {
        await RPForms_1.RPForms.database.ensureUser(discordId);
    }
    static async getUser(discordId) {
        return await RPForms_1.RPForms.database.getUser(discordId);
    }
    static async setCooldown(discordId, cooldownUntil) {
        await RPForms_1.RPForms.database.setUserCooldown(discordId, cooldownUntil);
    }
}
exports.default = UserModel;
