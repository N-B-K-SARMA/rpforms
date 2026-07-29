"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ApplicationEvents_1 = require("./framework/ApplicationEvents");
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    execute(client) {
        (0, ApplicationEvents_1.registerApplicationEvents)(client);
        console.log(`✓ Bot Ready! Logged in as ${client.user.tag}`);
    },
};
