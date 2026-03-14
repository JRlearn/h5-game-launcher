import { _decorator, Node } from 'cc';
import { EntryBase } from '../../../../core/game/base/entry/EntryBase';
import { GameController } from './controller/GameController';
import { GameModel } from './model/GameModel';
import { GameView } from './view/GameView';

const { ccclass } = _decorator;

/**
 * stormOfSeth - 遊戲入口點
 */
@ccclass('Main')
export class Main extends EntryBase<GameView, GameModel, GameController> {
    protected createModel(): GameModel {
        return new GameModel();
    }

    protected createView(node: Node): GameView {
        return new GameView(node);
    }

    protected createController(view: GameView, model: GameModel): GameController {
        return new GameController(view, model);
    }

    // 注意：原本的 view.gridManager.init(col, row) 需要被安插在初始化流程中
    // 由於我們改用 EntryBase 架構，這裡利用覆寫來處理特殊的 View 初始化需求
    protected async onLoadResources(): Promise<void> {
        // 若有需預載的特有資源可放置於此
    }

    protected onGameStart(): void {
        // 確保在 View 初始化後，Controller 啟動前設定網格
        if (this.view.gridManager && this.model) {
            this.view.gridManager.init(this.model.COLUMN_COUNT, this.model.ROW_COUNT);
        }

        // 進入遊戲主循環
        this.controller.startGame();
    }
}
