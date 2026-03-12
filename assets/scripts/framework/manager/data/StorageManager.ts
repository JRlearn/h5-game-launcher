import { sys } from 'cc';

/**
 * StorageManager - 增強型本地儲存管理器
 */
export class StorageManager {
    /** 單例 */
    private static _instance: StorageManager | null = null;
    /** tag */
    private readonly _TAG = '[Storage]';

    /** 私有構造 */
    private constructor() {}

    /** 獲取單例 */
    public static getInstance(): StorageManager {
        if (!this._instance) this._instance = new StorageManager();
        return this._instance;
    }

    /** 初始化管理器 */
    public init(): void {
        this._info('StorageManager 初始化完成');
    }

    /**
     * 儲存字串
     * @param key
     * @param value
     */
    public setString(key: string, value: string): void {
        try {
            sys.localStorage.setItem(key, value);
        } catch (err) {
            this._error(`setString fail: ${key}`, err);
        }
    }

    /**
     * 獲取字串
     * @param key
     * @param defaultValue
     */
    public getString(key: string, defaultValue = ''): string {
        const value = sys.localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    }

    /**
     * 檢查是否存在某鍵
     * @param key
     */
    public hasKey(key: string): boolean {
        return sys.localStorage.getItem(key) !== null;
    }

    /**
     * 儲存數值
     * @param key
     * @param value
     */
    public setNumber(key: string, value: number): void {
        this.setString(key, value.toString());
    }

    /**
     * 獲取數值
     * @param key
     * @param defaultValue
     */
    public getNumber(key: string, defaultValue = 0): number {
        const value = sys.localStorage.getItem(key);
        if (!value) return defaultValue;
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    }

    /**
     * 儲存布林值
     * @param key
     * @param value
     */
    public setBool(key: string, value: boolean): void {
        this.setString(key, value ? '1' : '0');
    }

    /**
     * 獲取布林值
     * @param key
     * @param defaultValue
     */
    public getBool(key: string, defaultValue = false): boolean {
        const value = sys.localStorage.getItem(key);
        if (value === null) return defaultValue;
        return value === '1';
    }

    /**
     * 儲存物件
     * @param key
     * @param obj
     */
    public setObject<T>(key: string, obj: T): void {
        try {
            this.setString(key, JSON.stringify(obj));
        } catch (err) {
            this._error(`setObject fail: ${key}`, err);
        }
    }

    /**
     * 獲取物件
     * @param key
     * @param defaultValue
     */
    public getObject<T>(key: string, defaultValue: T | null = null): T | null {
        const str = sys.localStorage.getItem(key);
        if (!str) return defaultValue;
        try {
            return JSON.parse(str) as T;
        } catch {
            this._warn(`JSON parse fail: ${key}`);
            return defaultValue;
        }
    }

    /**
     * 儲存 JSON 路徑值
     * @param key
     * @param path
     * @param value
     */
    public setObjectPath<T>(key: string, path: string, value: T): void {
        const obj = this.getObject<Record<string, any>>(key, {}) || {};
        const keys = path.split('.');
        let cur = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!cur[keys[i]]) cur[keys[i]] = {};
            cur = cur[keys[i]];
        }
        cur[keys[keys.length - 1]] = value;
        this.setObject(key, obj);
    }

    /**
     * 獲取 JSON 路徑值
     * @param key
     * @param path
     * @param defaultValue
     */
    public getObjectPath<T>(key: string, path: string, defaultValue: T | null = null): T | null {
        const obj = this.getObject<Record<string, any>>(key, {}) || {};
        const keys = path.split('.');
        let cur: any = obj;
        for (let k of keys) {
            if (cur[k] === undefined) return defaultValue;
            cur = cur[k];
        }
        return cur as T;
    }

    /**
     * 儲存字串
     * @param key
     * @param value
     */
    public async setStringAsync(key: string, value: string): Promise<void> {
        this.setString(key, value);
    }
    /**
     * 獲取字串
     * @param key
     * @param defaultValue
     */
    public async getStringAsync(key: string, defaultValue = ''): Promise<string> {
        return this.getString(key, defaultValue);
    }
    /**
     * 儲存物件
     * @param key
     * @param obj
     */
    public async setObjectAsync<T>(key: string, obj: T): Promise<void> {
        this.setObject(key, obj);
    }
    /**
     * 獲取物件
     * @param key
     * @param defaultValue
     */
    public async getObjectAsync<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
        return this.getObject(key, defaultValue);
    }

    /**
     * 清理模組資料
     * @param moduleKey
     */
    public clearModule(moduleKey: string) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sys.localStorage.length; i++) {
            const key = sys.localStorage.key(i);
            if (key?.startsWith(moduleKey)) keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => sys.localStorage.removeItem(k));
        this._info(`已清理模組資料: ${moduleKey}`);
    }

    /** 清空所有資料 */
    public clearAll() {
        sys.localStorage.clear();
        this._warn('本地儲存已清空');
    }

    /**
     * info
     * @param msg
     * @param args
     */
    private _info(msg: string, ...args: any[]) {
        console.log(`${this._TAG} [INFO] ${msg}`, ...args);
    }

    /**
     * warn
     * @param msg
     * @param args
     */
    private _warn(msg: string, ...args: any[]) {
        console.warn(`${this._TAG} [WARN] ${msg}`, ...args);
    }

    /**
     * error
     * @param msg
     * @param args
     */
    private _error(msg: string, ...args: any[]) {
        console.error(`${this._TAG} [ERROR] ${msg}`, ...args);
    }
}
