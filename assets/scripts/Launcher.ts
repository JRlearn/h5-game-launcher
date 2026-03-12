import { _decorator, Component, JsonAsset, ProgressBar, director } from 'cc';
import { SceneManager } from './manager/scene/SceneManager';
import { ResManager } from './manager/resource/ResManager';
import { LanguageManager } from './manager/i18n/LanguageManager';
import { TaskChain } from './framework/utils/TaskChain';
import { LogManager, LogLevel } from './manager/core/LogManager';
import { AppConfig } from './config/AppConfig';
import { GameManager } from './manager/game/GameManager';
import { StorageManager } from './manager/data/StorageManager';
import { App } from './App';
import { AppScene } from './AppScene';
const { ccclass, property } = _decorator;

/**
 * 應用主程式進入點 (Launcher)
 *
 * 負責場景的初始化：加載核心資源並導向唯一主場景 App。
 */
@ccclass('Launcher')
export class Launcher extends Component {
    @property({ type: ProgressBar, tooltip: '載入進度條組件' })
    public progressBar: ProgressBar | null = null;
    public onLoad(): void {
        LogManager.getInstance().setLevel(LogLevel.DEBUG);
        LogManager.getInstance().info('App', 'Launcher onLoad');

        // 初始化遊戲全局狀態管理器
        GameManager.getInstance().init();
        // 初始化儲存管理器
        StorageManager.getInstance().init();
    }

    /**
     * 腳本啟動：執行初始化並導向主場景。
     */
    public start(): void {
        LogManager.getInstance().info('App', 'Launcher start - 啟動初始化流程');
        this.initApp();
    }

    /**
     * 初始化核心應用程式環境
     *
     * 並行策略：
     * 1. loadBundleAsync(common) + director.preloadScene(AppScene) 同時執行
     * 2. 兩者都完成後才 director.loadScene（幾乎無延遲）
     * 3. AppScene 的 LoadingOverlay 接手後，HTML Splash Screen 才淡出
     */
    private async initApp() {
        LogManager.getInstance().info('App', '正在加載共用資源...');

        try {
            // ── 並行：common bundle 下載 + AppScene 預載 ──────────
            await Promise.all([
                this.loadCommonResources((p) => {
                    if (this.progressBar) this.progressBar.progress = p * 0.5; // 前 50%
                }),
                this.preloadAppScene((p) => {
                    if (this.progressBar) this.progressBar.progress = 0.5 + p * 0.5; // 後 50%
                }),
            ]);

            LogManager.getInstance().info(
                'App',
                `✅ 核心資源 + AppScene 預載完成，切換至: ${AppConfig.SCENE_MAIN}`,
            );

            const scene = new AppScene(AppConfig.SCENE_MAIN);
            scene.start();
            director.runSceneImmediate(scene, () => {
                LogManager.getInstance().info('App', '🚀 已進入主場景 AppScene');
            });
        } catch (err) {
            LogManager.getInstance().error('App', '❌ 啟動失敗:', err);
        }
    }

    /**
     * 加載共用資源與多語系
     * @param onProgress 進度回調 (0~1)
     */
    private async loadCommonResources(onProgress?: (p: number) => void): Promise<void> {
        onProgress?.(0);
        await ResManager.getInstance().loadBundleAsync(AppConfig.BUNDLE_COMMON);

        const langs = AppConfig.SUPPORTED_LANGUAGES;
        for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const jsonAsset = await ResManager.getInstance().loadJsonAsync(
                AppConfig.BUNDLE_COMMON,
                `${AppConfig.I18N_DIR}${lang}`,
            );
            if (jsonAsset?.json) {
                LanguageManager.getInstance().loadLanguage(lang, jsonAsset.json);
            }
            onProgress?.((i + 1) / langs.length);
        }
        LanguageManager.getInstance().init(AppConfig.DEFAULT_LANGUAGE);
    }

    /**
     * 預載 AppScene（與 common bundle 並行）
     * 讓 director.loadScene 執行時場景資源已在記憶體中，避免切換延遲
     * @param onProgress 進度回調 (0~1)
     */
    private preloadAppScene(onProgress?: (p: number) => void): Promise<void> {
        return new Promise((resolve) => {
            director.preloadScene(
                AppConfig.SCENE_MAIN,
                (completedCount, totalCount) => {
                    if (totalCount > 0) {
                        onProgress?.(completedCount / totalCount);
                    }
                },
                (err) => {
                    if (err) {
                        LogManager.getInstance().warn(
                            'App',
                            `AppScene 預載部分失敗（可繼續）: ${err}`,
                        );
                    }
                    resolve(); // 無論成功或失敗都繼續，不阻塞主流程
                },
            );
        });
    }
}
