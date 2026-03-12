import { _decorator, Node, instantiate, log, error } from 'cc';
import { AppConfig } from '../../../../config/AppConfig';
import { ResManager } from '../../resource/ResManager';
import { LoadingOverlay } from '../LoadingOverlay';
import { LoadTaskManager } from './LoadTaskManager';

/**
 * 進入遊戲及預載的設定介面
 */
export interface IEnterGameConfig {
    /**
     * bundle 名稱
     */
    bundleName: string;
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
}

/**
 * SceneManager - 場景管理器
 */
export class SceneManager {
    /**
     * instance
     */
    private static _instance: SceneManager;
    /**
     * 遊戲節點
     */
    private _gameRoot: Node | null = null;
    /**
     * 遊戲大廳節點
     */
    private _lobbyRoot: Node | null = null;

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
        return this._instance;
    }

    /**
     * 初始化
     * @param gameRoot 遊戲節點
     * @param lobbyRoot 遊戲大廳節點
     */
    public init(gameRoot: Node, lobbyRoot: Node) {
        this._gameRoot = gameRoot;
        this._lobbyRoot = lobbyRoot;
        log('[Scene] ✅ SceneManager 掛載節點已初始化');
    }

    /**
     * 清除遊戲節點
     */
    public clearGameRoot() {
        if (!this._gameRoot) return;
        this._gameRoot.removeAllChildren();
    }

    /**
     * 進入遊戲
     * @param config 進入遊戲的設定
     * @returns Promise<void>
     */
    public async enterGame(config: IEnterGameConfig): Promise<void> {
        log('[Scene]', `🎮 進入遊戲 (全代碼模式): ${config.bundleName}`);

        const overlay = LoadingOverlay.getInstance();
        overlay?.show('資源加載中...');

        try {
            // 1. 僅加載 Bundle 與額外 UI Prefabs (不加載 Entry Prefab)
            await LoadTaskManager.execute({
                bundleName: config.bundleName,
                uiPrefabPaths: config.uiPrefabPaths ?? [],
            });

            await overlay?.revealSharp('即將進入遊戲...');

            // 2. 清除舊遊戲並建立新遊戲節點
            this.clearGameRoot();
            const gameNode = new Node('GameScene');
            
            // 使用字串名稱掛載元件 (子遊戲入口統一約定為 'Main')
            gameNode.addComponent('Main');

            if (this._gameRoot) this._gameRoot.addChild(gameNode);
            if (this._lobbyRoot) this._lobbyRoot.active = false;

            log('[Scene] 🚀 遊戲全代碼初始化完成:', config.bundleName);

            overlay?.hide(0.2);
        } catch (err) {
            error('[Scene]', `❌ 進入遊戲失敗: ${config.bundleName}`, err);
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
        if (this._lobbyRoot) this._lobbyRoot.active = true;

        if (this._lobbyRoot && this._lobbyRoot.children.length > 0) {
            log('[Scene] ✅ 使用快取大廳 UI');
            return;
        }

        const overlay = LoadingOverlay.getInstance();
        overlay?.show('載入大廳中...');

        try {
            // 1. 僅加載 Bundle，不加載 Prefab
            await LoadTaskManager.execute({
                bundleName: AppConfig.BUNDLE_LOBBY,
            });

            await overlay?.revealSharp('準備就緒');

            // 2. 動態建立大廳進入點節點
            const lobbyNode = new Node('LobbyScene');

            // 使用字串名稱掛載元件以達成「按需載入」及「解耦」
            // 只要 Lobby Bundle 已加載，引擎就會自動從類別註冊表中找到 'LobbyMain'
            lobbyNode.addComponent('Main');

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
    public async preloadGame(config: Pick<IEnterGameConfig, 'bundleName'>): Promise<void> {
        log('[Scene]', `⏳ 背景預載 Bundle: ${config.bundleName}`);
        await ResManager.getInstance().loadBundleAsync(config.bundleName);
        log('[Scene]', `✅ 背景預載完成: ${config.bundleName}`);
    }
}
