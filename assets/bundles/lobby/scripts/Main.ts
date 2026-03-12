import { _decorator, Component } from 'cc';
import { LobbyController } from './controller/LobbyController';
import { LobbyModel } from './model/LobbyModel';
import { LobbyView } from './view/LobbyView';

const { ccclass } = _decorator;

/**
 * 大廳模組進入點 (LobbyMain)
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
    private controller!: LobbyController;
    private model!: LobbyModel;
    private view!: LobbyView;

    protected onLoad(): void {
        this.initAsync();
    }

    private async initAsync(): Promise<void> {
        try {
            this.model = new LobbyModel();
            this.view = new LobbyView(this.node);
            this.view.init();

            this.controller = new LobbyController(this.view, this.model);
            this.controller.init();
        } catch (err) {}
    }

    protected start(): void {
        this.node.name = 'LobbyScene';
    }

    protected onDestroy(): void {}
}
