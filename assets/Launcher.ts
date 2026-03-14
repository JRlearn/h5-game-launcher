import { _decorator, Component, director, Node, log, error, Scene } from 'cc';
import { ResManager } from './core/systems/resource/ResManager';
import { AppConfig } from './app/config/Config';
import { GameManager } from './core/game/GameManager';
import { AppScene } from './app/AppScene';
import { EventBus } from './core/systems/event/EventBus';
import { EventName } from './core/systems/event/EventName';
import { ProgressUIController } from './app/progress/ProgressUIController';
import { LanguageManager } from './core/systems/language/LanguageManager';
import { LanguageType } from './core/systems/language/LanguageType';
import { ProgressManager } from './app/progress/ProgressManager';
import { TaskChain } from './core/utils/TaskChain';

const { ccclass } = _decorator;

/**
 * Launcher - 應用啟動器
 * 負責初始加載流程的編排與場景路由切換。
 */
@ccclass('Launcher')
export class Launcher extends Component {
    /** 加載階段權重常量 */
    private readonly _WEIGHT_CONFIG = {
        COMMON_BUNDLE: 0.4,
        LANGUAGES: 0.1,
        TARGET_PRELOAD: 0.5,
    };

    public onLoad(): void {
        log('[Launcher][INFO] onLoad');

        // 1. 初始化資源與本地存儲
        GameManager.getInstance().init();

        // 2. 初始化進度管理器與 UI
        ProgressManager.getInstance().init(this._WEIGHT_CONFIG);
        this.node.addComponent(ProgressUIController);
    }

    public start(): void {
        log('[Launcher][INFO] 執行啟動流程...');
        this._launch();
    }

    /**
     * 啟動加載並行流程
     * @returns Promise<void>
     */
    private async _launch(): Promise<void> {
        try {
            const config = GameManager.getInstance().getLaunchConfig();
            if (!config) throw new Error('無法獲取啟動配置');

            const taskChain = new TaskChain();

            // 1. 核心資源加載 (Bundle -> Languages)
            taskChain.addTask(
                async () => {
                    await this._doLoadCommonBundle();
                    await this._doLoadLanguages(config.lang);
                },
                this._WEIGHT_CONFIG.COMMON_BUNDLE + this._WEIGHT_CONFIG.LANGUAGES,
                '核心資源與語系加載',
            );

            // 2. API 連線、插件與 SDK 初始化 (並行執行)
            taskChain.addTask(
                async () => {
                    await Promise.all([this._doConnectAPI(), this._doInitPlugins()]);
                },
                0.1,
                '系統服務初始化',
            );

            // 執行任務鏈
            await taskChain.run((p: number) => {
                // TaskChain 的進度是根據權重計算的，這裡可以統一處理或保留細分進度
                log(`[Launcher] 總體啟動進度: ${(p * 100).toFixed(1)}%`);
            });

            log('[Launcher][SUCCESS] ✅ 核心資源與 API 加載圓滿完成');
            EventBus.emit(EventName.LAUNCHER_COMPLETE, undefined);

            // 切換導航
            this._navigateToApp(config.gameId, config.path);
        } catch (err) {
            error('[Launcher][FATAL] 啟動流程中斷:', err);
        }
    }

    /**
     * Step: 加載 Common Bundle
     * @returns Promise<void>
     */
    private async _doLoadCommonBundle(): Promise<void> {
        log('[Launcher][INFO] 開始加載核心資源包 (Common Bundle)...');
        try {
            await ResManager.getInstance().loadBundleAsync(AppConfig.BUNDLE_COMMON, (p) => {
                ProgressManager.getInstance().setStepProgress(
                    'COMMON_BUNDLE',
                    p,
                    '正在下載核心資源...',
                );
            });
        } catch (err) {
            this._reportError('COMMON_BUNDLE', err);
            throw err;
        }
    }

    /**
     * 加載特定語系的多國語系配置
     * @param targetLang 目標語系代碼，若為 null 則使用預設語系
     */
    private async _doLoadLanguages(targetLang: LanguageType | null): Promise<void> {
        log('[Launcher][INFO] 開始加載多國語系配置...');
        try {
            const langs = AppConfig.SUPPORTED_LANGUAGES;
            const manager = ProgressManager.getInstance();

            await ResManager.getInstance().loadLanguagesAsync(
                langs,
                AppConfig.I18N_DIR,
                AppConfig.BUNDLE_COMMON,
                (lang: LanguageType, json: any) => {
                    LanguageManager.getInstance().loadLanguage(lang, json);
                },
                (p: number, lang: LanguageType) => {
                    manager.setStepProgress('LANGUAGES', p, `正在設置語言模組 (${lang})...`);
                },
            );
            LanguageManager.getInstance().init(targetLang || AppConfig.DEFAULT_LANGUAGE);
        } catch (err) {
            this._reportError('LANGUAGES', err);
            throw err;
        }
    }

    /**
     * 連線讀取 API 流程
     * @returns Promise<void>
     */
    private async _doConnectAPI(): Promise<void> {
        log('[Launcher][INFO] 開始連線 API 取得遊戲狀態或使用者資料...');
        try {
            // TODO: 在這裡置換為真實的 API 端點
            // 例如：const response = await HttpManager.getInstance().get('https://api.example.com/init');

            // 模擬 API 延遲
            // await new Promise((resolve) => setTimeout(resolve, 500));
            log('[Launcher][SUCCESS] API 連線完成');
        } catch (err) {
            this._reportError('CONNECT_API', err);
            throw err;
        }
    }

    /**
     * 執行最後的導航，進入主應用場景並根據 ID 切換入口
     * @param gameId 遊戲 ID，若為 null 則進入大廳
     * @param path 引導進入的業務入口路徑
     */
    private _navigateToApp(gameId: string | null, path: string): void {
        log('[Launcher][INFO] 準備切換至主應用流程...');
        // 建立單場景核心容器節點
        const scene = new Scene(AppConfig.SCENE_MAIN);
        const appNode = new Node('AppScene');
        appNode.addComponent(AppScene);
        scene.addChild(appNode);

        director.runSceneImmediate(scene, () => {
            log('[Launcher][SUCCESS] 🚀 啟動場景任務圓滿完成，進入主應用邏輯');
            if (gameId) {
                GameManager.getInstance().enterGame(gameId);
            } else {
                GameManager.getInstance().returnToLobby();
            }
        });
    }

    /**
     * 初始化全域插件系統
     */
    private async _doInitPlugins(): Promise<void> {
        log('[Launcher][INFO] 正在初始化插件系統...');
        // 未來可以在此註冊全域插件
        // await PluginManager.getInstance().registerPlugin(new SomePlugin());
        await Promise.resolve();
    }

    /**
     * 集中報告啟動過程中的錯誤
     * @param step 發生錯誤的加載步驟名稱
     * @param err 錯誤對象
     */
    private _reportError(step: string, err: Error | unknown): void {
        error(`[Launcher][ERROR] Step [${step}] failed:`, err);
        EventBus.emit(EventName.LAUNCHER_ERROR, { step, error: err });
    }
}
