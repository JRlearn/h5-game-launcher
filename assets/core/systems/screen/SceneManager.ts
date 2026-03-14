import { Node, log, error, AssetManager, Prefab, instantiate } from 'cc';
import { AppConfig } from '../../../app/config/Config';
import { ResManager } from '../resource/ResManager';
import { LoadingOverlay } from '../../../app/ui/LoadingOverlay';
import { LanguageManager } from '../language/LanguageManager';
import { EntryBase } from '../../game/base/entry/EntryBase';
import { GameSandbox } from '../../game/sandbox/GameSandbox';

/**
 * SceneManager - 場景管理器
 * 負責處理大廳與子遊戲之間的場景導航、資源生命週期控管及轉場動畫。
 */
export class SceneManager {
    private static _instance: SceneManager | null = null;

    private _gameRoot: Node | null = null;
    private _lobbyRoot: Node | null = null;
    private _currentGameId: string | null = null;

    /**
     * 獲取單例實例
     */
    public static getInstance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance!;
    }

    private constructor() {}

    /**
     * 初始化管理器
     * @param gameRoot 遊戲掛載點
     * @param lobbyRoot 大廳掛載點
     */
    public init(gameRoot: Node, lobbyRoot: Node): void {
        this._gameRoot = gameRoot;
        this._lobbyRoot = lobbyRoot;
        log('[SceneManager] ✅ 初始化場景根節點完成');
    }

    /** ---------------------- 公開 API ---------------------- */

    /**
     * 進入指定的子遊戲
     * @param config 進入配置
     */
    public async enterGame(gameId: string): Promise<void> {
        const overlay = LoadingOverlay.getInstance();
        overlay?.show('資源載入中...');

        try {
            await overlay?.revealSharp('初始化物件...');
            this._showLobby(false);
            this._clearNode(this._gameRoot);

            // 1. 加載遊戲 Bundle (含程式碼與 Prefab)
            const bundle = await this.preloadBundle(`${gameId}_src`);
            if (!bundle) throw new Error(`[SceneManager] ❌ 載入遊戲 Bundle 失敗: ${gameId}`);

            // 2. 加載入口 Prefab
            bundle.load('Main', Prefab, async (err, prefab) => {
                if (err) {
                    error(`[SceneManager] ❌ 載入入口 Prefab (Main) 失敗:`, err);
                    overlay?.hide(0);
                    return;
                }

                // 3. 實例化沙盒並啟動
                const sandboxNode = new Node(`${gameId}_Sandbox`);
                this._gameRoot!.addChild(sandboxNode);
                const sandbox = sandboxNode.addComponent(GameSandbox);

                const sceneNode = instantiate(prefab);
                sceneNode.name = 'GameScene';
                sandboxNode.addChild(sceneNode);

                this._currentGameId = gameId;
                await sandbox.bootstrap(gameId, sceneNode);

                overlay?.hide(0.3);
                log(`[SceneManager] ✅ 成功進入遊戲沙盒：${gameId}`);
            });
        } catch (err) {
            error(`[SceneManager] ❌ 場景切換失敗 (${gameId})：`, err);
            overlay?.hide(0);
        }
    }

    /**
     * 返回遊戲大廳
     */
    public async returnToLobby(): Promise<void> {
        log('[SceneManager] 🏠 執行返回大廳流程');
        this._releaseCurrentGameResources();

        if (this._lobbyRoot && this._lobbyRoot.children.length > 0) {
            this._showLobby(true);
            this._clearNode(this._gameRoot); // This will destroy the sandbox node and its children
            log('[SceneManager] ✅ 從快取中恢復大廳');
            return;
        }

        const overlay = LoadingOverlay.getInstance();
        overlay?.show('資源載入中...');

        try {
            await overlay?.revealSharp('初始化物件...');
            this._showLobby(true);
            this._clearNode(this._gameRoot); // This will destroy the sandbox node and its children

            // 1. 加載大廳 Bundle
            const bundleName = 'lobby_src';
            const bundle = await this.preloadBundle(bundleName);
            if (!bundle) throw new Error('[SceneManager] ❌ 載入大廳 Bundle 失敗');

            // 2. 加載入口 Prefab
            bundle.load('Main', Prefab, async (err, prefab) => {
                if (err) {
                    error(`[SceneManager] ❌ 載入大廳入口 Prefab 失敗`, err);
                    overlay?.hide(0);
                    return;
                }

                // 3. 實例化並啟動
                const sceneNode = instantiate(prefab);
                sceneNode.name = 'LobbyScene';
                this._lobbyRoot!.addChild(sceneNode);

                const comp = sceneNode.getComponent(EntryBase);
                if (comp) {
                    await comp.bootstrapAsync();
                }

                overlay?.hide(0.3);
                log('[SceneManager] ✅ 大廳初始化完成');
            });
        } catch (err) {
            error(`[SceneManager] ❌ 場景切換失敗：Lobby`, err);
            overlay?.hide(0);
        }
    }

    /**
     * 靜態預載 Bundle
     */
    public async preloadBundle(name: string): Promise<AssetManager.Bundle | null> {
        return await ResManager.getInstance().loadBundleAsync(name);
    }

    /**
     * 釋放目前遊戲佔用的資源
     */
    private _releaseCurrentGameResources(): void {
        if (!this._currentGameId) return;

        const lang = LanguageManager.getInstance().getLanguage();
        const resMgr = ResManager.getInstance();

        log(`[SceneManager] 🗑️ 正在清空資源：${this._currentGameId}`);

        // 1. 釋放入口代碼與 Prefab Bundle (對應 enterGame 中的 preloadBundle)
        resMgr.releaseBundle(`${this._currentGameId}_src`);

        // 2. 釋放多國語系資源 Bundle (對應 Subgame Main.ts 中的 onLoadResources)
        // 此處命名規則暫與各遊戲 Config 保持一致 (e.g., stormOfSeth_res_zh-TW)
        resMgr.releaseBundle(`${this._currentGameId}_res_${lang}`);

        this._currentGameId = null;
    }

    /**
     * 切換大廳與遊戲根節點的顯示狀態
     */
    private _showLobby(show: boolean): void {
        const isLobby = show;
        if (this._lobbyRoot) this._lobbyRoot.active = isLobby;
        if (this._gameRoot) this._gameRoot.active = !isLobby;
    }

    /**
     * 清空節點內容並銷毀子節點
     */
    private _clearNode(node: Node | null): void {
        if (node) {
            node.children.forEach((child) => {
                child.destroy();
            });
            node.removeAllChildren();
        }
    }

    // 已改用 Prefab 加載模式，原 getGameEntry 方法已移除。
}
