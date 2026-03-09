---
description: 在項目中為新的 UI 組件創建 MVC 模板代碼的工作流。
---

# 工作流：創建 MVC UI 模板

使用此工作流快速生成特定 bundle 中新 UI 所需的 Controller、Model、View 以及 Component 腳本。

## 參數
*   `BUNDLE_PATH`: 指向該 bundle 的 `scripts` 目錄的絕對或相對路徑（例如：`assets/bundles/games/slot/scripts`）。
*   `MODULE_NAME`: UI 模組的名稱，首字母大寫（例如：`Login`, `Inventory`, `Settings`）。

## 步驟

1.  **定位目標目錄**:
    確保 `BUNDLE_PATH` 存在，且包含 `/components`、`/controller`、`/model` 與 `/view` 子目錄。

2.  **創建腳本: [MODULE_NAME]Script.ts**:
    在 `BUNDLE_PATH/components/[MODULE_NAME]Script.ts` 創建文件。
    *   此腳本應為繼承自 `Component` 的 `@ccclass('[MODULE_NAME]Script')`。
    *   它是 Prefab `[MODULE_NAME]UI` 的掛載點。
    *   它應在其 `onLoad` 或 `start` 方法中實例化 Controller。

3.  **創建模型: [MODULE_NAME]Model.ts**:
    在 `BUNDLE_PATH/model/[MODULE_NAME]Model.ts` 創建文件。
    *   定義該 UI 的數據結構。
    *   儘可能不依賴 `cc` 模組的導入。

4.  **創建視圖: [MODULE_NAME]View.ts**:
    在 `BUNDLE_PATH/view/[MODULE_NAME]View.ts` 創建文件。
    *   此類別負責更新可視元素（Nodes, Labels, Sprites）。
    *   它通常透過構造函數或 `init(node: Node)` 方法獲取 `[MODULE_NAME]Script` 的 `Node` 引用。

5.  **創建控制器: [MODULE_NAME]Controller.ts**:
    在 `BUNDLE_PATH/controller/[MODULE_NAME]Controller.ts` 創建文件。
    *   此類別連接 View 與 Model。
    *   它負責實例化 Model 與 View。
    *   它處理（從 View/Component 傳遞過來的）按鈕點擊事件，並透過網絡組件或 Model 更新數據。
