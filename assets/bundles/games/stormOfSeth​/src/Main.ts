import { _decorator, Component } from 'cc';
import { GameController } from './controller/GameController';
import { GameModel } from './model/GameModel';
import { GameView } from './view/GameView';

const { ccclass } = _decorator;

/**
 * SlotMaster - 遊戲入口點
 */
@ccclass('Main')
export class Main extends Component {
    private controller!: GameController;
    private model!: GameModel;
    private view!: GameView;

    protected onLoad(): void {
        this._initMVC();
    }

    private _initMVC(): void {
        this.model = new GameModel();

        // 傳入 this.node 作為此子遊戲的 UI 根節點
        this.view = new GameView(this.node);
        this.view.init();

        this.controller = new GameController(this.view, this.model);
        this.controller.init();
    }

    protected start(): void {
        this.controller.startGame();
    }

    protected onDestroy(): void {
        this.controller.cleanup();
    }
}
