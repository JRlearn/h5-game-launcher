import { _decorator, Component, Node } from 'cc';
import { SlotController } from './controller/SlotController';
import { SlotModel } from './model/SlotModel';
import { SlotView } from './view/SlotView';

const { ccclass } = _decorator;

/**
 * SlotMaster - 遊戲入口點
 */
@ccclass('SlotMain')
export class SlotMain extends Component {
    private controller!: SlotController;
    private model!: SlotModel;
    private view!: SlotView;

    protected onLoad(): void {
        this._initMVC();
    }

    private _initMVC(): void {
        this.model = new SlotModel();

        // 傳入 this.node 作為此子遊戲的 UI 根節點
        this.view = new SlotView(this.node);
        this.view.init();

        this.controller = new SlotController(this.view, this.model);
        this.controller.init();
    }

    protected start(): void {
        this.controller.startGame();
    }

    protected onDestroy(): void {
        this.controller.cleanup();
    }
}
