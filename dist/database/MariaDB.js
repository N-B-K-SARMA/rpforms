"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MariaDB = void 0;
const pool_1 = require("./pool");
class MariaDB {
    async connect() { }
    async query(sql, params) {
        const pool = (0, pool_1.getPool)();
        return await pool.query(sql, params);
    }
}
exports.MariaDB = MariaDB;
n;
