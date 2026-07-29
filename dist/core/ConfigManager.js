"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const config_1 = __importDefault(require("../config/config"));
class ConfigManager {
    config = {};
    constructor() {
        this.load();
    }
    load() {
        this.config = config_1.default;
    }
    get(key) {
        return this.config[key];
    }
    getAll() {
        return this.config;
    }
}
exports.ConfigManager = ConfigManager;
