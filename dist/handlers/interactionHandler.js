"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.default = (client) => {
    const interactionsPath = path_1.default.join(__dirname, '..', 'interactions');
    const interactionFiles = fs_1.default.readdirSync(interactionsPath).filter((file) => file.endsWith('.js'));
    for (const file of interactionFiles) {
        const req = require(path_1.default.join(interactionsPath, file));
        const interaction = req.default || req;
        client.interactions.set(interaction.id, interaction);
    }
};
