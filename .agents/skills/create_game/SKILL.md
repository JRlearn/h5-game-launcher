---
name: create_game
description: 遵循專案標準 MVC 架構，快速建立新的子遊戲模組。
metadata:
  version: "1.0.0"
  author: "Billy Lu"
---

# 子遊戲開發技能 (Create Game)

## 🎯 任務目標
根據專案規範在 `assets/bundles/games/` 下建立新的子遊戲，確保 MVC 分層清晰並與核心系統（SceneManager, WebSocketManager）對接。

## 🛠 執行指令
1. **建立目錄**：參考 `rules/structure.md` 建立標準目錄結構。
2. **初始化入口**：套用 `templates/main_ts.md` 建立 `Main.ts`。
3. **實作分層**：
   - 使用 `templates/mvc_ts.md` 中的 Model/View/Controller 基礎代碼。
   - UI 部分配合 `cocos_ui_generator` 進行全代碼構建。
4. **網路對接**：若有聯機需求，參考 `rules/network.md` 進行註冊。

## ⚠️ 強制約束
- 子遊戲入口類別名必須為 `Main` 且裝飾器為 `@ccclass('Main')`。
- 嚴禁在 `Main.ts` 中撰寫業務邏輯，僅限於組裝 MVC。
- 所有 UI 資源載入需透過 `ResManager` 或 `LoadTaskManager`。
