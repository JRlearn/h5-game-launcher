import { sys } from 'cc';

/**
 * StorageManager - 增強型本地儲存管理器
 */
export class StorageManager {
    /** UIManager 單例實例 */
    private static _instance: StorageManager | null = null;
    /** 日誌標籤 */
    private readonly _TAG = '[Storage]';

    /** 私有構造函數，防止外部實例化 */
    private constructor() {}

    /**
     * 獲取 StorageManager 單例
     * @returns StorageManager 實例
     */
    public static getInstance(): StorageManager {
        if (!this._instance) {
            this._instance = new StorageManager();
        }
        return this._instance!;
    }

    /** 
     * 初始化管理器 
     */
    public init(): void {
        this._info('StorageManager 初始化完成');
    }

    /**
     * 儲存字串資料
     * @param key 鍵名
     * @param value 字串值
     */
    public setString(key: string, value: string): void {
        try {
            sys.localStorage.setItem(key, value);
        } catch (err) {
            this._error(`setString fail: ${key}`, err);
        }
    }

    /**
     * 獲取字串資料
     * @param key 鍵名
     * @param defaultValue 預設值
     * @returns 獲取到的字串或預設值
     */
    public getString(key: string, defaultValue = ''): string {
        const value = sys.localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    }

    /**
     * 檢查本地儲存中是否存在指定鍵
     * @param key 鍵名
     * @returns 是否存在
     */
    public hasKey(key: string): boolean {
        return sys.localStorage.getItem(key) !== null;
    }

    /**
     * 儲存數值資料
     * @param key 鍵名
     * @param value 數值
     */
    public setNumber(key: string, value: number): void {
        this.setString(key, value.toString());
    }

    /**
     * 獲取數值資料
     * @param key 鍵名
     * @param defaultValue 預設值
     * @returns 獲取到的數值或預設值
     */
    public getNumber(key: string, defaultValue = 0): number {
        const value = sys.localStorage.getItem(key);
        if (!value) return defaultValue;
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    }

    /**
     * 儲存布林值資料
     * @param key 鍵名
     * @param value 布林值
     */
    public setBool(key: string, value: boolean): void {
        this.setString(key, value ? '1' : '0');
    }

    /**
     * 獲取布林值資料
     * @param key 鍵名
     * @param defaultValue 預設值
     * @returns 獲取到的布林值或預設值
     */
    public getBool(key: string, defaultValue = false): boolean {
        const value = sys.localStorage.getItem(key);
        if (value === null) return defaultValue;
        return value === '1';
    }

    /**
     * 儲存物件資料（會自動序列化為 JSON）
     * @template T 物件型別
     * @param key 鍵名
     * @param obj 物件
     */
    public setObject<T>(key: string, obj: T): void {
        try {
            this.setString(key, JSON.stringify(obj));
        } catch (err) {
            this._error(`setObject fail: ${key}`, err);
        }
    }

    /**
     * 獲取物件資料
     * @template T 物件型別
     * @param key 鍵名
     * @param defaultValue 預設值
     * @returns 獲取到的物件或預設值
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
     * 儲存 JSON 對象中特定路徑的值
     * @template T 值型別
     * @param key 本地儲存鍵名
     * @param path 物件路徑（如 'user.profile.name'）
     * @param value 要設定的值
     */
    public setObjectPath<T>(key: string, path: string, value: T): void {
        const obj = this.getObject<Record<string, unknown>>(key, {}) || {};
        const keys = path.split('.');
        let cur = obj as Record<string, any>;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!cur[keys[i]]) cur[keys[i]] = {};
            cur = cur[keys[i]];
        }
        cur[keys[keys.length - 1]] = value;
        this.setObject(key, obj);
    }

    /**
     * 獲取 JSON 對象中特定路徑的值
     * @template T 值型別
     * @param key 本地儲存鍵名
     * @param path 物件路徑
     * @param defaultValue 預設值
     * @returns 獲取到的值或預設值
     */
    public getObjectPath<T>(key: string, path: string, defaultValue: T | null = null): T | null {
        const obj = this.getObject<Record<string, unknown>>(key, {}) || {};
        const keys = path.split('.');
        let cur: any = obj;
        for (let k of keys) {
            if (cur[k] === undefined) return defaultValue;
            cur = cur[k];
        }
        return cur as T;
    }

    /**
     * 非同步儲存字串
     * @param key 鍵名
     * @param value 字串值
     */
    public async setStringAsync(key: string, value: string): Promise<void> {
        this.setString(key, value);
    }

    /**
     * 非同步獲取字串
     * @param key 鍵名
     * @param defaultValue 預設值
     * @returns 字串
     */
    public async getStringAsync(key: string, defaultValue = ''): Promise<string> {
        return this.getString(key, defaultValue);
    }

    /**
     * 非同步儲存物件
     * @template T 物件型別
     * @param key 鍵名
     * @param obj 物件
     */
    public async setObjectAsync<T>(key: string, obj: T): Promise<void> {
        this.setObject(key, obj);
    }

    /**
     * 非同步獲取物件
     * @template T 物件型別
     * @param key 鍵名
     * @param defaultValue 預設值
     * @returns 物件或 null
     */
    public async getObjectAsync<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
        return this.getObject(key, defaultValue);
    }

    /**
     * 清理特定模組相關的所有資料
     * @param moduleKey 模組前綴
     */
    public clearModule(moduleKey: string): void {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sys.localStorage.length; i++) {
            const key = sys.localStorage.key(i);
            if (key?.startsWith(moduleKey)) keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => sys.localStorage.removeItem(k));
        this._info(`已清理模組資料: ${moduleKey}`);
    }

    /** 
     * 清空本地儲存中所有資料 
     */
    public clearAll(): void {
        sys.localStorage.clear();
        this._warn('本地儲存已清空');
    }

    /**
     * 內部日誌輸出
     * @param msg 訊息內容
     * @param args 附加參數
     */
    private _info(msg: string, ...args: unknown[]): void {
        console.log(`${this._TAG} [INFO] ${msg}`, ...args);
    }

    /**
     * 內部警告輸出
     * @param msg 訊息內容
     * @param args 附加參數
     */
    private _warn(msg: string, ...args: unknown[]): void {
        console.warn(`${this._TAG} [WARN] ${msg}`, ...args);
    }

    /**
     * 內部錯誤輸出
     * @param msg 訊息內容
     * @param args 附加參數
     */
    private _error(msg: string, ...args: unknown[]): void {
        console.error(`${this._TAG} [ERROR] ${msg}`, ...args);
    }
}
