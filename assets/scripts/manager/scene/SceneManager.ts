import { _decorator, Node, instantiate, Prefab } from 'cc';
import { ResManager } from '../resource/ResManager';
import { LogManager } from '../core/LogManager';
import { AppConfig } from '../../config/AppConfig';
import { LoadTaskManager } from './LoadTaskManager';
import { LoadingOverlay } from '../ui/LoadingOverlay';

/**
 * 進入遊戲及預載的設定介面
 */
export interface IEnterGameConfig {
    /** 要載入的資源包名稱 (例如: 'games/bullsAndCows') */
    bundleName: string;
    /** 場景或預製體在該資源包中的相對路徑 */
    path: string;
    /** 是否使用預製體載入模式 (單場景架構為 true) */
    isPrefab?: boolean;
    /** 進入此遊戲需要預載的 UI Prefab 路徑列表（可選）*/
    uiPrefabPaths?: string[];
}

/**
 * SceneManager - 場景管理器
 *
 * 採用並行加載架構（LoadTaskManager）：
 * - Bundle manifest + Entry Prefab + UI Prefabs 全部並行下載
 * - 配合 LoadingOverlay 顯示模糊遮罩 → 載入完成後顯示清晰背景
 */
export class SceneManager {
    private static instance: SceneManager;
    private gameRoot: Node | null = null;
    private lobbyRoot: Node | null = null;

    private constructor() {}

    public static getInstance(): SceneManager {
        if (!this.instance) {
            this.instance = new SceneManager();
        }
        return this.instance;
    }

    /**
     * 初始化場景管理器所需之掛載節點 (由 App 呼叫注入)
     */
    public init(gameRoot: Node, lobbyRoot: Node) {
        this.gameRoot = gameRoot;
        this.lobbyRoot = lobbyRoot;
        LogManager.getInstance().info('Scene', '✅ SceneManager 掛載節點已初始化');
    }

    /**
     * 清理單場景底下所有的遊戲子節點
     */
    public clearGameRoot() {
        if (!this.gameRoot) return;
        this.gameRoot.removeAllChildren();
    }

    // ==========================================
    // 進入遊戲（並行加載 + Loading Overlay）
    // ==========================================

    /**
     * 非同步進入遊戲流程
     * 1. 顯示模糊 Loading 遮罩
     * 2. 並行加載 Bundle + Entry Prefab + UI Prefabs
     * 3. 載入完成後 cross-fade 清晰遮罩 → 實例化 → 淡出
     */
    public async enterGame(config: IEnterGameConfig): Promise<void> {
        LogManager.getInstance().info(
            'Scene',
            `🎮 進入遊戲: ${config.bundleName}, 路徑: ${config.path}`,
        );

        // 1. 立即顯示 loading 遮罩（模糊圖）
        const overlay = LoadingOverlay.getInstance();
        overlay?.show('資源加載中...');

        try {
            // 2. 並行加載（Bundle + Entry Prefab + UI Prefabs）
            const entryPrefab = await LoadTaskManager.execute(
                {
                    bundleName: config.bundleName,
                    entryPrefabPath: config.path,
                    uiPrefabPaths: config.uiPrefabPaths ?? [],
                },
                (progress) => {
                    overlay?.setProgress(progress);
                },
            );

            if (!entryPrefab) {
                throw new Error(`找不到預製體: ${config.path}`);
            }

            // 3. 切換清晰背景圖（cross-fade）
            await overlay?.revealSharp('即將進入遊戲...');

            // 4. 實例化並掛載
            this.clearGameRoot();
            const node = instantiate(entryPrefab);
            if (this.gameRoot) this.gameRoot.addChild(node);
            if (this.lobbyRoot) this.lobbyRoot.active = false;

            LogManager.getInstance().info('Scene', `🚀 遊戲已啟動: ${config.path}`);

            // 5. 淡出 loading 遮罩
            overlay?.hide(0.2);
        } catch (error) {
            LogManager.getInstance().error('Scene', `❌ 進入遊戲失敗: ${config.bundleName}`, error);
            overlay?.hide(0);
        }
    }

    // ==========================================
    // 返回大廳（並行加載 + Loading Overlay）
    // ==========================================

    public async returnToLobby(): Promise<void> {
        LogManager.getInstance().info('Scene', '🏠 返回遊戲大廳');

        this.clearGameRoot();
        if (this.lobbyRoot) this.lobbyRoot.active = true;

        // 大廳已存在快取中，直接返回
        if (this.lobbyRoot && this.lobbyRoot.children.length > 0) {
            LogManager.getInstance().info('Scene', '✅ 使用快取大廳 UI');
            return;
        }

        const overlay = LoadingOverlay.getInstance();
        overlay?.show('載入大廳中...');

        try {
            // 並行加載 lobby bundle + main prefab
            const prefab = await LoadTaskManager.execute(
                {
                    bundleName: AppConfig.BUNDLE_LOBBY,
                    entryPrefabPath: 'prefabs/entry/Main',
                },
                (progress) => overlay?.setProgress(progress),
            );

            if (!prefab) throw new Error('找不到大廳的 Main Prefab');

            // cross-fade 清晰圖
            await overlay?.revealSharp('準備就緒');

            const lobbyNode = instantiate(prefab);
            if (this.lobbyRoot) this.lobbyRoot.addChild(lobbyNode);

            LogManager.getInstance().info('Scene', '✅ 大廳 UI 已載入');

            overlay?.hide(0.2);
        } catch (error) {
            LogManager.getInstance().error('Scene', '❌ 載入大廳 UI 失敗:', error);
            overlay?.hide(0);
        }
    }

    // ==========================================
    // 背景預載（不影響 overlay）
    // ==========================================

    /**
     * 背景預載遊戲 Bundle（在大廳閒置時呼叫）
     */
    public async preloadGame(config: Pick<IEnterGameConfig, 'bundleName'>): Promise<void> {
        LogManager.getInstance().info('Scene', `⏳ 背景預載 Bundle: ${config.bundleName}`);
        await ResManager.getInstance().loadBundleAsync(config.bundleName);
        LogManager.getInstance().info('Scene', `✅ 背景預載完成: ${config.bundleName}`);
    }
}
