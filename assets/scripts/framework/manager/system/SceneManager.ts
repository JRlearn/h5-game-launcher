import { _decorator, Node, log, error } from 'cc';
import { AppConfig } from '../../../config/AppConfig';
import { ResManager } from '../resource/ResManager';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { LanguageManager } from '../../../core/i18n/LanguageManager';

/**
 * 進入遊戲及預載的設定介面
 */
export interface IEnterGameConfig {
    /**
     * 遊戲目錄名稱 (例如 'bullsAndCows')
     */
    gameId: string;
    /**
     * entry 預製體路徑
     */
    path: string;
    /**
     * 是否為预制體
     */
    isPrefab?: boolean;
    /**
     * UI 預製體路徑
     */
    uiPrefabPaths?: string[];
    /**
     * 入口元件名稱 (預設為 'Main')
     */
    mainComponent?: string;
}

/**
 * SceneManager - 場景管理器
 */
export class SceneManager {
    /**
     * instance
     */
    private static _instance: SceneManager | null = null;
    /**
     * 遊戲節點
     */
    private _gameRoot: Node | null = null;
    /**
     * 遊戲大廳節點
     */
    private _lobbyRoot: Node | null = null;
    /** 當前運行的遊戲目錄名稱 (用於退出時釋放資源) */
    private _currentGameId: string | null = null;

    /**
     * 私有建構式
     */
    private constructor() {}

    /**
     * 取得 instance
     */
    public static getInstance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance!;
    }

    /**
     * 初始化場景管理器
     * @param gameRoot 遊戲節點
     * @param lobbyRoot 遊戲大廳節點
     */
    public init(gameRoot: Node, lobbyRoot: Node): void {
        this._gameRoot = gameRoot;
        this._lobbyRoot = lobbyRoot;
        log('[Scene] ✅ SceneManager 掛載節點已初始化');
    }

    /**
     * 清除遊戲根節點下所有子節點
     */
    public clearGameRoot(): void {
        if (!this._gameRoot) return;
        this._gameRoot.removeAllChildren();
    }

    /**
     * 進入遊戲
     * @param config 進入遊戲的設定
     * @returns Promise<void>
     */
    public async enterGame(config: IEnterGameConfig): Promise<void> {
        log('[Scene]', `🎮 進入遊戲 (全代碼模式): ${config.gameId}`);

        const overlay = LoadingOverlay.getInstance();
        overlay?.show('資源加載中...');

        try {
            const lang = LanguageManager.getInstance().getLanguage();
            const basePath = `${AppConfig.GAMES_DIR_PREFIX}${config.gameId}`;
            const bundles = [`${basePath}/res/${lang}`, `${basePath}/src`];

            // 1. 加載兩包資源 (res/lang 與 src)
            await ResManager.getInstance().loadGameResources({
                bundleNames: bundles,
                uiPrefabPaths: config.uiPrefabPaths ?? [],
            });

            await overlay?.revealSharp('即將進入遊戲...');

            // 2. 清除舊遊戲並建立新遊戲節點
            this.clearGameRoot();
            const gameNode = new Node('GameScene');

            // 使用字串名稱掛載元件
            const mainComp = config.mainComponent || 'Main';
            gameNode.addComponent(mainComp);

            if (this._gameRoot) this._gameRoot.addChild(gameNode);
            if (this._lobbyRoot) this._lobbyRoot.active = false;

            // 紀錄當前遊戲 ID 以便後續釋放
            this._currentGameId = config.gameId;

            log('[Scene] 🚀 遊戲全代碼初始化完成:', config.gameId);

            overlay?.hide(0.2);
        } catch (err) {
            error('[Scene]', `❌ 進入遊戲失敗: ${config.gameId}`, err);
            overlay?.hide(0);
        }
    }

    /**
     * 返回遊戲大廳
     * @returns Promise<void>
     */
    public async returnToLobby(): Promise<void> {
        log('[Scene] 🏠 返回遊戲大廳 (全代碼初始化模式)');

        this.clearGameRoot();

        // 釋放舊遊戲的資源 Bundle
        if (this._currentGameId) {
            log(`[Scene] 🗑️ 釋放遊戲資源包: ${this._currentGameId}`);
            const lang = LanguageManager.getInstance().getLanguage();
            const basePath = `${AppConfig.GAMES_DIR_PREFIX}${this._currentGameId}`;
            ResManager.getInstance().releaseBundle(`${basePath}/res/${lang}`);
            this._currentGameId = null;
        }

        if (this._lobbyRoot) this._lobbyRoot.active = true;

        if (this._lobbyRoot && this._lobbyRoot.children.length > 0) {
            log('[Scene] ✅ 使用快取大廳 UI');
            return;
        }

        const overlay = LoadingOverlay.getInstance();
        overlay?.show('載入大廳中...');

        try {
            const lang = LanguageManager.getInstance().getLanguage();
            const bundles = [`${AppConfig.BUNDLE_LOBBY}_${lang}`];

            // 1. 加載大廳資源
            await ResManager.getInstance().loadGameResources({
                bundleNames: bundles,
            });

            await overlay?.revealSharp('準備就緒');

            // 2. 動態建立大廳進入點節點
            const lobbyNode = new Node('LobbyScene');

            // 使用動態 import 載入大廳進入點類別，避免使用字串以獲取更好的型別支援
            const { Main } = await import('../../../../bundles/lobby/src/Main');
            lobbyNode.addComponent(Main);

            if (this._lobbyRoot) this._lobbyRoot.addChild(lobbyNode);

            log('[Scene] ✅ 大廳全代碼初始化完成');

            overlay?.hide(0.2);
        } catch (err) {
            error('[Scene] ❌ 載入大廳失敗:', err);
            overlay?.hide(0);
        }
    }

    /**
     * 預載遊戲 Bundle
     * @param config 預載遊戲的設定
     * @returns Promise<void>
     */
    public async preloadGame(config: { bundleName: string }): Promise<void> {
        log('[Scene]', `⏳ 背景預載 Bundle: ${config.bundleName}`);
        await ResManager.getInstance().loadBundleAsync(config.bundleName);
        log('[Scene]', `✅ 背景預載完成: ${config.bundleName}`);
    }
}
