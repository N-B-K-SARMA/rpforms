"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
const events_1 = require("events");
class EventManager extends events_1.EventEmitter {
    constructor() { super(); }
}
exports.EventManager = EventManager;
