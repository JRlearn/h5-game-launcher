import { sys } from 'cc';
import { LogManager } from '../core/LogManager';

/**
 * StorageManager - 本地儲存管理器
 *
 * 封裝了 Cocos Creator 的 sys.localStorage，提供類型安全的資料持久化功能。
 * 支援自動 JSON 序列化與反序列化，並提供讀取時的預設值機制。
 */
export class StorageManager {
    /** StorageManager 單例 */
    private static _instance: StorageManager | null = null;
    /** 日誌標籤 */
    private readonly _TAG: string = 'Storage';

    private constructor() {
        // 私有構造函數，防止外部實例化
    }

    /**
     * 獲取 StorageManager 單例
     * @returns StorageManager 實例
     */
    public static getInstance(): StorageManager {
        if (!this._instance) {
            this._instance = new StorageManager();
        }
        return this._instance;
    }

    /**
     * 初始化管理器
     */
    public init(): void {
        LogManager.getInstance().info(this._TAG, 'StorageManager 初始化完成');
    }

    /**
     * 儲存字串資料
     * @param key 儲存鍵值
     * @param value 要儲存的字串
     */
    public setString(key: string, value: string): void {
        try {
            sys.localStorage.setItem(key, value);
        } catch (error) {
            LogManager.getInstance().error(this._TAG, `儲存字串失敗: ${key}`, error);
        }
    }

    /**
     * 獲取字串資料
     * @param key 儲存鍵值
     * @param defaultValue 若找不到對應資料時的預設值 (選填)
     * @returns 儲存的字串或預設值
     */
    public getString(key: string, defaultValue: string = ''): string {
        const value = sys.localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    }

    /**
     * 儲存物件資料 (自動進行 JSON 序列化)
     * @param key 儲存鍵值
     * @param obj 要儲存的物件或陣列
     */
    public setObject(key: string, obj: any): void {
        try {
            const jsonStr = JSON.stringify(obj);
            this.setString(key, jsonStr);
        } catch (error) {
            LogManager.getInstance().error(this._TAG, `物件序列化儲存失敗: ${key}`, error);
        }
    }

    /**
     * 獲取物件資料 (自動進行 JSON 反序列化)
     * @param key 儲存鍵值
     * @param defaultValue 若解析失敗或找不到資料時的預設值 (選填)
     * @returns 解析後的物件或預設值
     */
    public getObject<T>(key: string, defaultValue: T | null = null): T | null {
        const jsonStr = sys.localStorage.getItem(key);
        if (jsonStr === null) return defaultValue;

        try {
            return JSON.parse(jsonStr) as T;
        } catch (error) {
            LogManager.getInstance().warn(this._TAG, `解析 JSON 失敗: ${key}, 回傳預設值`);
            return defaultValue;
        }
    }

    /**
     * 儲存數值
     * @param key 儲存鍵值
     * @param value 要儲存的數字
     */
    public setNumber(key: string, value: number): void {
        this.setString(key, value.toString());
    }

    /**
     * 獲獲數值
     * @param key 儲存鍵值
     * @param defaultValue 預設值 (選填)
     * @returns 儲存的數值或預設值
     */
    public getNumber(key: string, defaultValue: number = 0): number {
        const value = sys.localStorage.getItem(key);
        if (value === null) return defaultValue;
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    }

    /**
     * 儲存布林值
     * @param key 儲存鍵值
     * @param value 要儲存的布林值
     */
    public setBool(key: string, value: boolean): void {
        this.setString(key, value ? '1' : '0');
    }

    /**
     * 獲取布林值
     * @param key 儲存鍵值
     * @param defaultValue 預設值 (選填)
     * @returns 儲存的布林值或預設值
     */
    public getBool(key: string, defaultValue: boolean = false): boolean {
        const value = sys.localStorage.getItem(key);
        if (value === null) return defaultValue;
        return value === '1';
    }

    /**
     * 移除特定資料
     * @param key 要移除的鍵值
     */
    public removeItem(key: string): void {
        sys.localStorage.removeItem(key);
    }

    /**
     * 清空所有本地儲存資料 (請謹慎使用)
     */
    public clear(): void {
        sys.localStorage.clear();
        LogManager.getInstance().warn(this._TAG, '本地儲存已清空');
    }
}
