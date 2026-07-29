"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ApplicationEvents_1 = require("./framework/ApplicationEvents");
const RPForms_1 = require("../core/RPForms");
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    execute(client) {
        (0, ApplicationEvents_1.registerApplicationEvents)(client);
        // Check for application timeouts every minute
        setInterval(() => {
            RPForms_1.RPForms.applications.handleTimeouts().catch(console.error);
        }, 60 * 1000);
        console.log(`✓ Bot Ready! Logged in as ${client.user.tag}`);
    },
};
