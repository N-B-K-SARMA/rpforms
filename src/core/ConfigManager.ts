import configData from '../config/config';

export class ConfigManager {
    private config: any = {};

    constructor() {
        this.load();
    }

    public load() {
        this.config = configData;
    }

    public get<T = any>(key: string): T {
        return this.config[key] as T;
    }

    public getAll(): any {
        return this.config;
    }
}