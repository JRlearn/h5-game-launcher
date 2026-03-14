import {
    assetManager,
    Asset,
    JsonAsset,
    Constructor,
    log,
    warn,
    error,
    AudioClip,
    AssetManager,
    Prefab, // Added Prefab import
} from 'cc';
import { LanguageType } from '../language/LanguageType';

/**
 * ResManager - 資源管理器
 * 負責管理 Asset Bundle 的載入、快取以及資源的異步加載。
 */
export class ResManager {
    private static _instance: ResManager | null = null;

    /**
     * 獲取單例實例
     */
    public static getInstance(): ResManager {
        if (!ResManager._instance) {
            ResManager._instance = new ResManager();
        }
        return ResManager._instance!;
    }

    private constructor() {}

    /** 內部快取：bundleName -> 資源名稱 -> Asset 物件 */
    private _bundleCache: Map<string, Map<string, Asset>> = new Map();
    /** Bundle 實例控制柄快取 */
    private _bundleHandles: Map<string, any> = new Map();

    /** ---------------------- 基本方法 ---------------------- */

    /**
     * 異步載入 Asset Bundle
     * @param bundleName Bundle 名稱或遠端 URL
     * @param onProgress 執行進度回標 (0 ~ 1)
     */
    public async loadBundleAsync(
        bundleName: string,
        onProgress?: (p: number) => void,
    ): Promise<AssetManager.Bundle | null> {
        if (this._bundleHandles.has(bundleName)) {
            onProgress?.(1);
            return this._bundleHandles.get(bundleName);
        }

        return new Promise((resolve, reject) => {
            assetManager.loadBundle(
                bundleName,
                (finished: number, total: number) => {
                    if (total > 0) onProgress?.(finished / total);
                },
                (err, bundle) => {
                    if (err) {
                        error(`[ResManager] Bundle 加載失敗：${bundleName}`, err);
                        reject(err);
                        return;
                    }
                    this._bundleHandles.set(bundleName, bundle);
                    if (!this._bundleCache.has(bundleName)) {
                        this._bundleCache.set(bundleName, new Map());
                    }
                    onProgress?.(1);
                    resolve(bundle);
                },
            );
        });
    }

    /**
     * 通用資源加載方法 (附載自動快取機制)
     * 支援單一或多路徑的陣列請求。
     * @param bundleName 資源所屬的 Bundle 名稱
     * @param path 資源在 Bundle 內的相對路徑 或 路徑陣列
     * @param type 資源的建構型別
     * @param onProgress 載入進度回標
     */
    public async load<T extends Asset>(
        bundleName: string,
        path: string,
        type: Constructor<T>,
        onProgress?: (p: number) => void,
    ): Promise<T | null>;
    public async load<T extends Asset>(
        bundleName: string,
        paths: string[],
        type: Constructor<T>,
        onProgress?: (p: number) => void,
    ): Promise<(T | null)[]>;
    public async load<T extends Asset>(
        bundleName: string,
        paths: string | string[],
        type: Constructor<T>,
        onProgress?: (p: number) => void,
    ): Promise<T | null | (T | null)[]> {
        if (Array.isArray(paths)) {
            // 多筆徑並行載入
            const promises = paths.map((p) => this.loadSingle<T>(bundleName, p, type));
            const results = await Promise.all(promises);
            onProgress?.(1);
            return results;
        } else {
            // 單一筆載入
            const result = await this.loadSingle<T>(bundleName, paths, type, onProgress);
            return result;
        }
    }

    /**
     * 內部單一資源加載
     */
    private async loadSingle<T extends Asset>(
        bundleName: string,
        path: string,
        type: Constructor<T>,
        onProgress?: (p: number) => void,
    ): Promise<T | null> {
        let bundleCache = this._bundleCache.get(bundleName);
        if (!bundleCache) {
            // 預防性處理：若未載入 Bundle 則嘗試初始化快取容器
            bundleCache = new Map<string, Asset>();
            this._bundleCache.set(bundleName, bundleCache);
        }

        // 優先從快取中獲取已加載資源
        if (bundleCache.has(path)) {
            onProgress?.(1);
            return bundleCache.get(path) as T;
        }

        // 獲取 Bundle 實例
        const bundle = this._bundleHandles.get(bundleName) ?? assetManager.getBundle(bundleName);
        if (!bundle) {
            error(`[ResManager] 指定的 Bundle 未加載，無法取得資源：${bundleName}`);
            return null;
        }

        return new Promise((resolve) => {
            bundle.load(
                path,
                type,
                (finished: number, total: number) => {
                    if (total > 0) onProgress?.(finished / total);
                },
                (err: Error | null, asset: T) => {
                    if (err) {
                        error(`[ResManager] 資源加載失敗：${bundleName} / ${path}`, err);
                        resolve(null);
                        return;
                    }
                    // 寫入快取
                    bundleCache!.set(path, asset);
                    onProgress?.(1);
                    resolve(asset);
                },
            );
        });
    }

    /**
     * 同步從快取或 Bundle 中獲取資源
     * @param bundleName 資源所屬的 Bundle 名稱
     * @param path 資源目錄徑
     * @returns 資源實體或 null
     */
    public getAsset<T extends Asset>(bundleName: string, path: string): T | null {
        let bundleCache = this._bundleCache.get(bundleName);
        if (bundleCache && bundleCache.has(path)) {
            return bundleCache.get(path) as T;
        }

        // 若快取中沒有，嘗試直接從 bundle 獲取（包含其它非本類加載的資源）
        const bundle = this._bundleHandles.get(bundleName) ?? assetManager.getBundle(bundleName);
        if (bundle) {
            const asset = bundle.get(path) as T;
            if (asset) {
                if (!bundleCache) {
                    bundleCache = new Map<string, Asset>();
                    this._bundleCache.set(bundleName, bundleCache);
                }
                bundleCache.set(path, asset);
                return asset;
            }
        }

        return null;
    }

    /**
     * 同步從 Bundle 中獲取 AudioClip
     * 專門提供給 SoundManager 使用的接口
     */
    public getAudioClipFromBundle(bundleName: string, path: string): AudioClip | null {
        return this.getAsset<AudioClip>(bundleName, path);
    }

    /**
     * 同步從 Bundle 中獲取 Prefab
     * @param bundleName 資源包名稱
     * @param path Prefab 路徑
     */
    public getPrefabFromBundle(bundleName: string, path: string): Prefab | null {
        return this.getAsset<Prefab>(bundleName, path);
    }

    /**
     * 獲取預設的資源包名稱
     */
    public getDefaultBundleName(): string {
        return 'common';
    }

    /**
     * 釋放指定的 Bundle 及其包含的所有資源
     * @param bundleName 要釋放的 Bundle 名稱
     */
    public releaseBundle(bundleName: string): void {
        const bundleCache = this._bundleCache.get(bundleName);
        if (!bundleCache) {
            warn(`[ResManager] Bundle 未加載，無需重複釋放：${bundleName}`);
            return;
        }

        // 釋放資源引用
        bundleCache.forEach((asset) => asset.decRef());
        this._bundleCache.delete(bundleName);

        const bundle = this._bundleHandles.get(bundleName) ?? assetManager.getBundle(bundleName);
        if (bundle) {
            bundle.releaseAll();
            assetManager.removeBundle(bundle);
            this._bundleHandles.delete(bundleName);
            log(`[ResManager] Bundle 已成功釋放：${bundleName}`);
        }
    }

    /**
     * 獲取當前已載入的所有 Bundle 名稱列表
     */
    public getLoadedBundles(): string[] {
        return Array.from(this._bundleHandles.keys());
    }

    /**
     * 異步批量加載多國語系 JSON 檔案
     * @param langs 語系代碼清單
     * @param i18nDir 語系定義檔案的路徑目錄
     * @param commonBundle 存放語系資源的核心 Bundle 名稱
     * @param onLoad 每個語系加載完成後的處理函式
     * @param onProgress 總體加載進度回標
     */
    public async loadLanguagesAsync(
        langs: LanguageType[],
        i18nDir: string,
        commonBundle: string,
        onLoad: (lang: LanguageType, json: any) => void,
        onProgress?: (p: number, lang: LanguageType) => void,
    ): Promise<void> {
        let loadedCount = 0;
        const promises = langs.map(async (lang) => {
            const path = `${i18nDir}${lang}`;
            const asset = await this.load<JsonAsset>(commonBundle, path, JsonAsset);
            if (asset && asset.json) {
                onLoad(lang, asset.json);
            }
            loadedCount++;
            onProgress?.(loadedCount / langs.length, lang);
        });

        await Promise.all(promises);
    }
}
