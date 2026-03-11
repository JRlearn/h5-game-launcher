---
description: Cocos Creator 3.8.8 TypeScript 與 MVC 架構指南（H5 遊戲啟動器）
---

# Cocos Creator 3.8.8 H5 遊戲啟動器開發技能

在參與此項目開發時，請務必嚴格遵守以下準則。本項目使用 Cocos Creator 3.8.8，並為其 H5 子遊戲和大廳系統採用了嚴格的 MVC 資料夾結構。

## 1. Cocos Creator 3.8.8 編碼規範

*   **僅限 TypeScript**: 所有腳本必須使用 TypeScript (`.ts`) 編寫。
*   **現代 CC 3.x API**:
    *   **不要使用** CC 2.x 的屬性，如 `node.x`, `node.y`, `node.width`, `node.height`, `node.opacity`, `node.color`, `node.parent`。
    *   **請使用** `node.setPosition(x, y, z)`, `node.position.x`, `node.getComponent(UITransform).setContentSize(w, h)`, `node.getComponent(UIOpacity).opacity = 255`, `node.getComponent(Sprite).color = new Color(...)`。
    *   設置父節點：`childNode.setParent(parentNode)`。插入子節點：`parentNode.addChild(childNode)`。
*   **組件裝飾器 (Decorators)**: 務必使用 `@ccclass('ClassName')` 以及對應的 `@property` 裝飾器來定義編輯器變數。
*   **解構導入**: 優先使用 `import { Node, Prefab, instantiate, Sprite, Color, UITransform, UIOpacity } from 'cc';`

## 2. 項目架構與命名慣例

本項目將邏輯劃分為 **Controller (控制層)**、**Model (模型層)**、**View (視圖層)**、**System Managers (系統管理器)** 以及 **Network (網絡層)**。

### Bundle 結構
*   **公共資源 (Common Resources)**: `/assets/bundles/common`
*   **大廳 (Lobby)**: `/assets/bundles/lobby`
*   **子遊戲 (Subgames)**: `/assets/bundles/games/gameName` (例如：`game1`, `gameN`)。新的子遊戲是從 `/assets/bundles/games/template` 複製而來。

### 組件命名規則
*   **UI Prefabs**: 必須以 `UI` 結尾（例如：`LoginUI.prefab`, `PokerUI.prefab`）。
*   **掛載在 Prefab 上的組件/腳本**: 必須與 Prefab 名稱一致但以 `Script` 結尾（例如：`LoginScript.ts`, `PokerScript.ts`）。請將這些文件存放在該 bundle 的 `/scripts/components/` 資料夾內。
*   **入口場景 (Entry Scene)**: 任何子遊戲或大廳的主要入口場景必須準確命名為 `Scene.scene`。
*   **入口腳本 (Entry Script)**: 掛載在 `Scene` 上的腳本必須命名為 `Main.ts`。

### MVC 劃分規則
構建新的 UI 模組時，必須拆分為：
1.  **View (`xxxView.ts`)**: 負責底層 Cocos UI 操作（獲取節點、設置標籤、播放 Spine 動畫等）。**嚴禁包含業務邏輯**。
2.  **Model (`xxxModel.ts`)**: 負責數據結構、狀態定義，並發送數據更新事件。儘可能**不要導入 'cc' (Cocos) 模組**，保持純粹的 TS 邏輯。
3.  **Controller (`xxxController.ts`)**: 核心組件。監聽 View 的交互，調用網絡請求（或更新 Model），並指導 View 根據 Model 的變化進行更新。

## 3. 管理器 (Manager) 使用規則

對於通用系統，請**不要**直接使用原生的 Cocos API。請使用位於 `/assets/scripts/manager/` 的自定義管理器。

*   **資源管理**: 載入資產時，請使用位於 `/scripts/manager/resource/` 的 `ResManager.ts`。除非正在編寫 `ResManager` 內部邏輯，否則**請勿直接使用** `resources.load`。
*   **UI 管理**: 開啟或關閉 UI 彈窗/預製體時，請使用位於 `/scripts/manager/ui/` 的 `UIManager.ts`。
*   **事件 (Events)**: 使用位於 `/scripts/manager/system/` 的 `EventManager.ts` 進行全局事件廣播與監聽。
*   **網絡 (Network)**: 使用位於 `/scripts/manager/network/` 的 `HttpManager.ts` 或 `WebSocketManager.ts` 進行服務器通信。
*   **多語言/i18n**: 透過 `LanguageManager.ts` 處理。`en`、`cn` 等語言資產存在於 resource 資料夾中。
*   **音效 (Audio)**: 使用 `SoundManager.ts` 處理背景音樂 (BGM) 與音效 (SFX)。

## 4. 工作流 (Workflows)

當被要求創建新的通用 UI 模組或子遊戲時，請參考預定義的工作流文件：
*   `.agents/workflows/create_new_subgame.md`
*   `.agents/workflows/create_mvc_ui.md`

## 5. TypeScript 編碼規範與註釋要求

