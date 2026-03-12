import { _decorator, Component } from 'cc';
import { LogManager } from '../../../scripts/manager/core/LogManager';
import { ResManager } from '../../../scripts/manager/resource/ResManager';
import { LobbyController } from './controller/LobbyController';
import { LobbyModel } from './model/LobbyModel';
import { LobbyView } from './view/LobbyView';

const { ccclass } = _decorator;

/**
 * 大廳模組進入點
 *
 * 初始化序列（與 bullsAndCows/Main.ts 對齊）：
 * onLoad → initAsync()
 *   └── preloadUIResources()  ← 按需預載所有 UI Prefab
 *   └── new LobbyView()       ← 純 TS 類，非 Component
 *   └── view.init()           ← 動態 createComponent 建立面板
 *   └── new LobbyController() → controller.init()
 */
@ccclass('Main')
export class Main extends Component {
    private readonly bundleName = 'lobby';

    /**
     * 大廳 UI Prefab 路徑清單
     * 在建立 LobbyView 前，必須先透過 ResManager.loadPrefabsAsync 載入快取。
     */
    private readonly requiredUIPrefabs = ['prefabs/GameListPanel', 'prefabs/CategoryTabBar'];

    private controller!: LobbyController;
    private model!: LobbyModel;
    private view!: LobbyView;

    protected onLoad(): void {
        this.initAsync();
    }

    private async initAsync(): Promise<void> {
        try {
            LogManager.getInstance().info('Lobby', '⏳ 預載大廳 UI 資源中...');

            await this.preloadUIResources();

            LogManager.getInstance().info('Lobby', '✅ 大廳 UI 資源預載完成，初始化 MVC...');

            this.model = new LobbyModel();
            this.view = new LobbyView(this.node);
            this.view.init();

            this.controller = new LobbyController(this.view, this.model);
            this.controller.init();
        } catch (err) {
            LogManager.getInstance().error('Lobby', '❌ 大廳初始化失敗', err);
        }
    }

    /**
     * 按需預載所有大廳 UI Prefab（並行執行）
     */
    private async preloadUIResources(): Promise<void> {
        await ResManager.getInstance().loadPrefabsAsync(this.bundleName, this.requiredUIPrefabs);
    }

    protected start(): void {
        LogManager.getInstance().info('Lobby', '✨ 大廳模組啟動完成');
    }

    protected onDestroy(): void {
        LogManager.getInstance().info('Lobby', '🧹 大廳模組資源釋放中...');
    }
}
