import { assetManager, Asset, Prefab, AudioClip, SpriteFrame, JsonAsset, Constructor } from 'cc';
import { LogManager } from '../core/LogManager';

/**
 * ResManager - 資源管理器
 *
 * 採用按需加載策略（Lazy Load）：
 * - loadBundleAsync：只做 Bundle 的 manifest 註冊，不全量 loadDir
 * - loadPrefabAsync / loadAssetAsync：只在需要時，按路徑加載單個資源並快取
 * - getPrefabFromBundle 等方法：仍為同步快取讀取，供已預載的資源使用
 */
export class ResManager {
    private static instance: ResManager | null = null;

    /** 資源快取結構：bundleName -> typeName -> assetName -> Asset */
    private bundleCache: Map<string, Map<string, Map<string, Asset>>> = new Map();

    /** Bundle 實例快取（Cocos AssetBundle 的 handle） */
    private bundleHandles: Map<string, any> = new Map();

    /** 預設資源包名稱 */
    private defaultBundleName: string = 'null';

    private constructor() {}

    public static getInstance(): ResManager {
        if (!this.instance) {
            this.instance = new ResManager();
        }
        return this.instance;
    }

    public setupDefaultBundleName(name: string): void {
        this.defaultBundleName = name;
    }

    public getDefaultBundleName(): string {
        if (this.defaultBundleName === 'null') {
            LogManager.getInstance().warn(
                'ResManager',
                '預設資源包名稱未設置，請先調用 setupDefaultBundleName() 方法。',
            );
        }
        return this.defaultBundleName;
    }

    // ==========================================
    // Bundle 加載（輕量版，只做 manifest 註冊）
    // ==========================================

    /**
     * 非同步加載資源包（只做 Bundle 註冊，不全量 loadDir）
     * - 若 Bundle 已存在快取，直接 return
     * - 資源需透過 loadPrefabAsync / loadAssetAsync 按需加載
     */
    public loadBundleAsync(bundleName: string): Promise<void> {
        if (this.bundleHandles.has(bundleName)) {
            LogManager.getInstance().debug('ResManager', `Bundle 已快取，跳過: ${bundleName}`);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    LogManager.getInstance().error(
                        'ResManager',
                        `Bundle 加載失敗: ${bundleName}`,
                        err,
                    );
                    reject(err);
                    return;
                }
                LogManager.getInstance().info('ResManager', `Bundle 已就緒: ${bundleName}`);
                this.bundleHandles.set(bundleName, bundle);
                if (!this.bundleCache.has(bundleName)) {
                    this.bundleCache.set(bundleName, new Map());
                }
                resolve();
            });
        });
    }

    // ==========================================
    // 按需加載（Lazy Load）
    // ==========================================

    /**
     * 按需加載指定路徑的資源（自動快取，快取命中則直接返回）
     * @param bundleName Bundle 名稱（需已透過 loadBundleAsync 完成註冊）
     * @param path Bundle 內的資源路徑，例如 'prefabs/MenuPanel'
     * @param AssetType 資源型別，例如 Prefab
     */
    public async loadAssetAsync<T extends Asset>(
        bundleName: string,
        path: string,
        AssetType: Constructor<T>,
    ): Promise<T | null> {
        const typeName = AssetType.name;
        const assetName = path.split('/').pop()!;

        // 快取命中，直接返回
        const cached = this.getAsset(bundleName, typeName, assetName);
        if (cached) return cached as T;

        // 取得 Bundle 實例
        const bundle = this.bundleHandles.get(bundleName) ?? assetManager.getBundle(bundleName);
        if (!bundle) {
            LogManager.getInstance().error(
                'ResManager',
                `Bundle 未加載，無法取得資源: ${bundleName}/${path}，請先呼叫 loadBundleAsync()`,
            );
            return null;
        }

        return new Promise((resolve) => {
            bundle.load(path, AssetType, (err: Error | null, asset: T) => {
                if (err) {
                    LogManager.getInstance().error(
                        'ResManager',
                        `資源加載失敗: ${bundleName}/${path}`,
                        err,
                    );
                    resolve(null);
                    return;
                }
                this.cacheAsset(bundleName, typeName, asset.name, asset);
                LogManager.getInstance().debug(
                    'ResManager',
                    `資源已加載並快取: ${bundleName}/${path}`,
                );
                resolve(asset);
            });
        });
    }

    /**
     * 按需加載 Prefab 的便捷方法
     * @param bundleName Bundle 名稱
     * @param path Prefab 路徑，例如 'prefabs/MenuPanel'
     */
    public async loadPrefabAsync(bundleName: string, path: string): Promise<Prefab | null> {
        return this.loadAssetAsync(bundleName, path, Prefab);
    }

    /**
     * 批量按需加載多個 Prefab（並行執行）
     * @param bundleName Bundle 名稱
     * @param paths Prefab 路徑陣列
     */
    public async loadPrefabsAsync(bundleName: string, paths: string[]): Promise<void> {
        await Promise.all(paths.map((path) => this.loadPrefabAsync(bundleName, path)));
    }

    /**
     * 按需加載 JsonAsset 的便捷方法
     */
    public async loadJsonAsync(bundleName: string, path: string): Promise<JsonAsset | null> {
        return this.loadAssetAsync(bundleName, path, JsonAsset);
    }

    // ==========================================
    // 快取讀取（同步）
    // ==========================================

    /**
     * 從快取中取得資源（同步）
     * 若資源未透過 loadAssetAsync/loadPrefabAsync 預載，會返回 null
     */
    public getAsset(bundleName: string, type: string, name: string): Asset | null {
        const bundleCache = this.bundleCache.get(bundleName);
        if (!bundleCache) return null;
        const typeCache = bundleCache.get(type);
        if (!typeCache) return null;
        const asset = typeCache.get(name);
        if (!asset) {
            LogManager.getInstance().warn(
                'ResManager',
                `資源未在快取中: [${name}] type: [${type}] bundle: [${bundleName}]，請先呼叫 loadPrefabAsync()`,
            );
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

    // ==========================================
    // 資源釋放
    // ==========================================

    /**
     * 釋放資源包及其所有快取資源
     */
    public releaseBundle(bundleName: string): void {
        const bundleCache = this.bundleCache.get(bundleName);
        if (!bundleCache) {
            LogManager.getInstance().warn('ResManager', `Bundle 未加載，無需釋放: ${bundleName}`);
            return;
        }

        bundleCache.forEach((typeCache) => {
            typeCache.forEach((asset) => asset.decRef());
        });

        this.bundleCache.delete(bundleName);
        this.bundleHandles.delete(bundleName);

        const bundle = assetManager.getBundle(bundleName);
        if (bundle) assetManager.removeBundle(bundle);

        LogManager.getInstance().info('ResManager', `Bundle 已釋放: ${bundleName}`);
    }

    /**
     * 獲取目前所有已加載的 Bundle 名稱
     */
    public getLoadedBundleNames(): string[] {
        return Array.from(this.bundleHandles.keys());
    }

    // ==========================================
    // 內部工具
    // ==========================================

    private cacheAsset(bundleName: string, type: string, name: string, asset: Asset): void {
        if (!this.bundleCache.has(bundleName)) {
            this.bundleCache.set(bundleName, new Map());
        }
        const bundleCache = this.bundleCache.get(bundleName)!;
        if (!bundleCache.has(type)) {
            bundleCache.set(type, new Map());
        }
        bundleCache.get(type)!.set(name, asset);
    }
}
