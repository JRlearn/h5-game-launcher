# 子遊戲 MVC 基礎模組模板

## 1. Model (GameModel.ts)
```typescript
export class GameModel {
    public score: number = 0;
    // ... 定義資料結構與介面
}
```

## 2. View (GameView.ts)
```typescript
import { ViewBase } from '../../../../scripts/core/base/mvc/view/ViewBase';

export class GameView extends ViewBase {
    public override init(): void {
        // 使用 NodeFactory 或 UIManager 建立 UI
        // this.root 是子遊戲的 Node
    }
}
```

## 3. Controller (GameController.ts)
```typescript
import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';

export class GameController {
    constructor(private view: GameView, private model: GameModel) {}

    public init(): void {
        // 綁定事件或初始化狀態
    }

    public startGame(): void {
        // 遊戲開始邏輯
    }

    public cleanup(): void {
        // 清除監聽或狀態
    }
}
```
