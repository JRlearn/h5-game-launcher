import { _decorator, Component } from 'cc';
import { GameController } from './controller/GameController';
import { GameModel } from './model/GameModel';
import { GameView } from './view/GameView';
import { WebSocketManager } from '../../../../scripts/manager/network/WebSocketManager';
import { ResManager } from '../../../../scripts/manager/resource/ResManager';
import { LogManager } from '../../../../scripts/manager/core/LogManager';

const { ccclass } = _decorator;

/** Bundle 名稱 */
const BUNDLE_NAME = 'games/bullsAndCows';

/**
 * 此遊戲需要的所有 UI Prefab 路徑（Bundle 內相對路徑）
 * 在建立 GameView 前，必須先透過 ResManager.loadPrefabsAsync 載入快取，
 * 否則 GameView.init() 中的 createComponent 會因快取為空而失敗。
 */
const REQUIRED_UI_PREFABS = [
    'prefabs/GuessNumPanel',
    'prefabs/LaLaKeyboardPanel',
    'prefabs/MenuPanel',
    'prefabs/CreateGamePanel',
    'prefabs/JoinGamePanel',
    'prefabs/SetupGuessPanel',
    'prefabs/ResultPanel',
    'prefabs/Toast',
    'prefabs/WaitingMask',
];

/**
 * 遊戲模組進入點（bullsAndCows）
 *
 * 初始化序列：
 * onLoad → initAsync()
 *   └── preloadUIResources()   ← 按需預載所有 UI Prefab（並行）
 *   └── new GameView()         ← Prefab 皆已在快取，同步建立
 *   └── controller.init()
 *   └── conectToServer()
 *   └── controller.start()
 */
@ccclass('Main')
export class Main extends Component {
    private controller!: GameController;
    private model!: GameModel;
    private view!: GameView;

    protected onLoad(): void {
        this.initAsync();
    }

    private async initAsync(): Promise<void> {
        try {
            LogManager.getInstance().info('BullsAndCows', '⏳ 預載 UI 資源中...');

            await this.preloadUIResources();

            LogManager.getInstance().info('BullsAndCows', '✅ UI 資源預載完成，初始化 MVC...');

            this.model = new GameModel();
            this.view = new GameView(this.node);
            this.view.init();

            this.controller = new GameController(this.view, this.model);
            this.controller.init();

            this.conectToServer();
            this.controller.start();
        } catch (err) {
            LogManager.getInstance().error('BullsAndCows', '❌ 遊戲初始化失敗', err);
        }
    }

    /**
     * 按需預載所有 UI Prefab（並行執行）
     * Bundle 在 SceneManager.enterGame 時已完成 manifest 載入，
     * 這裡直接對各 Prefab 路徑發出並行下載請求並寫入快取。
     */
    private async preloadUIResources(): Promise<void> {
        await ResManager.getInstance().loadPrefabsAsync(BUNDLE_NAME, REQUIRED_UI_PREFABS);
    }

    private conectToServer(): void {
        LogManager.getInstance().info('BullsAndCows', '🔌 連接到伺服器...');
        WebSocketManager.getInstance().register(
            'bullsAndCows',
            'ws://127.0.0.1:8082',
            this.controller,
        );
    }
}
