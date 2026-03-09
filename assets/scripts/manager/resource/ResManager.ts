import { assetManager, Asset, log, error, Prefab, AudioClip, SpriteFrame } from 'cc';

export class ResManager {
    private static instance: ResManager | null = null;

    // 資源緩存結構：資源包 -> 資源類型 -> 資源名稱 -> 資源對象
    private bundleCache: Map<string, Map<string, Map<string, Asset>>> = new Map();

    //預設資源包名稱
    private defaultBundleName: string = 'null';

    private constructor() {}

    public static getInstance(): ResManager {
        if (!this.instance) {
            this.instance = new ResManager();
        }
        return this.instance;
    }

    public setupDefaultBundleName(name: string): void {
        this.defaultBundleName = name; // 設置預設資源包名稱
    }

    public getDefaultBundleName(): string {
        if (this.defaultBundleName === 'null') {
            log('預設資源包名稱未設置，請先調用 setupDefaultBundleName() 方法。');
        }
        return this.defaultBundleName; // 獲取預設資源包名稱
    }

    public loadDefaultBundle(callback: () => void): void {
        if (this.defaultBundleName === 'null') {
            log('預設資源包名稱未設置，請先調用 setupDefaultBundleName() 方法。');
            return;
        }
        this.loadBundle(this.defaultBundleName, callback); // 加載預設資源包
    }

    /**
     * 加載資源包並分類資源。
     * @param bundleName - 資源包名稱。
     * @param callback - 加載完成後的回調函數。
     */
    public loadBundle(bundleName: string, callback: () => void): void {
        assetManager.loadBundle(bundleName, (err, bundle) => {
            console.log('資源包加載', bundleName, err, bundle);
            if (err) {
                error(`資源包加載失敗: ${bundleName}`, err);
                return;
            }
            log(`資源包加載成功: ${bundleName}`);

            // 初始化資源包緩存結構
            if (!this.bundleCache.has(bundleName)) {
                this.bundleCache.set(bundleName, new Map());
            }

            const bundleCache = this.bundleCache.get(bundleName)!;

            // 計數器，用於追蹤資源類型的加載進度
            let loadCount = 0;
            const totalTypes = 3; // 預製體、音頻、精靈圖三種類型

            const checkAllLoaded = () => {
                loadCount++;
                if (loadCount === totalTypes) {
                    log(`資源包 ${bundleName} 的所有資源類型加載完成`);
                    callback();
                }
            };

            // 加載並分類資源
            bundle.loadDir('', Prefab, (err, prefabs) => {
                if (err) {
                    error(`加載預製體失敗: ${bundleName}`, err);
                } else {
                    log(`加載預製體成功: ${prefabs.length} 個`);
                    this.cacheAssets(bundleCache, 'Prefab', prefabs);
                }
                checkAllLoaded(); // 無論成功或失敗，都需要檢查是否完成
            });

            bundle.loadDir('', AudioClip, (err, audioClips) => {
                if (err) {
                    error(`加載音頻失敗: ${bundleName}`, err);
                } else {
                    log(`加載音頻成功: ${audioClips.length} 個`);
                    this.cacheAssets(bundleCache, 'AudioClip', audioClips);
                }
                checkAllLoaded(); // 無論成功或失敗，都需要檢查是否完成
            });

            bundle.loadDir('', SpriteFrame, (err, spriteFrames) => {
                if (err) {
                    error(`加載精靈圖失敗: ${bundleName}`, err);
                } else {
                    log(`加載精靈圖成功: ${spriteFrames.length} 個`);
                    this.cacheAssets(bundleCache, 'SpriteFrame', spriteFrames);
                }
                checkAllLoaded(); // 無論成功或失敗，都需要檢查是否完成
            });
        });
    }

    /**
     * 緩存資源到指定類型分類中。
     * @param bundleCache - 資源包緩存。
     * @param type - 資源類型（如 Prefab, AudioClip, SpriteFrame）。
     * @param assets - 資源數組。
     */
    private cacheAssets(
        bundleCache: Map<string, Map<string, Asset>>,
        type: string,
        assets: Asset[],
    ): void {
        if (!bundleCache.has(type)) {
            bundleCache.set(type, new Map());
        }

        const typeCache = bundleCache.get(type)!;
        assets.forEach((asset) => {
            console.log(asset.name, asset);
            typeCache.set(asset.name, asset);
        });
    }

    /**
     * 獲取資源。
     * @param bundleName - 資源包名稱。
     * @param type - 資源類型（如 Prefab, AudioClip, SpriteFrame）。
     * @param name - 資源名稱。
     * @returns 資源對象，如果未找到則返回 null。
     */
    public getAsset(bundleName: string, type: string, name: string): Asset | null {
        const bundleCache = this.bundleCache.get(bundleName);
        console.log('獲取預製體列表', bundleName, bundleCache);
        if (!bundleCache) {
            log(`資源包未加載: ${bundleName}`);
            return null;
        }

        const typeCache = bundleCache.get(type);
        if (!typeCache) {
            log(`資源類型未加載: ${type}`);
            return null;
        }

        const asset = typeCache.get(name);
        if (!asset) {
            log(`資源未加載: ${name}`);
            return null;
        }

        return asset;
    }

    public getPrefabFromBundle(bundleName: string, name: string): Prefab | null {
        console.log('獲取預製體', bundleName, name);
        return this.getAsset(bundleName, 'Prefab', name) as Prefab;
    }

    public getAudioClipFromBundle(bundleName: string, name: string): AudioClip | null {
        return this.getAsset(bundleName, 'AudioClip', name) as AudioClip;
    }

    public getSpriteFrameFromBundle(bundleName: string, name: string): SpriteFrame | null {
        return this.getAsset(bundleName, 'SpriteFrame', name) as SpriteFrame;
    }

    public getPrefab(name: string): Prefab | null {
        let bundleName = this.getDefaultBundleName(); // 使用預設資源包名稱
        return this.getPrefabFromBundle(bundleName, name);
    }

    public getAudioClip(name: string): AudioClip | null {
        let bundleName = this.getDefaultBundleName(); // 使用預設資源包名稱
        return this.getAudioClipFromBundle(bundleName, name);
    }

    public getSpriteFrame(name: string): SpriteFrame | null {
        let bundleName = this.getDefaultBundleName(); // 使用預設資源包名稱
        return this.getSpriteFrameFromBundle(bundleName, name);
    }

    /**
     * 釋放資源包。
     * @param bundleName - 資源包名稱。
     */
    public releaseBundle(bundleName: string): void {
        const bundleCache = this.bundleCache.get(bundleName);
        if (!bundleCache) {
            log(`資源包未加載: ${bundleName}`);
            return;
        }

        bundleCache.forEach((typeCache, type) => {
            typeCache.forEach((asset, name) => {
                asset.decRef();
                log(`資源已釋放: ${bundleName}/${type}/${name}`);
            });
        });

        this.bundleCache.delete(bundleName);
        log(`資源包已釋放: ${bundleName}`);
    }
}
