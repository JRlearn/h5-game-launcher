import { _decorator, Component, director, Node, log, error, Scene } from 'cc';
import { ResManager } from './framework/manager/resource/ResManager';
import { AppConfig } from './config/AppConfig';
import { GameManager } from './framework/manager/game/GameManager';
import { AppScene } from './AppScene';
import { SceneManager } from './framework/manager/ui/scene/SceneManager';
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
     */
    private async _launch() {
        try {
            const config = GameManager.getInstance().getLaunchConfig();
            if (!config) throw new Error('無法獲取啟動配置');

            // 1. 任務依賴：Common Bundle -> Languages
            const essentialTask = (async () => {
                await this._doLoadCommonBundle();
                await this._doLoadLanguages(config.lang);
            })();

            // 2. 並行執行所有載入階段
            await Promise.all([essentialTask, this._doPreloadTarget(config.gameId, config.path)]);

            log('[Launcher][SUCCESS] ✅ 核心資源加載圓滿完成');
            EventBus.emit(EventName.LAUNCHER_COMPLETE, undefined);

            // 切換導航
            this._navigateToApp(config.gameId, config.path);
        } catch (err) {
            error('[Launcher][FATAL] 啟動流程中斷:', err);
        }
    }

    /**
     * Step: 加載 Common Bundle
     */
    private async _doLoadCommonBundle() {
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
     * Step: 加載語系
     */
    private async _doLoadLanguages(targetLang: string | null) {
        log('[Launcher][INFO] 開始加載多國語系配置...');
        try {
            const langs = AppConfig.SUPPORTED_LANGUAGES;
            for (let i = 0; i < langs.length; i++) {
                const lang = langs[i];
                const asset = await ResManager.getInstance().loadJsonAsync(
                    AppConfig.BUNDLE_COMMON,
                    `${AppConfig.I18N_DIR}${lang}`,
                );
                if (asset?.json) {
                    LanguageManager.getInstance().loadLanguage(lang, asset.json);
                }
                ProgressManager.getInstance().setStepProgress(
                    'LANGUAGES',
                    (i + 1) / langs.length,
                    `正在設置語言模組 (${lang})...`,
                );
            }

            const defaultLang = (targetLang as LanguageType) || AppConfig.DEFAULT_LANGUAGE;
            LanguageManager.getInstance().init(defaultLang);
        } catch (err) {
            this._reportError('LANGUAGES', err);
            throw err;
        }
    }

    /**
     * Step: 預載目標業務 Bunlde (大廳或遊戲)
     */
    private async _doPreloadTarget(gameId: string | null, path: string) {
        const targetName = gameId ? `遊戲 [${gameId}]` : '大廳';
        log(`[Launcher][INFO] 預載目標業務資源: ${targetName}`);

        try {
            const manager = ProgressManager.getInstance();
            const step = 'TARGET_PRELOAD';

            if (!gameId) {
                // 預載大廳
                await ResManager.getInstance().loadBundleAsync(AppConfig.BUNDLE_LOBBY, (p) =>
                    manager.setStepProgress(step, p * 0.5, '下載大廳資源...'),
                );
                await ResManager.getInstance().loadPrefabAsync(
                    AppConfig.BUNDLE_LOBBY,
                    'prefabs/entry/Main',
                    (p) => manager.setStepProgress(step, 0.5 + p * 0.5, '初始化大廳主介面...'),
                );
            } else {
                // 預載子遊戲
                const bundleName = `${AppConfig.GAMES_DIR_PREFIX}${gameId}`;
                await ResManager.getInstance().loadBundleAsync(bundleName, (p) =>
                    manager.setStepProgress(step, p * 0.5, `下載${targetName}資源...`),
                );
                await ResManager.getInstance().loadPrefabAsync(bundleName, path, (p) =>
                    manager.setStepProgress(step, 0.5 + p * 0.5, `準備${targetName}組件...`),
                );
            }
            manager.setStepProgress(step, 1, `${targetName}資源已就緒`);
        } catch (err) {
            this._reportError('TARGET_PRELOAD', err);
            throw err;
        }
    }

    /**
     * 執行最後的導航，進入 AppScene 並配置狀態
     */
    private _navigateToApp(gameId: string | null, path: string) {
        log('[Launcher][INFO] 準備切換至主應用流程...');
        // 建立單場景核心容器節點
        const scene = new Scene(AppConfig.SCENE_MAIN);
        const appNode = new Node('AppScene');
        appNode.addComponent(AppScene);
        scene.addChild(appNode);

        director.runSceneImmediate(scene, async () => {
            log('[Launcher][SUCCESS] 🚀 啟動場景任務圓滿完成，進入主應用邏輯');
            if (gameId) {
                GameManager.getInstance().setGameState('PLAYING');
                const bundleName = `${AppConfig.GAMES_DIR_PREFIX}${gameId}`;
                await SceneManager.getInstance().enterGame({ bundleName, path, isPrefab: true });
            } else {
                GameManager.getInstance().setGameState('LOBBY');
                await SceneManager.getInstance().returnToLobby();
            }
        });
    }

    /**
     * 報告錯誤
     */
    private _reportError(step: string, err: any) {
        error(`[Launcher][ERROR] Step [${step}] failed:`, err);
        EventBus.emit(EventName.LAUNCHER_ERROR, { step, error: err });
    }
}
