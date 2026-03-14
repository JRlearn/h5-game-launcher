# 子遊戲 MVC 基礎模組模板

## 1. Model (GameModel.ts)
```typescript
export class GameModel {
    /** 範例：列數 */
    public readonly COLUMN_COUNT = 5;
    /** 範例：行數 */
    public readonly ROW_COUNT = 5;

    public balance: number = 0;
    public currentWin: number = 0;
    public isSpinning: boolean = false;

    // ... 定義資料結構與業務規則
}
```

## 2. View (GameView.ts)
```typescript
import { Node, Layers, UITransform } from 'cc';
import { ViewBase } from '../../../../core/game/base/mvc/view/ViewBase';

/**
 * 視圖層 - 負責 UI 生成與動畫表現
 * 遵循 cocos_ui_generator 全代碼規範
 */
export class GameView extends ViewBase {
    
    public override init(): void {
        this._buildUI();
    }

    private _buildUI(): void {
        const trans = this.getUITransform();
        trans.setContentSize(720, 1280); // 以設計解析度為準

        // 依序構建子節點
        // this.root.addChild(this._createBackground());
    }

    // 實作私有 _createXXXX 方法...
}
```

## 3. Controller (GameController.ts)
```typescript
import { log } from 'cc';
import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';

/**
 * 控制器 - 業務邏輯中樞
 */
export class GameController {
    constructor(private view: GameView, private model: GameModel) {}

    public init(): void {
        log('[GameController] 初始化');
        // 初始化狀態、訂閱同步 UI
    }

    public async startGame(): Promise<void> {
        // 設定 View 回調，啟動遊戲循環
        // this.view.onSpinClick = () => this.spin();
    }

    public cleanup(): void {
        // 清理監聽
    }
}
```
