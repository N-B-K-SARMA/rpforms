"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.default = (client) => {
    const eventsPath = path_1.default.join(__dirname, '..', 'events');
    const eventFiles = fs_1.default.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path_1.default.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
};
