import { _decorator, AssetManager, assetManager, director } from 'cc';
import { ResManager } from '../resource/ResManager';
/**
 * SceneManager - 場景管理器，用於管理遊戲中的場景切換和資源加載。
 */
export class SceneManager {
    private static instance: SceneManager;
    private loadedBundles: Map<string, any> = new Map();
    private constructor() {
        // 私有構造函數，防止外部實例化
    }

    public static getInstance(): SceneManager {
        if (!this.instance) {
            this.instance = new SceneManager();
        }
        return this.instance;
    }

    /**
     * 切換場景
     * @param sceneName 場景名稱
     */
    public loadScene(sceneName: string, callback?: () => void) {
        director.loadScene(sceneName, (err) => {
            if (err) {
                console.error(`❌ 切換場景 ${sceneName} 失敗:`, err);
                return;
            }
            console.log(`✅ 成功切換場景: ${sceneName}`);
            callback && callback();
        });
    }

    /**
     * 加載 Asset Bundle
     * @param bundleName Bundle 名稱
     * @param callback 加載完成回調
     */
    public loadBundle(bundleName: string, callback?: (bundle: any) => void) {
        if (this.loadedBundles.has(bundleName)) {
            console.log(`🔄 Asset Bundle ${bundleName} 已加載，直接使用`);
            callback && callback(this.loadedBundles.get(bundleName));
            return;
        }

        assetManager.loadBundle(bundleName, (err, bundle) => {
            if (err) {
                console.error(`❌ 加載 Asset Bundle ${bundleName} 失敗:`, err);
                return;
            }
            console.log(`✅ 成功加載 Asset Bundle: ${bundleName}`);
            this.loadedBundles.set(bundleName, bundle);
            callback && callback(bundle);
        });
    }

    /**
     * 卸載 Asset Bundle
     * @param bundleName 要卸載的 Bundle 名稱
     */
    public unloadBundle(bundleName: string) {
        if (this.loadedBundles.has(bundleName)) {
            assetManager.removeBundle(this.loadedBundles.get(bundleName));
            this.loadedBundles.delete(bundleName);
            console.log(`🗑️ 已卸載 Asset Bundle: ${bundleName}`);
        } else {
            console.warn(`⚠️ 嘗試卸載未加載的 Asset Bundle: ${bundleName}`);
        }
    }

    /**
     * 進入遊戲
     * @param gameName 遊戲名稱 (對應 Asset Bundle)
     * @param sceneName 遊戲內的場景名稱
     */
    public async enterGame(gameName: string, sceneName: string) {
        console.log(`🎮 嘗試進入遊戲: ${gameName}, 場景: ${sceneName}`);

        let result = await Promise.all([
            this.loadBundleAsync(`games/${gameName}`),
            this.loadSceneAsync(gameName, sceneName),
        ]);
        let scene = result[1];
        director.runScene(scene);
    }

    /**
     * 將 loadBundle 包裝為 Promise
     */
    private loadBundleAsync(bundleName: string): Promise<void> {
        //設置資源包名稱
        ResManager.getInstance().setupDefaultBundleName(bundleName);
        return new Promise((resolve, reject) => {
            ResManager.getInstance().loadDefaultBundle(() => {
                resolve();
            });
        });
    }

    /**
     * 將場景加載包裝為 Promise
     */
    private loadSceneAsync(gameName: string, sceneName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.loadBundle(`games/${gameName}`, (bundle) => {
                // 透過 Bundle 載入對應的場景
                bundle.loadScene('scenes/Scene', (err, scene) => {
                    if (err) {
                        reject(`加載場景失敗: ${gameName}/main`);
                    } else {
                        resolve(scene);
                    }
                });
            });
        });
    }

    /**
     * 返回大廳
     */
    public returnToLobby() {
        console.log('🏠 返回遊戲大廳');
        this.loadScene('Lobby', () => {
            this.unloadUnusedBundles();
        });
    }

    /**
     * 卸載所有已加載的遊戲資源 (除了大廳)
     */
    private unloadUnusedBundles() {
        this.loadedBundles.forEach((_, bundleName) => {
            if (bundleName !== 'lobby') {
                this.unloadBundle(bundleName);
            }
        });
    }
}
