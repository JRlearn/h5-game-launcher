---
description: UI元件化架構規範 — Prefab + 動態實體化 + BaseUIController，適用於 H5 遊戲啟動器所有子遊戲與大廳模組
---

# UI 元件化架構 Skill

## 核心原則

本專案所有 UI 面板、彈窗、功能區塊，一律遵循以下三條規則：

1. **Prefab 化**：每個 UI 元件必須是獨立的 `.prefab` 檔，在 Cocos Editor 中設計
2. **動態實體化**：透過 `UIManager.createComponent()` + `ResManager` 在 runtime 載入並 `instantiate`
3. **Script 綁定**：每個 Prefab 根節點在 **Cocos Editor 中預先掛上**對應的 `BaseUIController` 子類 Script

---

## 標準架構圖

```
Bundle (games/bullsAndCows)
  └── prefabs/
       ├── GameRoot.prefab      ← 遊戲根 Prefab，掛 Main.ts
       ├── GuessNumPanel.prefab ← 掛 GuessNumPanel.ts
       ├── MenuPanel.prefab     ← 掛 MenuPanel.ts
       ├── Toast.prefab         ← 掛 Toast.ts
       └── ...

GameView (runtime)
  └── root Node (GameRoot 實例)
       ├── GuessNumPanel Node  ← instantiate(GuessNumPanel.prefab)
       ├── MenuPanel Node
       ├── Toast Node
       └── ...
```

---

## 實作步驟

### 1. 在 Cocos Editor 建立 Prefab

```
Prefab 結構範例（MenuPanel）：

MenuPanel (Node)        ← 根節點：掛上 MenuPanel.ts
├── Background (Sprite)
├── Title (Label)
├── StartBtn (Button)
└── QuitBtn (Button)
```

- 根節點名稱 = Prefab 檔名 = Script class 名稱（三者一致）
- 根節點在 Editor 中直接掛上對應 Script

### 2. 繼承 BaseUIController 撰寫 Script

```typescript
import { _decorator } from 'cc';
import { BaseUIController } from '../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

@ccclass('MenuPanel')
export class MenuPanel extends BaseUIController {
    public onStartBtnClick: (() => void) = () => {};
    public onQuitBtnClick: (() => void) = () => {};

    // init() 由 GameView 呼叫，在所有 Prefab 加載完後執行
    public override init(): void {
        super.init(); // → node.active = false + collectViews()

        this.bindButtonEvent('MenuPanel/StartBtn', () => this.onStartBtnClick());
        this.bindButtonEvent('MenuPanel/QuitBtn', () => this.onQuitBtnClick());
    }
}
```

**BaseUIController 提供的工具方法：**

| 方法 | 用途 |
|------|------|
| `getNode(path)` | 取得指定路徑的 Node |
| `getLabel(path)` | 取得 Label 元件 |
| `getButton(path)` | 取得 Button 元件 |
| `getSprite(path)` | 取得 Sprite 元件 |
| `getEditBox(path)` | 取得 EditBox 元件 |
| `bindButtonEvent(path, cb)` | 綁定按鈕點擊事件 |
| `show()` / `hide()` | 顯示/隱藏節點 |

路徑規則：`節點名/子節點名/...`（從根節點開始，含根節點名）

### 3. 在 GameView 加入 createComponent

```typescript
// GameView.ts
this.menuPanel = this.createComponent('MenuPanel', MenuPanel);
this.menuPanel.init();
this.addChild(this.menuPanel);
```

`createComponent` 內部流程：
```
UIManager.createComponent(bundleName, 'MenuPanel', MenuPanel)
  └── ResManager.getPrefabFromBundle()   // 從快取取 Prefab
  └── instantiate(prefab)                // 動態實體化節點
  └── node.getComponent(MenuPanel)       // 取出 Editor 中已掛好的 Script
  └── return MenuPanel 實例
```

### 4. 在 Main.ts preload 後再 init

```typescript
// Main.ts - initAsync()
await this.preloadUIResources();          // loadPrefabsAsync 全部 Prefab
this.view = new GameView(this.node);
this.view.init();                         // 此時快取已有所有 Prefab，同步執行
```

---

## 命名規範

| 類型 | 規範 | 範例 |
|------|------|------|
| Prefab 檔名 | PascalCase，功能性名稱 | `MenuPanel.prefab` |
| Script 檔名 | 同 Prefab 名稱 | `MenuPanel.ts` |
| `@ccclass` 名稱 | 同 Script 類別名 | `@ccclass('MenuPanel')` |
| Prefab 存放路徑 | `prefabs/` 或 `prefabs/子目錄/` | `prefabs/GuessNumPanel.prefab` |
| Script 存放路徑 | `scripts/components/功能名/` | `scripts/components/menuPanel/MenuPanel.ts` |

---

## 常見問題 / 注意事項

### Q: Script 要在 Editor 掛，還是 runtime addComponent？

**一律在 Editor 掛**。`UIManager.createComponentFromBundle` 使用 `getComponent`（不是 `addComponent`）取出已掛好的 Script。

若在 runtime 動態 `addComponent`，Cocos 會重新執行 `onLoad`，可能與 Prefab 節點樹衝突。

### Q: 路徑字串怎麼確認？

`collectViews` 從根節點開始遞迴，路徑格式為：
```
根節點名/子節點名/孫節點名
```
範例：`GuessNumPanel/InputArea/InputField`

Debug 方式：在 `init()` 中暫時 `console.log(Object.keys(this.views))` 確認所有路徑。

### Q: Prefab 的 bundle 路徑怎麼給？

存放於 `games/bullsAndCows/prefabs/MenuPanel.prefab` 時，
`loadPrefabAsync` 路徑為 `'prefabs/MenuPanel'`（Bundle 內相對路徑，不含副檔名）。

### Q: 錯誤：`找不到預製體 XXX in bundle YYY`

原因：`loadPrefabAsync` 未執行或路徑錯誤。
檢查順序：
1. `REQUIRED_UI_PREFABS` 中的路徑字串是否正確
2. 實際檔案是否在 Bundle 目錄下
3. `preloadUIResources()` 是否在 `view.init()` 之前 await 完成

---

## 完整型別簽名速查

```typescript
// UIManager
createComponent<T extends BaseUIController>(
    bundleName: string,
    prefabName: string,   // 檔名不含副檔名，對應快取 key
    componentClass: new () => T,
): T

// ResManager
loadPrefabAsync(bundleName: string, path: string): Promise<Prefab | null>
loadPrefabsAsync(bundleName: string, paths: string[]): Promise<void>
getPrefabFromBundle(bundleName: string, name: string): Prefab | null

// BaseUIController
init(): void                           // 需子類 override 並呼叫 super.init()
show(): void
hide(): void
getNode(path: string): Node | undefined
getLabel(path: string): Label | undefined
bindButtonEvent(path: string, cb: () => void): void
```
