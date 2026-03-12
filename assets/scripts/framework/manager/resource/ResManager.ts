import { assetManager, Asset, Prefab, AudioClip, SpriteFrame, JsonAsset, Constructor, log, warn, error } from 'cc';

/**
 * ResManager - 資源管理器
 * 負責 Asset Bundle 的加載與管理，以及資源的異步加載與快取。
 */
export class ResManager {
    private static _instance: ResManager | null = null;

    /** 資源快取結構：bundleName -> typeName -> assetName -> Asset */
    private _bundleCache: Map<string, Map<string, Map<string, Asset>>> = new Map();

    /** Bundle 實例快取（Cocos AssetBundle 的 handle） */
    private _bundleHandles: Map<string, any> = new Map();

    /** 預設資源包名稱 */
    private _defaultBundleName: string = 'null';

    private constructor() {}

    /**
     * 獲取單例實例
     */
    public static getInstance(): ResManager {
        if (!this._instance) {
            this._instance = new ResManager();
        }
        return this._instance;
    }

    /**
     * 設置預設 Bundle 名稱
     * @param name Bundle 名稱
     */
    public setupDefaultBundleName(name: string): void {
        this._defaultBundleName = name;
    }

    /**
     * 獲取預設 Bundle 名稱
     */
    public getDefaultBundleName(): string {
        if (this._defaultBundleName === 'null') {
            warn('[ResManager] 預設資源包名稱未設置，請先調用 setupDefaultBundleName() 方法。');
        }
        return this._defaultBundleName;
    }

    /**
     * 異步加載 Asset Bundle
     * @param bundleName Bundle 名稱或 URL
     * @param onProgress 進度回調 (0~1)
     */
    public loadBundleAsync(bundleName: string, onProgress?: (p: number) => void): Promise<void> {
        if (this._bundleHandles.has(bundleName)) {
            log(`[ResManager] Bundle 已快取，跳過: ${bundleName}`);
            onProgress?.(1);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            assetManager.loadBundle(
                bundleName,
                (finished: number, total: number) => {
                    if (total > 0) onProgress?.(finished / total);
                },
                (err, bundle) => {
                    if (err) {
                        error(`[ResManager] Bundle 加載失敗: ${bundleName}`, err);
                        reject(err);
                        return;
                    }
                    log(`[ResManager] Bundle 已就緒: ${bundleName}`);
                    this._bundleHandles.set(bundleName, bundle);
                    if (!this._bundleCache.has(bundleName)) {
                        this._bundleCache.set(bundleName, new Map());
                    }
                    onProgress?.(1);
                    resolve();
                }
            );
        });
    }

    /**
     * 異步加載單一資源
     * @param bundleName Bundle 名稱
     * @param path 資源路徑
     * @param AssetType 資源型別
     * @param onProgress 進度回調
     */
    public async loadAssetAsync<T extends Asset>(
        bundleName: string,
        path: string,
        AssetType: Constructor<T>,
        onProgress?: (p: number) => void
    ): Promise<T | null> {
        const typeName = AssetType.name;
        const assetName = path.split('/').pop()!;

        const cached = this.getAsset(bundleName, typeName, assetName);
        if (cached) {
            onProgress?.(1);
            return cached as T;
        }

        const bundle = this._bundleHandles.get(bundleName) ?? assetManager.getBundle(bundleName);
        if (!bundle) {
            error(`[ResManager] Bundle 未加載，無法取得資源: ${bundleName}/${path}，請先呼叫 loadBundleAsync()`);
            return null;
        }

        return new Promise((resolve) => {
            bundle.load(
                path,
                AssetType,
                (finished: number, total: number) => {
                    if (total > 0) onProgress?.(finished / total);
                },
                (err: Error | null, asset: T) => {
                    if (err) {
                        error(`[ResManager] 資源加載失敗: ${bundleName}/${path}`, err);
                        resolve(null);
                        return;
                    }
                    this._cacheAsset(bundleName, typeName, asset.name, asset);
                    log(`[ResManager] 資源已加載並快取: ${bundleName}/${path}`);
                    onProgress?.(1);
                    resolve(asset);
                }
            );
        });
    }

    /**
     * 異步加載預設體
     */
    public async loadPrefabAsync(bundleName: string, path: string, onProgress?: (p: number) => void): Promise<Prefab | null> {
        return this.loadAssetAsync(bundleName, path, Prefab, onProgress);
    }

    /**
     * 異步加載多個預設體
     */
    public async loadPrefabsAsync(bundleName: string, paths: string[], onProgress?: (p: number) => void): Promise<void> {
        let completed = 0;
        await Promise.all(
            paths.map((path) =>
                this.loadPrefabAsync(bundleName, path, (p) => {
                    // 這裡的邏輯較為簡化：任務完成一個算一份進度
                    if (p === 1) {
                        completed++;
                        onProgress?.(completed / paths.length);
                    }
                })
            )
        );
    }

    /**
     * 異步加載 JSON 資源
     */
    public async loadJsonAsync(bundleName: string, path: string, onProgress?: (p: number) => void): Promise<JsonAsset | null> {
        return this.loadAssetAsync(bundleName, path, JsonAsset, onProgress);
    }

    /**
     * 從快取獲取資源
     */
    public getAsset(bundleName: string, type: string, name: string): Asset | null {
        const bundleCache = this._bundleCache.get(bundleName);
        if (!bundleCache) return null;
        const typeCache = bundleCache.get(type);
        if (!typeCache) return null;
        const asset = typeCache.get(name);
        if (!asset) {
            warn(`[ResManager] 資源未在快取中: [${name}] type: [${type}] bundle: [${bundleName}]，請先呼叫 loadPrefabAsync()`);
            return null;
        }
        return asset;
    }

    public getPrefabFromBundle(bundleName: string, name: string): Prefab | null {
        return this.getAsset(bundleName, 'Prefab', name) as Prefab | null;
    }

    public getAudioClipFromBundle(bundleName: string, name: string): AudioClip | null {
        return this.getAsset(bundleName, 'AudioClip', name) as AudioClip | null;
    }

    public getSpriteFrameFromBundle(bundleName: string, name: string): SpriteFrame | null {
        return this.getAsset(bundleName, 'SpriteFrame', name) as SpriteFrame | null;
    }

    public getJsonAssetFromBundle(bundleName: string, name: string): JsonAsset | null {
        return this.getAsset(bundleName, 'JsonAsset', name) as JsonAsset | null;
    }

    public getPrefab(name: string): Prefab | null {
        return this.getPrefabFromBundle(this.getDefaultBundleName(), name);
    }

    public getAudioClip(name: string): AudioClip | null {
        return this.getAudioClipFromBundle(this.getDefaultBundleName(), name);
    }

    public getSpriteFrame(name: string): SpriteFrame | null {
        return this.getSpriteFrameFromBundle(this.getDefaultBundleName(), name);
    }

    public getJsonAsset(name: string): JsonAsset | null {
        return this.getJsonAssetFromBundle(this.getDefaultBundleName(), name);
    }

    /**
     * 釋放 Bundle 資源
     */
    public releaseBundle(bundleName: string): void {
        const bundleCache = this._bundleCache.get(bundleName);
        if (!bundleCache) {
            warn(`[ResManager] Bundle 未加載，無需釋放: ${bundleName}`);
            return;
        }

        bundleCache.forEach((typeCache) => {
            typeCache.forEach((asset) => asset.decRef());
        });

        this._bundleCache.delete(bundleName);
        this._bundleHandles.delete(bundleName);

        const bundle = assetManager.getBundle(bundleName);
        if (bundle) assetManager.removeBundle(bundle);

        log(`[ResManager] Bundle 已釋放: ${bundleName}`);
    }

    /**
     * 獲取所有已載入的 Bundle 名稱
     */
    public getLoadedBundleNames(): string[] {
        return Array.from(this._bundleHandles.keys());
    }

    /**
     * 快取資源
     */
    private _cacheAsset(bundleName: string, type: string, name: string, asset: Asset): void {
        if (!this._bundleCache.has(bundleName)) {
            this._bundleCache.set(bundleName, new Map());
        }
        const bundleCache = this._bundleCache.get(bundleName)!;
        if (!bundleCache.has(type)) {
            bundleCache.set(type, new Map());
        }
        bundleCache.get(type)!.set(name, asset);
    }
}


