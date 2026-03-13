import { _decorator, Component, director, Node, log, error, Scene } from 'cc';
import { ResManager } from './framework/manager/resource/ResManager';
import { AppConfig } from './config/AppConfig';
import { GameManager } from './framework/manager/game/GameManager';
import { AppScene } from './AppScene';
import { EventBus } from './core/event/EventBus';
import { EventName } from './core/event/EventName';
import { ProgressUIController } from './framework/manager/progress/ProgressUIController';
import { LanguageManager } from './core/i18n/LanguageManager';
import { LanguageType } from './core/i18n/LanguageType';
import { ProgressManager } from './framework/manager/progress/ProgressManager';

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

            // 1. 任務依賴：Common Bundle -> Languages
            const essentialTask = (async () => {
                await this._doLoadCommonBundle();
                await this._doLoadLanguages(config.lang);
            })();

            // 2. 任務依賴：連線取得 API 設定
            const apiTask = this._doConnectAPI();

            // 並行執行所有載入階段
            await Promise.all([essentialTask, apiTask]);

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
                (lang, json) => {
                    LanguageManager.getInstance().loadLanguage(lang, json);
                },
                (p, lang) => {
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

        director.runSceneImmediate(scene, async () => {
            log('[Launcher][SUCCESS] 🚀 啟動場景任務圓滿完成，進入主應用邏輯');
            const GM = GameManager.getInstance();
            if (gameId) {
                await GM.enterGame(gameId, path, 'Main');
            } else {
                await GM.returnToLobby();
            }
        });
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
