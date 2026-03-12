# UI 元件化架構規範 (Code-only UI 版本)

## 1. 架構核心規則

為了提高開發效率、簡化版本控制並增強佈局的動態性，本專案全面轉向 **Code-only UI** 架構。

| 規則 | 說明 |
|------|------|
| **純程式碼構建** | 所有 UI 元件不再依賴 Editor 中的 Prefab 檔案，改由 Script 動態建立。 |
| **職責對稱** | 每個 UI 面板（Panel）都有一個對應的 `BaseUIController` 子類別。 |
| **資料驅動** | UI 狀態由資料（Model）決定，透過 `setup()` 或 `render()` 方法更新顯示。 |
| **目錄一致性** | 腳本結構與大廳/遊戲 bundle 結構完全對齊。 |

---

## 2. 完整開發流程

```
┌─────────────────── 初始化階段 (Sync) ────────────────────┐
│  View.init()                                            │
│    └── createComponentOnly('MenuPanel', MenuPanel)      │
│          └── UIManager.createComponentOnly()            │
│                ├── new Node('MenuPanel')                │
│                └── addComponent(MenuPanel)              │
├─────────────────── 構建階段 (Sync/Async) ────────────────┤
│  MenuPanel.onLoad()                                     │
│    └── initUI()                                         │
│          ├── 建立 Background (Sprite)                   │
│          ├── 建立 內容容器 (Layout)                      │
│          └── 建立 各種元件 (Label, Button, etc.)          │
├─────────────────── 綁定階段 (Sync) ──────────────────────┤
│  Controller 管理邏輯                                     │
│    └── 為 Panel 注入事件回調 (onStartClick, etc.)         │
└─────────────────── 數據渲染 (Data-Driven) ───────────────┘
     └── panel.setup(data) -> 更新 Label.string / Sprite
```

---

## 3. 目錄結構

```
assets/bundles/games/[GameName]/
├── scripts/
│   ├── Main.ts                  ← 注入點，管理 MVC init
│   ├── view/
│   │   └── GameView.ts          ← 建立並持有所有 UI 實體
│   ├── controller/
│   │   └── GameController.ts    ← 處理業務邏輯與介面互動
│   ├── model/
│   │   └── GameModel.ts         ← 儲存遊戲狀態與數據
│   └── components/              ← UI 組件 (Panels / Items)
│       ├── menuPanel/
│       │   └── MenuPanel.ts     ← 包含 initUI() 生成邏輯
│       └── ...
└── textures/                    ← 僅存儲必要的素材 (SpriteFrames)，而非 Prefabs
```

---

## 4. 標準 Code-only Script 範本

```typescript
import { _decorator, Node, Label, Sprite, Color, UITransform, Button } from 'cc';
import { BaseUIController } from '../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

@ccclass('MenuPanel')
export class MenuPanel extends BaseUIController {
    // 1. 內部組件引用（不再使用 @property）
    private titleLabel!: Label;

    // 2. 暴露事件回調
    public onStartClick: () => void = () => {};

    public override init(): void {
        super.init(); // 執行基礎初始化 (如節點隱藏等)
    }

    protected onLoad(): void {
        this.initUI(); // 3. 在載入時動態構建介面
    }

    /**
     * 【核心】程式碼構建 UI 結構
     */
    private initUI(): void {
        const trans = this.getOrAddComponent(this.node, UITransform);
        trans.setContentSize(1280, 720);

        // 建立標題
        const titleNode = new Node('Title');
        const titleTrans = titleNode.addComponent(UITransform);
        titleTrans.setPosition(0, 200);
        this.titleLabel = titleNode.addComponent(Label);
        this.titleLabel.string = '程式碼生成的大廳';
        this.node.addChild(titleNode);

        // 建立按鈕
        this.createSimpleButton('StartBtn', '開始遊戲', 0, 0, () => this.onStartClick());
    }

    /** 輔助工具：建立簡單按鈕 */
    private createSimpleButton(name: string, text: string, x: number, y: number, cb: () => void): void {
        const btnNode = new Node(name);
        btnNode.setPosition(x, y);
        btnNode.addComponent(UITransform).setContentSize(200, 60);
        
        // 背景
        const sprite = btnNode.addComponent(Sprite);
        sprite.color = Color.GRAY;

        // 文字
        const labelNode = new Node('Label');
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 24;
        btnNode.addChild(labelNode);

        // 點擊事件
        btnNode.on(Node.EventType.TOUCH_END, cb, this);
        this.node.addChild(btnNode);
    }
}
```

---

## 5. 為什麼選擇 Code-only UI？

| 優點 | 說明 |
|------|------|
| **易於協作** | 介面邏輯都在 `.ts` 檔案中，GitHub 預覽 Diff 非常清晰，避免 Prefab 衝突。 |
| **動態性強** | 根據不同解析度或數據狀態，在程式碼中靈活調整寬高與間距。 |
| **極速迭代** | 不用在 Editor 與 IDE 之間頻繁切換。 |
| **減少載入時間** | 省去載入大型 Prefab JSON 的解析過程，直接執行指令建立節點。 |

---

## 6. 新增 UI 元件 Checklist (Code-only)

- [ ] 在 `scripts/components/功能名/` 下建立 `.ts` 腳本，繼承 `BaseUIController`
- [ ] 實作 `initUI()` 方法，使用 `new Node()` 與 `addComponent` 構建結構
- [ ] 在 `View` 層（如 `LobbyView`）使用 `this.createComponentOnly()` 建立實體
- [ ] 在 `Controller` 層注入需要的業務邏輯回調
- [ ] (選填) 若有重複使用的 UI 樣式，封裝於 `BaseUIController` 的輔助方法中
