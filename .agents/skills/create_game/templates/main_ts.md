# 子遊戲入口 (Main.ts) 模板

```typescript
import { _decorator, Node } from 'cc';
import { EntryBase } from '../../../../core/game/base/entry/EntryBase';
import { GameController } from './controller/GameController';
import { GameModel } from './model/GameModel';
import { GameView } from './view/GameView';

const { ccclass } = _decorator;

/**
 * [GameId] - 遊戲入口點
 * 繼承 EntryBase 以標準化生命週期與 MVC 綁定
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

    /**
     * 加載 Bundle 特有資源
     */
    protected async onLoadResources(): Promise<void> {
        // 範例：加載音效、圖集或進入遊戲前的重度資源
        // await ResManager.getInstance().loadBundleRes('[BundleName]', 'textures/main/spriteFrame');
    }

    /**
     * 資源加載完畢且 MVC 初始化後的啟動點
     */
    protected onGameStart(): void {
        // 可以在此處處理 Controller 開始前的最後準備 (例如網格初始化)
        this.controller.startGame();
    }
}
```
